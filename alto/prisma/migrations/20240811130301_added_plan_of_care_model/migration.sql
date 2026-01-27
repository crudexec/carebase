-- CreateTable
CREATE TABLE "PlanOfCare" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "certStartDate" TIMESTAMP(3),
    "certEndDate" TIMESTAMP(3),
    "signatureSentDate" TIMESTAMP(3),
    "signatureReceivedDate" TIMESTAMP(3),
    "mainInternalNote" VARCHAR(255),
    "dmeSupplies" VARCHAR(255),
    "safetyMeasures" VARCHAR(255),
    "nutritionalRequirement" VARCHAR(255),
    "allergies" VARCHAR(255),
    "functionalLimitations" TEXT[],
    "otherFunctionalLimit" VARCHAR(255),
    "activitiesPermitted" TEXT[],
    "otherActivitiesPermit" VARCHAR(255),
    "mentalStatus" TEXT[],
    "otherMentalStatus" VARCHAR(255),
    "prognosis" VARCHAR(255),
    "certStatement" VARCHAR(255),
    "cognitiveStatus" VARCHAR(255),
    "rehabPotential" VARCHAR(255),
    "dischargePlan" VARCHAR(255),
    "riskIntervention" VARCHAR(255),
    "informationRelatedTo" VARCHAR(255),
    "caregiverNeeds" VARCHAR(255),
    "homeboundStatus" VARCHAR(255),
    "clinicalSummary" VARCHAR(255),
    "physicianId" TEXT,
    "modifyPhysicianCert" BOOLEAN NOT NULL DEFAULT false,
    "caseManagerId" TEXT,
    "verbalSOC" TIMESTAMP(3),
    "qAstatus" VARCHAR(100),
    "nurseMediaId" VARCHAR(100),
    "nurseSignatureDate" TIMESTAMP(3),
    "QANote" VARCHAR(225),
    "carePreferences" VARCHAR(225),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "medication" VARCHAR(225),

    CONSTRAINT "PlanOfCare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PocDiagnosisProcedure" (
    "id" TEXT NOT NULL,
    "planOfCareId" TEXT NOT NULL,
    "diagnosisProcedureId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "type" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PocDiagnosisProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdersAndGoals" (
    "id" TEXT NOT NULL,
    "planOfCareId" TEXT NOT NULL,
    "carePlanType" VARCHAR(255),
    "disciplineId" TEXT,
    "isFrequencyOrder" BOOLEAN NOT NULL DEFAULT false,
    "bodySystem" VARCHAR(255),
    "effectiveDate" TIMESTAMP(3),
    "orders" VARCHAR(255),
    "orderexplanation" VARCHAR(255),
    "goals" VARCHAR(255),
    "goalsExplanation" VARCHAR(255),
    "goalsMet" BOOLEAN NOT NULL DEFAULT false,
    "goalsOngoing" BOOLEAN NOT NULL DEFAULT false,
    "discontinue" BOOLEAN NOT NULL DEFAULT false,
    "goalsMetDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdersAndGoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phrase" (
    "id" TEXT NOT NULL,
    "section" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "description" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisProcedure" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "warning" VARCHAR(255),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisProcedure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "Physician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_caseManagerId_fkey" FOREIGN KEY ("caseManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOfCare" ADD CONSTRAINT "PlanOfCare_nurseMediaId_fkey" FOREIGN KEY ("nurseMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PocDiagnosisProcedure" ADD CONSTRAINT "PocDiagnosisProcedure_planOfCareId_fkey" FOREIGN KEY ("planOfCareId") REFERENCES "PlanOfCare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PocDiagnosisProcedure" ADD CONSTRAINT "PocDiagnosisProcedure_diagnosisProcedureId_fkey" FOREIGN KEY ("diagnosisProcedureId") REFERENCES "DiagnosisProcedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersAndGoals" ADD CONSTRAINT "OrdersAndGoals_planOfCareId_fkey" FOREIGN KEY ("planOfCareId") REFERENCES "PlanOfCare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersAndGoals" ADD CONSTRAINT "OrdersAndGoals_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
