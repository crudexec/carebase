import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

// POST /api/care-plans/[id]/approve - Approve or reject care plan
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Clinical Director and Admin can approve
    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    if (carePlan.status !== "PENDING_CLINICAL_REVIEW") {
      return NextResponse.json(
        { error: "Care plan is not pending clinical review" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = approveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { action, comments } = validation.data;

    const updatedCarePlan = await prisma.carePlan.update({
      where: { id },
      data: {
        status: action === "approve" ? "CLINICAL_APPROVED" : "DRAFT",
        clinicalReviewedById: action === "approve" ? session.user.id : null,
        clinicalReviewedAt: action === "approve" ? new Date() : null,
        clinicalNotes: comments,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        taskTemplates: {
          orderBy: { displayOrder: "asc" },
        },
        clinicalReviewedBy: {
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
        action: action === "approve" ? "CARE_PLAN_APPROVED" : "CARE_PLAN_REJECTED",
        entityType: "CarePlan",
        entityId: id,
        changes: {
          clientName: `${carePlan.client.firstName} ${carePlan.client.lastName}`,
          comments,
        },
      },
    });

    return NextResponse.json({ carePlan: updatedCarePlan });
  } catch (error) {
    console.error("Error approving care plan:", error);
    return NextResponse.json(
      { error: "Failed to approve care plan" },
      { status: 500 }
    );
  }
}
