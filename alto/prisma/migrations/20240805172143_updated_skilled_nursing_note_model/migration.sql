/*
  Warnings:

  - You are about to drop the column `snNoteType` on the `UnscheduledVisit` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `SkilledNursingNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "InsurancePriorAuthorization" ADD COLUMN     "providerId" VARCHAR(100);

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "PatientSchedule" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "Physician" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "QASignature" ADD COLUMN     "nurseMediaId" VARCHAR(100),
ADD COLUMN     "nurseSignatureDate" TIMESTAMP(3),
ADD COLUMN     "patientMediaId" VARCHAR(100),
ADD COLUMN     "patientSignatureDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScheduleRecurrence" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "ScheduleVisitVerification" ADD COLUMN     "providerId" VARCHAR(100);

-- AlterTable
ALTER TABLE "SkilledNursingNote" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "archivedOn" TIMESTAMP(3),
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "snNoteType" VARCHAR(100);

-- AlterTable
ALTER TABLE "SkinAndWound" ADD COLUMN     "otherResponseToTeaching" TEXT,
ADD COLUMN     "otherTeachingProvidedTo" TEXT,
ADD COLUMN     "procedureDifficultyExplain" TEXT,
ADD COLUMN     "responseToTeaching" TEXT[],
ADD COLUMN     "teachingProvidedTo" TEXT[],
ADD COLUMN     "woundCareProcedure" TEXT;

-- AlterTable
ALTER TABLE "UnscheduledVisit" DROP COLUMN "snNoteType",
ADD COLUMN     "providerId" VARCHAR(100);

-- AlterTable
ALTER TABLE "Wound" ADD COLUMN     "tunnelling" VARCHAR(225);

-- AddForeignKey
ALTER TABLE "Physician" ADD CONSTRAINT "Physician_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRecurrence" ADD CONSTRAINT "ScheduleRecurrence_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleVisitVerification" ADD CONSTRAINT "ScheduleVisitVerification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkilledNursingNote" ADD CONSTRAINT "SkilledNursingNote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnscheduledVisit" ADD CONSTRAINT "UnscheduledVisit_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePriorAuthorization" ADD CONSTRAINT "InsurancePriorAuthorization_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QASignature" ADD CONSTRAINT "QASignature_patientMediaId_fkey" FOREIGN KEY ("patientMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QASignature" ADD CONSTRAINT "QASignature_nurseMediaId_fkey" FOREIGN KEY ("nurseMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
