/*
  Warnings:

  - You are about to drop the column `qAStatus` on the `Assessment` table. All the data in the column will be lost.
  - The `source` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `Physician` table. All the data in the column will be lost.
  - You are about to drop the `Consent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NursingAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OasisAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SNVisit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[patientScheduleId]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QAStatus" AS ENUM ('APPROVED', 'REJECTED', 'COMPLETED', 'INUSE');

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_caregiverId_fkey";

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_legalRepSignatureId_fkey";

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_patientScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "NursingAssessment" DROP CONSTRAINT "NursingAssessment_caregiverId_fkey";

-- DropForeignKey
ALTER TABLE "NursingAssessment" DROP CONSTRAINT "NursingAssessment_patientScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "OasisAssessment" DROP CONSTRAINT "OasisAssessment_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "OasisAssessment" DROP CONSTRAINT "OasisAssessment_nurseId_fkey";

-- DropForeignKey
ALTER TABLE "SNVisit" DROP CONSTRAINT "SNVisit_caregiverId_fkey";

-- DropForeignKey
ALTER TABLE "SNVisit" DROP CONSTRAINT "SNVisit_patientScheduleId_fkey";

-- DropIndex
DROP INDEX "Physician_name_key";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "qAStatus",
ADD COLUMN     "consent" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hhaVisit" JSONB,
ADD COLUMN     "historyAndDiagnosis" JSONB,
ADD COLUMN     "livingFinancial" JSONB,
ADD COLUMN     "nursingAssessment" JSONB,
ADD COLUMN     "oasisAssessment" JSONB,
ADD COLUMN     "oasisFollowUp" JSONB,
ADD COLUMN     "otEval" JSONB,
ADD COLUMN     "otVisit" JSONB,
ADD COLUMN     "patientScheduleId" TEXT,
ADD COLUMN     "patientTracking" JSONB,
ADD COLUMN     "ptEval" JSONB,
ADD COLUMN     "ptVisit" JSONB,
ADD COLUMN     "qaComment" TEXT,
ADD COLUMN     "qaStatus" "QAStatus",
ADD COLUMN     "qaed" BOOLEAN DEFAULT false,
ADD COLUMN     "snVisit" JSONB,
ADD COLUMN     "socAccess" JSONB,
ADD COLUMN     "stEval" JSONB,
ADD COLUMN     "stVisit" JSONB,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "timeIn" TEXT,
ADD COLUMN     "timeOut" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visitDate" TIMESTAMP(3),
ADD COLUMN     "walkTest" JSONB,
DROP COLUMN "source",
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "patientNo" VARCHAR(100);

-- AlterTable
ALTER TABLE "Physician" DROP COLUMN "name",
ADD COLUMN     "firstName" VARCHAR(100),
ADD COLUMN     "lastName" VARCHAR(100),
ADD COLUMN     "upin" VARCHAR(100);

-- DropTable
DROP TABLE "Consent";

-- DropTable
DROP TABLE "NursingAssessment";

-- DropTable
DROP TABLE "OasisAssessment";

-- DropTable
DROP TABLE "SNVisit";

-- DropEnum
DROP TYPE "AssessmentType";

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_patientScheduleId_key" ON "Assessment"("patientScheduleId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
