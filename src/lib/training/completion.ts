import { randomUUID } from "crypto";
import {
  CredentialCategory,
  CredentialStatus,
  TrainingAssignmentStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";

type Tx = Prisma.TransactionClient;

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function buildCertificateNumber() {
  const year = new Date().getFullYear();
  const suffix = randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `CB-TRN-${year}-${suffix}`;
}

async function ensureTrainingCredential(
  tx: Tx,
  input: {
    companyId: string;
    userId: string;
    courseId: string;
    courseTitle: string;
    requiredForRoles: string[];
    isRequired: boolean;
    validityMonths: number;
    issuedAt: Date;
    expiresAt: Date;
    documentUrl: string;
    verificationUrl: string;
    score?: number | null;
  }
) {
  const user = await tx.user.findFirst({
    where: { id: input.userId, companyId: input.companyId },
    include: { caregiverProfile: true },
  });

  if (!user) {
    return null;
  }

  const caregiverProfile = user.caregiverProfile ?? (await tx.caregiverProfile.create({
    data: {
      userId: user.id,
      availableDays: [],
    },
  }));

  const credentialType = await tx.credentialType.upsert({
    where: {
      companyId_name: {
        companyId: input.companyId,
        name: input.courseTitle,
      },
    },
    update: {
      category: CredentialCategory.TRAINING,
      defaultValidityMonths: input.validityMonths,
      isRequired: input.isRequired,
      requiredForRoles: input.requiredForRoles,
      isActive: true,
    },
    create: {
      companyId: input.companyId,
      name: input.courseTitle,
      category: CredentialCategory.TRAINING,
      description: `Generated from completion of ${input.courseTitle}.`,
      defaultValidityMonths: input.validityMonths,
      isRequired: input.isRequired,
      requiredForRoles: input.requiredForRoles,
      reminderDays: [60, 30, 7],
      isActive: true,
    },
  });

  return tx.caregiverCredential.create({
    data: {
      caregiverProfileId: caregiverProfile.id,
      credentialTypeId: credentialType.id,
      issueDate: input.issuedAt,
      expirationDate: input.expiresAt,
      status: CredentialStatus.ACTIVE,
      documentUrls: [input.documentUrl],
      verificationUrl: input.verificationUrl,
      notes: input.score == null
        ? `Issued from training completion for course ${input.courseId}.`
        : `Issued from training completion for course ${input.courseId}. Score: ${input.score}%.`,
    },
  });
}

export async function issueTrainingCertificate(input: {
  companyId: string;
  courseId: string;
  userId: string;
  courseProgressId?: string | null;
  attendanceId?: string | null;
  score?: number | null;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.trainingCertificate.findFirst({
      where: {
        companyId: input.companyId,
        courseId: input.courseId,
        userId: input.userId,
        revokedAt: null,
        ...(input.attendanceId ? { attendanceId: input.attendanceId } : {}),
      },
      orderBy: { issuedAt: "desc" },
    });

    if (existing) {
      return existing;
    }

    const course = await tx.trainingCourse.findFirst({
      where: { id: input.courseId, companyId: input.companyId },
      select: {
        id: true,
        title: true,
        ceuCredits: true,
        contactHours: true,
        isRecurring: true,
        recurrenceMonths: true,
        requiredForRoles: true,
        requiredForNewHires: true,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const issuedAt = new Date();
    const validityMonths = course.isRecurring && course.recurrenceMonths
      ? course.recurrenceMonths
      : 24;
    const expiresAt = addMonths(issuedAt, validityMonths);

    const certificate = await tx.trainingCertificate.create({
      data: {
        certificateNumber: buildCertificateNumber(),
        verificationToken: randomUUID(),
        issuedAt,
        expiresAt,
        score: input.score ?? null,
        ceuCredits: course.ceuCredits,
        contactHours: course.contactHours,
        courseId: input.courseId,
        userId: input.userId,
        courseProgressId: input.courseProgressId ?? null,
        attendanceId: input.attendanceId ?? null,
        companyId: input.companyId,
      },
    });

    const pdfUrl = `/api/training/certificates/${certificate.id}/pdf`;
    const verificationUrl = `/certificates/verify/${certificate.verificationToken}`;

    const credential = await ensureTrainingCredential(tx, {
      companyId: input.companyId,
      userId: input.userId,
      courseId: input.courseId,
      courseTitle: course.title,
      requiredForRoles: course.requiredForRoles,
      isRequired: course.requiredForNewHires || course.requiredForRoles.length > 0,
      validityMonths,
      issuedAt,
      expiresAt,
      documentUrl: pdfUrl,
      verificationUrl,
      score: input.score,
    });

    return tx.trainingCertificate.update({
      where: { id: certificate.id },
      data: {
        pdfUrl,
        credentialId: credential?.id ?? null,
      },
    });
  });
}

export async function syncCourseCompletion(input: {
  companyId: string;
  courseId: string;
  userId: string;
}) {
  const { companyId, courseId, userId } = input;

  const [course, totalLessons, completedLessons, progress] = await Promise.all([
    prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
      include: {
        quizzes: {
          include: {
            attempts: {
              where: { userId },
              orderBy: { score: "desc" },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.courseLesson.count({ where: { courseId, companyId } }),
    prisma.courseLessonProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        lesson: { courseId, companyId },
      },
    }),
    prisma.courseProgress.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    }),
  ]);

  if (!course) {
    throw new Error("Course not found");
  }

  const bestAttempt = course.quizzes
    .flatMap((quiz) => quiz.attempts)
    .sort((a, b) => b.score - a.score)[0];
  const hasQuiz = course.quizzes.length > 0;
  const quizPassed = hasQuiz
    ? course.quizzes.every((quiz) => quiz.attempts.some((attempt) => attempt.passed))
    : true;
  const lessonsComplete = totalLessons === 0 || completedLessons >= totalLessons;
  const isComplete = lessonsComplete && quizPassed;

  const updatedProgress = await prisma.courseProgress.upsert({
    where: {
      courseId_userId: {
        courseId,
        userId,
      },
    },
    update: {
      lessonsCompleted: completedLessons,
      quizPassed: hasQuiz ? quizPassed : progress?.quizPassed ?? false,
      bestQuizScore: bestAttempt?.score ?? progress?.bestQuizScore ?? null,
      completedAt: isComplete ? progress?.completedAt ?? new Date() : null,
    },
    create: {
      courseId,
      userId,
      companyId,
      lessonsCompleted: completedLessons,
      quizPassed: hasQuiz ? quizPassed : false,
      bestQuizScore: bestAttempt?.score ?? null,
      completedAt: isComplete ? new Date() : null,
    },
  });

  if (isComplete) {
    await prisma.trainingAssignment.updateMany({
      where: {
        companyId,
        userId,
        courseId,
        status: {
          in: [
            TrainingAssignmentStatus.ASSIGNED,
            TrainingAssignmentStatus.REGISTERED_FOR_SESSION,
            TrainingAssignmentStatus.OVERDUE,
            TrainingAssignmentStatus.EXTENDED,
          ],
        },
      },
      data: {
        status: TrainingAssignmentStatus.COMPLETED,
        completedAt: updatedProgress.completedAt ?? new Date(),
      },
    });

    await issueTrainingCertificate({
      companyId,
      courseId,
      userId,
      courseProgressId: updatedProgress.id,
      score: bestAttempt?.score ?? null,
    });
  }

  return {
    progress: updatedProgress,
    totalLessons,
    completedLessons,
    quizPassed,
    isComplete,
  };
}
