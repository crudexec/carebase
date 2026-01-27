-- CreateTable
CREATE TABLE "SNVisit" (
    "id" TEXT NOT NULL,
    "patientScheduleId" TEXT NOT NULL,
    "caregiverId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SNVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SNVisit_patientScheduleId_key" ON "SNVisit"("patientScheduleId");

-- AddForeignKey
ALTER TABLE "SNVisit" ADD CONSTRAINT "SNVisit_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SNVisit" ADD CONSTRAINT "SNVisit_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
