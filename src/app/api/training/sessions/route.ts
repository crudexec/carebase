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

// Create session schema
const createSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  scheduledDate: z.string().transform((s) => new Date(s)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  timezone: z.string().default("America/New_York"),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  virtualMeetingUrl: z.string().url().optional(),
  instructorId: z.string().optional(),
  externalInstructor: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
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
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = createSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify course exists
    const course = await prisma.trainingCourse.findFirst({
      where: { id: data.courseId, companyId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify instructor if provided
    if (data.instructorId) {
      const instructor = await prisma.user.findFirst({
        where: { id: data.instructorId, companyId },
      });
      if (!instructor) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
      }
    }

    const trainingSession = await prisma.trainingSession.create({
      data: {
        ...data,
        status: TrainingSessionStatus.SCHEDULED,
        companyId,
      },
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

    return NextResponse.json(trainingSession, { status: 201 });
  } catch (error) {
    console.error("Error creating training session:", error);
    return NextResponse.json(
      { error: "Failed to create training session" },
      { status: 500 }
    );
  }
}
