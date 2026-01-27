-- CreateTable
CREATE TABLE "InsurancePriorAuthorization" (
    "id" TEXT NOT NULL,
    "disciplineId" VARCHAR(100),
    "patientInsuranceId" TEXT NOT NULL,
    "dateRequestSent" TIMESTAMP(3),
    "dateAuthorizationReceived" TIMESTAMP(3),
    "authCode" TEXT,
    "visitAuth" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveThrough" TIMESTAMP(3),
    "hoursAuth" TEXT,
    "units" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePriorAuthorization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsurancePriorAuthorization" ADD CONSTRAINT "InsurancePriorAuthorization_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePriorAuthorization" ADD CONSTRAINT "InsurancePriorAuthorization_patientInsuranceId_fkey" FOREIGN KEY ("patientInsuranceId") REFERENCES "PatientInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
