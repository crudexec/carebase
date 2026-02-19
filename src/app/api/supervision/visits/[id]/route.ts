import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { SupervisionVisitStatus, PerformanceRating } from "@prisma/client";

// Update/document visit schema
const updateSchema = z.object({
  status: z.nativeEnum(SupervisionVisitStatus).optional(),
  visitDate: z.string().transform((s) => new Date(s)).optional(),
  actualDuration: z.number().int().min(1).optional(),
  clinicalObservations: z.string().optional(),
  technicalSkills: z.string().optional(),
  communicationSkills: z.string().optional(),
  documentationReview: z.string().optional(),
  overallRating: z.nativeEnum(PerformanceRating).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  feedbackProvided: z.string().optional(),
  superviseeResponse: z.string().optional(),
  goalsReviewed: z.array(z.string()).optional(),
  newGoalsSet: z.array(z.string()).optional(),
  followUpRequired: z.boolean().optional(),
  followUpItems: z.array(z.string()).optional(),
  nextVisitDate: z.string().transform((s) => new Date(s)).optional(),
});

// GET - Get single supervision visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;
    const { id } = await params;

    const visit = await prisma.supervisionVisit.findFirst({
      where: { id, companyId },
      include: {
        relationship: {
          include: {
            supervisor: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            supervisee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    // Check permissions
    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isParticipant =
      visit.relationship.supervisorId === currentUserId ||
      visit.relationship.superviseeId === currentUserId;

    if (!canViewAll && !isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error fetching supervision visit:", error);
    return NextResponse.json(
      { error: "Failed to fetch supervision visit" },
      { status: 500 }
    );
  }
}

// PATCH - Update/document supervision visit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;
    const { id } = await params;

    const body = await request.json();
    const parseResult = updateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.supervisionVisit.findFirst({
      where: { id, companyId },
      include: {
        relationship: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    // Check permissions
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isSupervisor = existing.relationship.supervisorId === currentUserId;

    if (!canManage && !isSupervisor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const visit = await prisma.supervisionVisit.update({
      where: { id },
      data: parseResult.data,
      include: {
        relationship: {
          include: {
            supervisor: {
              select: { id: true, firstName: true, lastName: true },
            },
            supervisee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error updating supervision visit:", error);
    return NextResponse.json(
      { error: "Failed to update supervision visit" },
      { status: 500 }
    );
  }
}

// DELETE - Delete supervision visit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.supervisionVisit.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    // Only allow deletion of scheduled visits
    if (existing.status !== SupervisionVisitStatus.SCHEDULED) {
      return NextResponse.json(
        { error: "Can only delete scheduled visits" },
        { status: 400 }
      );
    }

    await prisma.supervisionVisit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supervision visit:", error);
    return NextResponse.json(
      { error: "Failed to delete supervision visit" },
      { status: 500 }
    );
  }
}
