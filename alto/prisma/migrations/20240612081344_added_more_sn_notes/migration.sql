-- CreateTable
CREATE TABLE "CardioPulm" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "cardiovascularNormal" BOOLEAN NOT NULL DEFAULT false,
    "heartSound" VARCHAR(255),
    "heartSoundNote" VARCHAR(255),
    "edema" TEXT[],
    "edemaSeverity" VARCHAR(255),
    "edemaLocation" VARCHAR(255),
    "chestPain" BOOLEAN NOT NULL DEFAULT false,
    "chestPainLocation" VARCHAR(255)[],
    "otherChestPainLocation" VARCHAR(255),
    "painDuration" VARCHAR(255),
    "painIntensity" VARCHAR(255),
    "painType" TEXT[],
    "relievingFactor" VARCHAR(255),
    "cardiovascularNote" VARCHAR(255),
    "pulmonaryNormal" BOOLEAN NOT NULL DEFAULT false,
    "lungSound" TEXT[],
    "anterior" TEXT[],
    "posterior" TEXT[],
    "cough" TEXT[],
    "coughNote" VARCHAR(255) NOT NULL,
    "respiratoryStatus" TEXT[],
    "oxygen" VARCHAR(255),
    "pulseOximetry" VARCHAR(255),
    "pulmonaryNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardioPulm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeuroGastro" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "neuromuscularNormal" BOOLEAN NOT NULL DEFAULT false,
    "mentalStatus" TEXT[],
    "mentalStatusOrientedTo" TEXT[],
    "headache" BOOLEAN NOT NULL DEFAULT false,
    "impairment" TEXT[],
    "markApplicableNeuro" TEXT[],
    "gripStrength" VARCHAR(255),
    "gripLeft" VARCHAR(255),
    "gripRight" VARCHAR(255),
    "pupils" VARCHAR(255),
    "otherPupils" VARCHAR(255),
    "falls" VARCHAR(255),
    "neuromuscularNote" VARCHAR(255),
    "gastrointestinalNormal" BOOLEAN NOT NULL DEFAULT false,
    "bowelSounds" TEXT[],
    "bowelSoundsNote" VARCHAR(255),
    "abdominalPainNone" BOOLEAN NOT NULL DEFAULT false,
    "abdominalPain" TEXT[],
    "abdominalPainNote" VARCHAR(255),
    "apetite" VARCHAR(255),
    "nutritionalRequirement" VARCHAR(255),
    "tubeFeeding" VARCHAR(255),
    "tubeFeedingContinuous" VARCHAR(255),
    "npo" BOOLEAN NOT NULL DEFAULT false,
    "bowelMovementNormal" BOOLEAN NOT NULL DEFAULT false,
    "bowelMovement" TEXT[],
    "lastBM" VARCHAR(255),
    "enema" VARCHAR(255),
    "markApplicableGastro" TEXT[],
    "gastrointestinalNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeuroGastro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenitoEndo" (
    "id" TEXT NOT NULL,
    "genitourinaryNormal" BOOLEAN NOT NULL DEFAULT false,
    "unscheduledVisitId" TEXT,
    "urineFrequency" VARCHAR(255),
    "urineColor" VARCHAR(255),
    "urineOdor" VARCHAR(255),
    "symptoms" TEXT[],
    "urinaryCathetherType" VARCHAR(255),
    "urinaryCathetherSize" VARCHAR(255),
    "urinaryCathetherLastChanged" TIMESTAMP(3),
    "urinaryCathetherIrrigation" VARCHAR(255),
    "urinaryCathetherBulbInflated" VARCHAR(255),
    "genitourinaryNote" VARCHAR(255),
    "endocrineNormal" BOOLEAN NOT NULL DEFAULT false,
    "bloodSugar" VARCHAR(255),
    "glucometerReading" VARCHAR(255),
    "bloodSugarFasting" VARCHAR(255),
    "testingFrequency" VARCHAR(255),
    "diabetesControlledWith" TEXT[],
    "administeredBy" TEXT[],
    "otherAdministeredBy" VARCHAR(255),
    "hypoFrequency" VARCHAR(255),
    "patientAware" VARCHAR(255),
    "endocrineNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenitoEndo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteMedication" (
    "id" TEXT NOT NULL,
    "medicationChanged" VARCHAR(225),
    "unscheduledVisitId" TEXT,
    "medicationDose" VARCHAR(225),
    "medicationUpdated" TEXT[],
    "allergyNote" VARCHAR(225),
    "administeredBy" VARCHAR(225),
    "otherAdministeredBy" VARCHAR(225),
    "missedDoses" BOOLEAN NOT NULL DEFAULT false,
    "missedDoseNote" VARCHAR(225),
    "medicationNote" VARCHAR(225),
    "therapyNA" BOOLEAN NOT NULL DEFAULT false,
    "therapyRoute" TEXT[],
    "therapySite" VARCHAR(225),
    "dressingChange" VARCHAR(225),
    "otherDressingChange" VARCHAR(225),
    "lineFlush" VARCHAR(225),
    "otherLineFlush" VARCHAR(225),
    "lineFlushSaline" TEXT[],
    "teachingProvidedTo" TEXT[],
    "otherTeachingProvidedTo" VARCHAR(225),
    "teachingResponse" TEXT[],
    "otherTeachingResponse" VARCHAR(225),
    "therapyNote" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotePlan" (
    "id" TEXT NOT NULL,
    "carePlan" TEXT[],
    "unscheduledVisitId" TEXT,
    "nurseVisit" VARCHAR(225),
    "physicianVisit" VARCHAR(225),
    "careCordinationWith" TEXT[],
    "otherCareCordinationWith" VARCHAR(225),
    "providedBillableSupplies" BOOLEAN NOT NULL DEFAULT false,
    "planNote" VARCHAR(225),
    "aideName" VARCHAR(225),
    "aidePresent" VARCHAR(225),
    "aideFamilySatisfied" BOOLEAN NOT NULL DEFAULT false,
    "aideTaskObserved" VARCHAR(225),
    "aideVisitDate" TIMESTAMP(3),
    "lpnName" VARCHAR(225),
    "lpnPresent" VARCHAR(225),
    "lpnFamilySatisfied" BOOLEAN NOT NULL DEFAULT false,
    "lpnTaskObserved" VARCHAR(225),
    "lpnVisitDate" TIMESTAMP(3),
    "generalNotes" VARCHAR(225) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QASignature" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "status" VARCHAR(100),
    "QANote" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QASignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinAndWound" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "normalSkin" BOOLEAN NOT NULL DEFAULT false,
    "signAndSymptoms" TEXT,
    "symptomsExplanation" TEXT,
    "skinColor" TEXT,
    "skinTugor" TEXT,
    "skinNote" TEXT,
    "temperature" TEXT,
    "skinCondition" TEXT,
    "doctorNotified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkinAndWound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wound" (
    "id" TEXT NOT NULL,
    "woundType" TEXT,
    "woundLocation" JSONB[],
    "skinAndWoundId" VARCHAR(225),
    "location" VARCHAR(225),
    "length" VARCHAR(100),
    "depth" VARCHAR(100),
    "width" VARCHAR(100),
    "tissueThickness" VARCHAR(225),
    "drainageType" VARCHAR(225),
    "drainageAmount" VARCHAR(225),
    "undermining" VARCHAR(225),
    "bedColor" VARCHAR(225),
    "tunnellingLocation" VARCHAR(225),
    "odor" VARCHAR(225),
    "edema" VARCHAR(225),
    "woundEdge" VARCHAR(225),
    "bedTissue" TEXT[],
    "surroundingTissue" TEXT[],
    "notes" VARCHAR(225),
    "NPWT" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteIntervention" (
    "id" TEXT NOT NULL,
    "bodySystem" VARCHAR(225),
    "unscheduledVisitId" VARCHAR(225),
    "effectiveDate" TIMESTAMP(3),
    "interventions" VARCHAR(225),
    "patientResponse" VARCHAR(225),
    "orders" VARCHAR(225),
    "goals" VARCHAR(225),
    "goalMet" VARCHAR(225),
    "goalMetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardioPulm_unscheduledVisitId_key" ON "CardioPulm"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "NeuroGastro_unscheduledVisitId_key" ON "NeuroGastro"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "GenitoEndo_unscheduledVisitId_key" ON "GenitoEndo"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteMedication_unscheduledVisitId_key" ON "NoteMedication"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePlan_unscheduledVisitId_key" ON "NotePlan"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "QASignature_unscheduledVisitId_key" ON "QASignature"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinAndWound_unscheduledVisitId_key" ON "SkinAndWound"("unscheduledVisitId");

-- AddForeignKey
ALTER TABLE "CardioPulm" ADD CONSTRAINT "CardioPulm_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeuroGastro" ADD CONSTRAINT "NeuroGastro_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenitoEndo" ADD CONSTRAINT "GenitoEndo_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMedication" ADD CONSTRAINT "NoteMedication_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePlan" ADD CONSTRAINT "NotePlan_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QASignature" ADD CONSTRAINT "QASignature_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinAndWound" ADD CONSTRAINT "SkinAndWound_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wound" ADD CONSTRAINT "Wound_skinAndWoundId_fkey" FOREIGN KEY ("skinAndWoundId") REFERENCES "SkinAndWound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteIntervention" ADD CONSTRAINT "NoteIntervention_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
