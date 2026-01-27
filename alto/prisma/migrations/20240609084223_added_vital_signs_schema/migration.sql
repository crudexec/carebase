-- DropIndex
DROP INDEX "UnscheduledVisit_patientId_key";

-- AlterTable
ALTER TABLE "UnscheduledVisit" ADD COLUMN     "caregiverId" TEXT;

-- CreateTable
CREATE TABLE "VitalSigns" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "scheduledVisitId" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "visitType" TEXT,
    "otherVisitType" TEXT,
    "shiftNote" TEXT[],
    "homeboundReason" TEXT[],
    "otherHomeBoundReason" TEXT,
    "homeboundComment" VARCHAR(255),
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
    "painDenied" BOOLEAN NOT NULL DEFAULT false,
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

    CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_unscheduledVisitId_key" ON "VitalSigns"("unscheduledVisitId");

-- AddForeignKey
ALTER TABLE "UnscheduledVisit" ADD CONSTRAINT "UnscheduledVisit_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_scheduledVisitId_fkey" FOREIGN KEY ("scheduledVisitId") REFERENCES "PatientSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
