import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/assessments/[id] - Get single assessment with responses
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        },
        responses: {
          include: {
            item: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
          },
        },
        assessor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        intake: {
          select: {
            id: true,
            status: true,
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

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

const responseSchema = z.object({
  itemId: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  notes: z.string().optional(),
});

const updateAssessmentSchema = z.object({
  responses: z.array(responseSchema).optional(),
  notes: z.string().optional(),
});

// PATCH /api/assessments/[id] - Update assessment responses
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify assessment exists and user can edit it
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot modify a completed assessment" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { responses, notes } = validation.data;

    // Update responses
    if (responses && responses.length > 0) {
      for (const response of responses) {
        // Convert value to appropriate format
        let valueNumber: number | null = null;
        let valueText: string | null = null;

        if (typeof response.value === "number") {
          valueNumber = response.value;
        } else if (typeof response.value === "boolean") {
          valueNumber = response.value ? 1 : 0;
        } else if (typeof response.value === "string") {
          const parsed = parseFloat(response.value);
          if (!isNaN(parsed)) {
            valueNumber = parsed;
          }
          valueText = response.value;
        } else if (Array.isArray(response.value)) {
          valueText = JSON.stringify(response.value);
        }

        await prisma.assessmentResponse.upsert({
          where: {
            assessmentId_itemId: {
              assessmentId: id,
              itemId: response.itemId,
            },
          },
          create: {
            assessmentId: id,
            itemId: response.itemId,
            valueNumber,
            valueText,
            notes: response.notes,
          },
          update: {
            valueNumber,
            valueText,
            notes: response.notes,
          },
        });
      }
    }

    // Update assessment notes if provided
    if (notes !== undefined) {
      await prisma.assessment.update({
        where: { id },
        data: { notes },
      });
    }

    // Fetch updated assessment
    const updatedAssessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        },
        responses: {
          include: {
            item: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ assessment: updatedAssessment });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/[id] - Delete assessment
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Delete assessment (cascades to responses)
    await prisma.assessment.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "ASSESSMENT_DELETED",
        entityType: "Assessment",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
