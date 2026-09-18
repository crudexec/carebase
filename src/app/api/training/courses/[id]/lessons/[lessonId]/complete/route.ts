import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncCourseCompletion } from "@/lib/training/completion";

// POST - Mark lesson as complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;
    const { id: courseId, lessonId } = await params;

    // Verify lesson exists
    const lesson = await prisma.courseLesson.findFirst({
      where: { id: lessonId, courseId, companyId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Upsert progress
    const progress = await prisma.courseLessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        lessonId,
        userId,
        companyId,
        completedAt: new Date(),
      },
    });

    const completion = await syncCourseCompletion({
      companyId,
      courseId,
      userId,
    });

    return NextResponse.json({
      progress,
      lessonsCompleted: completion.completedLessons,
      totalLessons: completion.totalLessons,
      isComplete: completion.isComplete,
    });
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 }
    );
  }
}
