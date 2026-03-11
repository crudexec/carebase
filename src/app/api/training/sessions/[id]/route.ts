import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingSessionStatus } from "@prisma/client";

// Update session schema
const updateSchema = z.object({
  scheduledDate: z.string().transform((s) => new Date(s)).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  location: z.string().nullable().optional(),
  isVirtual: z.boolean().optional(),
  virtualMeetingUrl: z.string().url().nullable().optional(),
  instructorId: z.string().nullable().optional(),
  externalInstructor: z.string().nullable().optional(),
  capacity: z.number().int().min(1).nullable().optional(),
  status: z.nativeEnum(TrainingSessionStatus).optional(),
  cancelledReason: z.string().nullable().optional(),
});

// GET - Get single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;

    const trainingSession = await prisma.trainingSession.findFirst({
      where: { id, companyId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            format: true,
            durationMinutes: true,
            ceuCredits: true,
            contactHours: true,
            requiresAssessment: true,
            passingScore: true,
          },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attendances: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(trainingSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH - Update session
export async function PATCH(
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

    const body = await request.json();
    const parseResult = updateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.trainingSession.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const trainingSession = await prisma.trainingSession.update({
      where: { id },
      data: parseResult.data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(trainingSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete session
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

    const existing = await prisma.trainingSession.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Prevent deletion if there are attendances - cancel instead
    if (existing._count.attendances > 0) {
      return NextResponse.json(
        { error: "Cannot delete session with registered attendees. Cancel it instead." },
        { status: 400 }
      );
    }

    await prisma.trainingSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
