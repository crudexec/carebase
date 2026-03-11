import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Submit quiz attempt schema
const submitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedIds: z.array(z.string()),
  })),
});

// POST - Submit quiz attempt
export async function POST(
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

    // Get quiz with questions
    const quiz = await prisma.courseQuiz.findFirst({
      where: { courseId, companyId },
      include: {
        questions: true,
        attempts: {
          where: { userId },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if user can attempt
    if (quiz.maxAttempts && quiz.attempts.length >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: "Maximum attempts reached" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = submitSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { answers } = parseResult.data;

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    const results = quiz.questions.map((question) => {
      totalPoints += question.points;

      const userAnswer = answers.find((a) => a.questionId === question.id);
      const selectedIds = userAnswer?.selectedIds ?? [];
      const correctIds = question.correctIds;

      // Check if answer is correct
      const isCorrect =
        selectedIds.length === correctIds.length &&
        selectedIds.every((id) => correctIds.includes(id));

      if (isCorrect) {
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        question: question.question,
        selectedIds,
        correctIds,
        isCorrect,
        explanation: question.explanation,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0,
      };
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId,
        companyId,
        answers: answers as any,
        score,
        passed,
        completedAt: new Date(),
      },
    });

    // Update course progress if passed
    if (passed) {
      await prisma.courseProgress.upsert({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
        update: {
          quizPassed: true,
          bestQuizScore: {
            set: score,
          },
        },
        create: {
          courseId,
          userId,
          companyId,
          quizPassed: true,
          bestQuizScore: score,
        },
      });
    } else {
      // Update best score if this is better
      const existingProgress = await prisma.courseProgress.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

      if (!existingProgress || (existingProgress.bestQuizScore ?? 0) < score) {
        await prisma.courseProgress.upsert({
          where: {
            courseId_userId: {
              courseId,
              userId,
            },
          },
          update: {
            bestQuizScore: score,
          },
          create: {
            courseId,
            userId,
            companyId,
            bestQuizScore: score,
          },
        });
      }
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score,
        passed,
        passingScore: quiz.passingScore,
      },
      results,
      totalPoints,
      earnedPoints,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
