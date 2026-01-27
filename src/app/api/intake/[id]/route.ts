import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/intake/[id] - Get single intake with all details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            medicaidId: true,
            medicalNotes: true,
          },
        },
        referral: {
          select: {
            id: true,
            prospectFirstName: true,
            prospectLastName: true,
            primaryDiagnosis: true,
            requestedServices: true,
            specialNeeds: true,
          },
        },
        intakeCoordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessments: {
          include: {
            template: {
              select: {
                id: true,
                name: true,
                description: true,
                maxScore: true,
              },
            },
            responses: true,
          },
          orderBy: { startedAt: "desc" },
        },
        consents: {
          include: {
            template: {
              select: {
                id: true,
                name: true,
                description: true,
                formType: true,
              },
            },
          },
        },
        carePlans: {
          include: {
            taskTemplates: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // Get required assessment templates for the state
    const companyState = await prisma.companyStateConfig.findFirst({
      where: {
        companyId: session.user.companyId,
        isPrimaryState: true,
      },
      include: {
        stateConfig: true,
      },
    });

    const requiredTemplates = await prisma.assessmentTemplate.findMany({
      where: {
        stateConfigId: companyState?.stateConfigId,
        isRequired: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    // Get required consent form templates
    const requiredConsents = await prisma.consentFormTemplate.findMany({
      where: {
        stateConfigId: companyState?.stateConfigId,
        isRequired: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        formType: true,
      },
    });

    return NextResponse.json({
      intake,
      requiredTemplates,
      requiredConsents,
      stateConfig: companyState?.stateConfig,
    });
  } catch (error) {
    console.error("Error fetching intake:", error);
    return NextResponse.json(
      { error: "Failed to fetch intake" },
      { status: 500 }
    );
  }
}

const updateIntakeSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "IN_PROGRESS",
    "PENDING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ]).optional(),
  currentStep: z.number().min(1).optional(),
  scheduledDate: z.string().optional().nullable(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
});

// PATCH /api/intake/[id] - Update intake
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateIntakeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (validation.data.status) updateData.status = validation.data.status;
    if (validation.data.currentStep !== undefined) updateData.currentStep = validation.data.currentStep;
    if (validation.data.notes !== undefined) updateData.notes = validation.data.notes;
    if (validation.data.scheduledDate !== undefined) {
      updateData.scheduledDate = validation.data.scheduledDate
        ? new Date(validation.data.scheduledDate)
        : null;
    }
    if (validation.data.startedAt) {
      updateData.startedAt = new Date(validation.data.startedAt);
    }
    if (validation.data.completedAt) {
      updateData.completedAt = new Date(validation.data.completedAt);
    }

    const updatedIntake = await prisma.intake.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        intakeCoordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log for status changes
    if (validation.data.status && validation.data.status !== intake.status) {
      await prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "INTAKE_STATUS_CHANGED",
          entityType: "Intake",
          entityId: id,
          changes: {
            previousStatus: intake.status,
            newStatus: validation.data.status,
          },
        },
      });
    }

    return NextResponse.json({ intake: updatedIntake });
  } catch (error) {
    console.error("Error updating intake:", error);
    return NextResponse.json(
      { error: "Failed to update intake" },
      { status: 500 }
    );
  }
}

// DELETE /api/intake/[id] - Cancel/delete intake
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // Cancel instead of hard delete
    await prisma.intake.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "INTAKE_CANCELLED",
        entityType: "Intake",
        entityId: id,
        changes: {
          clientName: `${intake.client.firstName} ${intake.client.lastName}`,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling intake:", error);
    return NextResponse.json(
      { error: "Failed to cancel intake" },
      { status: 500 }
    );
  }
}
