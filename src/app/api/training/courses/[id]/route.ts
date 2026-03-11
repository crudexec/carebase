import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingCategory, TrainingFormat, UserRole } from "@prisma/client";

// Update course schema
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(TrainingCategory).optional(),
  format: z.nativeEnum(TrainingFormat).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  ceuCredits: z.number().min(0).optional(),
  contactHours: z.number().min(0).optional(),
  learningObjectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  requiresAssessment: z.boolean().optional(),
  passingScore: z.number().min(0).max(100).nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceMonths: z.number().int().min(1).nullable().optional(),
  prerequisites: z.array(z.string()).optional(),
  requiredForRoles: z.array(z.nativeEnum(UserRole)).optional(),
  requiredForNewHires: z.boolean().optional(),
  newHireDueDays: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;
    const { id } = await params;

    const course = await prisma.trainingCourse.findFirst({
      where: { id, companyId },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            progress: {
              where: { userId },
            },
          },
        },
        quizzes: {
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
            },
            attempts: {
              where: { userId },
              orderBy: { startedAt: "desc" },
              take: 1,
            },
          },
        },
        progress: {
          where: { userId },
        },
        sessions: {
          where: {
            scheduledDate: { gte: new Date() },
          },
          orderBy: { scheduledDate: "asc" },
          take: 5,
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: {
              select: { attendances: true },
            },
          },
        },
        _count: {
          select: {
            sessions: true,
            assignments: true,
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get prerequisite details
    let prerequisites: { id: string; title: string; category: string }[] = [];
    if (course.prerequisites.length > 0) {
      prerequisites = await prisma.trainingCourse.findMany({
        where: { id: { in: course.prerequisites } },
        select: { id: true, title: true, category: true },
      });
    }

    return NextResponse.json({ ...course, prerequisiteDetails: prerequisites });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PATCH - Update course
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

    const existing = await prisma.trainingCourse.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = await prisma.trainingCourse.update({
      where: { id },
      data: parseResult.data,
      include: {
        _count: {
          select: {
            sessions: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
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

    const existing = await prisma.trainingCourse.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { sessions: true, assignments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Prevent deletion if there are sessions or assignments
    if (existing._count.sessions > 0 || existing._count.assignments > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with existing sessions or assignments. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.trainingCourse.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
