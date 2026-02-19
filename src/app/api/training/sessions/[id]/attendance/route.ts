import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingAttendanceStatus, TrainingAssignmentStatus } from "@prisma/client";

// Record attendance schema
const attendanceSchema = z.object({
  userId: z.string().min(1, "User is required"),
  status: z.nativeEnum(TrainingAttendanceStatus),
  checkInTime: z.string().transform((s) => new Date(s)).optional(),
  checkOutTime: z.string().transform((s) => new Date(s)).optional(),
  minutesAttended: z.number().int().min(0).optional(),
  completedSuccessfully: z.boolean().default(false),
  assessmentScore: z.number().min(0).max(100).optional(),
  feedbackRating: z.number().int().min(1).max(5).optional(),
  feedbackComments: z.string().optional(),
});

// GET - Get session attendance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: sessionId } = await params;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trainingSession = await prisma.trainingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        course: {
          select: { id: true, title: true, requiresAssessment: true, passingScore: true },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Calculate summary
    const summary = {
      registered: trainingSession.attendances.filter(
        (a) => a.status === TrainingAttendanceStatus.REGISTERED ||
               a.status === TrainingAttendanceStatus.CONFIRMED
      ).length,
      attended: trainingSession.attendances.filter(
        (a) => a.status === TrainingAttendanceStatus.ATTENDED
      ).length,
      partiallyAttended: trainingSession.attendances.filter(
        (a) => a.status === TrainingAttendanceStatus.PARTIALLY_ATTENDED
      ).length,
      absent: trainingSession.attendances.filter(
        (a) => a.status === TrainingAttendanceStatus.ABSENT
      ).length,
      completed: trainingSession.attendances.filter(
        (a) => a.completedSuccessfully
      ).length,
      averageScore: trainingSession.attendances.filter((a) => a.assessmentScore != null).length > 0
        ? trainingSession.attendances
            .filter((a) => a.assessmentScore != null)
            .reduce((sum, a) => sum + (a.assessmentScore || 0), 0) /
          trainingSession.attendances.filter((a) => a.assessmentScore != null).length
        : null,
    };

    return NextResponse.json({
      session: trainingSession,
      attendances: trainingSession.attendances,
      summary,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST - Record attendance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: sessionId } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = attendanceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify session exists
    const trainingSession = await prisma.trainingSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        course: true,
      },
    });

    if (!trainingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: data.userId, companyId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if assessment score meets passing requirement
    if (trainingSession.course.requiresAssessment && trainingSession.course.passingScore) {
      if (data.assessmentScore !== undefined && data.assessmentScore < trainingSession.course.passingScore) {
        data.completedSuccessfully = false;
      }
    }

    // Upsert attendance record
    const attendance = await prisma.trainingAttendance.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId: data.userId,
        },
      },
      create: {
        sessionId,
        userId: data.userId,
        status: data.status,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        minutesAttended: data.minutesAttended,
        completedSuccessfully: data.completedSuccessfully,
        assessmentScore: data.assessmentScore,
        feedbackRating: data.feedbackRating,
        feedbackComments: data.feedbackComments,
        companyId,
      },
      update: {
        status: data.status,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        minutesAttended: data.minutesAttended,
        completedSuccessfully: data.completedSuccessfully,
        assessmentScore: data.assessmentScore,
        feedbackRating: data.feedbackRating,
        feedbackComments: data.feedbackComments,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // If completed successfully, update any related training assignments
    if (data.completedSuccessfully) {
      await prisma.trainingAssignment.updateMany({
        where: {
          userId: data.userId,
          courseId: trainingSession.courseId,
          status: {
            in: [
              TrainingAssignmentStatus.ASSIGNED,
              TrainingAssignmentStatus.REGISTERED_FOR_SESSION,
            ],
          },
        },
        data: {
          status: TrainingAssignmentStatus.COMPLETED,
          completedAt: new Date(),
          completedSessionId: sessionId,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
