import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Create lesson schema
const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  orderIndex: z.number().int().min(0).optional(),
  videoUrl: z.string().url().optional(),
  estimatedMinutes: z.number().int().min(1).default(5),
});

// GET - List lessons for a course
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
    const { id: courseId } = await params;

    // Verify course exists
    const course = await prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const lessons = await prisma.courseLesson.findMany({
      where: { courseId, companyId },
      orderBy: { orderIndex: "asc" },
      include: {
        progress: {
          where: { userId },
        },
      },
    });

    // Transform to include completion status
    const lessonsWithProgress = lessons.map((lesson) => ({
      ...lesson,
      isCompleted: lesson.progress.length > 0 && lesson.progress[0].completedAt !== null,
      progress: undefined, // Remove raw progress data
    }));

    return NextResponse.json(lessonsWithProgress);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST - Create lesson
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
    const { id: courseId } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify course exists
    const course = await prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
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

    // Get max order index if not provided
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrder = await prisma.courseLesson.aggregate({
        where: { courseId },
        _max: { orderIndex: true },
      });
      orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    }

    const lesson = await prisma.courseLesson.create({
      data: {
        ...data,
        orderIndex,
        courseId,
        companyId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
