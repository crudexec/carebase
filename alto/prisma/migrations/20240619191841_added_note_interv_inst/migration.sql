-- AlterTable
ALTER TABLE "UnscheduledVisit" ADD COLUMN     "snNoteType" VARCHAR(100);

-- CreateTable
CREATE TABLE "NoteIntervInst" (
    "id" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "interventions" TEXT[],
    "interventionNote" VARCHAR(225),
    "cardiacFluid" BOOLEAN NOT NULL DEFAULT false,
    "cardiacExacerbation" BOOLEAN NOT NULL DEFAULT false,
    "cardiacExacerbationNote" VARCHAR(225),
    "cardiacDietTeaching" BOOLEAN NOT NULL DEFAULT false,
    "cardiacDietTeachingNote" VARCHAR(225),
    "respiratory" TEXT[],
    "gigu" TEXT[],
    "endocrine" TEXT[],
    "endocrineDietTeaching" VARCHAR(225),
    "integumentary" TEXT[],
    "pain" TEXT[],
    "safety" TEXT[],
    "safetyDiseaseManagement" VARCHAR(225),
    "interactionResponse" VARCHAR(225),
    "instructionsNote" VARCHAR(225),
    "goals" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteIntervInst_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteIntervInst_unscheduledVisitId_key" ON "NoteIntervInst"("unscheduledVisitId");

-- AddForeignKey
ALTER TABLE "NoteIntervInst" ADD CONSTRAINT "NoteIntervInst_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
