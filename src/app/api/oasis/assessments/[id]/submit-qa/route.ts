import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/oasis/assessments/[id]/submit-qa - Submit assessment for QA review
export async function POST(
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
    const assessment = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: {
          include: {
            sections: {
              include: {
                items: true,
              },
            },
          },
        },
        responses: true,
        client: {
          select: {
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

    // Check if user can submit this assessment
    const canSubmit =
      session.user.id === assessment.assessorId ||
      ["ADMIN", "CLINICAL_DIRECTOR", "OPS_MANAGER"].includes(session.user.role);

    if (!canSubmit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that assessment can be submitted
    if (!["DRAFT", "IN_PROGRESS", "QA_REJECTED"].includes(assessment.status)) {
      return NextResponse.json(
        { error: `Assessment in ${assessment.status} status cannot be submitted` },
        { status: 400 }
      );
    }

    // Validate required fields are completed
    const errors: string[] = [];
    const responseMap = new Map(
      assessment.responses.map((r) => [r.itemCode, r])
    );

    for (const section of assessment.template.sections) {
      for (const item of section.items) {
        // Check if item is visible at this time point
        const visibleAt = (item.visibleAt as string[]) || [];
        if (!visibleAt.includes(assessment.timePoint)) {
          continue;
        }

        // Check required items
        if (item.required) {
          const response = responseMap.get(item.code);
          if (!response || !hasValue(response)) {
            errors.push(`${item.code}: ${item.label} is required`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Update assessment status
    const updatedAssessment = await prisma.oasisAssessment.update({
      where: { id },
      data: {
        status: "SUBMITTED_TO_QA",
        completedAt: new Date(),
        submittedForQaAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_SUBMITTED_TO_QA",
        entityType: "OasisAssessment",
        entityId: id,
        changes: {
          clientName: `${assessment.client.firstName} ${assessment.client.lastName}`,
          timePoint: assessment.timePoint,
          responseCount: assessment.responses.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error("Error submitting OASIS for QA:", error);
    return NextResponse.json(
      { error: "Failed to submit for QA" },
      { status: 500 }
    );
  }
}

// Helper to check if a response has a value
function hasValue(response: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueDate: Date | null;
  valueJson: unknown;
}): boolean {
  if (response.valueText !== null && response.valueText !== "") return true;
  if (response.valueNumber !== null) return true;
  if (response.valueBoolean !== null) return true;
  if (response.valueDate !== null) return true;
  if (response.valueJson !== null) {
    if (Array.isArray(response.valueJson)) return response.valueJson.length > 0;
    if (typeof response.valueJson === "object") return Object.keys(response.valueJson as object).length > 0;
    return true;
  }
  return false;
}
