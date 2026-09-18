import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingSessionStatus } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  courseId: z.string().optional(),
  status: z.nativeEnum(TrainingSessionStatus).optional(),
  upcoming: z.enum(["true", "false"]).optional().transform(v => v === "true"),
  instructorId: z.string().optional(),
});

// GET - List training sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, status, upcoming, instructorId } = queryResult.data;

    const sessions = await prisma.trainingSession.findMany({
      where: {
        companyId,
        ...(courseId && { courseId }),
        ...(status && { status }),
        ...(upcoming && { scheduledDate: { gte: new Date() } }),
        ...(instructorId && { instructorId }),
      },
      orderBy: { scheduledDate: "asc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            format: true,
            durationMinutes: true,
            ceuCredits: true,
          },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    // Add computed fields
    const sessionsWithMetrics = sessions.map((s) => ({
      ...s,
      availableSpots: s.capacity ? s.capacity - s.registeredCount : null,
      isFull: s.capacity ? s.registeredCount >= s.capacity : false,
    }));

    return NextResponse.json(sessionsWithMetrics);
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch training sessions" },
      { status: 500 }
    );
  }
}

// POST - Create training session
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Live training sessions have been removed. Training courses are self-paced only." },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error creating training session:", error);
    return NextResponse.json(
      { error: "Failed to create training session" },
      { status: 500 }
    );
  }
}
