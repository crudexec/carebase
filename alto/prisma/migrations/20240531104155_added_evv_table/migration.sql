/*
  Warnings:

  - You are about to drop the column `userId` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PatientInsurance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DischargeSummaryType" AS ENUM ('SN', 'PT', 'OT', 'ST', 'MSW', 'HHA', 'OTHER');

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_userId_fkey";

-- DropIndex
DROP INDEX "PatientInsurance_patientId_type_key";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "userId",
ADD COLUMN     "admitInfection" VARCHAR(100),
ADD COLUMN     "caregiverId" TEXT,
ADD COLUMN     "dnr" VARCHAR(100),
ADD COLUMN     "infectionControl" VARCHAR(100),
ADD COLUMN     "pan" VARCHAR(100),
ADD COLUMN     "transferredFrom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PatientInsurance" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "address1" VARCHAR(100),
ADD COLUMN     "address2" VARCHAR(100),
ADD COLUMN     "archivedOn" TIMESTAMP(3),
ADD COLUMN     "assignBenefits" VARCHAR(100),
ADD COLUMN     "billType" VARCHAR(100),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "comment" VARCHAR(100),
ADD COLUMN     "copayAmount" VARCHAR(100),
ADD COLUMN     "copayType" VARCHAR(100),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dob" VARCHAR(100),
ADD COLUMN     "effectiveFrom" TIMESTAMP(3),
ADD COLUMN     "effectiveThrough" TIMESTAMP(3),
ADD COLUMN     "firstName" VARCHAR(100),
ADD COLUMN     "groupName" VARCHAR(100),
ADD COLUMN     "groupNumber" VARCHAR(100),
ADD COLUMN     "insuranceCaseManagerId" TEXT,
ADD COLUMN     "lastName" VARCHAR(100),
ADD COLUMN     "memberId" VARCHAR(100),
ADD COLUMN     "middleName" VARCHAR(100),
ADD COLUMN     "patientRelationship" TEXT,
ADD COLUMN     "payerResponsibility" VARCHAR(100),
ADD COLUMN     "providerAcceptAssignment" VARCHAR(100),
ADD COLUMN     "relationshipToPatient" VARCHAR(100),
ADD COLUMN     "sex" VARCHAR(100),
ADD COLUMN     "state" VARCHAR(100),
ADD COLUMN     "suffix" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zip" VARCHAR(100);

-- CreateTable
CREATE TABLE "Payer" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "phone" VARCHAR(100),
    "fax" VARCHAR(100),
    "providerId" VARCHAR(100) NOT NULL,
    "address" VARCHAR(100),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zip" VARCHAR(100),
    "npi" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFrequency" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "disciplineId" TEXT,
    "visit" VARCHAR(100),
    "perDay" VARCHAR(100),
    "effectiveFrom" TIMESTAMP(3),
    "effectiveThrough" TIMESTAMP(3),
    "comment" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientFrequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedCaregiver" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT,
    "relationShip" TEXT,
    "patientInsuranceId" TEXT,

    CONSTRAINT "RelatedCaregiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientOtherInfo" (
    "id" TEXT NOT NULL,
    "comment" VARCHAR(100),
    "noPublicity" BOOLEAN NOT NULL DEFAULT false,
    "telephony" BOOLEAN NOT NULL DEFAULT false,
    "referralDate" TIMESTAMP(3),
    "region" VARCHAR(100),
    "sentDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "pharmacyName" VARCHAR(100),
    "pharmacyPhone" VARCHAR(100),
    "pharmacyFax" VARCHAR(100),
    "careConnect" BOOLEAN NOT NULL DEFAULT false,
    "evacuationLevel" VARCHAR(100),
    "releaseInformation" VARCHAR(100),
    "patientSignatureSourceCode" VARCHAR(100),
    "patientConditions" TEXT[],
    "patientConditionState" VARCHAR(100),
    "patientConditionDate" TIMESTAMP(3),

    CONSTRAINT "PatientOtherInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherPhysician" (
    "id" TEXT NOT NULL,
    "physicianId" TEXT,
    "comment" VARCHAR(255),
    "patientOtherInfoId" TEXT,

    CONSTRAINT "OtherPhysician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleVisitVerification" (
    "id" TEXT NOT NULL,
    "mediaId" VARCHAR(100),
    "signatureDate" TIMESTAMP(3),
    "patientScheduleId" TEXT NOT NULL,
    "comment" VARCHAR(255),
    "temperature" VARCHAR(255),
    "temperatureType" VARCHAR(255),
    "pulse" VARCHAR(255),
    "pulseType" VARCHAR(255),
    "pulseTypeRegular" VARCHAR(255),
    "respiration" VARCHAR(255),
    "respirationType" VARCHAR(255),
    "notes" VARCHAR(255),
    "bloodPressureRight" VARCHAR(255),
    "bloodPressureLeft" VARCHAR(255),
    "bloodPressureWeight" VARCHAR(255),
    "bloodPressureType" VARCHAR(255),
    "painDenied" BOOLEAN DEFAULT false,
    "painLocation" VARCHAR(255),
    "painIntensity" VARCHAR(255),
    "otherPain" VARCHAR(255),
    "painDuration" VARCHAR(255),
    "medicationTaken" VARCHAR(255),
    "painDescription" VARCHAR(255),
    "painLevel" VARCHAR(255),
    "painManagement" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleVisitVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDiscipline" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "SN" BOOLEAN NOT NULL DEFAULT false,
    "SNDischargeDate" TIMESTAMP(3),
    "SNDischargeComment" TEXT,
    "OT" BOOLEAN NOT NULL DEFAULT false,
    "OTDischargeDate" TIMESTAMP(3),
    "OTDischargeComment" TEXT,
    "PT" BOOLEAN NOT NULL DEFAULT false,
    "PTDischargeDate" TIMESTAMP(3),
    "PTDischargeComment" TEXT,
    "ST" BOOLEAN NOT NULL DEFAULT false,
    "STDischargeDate" TIMESTAMP(3),
    "STDischargeComment" TEXT,
    "MSW" BOOLEAN NOT NULL DEFAULT false,
    "MSWDischargeDate" TIMESTAMP(3),
    "MSWDischargeComment" TEXT,
    "HHA" BOOLEAN NOT NULL DEFAULT false,
    "HHADischargeDate" TIMESTAMP(3),
    "HHADischargeComment" TEXT,
    "OTHER" BOOLEAN NOT NULL DEFAULT false,
    "OTHERDischargeDate" TIMESTAMP(3),
    "OTHERDischargeComment" TEXT,

    CONSTRAINT "PatientDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DischargeSummary" (
    "id" TEXT NOT NULL,
    "type" "DischargeSummaryType" NOT NULL,
    "patientId" TEXT NOT NULL,
    "dischargeReason" VARCHAR(100),
    "otherReason" VARCHAR(100),
    "careSummary" VARCHAR(255),
    "comment" VARCHAR(100),
    "summaryDateSent" TIMESTAMP(3),
    "sentVia" VARCHAR(100),
    "signatureType" VARCHAR(100),
    "digitalSignatureChecked" BOOLEAN NOT NULL DEFAULT false,
    "mediaId" VARCHAR(100),
    "signatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DischargeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleVisitVerification_patientScheduleId_key" ON "ScheduleVisitVerification"("patientScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDiscipline_patientId_key" ON "PatientDiscipline"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DischargeSummary_type_key" ON "DischargeSummary"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_name_key" ON "Discipline"("name");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_insuranceCaseManagerId_fkey" FOREIGN KEY ("insuranceCaseManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFrequency" ADD CONSTRAINT "PatientFrequency_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFrequency" ADD CONSTRAINT "PatientFrequency_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedCaregiver" ADD CONSTRAINT "RelatedCaregiver_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedCaregiver" ADD CONSTRAINT "RelatedCaregiver_patientInsuranceId_fkey" FOREIGN KEY ("patientInsuranceId") REFERENCES "PatientInsurance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPhysician" ADD CONSTRAINT "OtherPhysician_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "Physician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPhysician" ADD CONSTRAINT "OtherPhysician_patientOtherInfoId_fkey" FOREIGN KEY ("patientOtherInfoId") REFERENCES "PatientOtherInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleVisitVerification" ADD CONSTRAINT "ScheduleVisitVerification_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleVisitVerification" ADD CONSTRAINT "ScheduleVisitVerification_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDiscipline" ADD CONSTRAINT "PatientDiscipline_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
