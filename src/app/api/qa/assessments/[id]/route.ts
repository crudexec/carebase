import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const qaReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

// PUT /api/qa/assessments/[id] - Update assessment QA status
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify assessment exists
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

    // Validate request body
    const body = await request.json();
    const validation = qaReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status, comment } = validation.data;

    // Update assessment with QA review
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        qaStatus: status,
        qaComment: comment || null,
        qaReviewedAt: new Date(),
        qaReviewedById: session.user.id,
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
        qaReviewedBy: {
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
        action: `ASSESSMENT_QA_${status}`,
        entityType: "Assessment",
        entityId: id,
        changes: {
          status,
          comment,
          clientId: assessment.clientId,
        },
      },
    });

    return NextResponse.json({
      assessment: updatedAssessment,
      message: `Assessment ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating assessment QA status:", error);
    return NextResponse.json(
      { error: "Failed to update assessment QA status" },
      { status: 500 }
    );
  }
}

// GET /api/qa/assessments/[id] - Get assessment for QA review
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment for QA:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
