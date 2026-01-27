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

// PUT /api/qa/visit-notes/[id] - Update visit note QA status
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

    // Verify visit note exists
    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
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

    // Update visit note with QA review
    const updatedVisitNote = await prisma.visitNote.update({
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
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        shift: {
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
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
        action: `VISIT_NOTE_QA_${status}`,
        entityType: "VisitNote",
        entityId: id,
        changes: {
          status,
          comment,
          clientId: visitNote.clientId,
        },
      },
    });

    return NextResponse.json({
      visitNote: updatedVisitNote,
      message: `Visit note ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating visit note QA status:", error);
    return NextResponse.json(
      { error: "Failed to update visit note QA status" },
      { status: 500 }
    );
  }
}

// GET /api/qa/visit-notes/[id] - Get visit note for QA review
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

    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
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
            dateOfBirth: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        shift: {
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
            actualStart: true,
            actualEnd: true,
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

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ visitNote });
  } catch (error) {
    console.error("Error fetching visit note for QA:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit note" },
      { status: 500 }
    );
  }
}
