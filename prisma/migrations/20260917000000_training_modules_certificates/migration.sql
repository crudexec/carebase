-- Add course modules and first-class training certificates.

ALTER TABLE "CourseLesson" ADD COLUMN "moduleId" TEXT;

CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingCertificate" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "score" INTEGER,
    "ceuCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contactHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseProgressId" TEXT,
    "attendanceId" TEXT,
    "credentialId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainingCertificate_certificateNumber_key" ON "TrainingCertificate"("certificateNumber");
CREATE UNIQUE INDEX "TrainingCertificate_verificationToken_key" ON "TrainingCertificate"("verificationToken");
CREATE UNIQUE INDEX "TrainingCertificate_attendanceId_key" ON "TrainingCertificate"("attendanceId");

CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");
CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");
CREATE INDEX "CourseModule_companyId_idx" ON "CourseModule"("companyId");
CREATE INDEX "CourseModule_orderIndex_idx" ON "CourseModule"("orderIndex");
CREATE INDEX "TrainingCertificate_courseId_idx" ON "TrainingCertificate"("courseId");
CREATE INDEX "TrainingCertificate_userId_idx" ON "TrainingCertificate"("userId");
CREATE INDEX "TrainingCertificate_companyId_idx" ON "TrainingCertificate"("companyId");
CREATE INDEX "TrainingCertificate_verificationToken_idx" ON "TrainingCertificate"("verificationToken");

ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "TrainingAttendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "CaregiverCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingCertificate" ADD CONSTRAINT "TrainingCertificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
