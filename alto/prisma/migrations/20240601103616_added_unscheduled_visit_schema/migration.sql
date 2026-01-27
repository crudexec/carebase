-- AlterTable
ALTER TABLE "PatientSchedule" ADD COLUMN     "unscheduledVisitId" TEXT;

-- CreateTable
CREATE TABLE "UnscheduledVisit" (
    "id" TEXT NOT NULL,
    "patientMediaId" VARCHAR(100),
    "patientSignatureDate" TIMESTAMP(3),
    "caregiverMediaId" VARCHAR(100),
    "caregiverSignatureDate" TIMESTAMP(3),
    "patientId" TEXT NOT NULL,
    "miles" VARCHAR(255),
    "milesComments" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnscheduledVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissedNotes" (
    "id" TEXT NOT NULL,
    "caregiver" VARCHAR(100) NOT NULL,
    "scheduledVisit" TIMESTAMP(3),
    "unscheduledVisitId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "visitType" VARCHAR(100),
    "otherVisitType" VARCHAR(100),
    "reasonType" VARCHAR(100),
    "reasonTypeComment" VARCHAR(100),
    "physicianNotified" VARCHAR(100),
    "physicianNotifiedDate" TIMESTAMP(3),
    "caseManagerNotified" VARCHAR(100),
    "caseManagerNotifiedDate" TIMESTAMP(3),
    "additionalComments" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissedNotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnscheduledVisit_patientId_key" ON "UnscheduledVisit"("patientId");

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnscheduledVisit" ADD CONSTRAINT "UnscheduledVisit_patientMediaId_fkey" FOREIGN KEY ("patientMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnscheduledVisit" ADD CONSTRAINT "UnscheduledVisit_caregiverMediaId_fkey" FOREIGN KEY ("caregiverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnscheduledVisit" ADD CONSTRAINT "UnscheduledVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissedNotes" ADD CONSTRAINT "MissedNotes_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
