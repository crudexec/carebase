import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OasisStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/oasis/assessments/[id] - Get single OASIS assessment with responses
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assessment = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: {
                items: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            medicaidId: true,
            dateOfBirth: true,
            address: true,
            phone: true,
          },
        },
        assessor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        responses: true,
        qaReviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Convert responses to a map format for the frontend
    const responsesMap: Record<string, unknown> = {};
    for (const response of assessment.responses) {
      responsesMap[response.itemCode] = {
        text: response.valueText,
        number: response.valueNumber,
        boolean: response.valueBoolean,
        date: response.valueDate,
        json: response.valueJson,
      };
    }

    return NextResponse.json({
      assessment: {
        ...assessment,
        responsesMap,
      },
    });
  } catch (error) {
    console.error("Error fetching OASIS assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch OASIS assessment" },
      { status: 500 }
    );
  }
}

const updateAssessmentSchema = z.object({
  status: z.nativeEnum(OasisStatus).optional(),
  m0090AssessmentDate: z.string().transform((s) => new Date(s)).optional(),
  m0030SocDate: z.string().transform((s) => new Date(s)).optional(),
  m0032RocDate: z.string().transform((s) => new Date(s)).optional(),
  m0906DischargeDate: z.string().transform((s) => new Date(s)).optional(),
});

// PATCH /api/oasis/assessments/[id] - Update OASIS assessment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Verify assessment exists and belongs to company
    const existing = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user can modify this assessment
    const canModify =
      session.user.id === existing.assessorId ||
      ["ADMIN", "CLINICAL_DIRECTOR", "OPS_MANAGER"].includes(session.user.role);

    if (!canModify) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow modification if exported
    if (existing.status === "EXPORTED") {
      return NextResponse.json(
        { error: "Cannot modify exported assessment" },
        { status: 400 }
      );
    }

    const assessment = await prisma.oasisAssessment.update({
      where: { id },
      data: validation.data,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_ASSESSMENT_UPDATED",
        entityType: "OasisAssessment",
        entityId: assessment.id,
        changes: validation.data,
      },
    });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error updating OASIS assessment:", error);
    return NextResponse.json(
      { error: "Failed to update OASIS assessment" },
      { status: 500 }
    );
  }
}

// DELETE /api/oasis/assessments/[id] - Delete OASIS assessment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify assessment exists and belongs to company
    const existing = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of drafts, or by admin
    const canDelete =
      existing.status === "DRAFT" ||
      session.user.role === "ADMIN";

    if (!canDelete) {
      return NextResponse.json(
        { error: "Only draft assessments can be deleted" },
        { status: 400 }
      );
    }

    // Delete assessment (cascades to responses)
    await prisma.oasisAssessment.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_ASSESSMENT_DELETED",
        entityType: "OasisAssessment",
        entityId: id,
        changes: {
          clientName: `${existing.client.firstName} ${existing.client.lastName}`,
          timePoint: existing.timePoint,
          status: existing.status,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting OASIS assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete OASIS assessment" },
      { status: 500 }
    );
  }
}
