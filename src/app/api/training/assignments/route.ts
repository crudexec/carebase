import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingAssignmentStatus, TrainingAssignmentReason } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  userId: z.string().optional(),
  courseId: z.string().optional(),
  status: z.nativeEnum(TrainingAssignmentStatus).optional(),
  overdue: z.enum(["true", "false"]).optional().transform(v => v === "true"),
});

// Create assignment schema
const createSchema = z.object({
  userId: z.string().min(1, "User is required"),
  courseId: z.string().min(1, "Course is required"),
  reason: z.nativeEnum(TrainingAssignmentReason),
  dueDate: z.string().transform((s) => new Date(s)),
});

// Bulk assign schema
const bulkAssignSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user is required"),
  courseId: z.string().min(1, "Course is required"),
  reason: z.nativeEnum(TrainingAssignmentReason),
  dueDate: z.string().transform((s) => new Date(s)),
});

// GET - List training assignments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;

    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, courseId, status, overdue } = queryResult.data;

    // Non-managers can only view their own assignments
    const filterUserId = canViewAll ? userId : currentUserId;

    const now = new Date();

    const assignments = await prisma.trainingAssignment.findMany({
      where: {
        companyId,
        ...(filterUserId && { userId: filterUserId }),
        ...(courseId && { courseId }),
        ...(status && { status }),
        ...(overdue && {
          dueDate: { lt: now },
          status: {
            in: [
              TrainingAssignmentStatus.ASSIGNED,
              TrainingAssignmentStatus.REGISTERED_FOR_SESSION,
            ],
          },
        }),
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
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
        assignedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        extensionApprovedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Add computed fields
    const assignmentsWithMetrics = assignments.map((a) => ({
      ...a,
      isOverdue: a.dueDate < now &&
        ([TrainingAssignmentStatus.ASSIGNED, TrainingAssignmentStatus.REGISTERED_FOR_SESSION] as TrainingAssignmentStatus[]).includes(a.status),
      daysUntilDue: Math.ceil((a.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json(assignmentsWithMetrics);
  } catch (error) {
    console.error("Error fetching training assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch training assignments" },
      { status: 500 }
    );
  }
}

// POST - Create training assignment(s)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: assignerId } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Try bulk assign first
    const bulkResult = bulkAssignSchema.safeParse(body);
    if (bulkResult.success) {
      const { userIds, courseId, reason, dueDate } = bulkResult.data;

      // Verify course exists
      const course = await prisma.trainingCourse.findFirst({
        where: { id: courseId, companyId },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // Verify all users exist
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, companyId },
      });

      if (users.length !== userIds.length) {
        return NextResponse.json({ error: "One or more users not found" }, { status: 404 });
      }

      // Check for existing active assignments
      const existingAssignments = await prisma.trainingAssignment.findMany({
        where: {
          userId: { in: userIds },
          courseId,
          status: {
            in: [
              TrainingAssignmentStatus.ASSIGNED,
              TrainingAssignmentStatus.REGISTERED_FOR_SESSION,
            ],
          },
        },
        select: { userId: true },
      });

      const existingUserIds = new Set(existingAssignments.map((a) => a.userId));
      const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

      if (newUserIds.length === 0) {
        return NextResponse.json(
          { error: "All users already have active assignments for this course" },
          { status: 400 }
        );
      }

      // Create assignments
      const assignments = await prisma.trainingAssignment.createMany({
        data: newUserIds.map((userId) => ({
          userId,
          courseId,
          assignedById: assignerId,
          reason,
          dueDate,
          status: TrainingAssignmentStatus.ASSIGNED,
          companyId,
        })),
      });

      return NextResponse.json({
        created: assignments.count,
        skipped: existingUserIds.size,
        message: existingUserIds.size > 0
          ? `${assignments.count} assignments created, ${existingUserIds.size} skipped (already assigned)`
          : `${assignments.count} assignments created`,
      }, { status: 201 });
    }

    // Try single assignment
    const singleResult = createSchema.safeParse(body);
    if (!singleResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: singleResult.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, courseId, reason, dueDate } = singleResult.data;

    // Verify course exists
    const course = await prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for existing active assignment
    const existingAssignment = await prisma.trainingAssignment.findFirst({
      where: {
        userId,
        courseId,
        status: {
          in: [
            TrainingAssignmentStatus.ASSIGNED,
            TrainingAssignmentStatus.REGISTERED_FOR_SESSION,
          ],
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "User already has an active assignment for this course" },
        { status: 400 }
      );
    }

    const assignment = await prisma.trainingAssignment.create({
      data: {
        userId,
        courseId,
        assignedById: assignerId,
        reason,
        dueDate,
        status: TrainingAssignmentStatus.ASSIGNED,
        companyId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        course: {
          select: { id: true, title: true, category: true },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating training assignment:", error);
    return NextResponse.json(
      { error: "Failed to create training assignment" },
      { status: 500 }
    );
  }
}
