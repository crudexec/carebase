/*
  Warnings:

  - You are about to drop the `ConsentInformation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsentInformation" DROP CONSTRAINT "ConsentInformation_consentId_fkey";

-- AlterTable
ALTER TABLE "Consent" ADD COLUMN     "information1" JSONB[];

-- DropTable
DROP TABLE "ConsentInformation";

-- CreateTable
CREATE TABLE "NursingAssessment" (
    "id" TEXT NOT NULL,
    "patientScheduleId" TEXT NOT NULL,
    "caregiverId" TEXT,
    "patientHistory" JSONB,
    "diagnosis" JSONB[],
    "procedure" JSONB[],
    "skilledObservation" JSONB,
    "internalAssessment" JSONB,
    "psychosocial" JSONB,
    "bodyAssessment" JSONB,
    "livingAssessment" JSONB,
    "rehabGoals" JSONB,
    "services" JSONB,
    "cert485" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NursingAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NursingAssessment_patientScheduleId_key" ON "NursingAssessment"("patientScheduleId");

-- AddForeignKey
ALTER TABLE "NursingAssessment" ADD CONSTRAINT "NursingAssessment_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NursingAssessment" ADD CONSTRAINT "NursingAssessment_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
