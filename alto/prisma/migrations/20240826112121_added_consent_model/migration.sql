-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "patientScheduleId" TEXT NOT NULL,
    "caregiverId" TEXT,
    "name" VARCHAR(255),
    "address" VARCHAR(255),
    "city" VARCHAR(255),
    "postalCode" VARCHAR(255),
    "isOtherService" BOOLEAN NOT NULL DEFAULT false,
    "otherService" VARCHAR(255),
    "information2" TEXT[],
    "understandInformation" VARCHAR(255),
    "evaluations" TEXT[],
    "otherEvaluation" VARCHAR(255),
    "information3" TEXT[],
    "attorneyPower" VARCHAR(255),
    "phone" VARCHAR(255),
    "purpose" TEXT[],
    "otherPurpose" VARCHAR(255),
    "continuityDate" TIMESTAMP(3),
    "legalRepSignatureId" TEXT,
    "legalRepSignatureDate" TIMESTAMP(3),
    "legalRepName" VARCHAR(255),
    "legalRepRelation" VARCHAR(255),
    "witness" VARCHAR(255),
    "witnessSignature" TEXT,
    "witnessSignatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentInformation" (
    "id" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "label" VARCHAR(255),
    "date" TIMESTAMP(3),
    "consentId" TEXT,

    CONSTRAINT "ConsentInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Consent_patientScheduleId_key" ON "Consent"("patientScheduleId");

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_legalRepSignatureId_fkey" FOREIGN KEY ("legalRepSignatureId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentInformation" ADD CONSTRAINT "ConsentInformation_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "Consent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
