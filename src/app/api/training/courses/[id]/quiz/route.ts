import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { QuizQuestionType } from "@prisma/client";

// Create quiz schema
const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  maxAttempts: z.number().int().min(1).nullable().optional(),
  timeLimit: z.number().int().min(1).nullable().optional(),
  questions: z.array(z.object({
    question: z.string().min(1),
    type: z.nativeEnum(QuizQuestionType).default("MULTIPLE_CHOICE"),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })),
    correctIds: z.array(z.string()),
    explanation: z.string().optional(),
    points: z.number().int().min(1).default(1),
  })).min(1, "At least one question is required"),
});

// GET - Get quiz for a course
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

    const quiz = await prisma.courseQuiz.findFirst({
      where: { courseId, companyId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        attempts: {
          where: { userId },
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ quiz: null });
    }

    // Get best attempt
    const bestAttempt = quiz.attempts.reduce((best, attempt) => {
      if (!best || attempt.score > best.score) return attempt;
      return best;
    }, null as typeof quiz.attempts[0] | null);

    // Remove correct answers from questions if user hasn't passed yet
    const hasPassed = quiz.attempts.some(a => a.passed);
    const questionsForUser = quiz.questions.map(q => ({
      ...q,
      correctIds: hasPassed ? q.correctIds : undefined,
      explanation: hasPassed ? q.explanation : undefined,
    }));

    return NextResponse.json({
      quiz: {
        ...quiz,
        questions: questionsForUser,
        attempts: quiz.attempts,
        bestScore: bestAttempt?.score ?? null,
        hasPassed,
        attemptsCount: quiz.attempts.length,
        canAttempt: !quiz.maxAttempts || quiz.attempts.length < quiz.maxAttempts,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// POST - Create or update quiz
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
    const parseResult = createQuizSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { questions, ...quizData } = parseResult.data;

    // Check if quiz already exists
    const existingQuiz = await prisma.courseQuiz.findFirst({
      where: { courseId, companyId },
    });

    let quiz;
    if (existingQuiz) {
      // Update existing quiz
      // First delete old questions
      await prisma.quizQuestion.deleteMany({
        where: { quizId: existingQuiz.id },
      });

      quiz = await prisma.courseQuiz.update({
        where: { id: existingQuiz.id },
        data: {
          ...quizData,
          questions: {
            create: questions.map((q, index) => ({
              ...q,
              orderIndex: index,
            })),
          },
        },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } else {
      // Create new quiz
      quiz = await prisma.courseQuiz.create({
        data: {
          ...quizData,
          courseId,
          companyId,
          questions: {
            create: questions.map((q, index) => ({
              ...q,
              orderIndex: index,
            })),
          },
        },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    }

    return NextResponse.json(quiz, { status: existingQuiz ? 200 : 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
