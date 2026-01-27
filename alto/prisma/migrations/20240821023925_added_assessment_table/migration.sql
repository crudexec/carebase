-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('OASIS', 'NON_OASIS', 'PEDIATRIC', 'NON_SKILLED');

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "source" "AssessmentType" NOT NULL,
    "reasons" TEXT[],
    "qAStatus" VARCHAR(255),
    "exportStatus" VARCHAR(255),
    "dateCompleted" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "patientId" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OasisAssessment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "discipline" VARCHAR(255) NOT NULL,
    "nurseId" TEXT,
    "referralDate" TIMESTAMP(3),
    "startOfCareDate" TIMESTAMP(3),
    "dischargeTransferOrDeathDate" TIMESTAMP(3),
    "noSOCDate" BOOLEAN NOT NULL DEFAULT false,
    "episodeTiming" VARCHAR(255),
    "isComprehensive" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),

    CONSTRAINT "OasisAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OasisAssessment_assessmentId_key" ON "OasisAssessment"("assessmentId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OasisAssessment" ADD CONSTRAINT "OasisAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OasisAssessment" ADD CONSTRAINT "OasisAssessment_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
