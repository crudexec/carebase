import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/assessments/[id]/submit-qa - Submit assessment for QA review
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify assessment exists and belongs to company
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

    // Check if assessment is completed
    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed before submitting for QA" },
        { status: 400 }
      );
    }

    // Check if already submitted for QA
    if (assessment.qaStatus) {
      return NextResponse.json(
        { error: "Assessment has already been submitted for QA" },
        { status: 400 }
      );
    }

    // Submit for QA
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        qaStatus: "PENDING_REVIEW",
        submittedForQAAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "ASSESSMENT_SUBMITTED_FOR_QA",
        entityType: "Assessment",
        entityId: id,
        changes: {
          clientId: assessment.clientId,
          templateId: assessment.templateId,
        },
      },
    });

    return NextResponse.json({
      assessment: updatedAssessment,
      message: "Assessment submitted for QA review",
    });
  } catch (error) {
    console.error("Error submitting assessment for QA:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment for QA" },
      { status: 500 }
    );
  }
}
