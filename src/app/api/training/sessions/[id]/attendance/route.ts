import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { TrainingAttendanceStatus } from "@prisma/client";

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
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Live session attendance has been removed. Complete self-paced lessons and quizzes instead." },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}

// PATCH - Update attendance by attendance record id
export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Live session attendance has been removed. Complete self-paced lessons and quizzes instead." },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
