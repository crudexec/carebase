/*
  Warnings:

  - You are about to drop the column `unscheduledVisitId` on the `CardioPulmonary` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `GenitoEndo` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `NeuroGastro` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `NoteIntervInst` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `NoteIntervention` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `NoteMedication` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `NotePlan` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `QASignature` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `SkinAndWound` table. All the data in the column will be lost.
  - You are about to drop the column `unscheduledVisitId` on the `VitalSigns` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `CardioPulmonary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `GenitoEndo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `NeuroGastro` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `NoteIntervInst` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `NoteMedication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `NotePlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `QASignature` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `SkinAndWound` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skilledNursingNoteId]` on the table `VitalSigns` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CardioPulmonary" DROP CONSTRAINT "CardioPulmonary_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "GenitoEndo" DROP CONSTRAINT "GenitoEndo_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "NeuroGastro" DROP CONSTRAINT "NeuroGastro_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "NoteIntervInst" DROP CONSTRAINT "NoteIntervInst_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "NoteIntervention" DROP CONSTRAINT "NoteIntervention_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "NoteMedication" DROP CONSTRAINT "NoteMedication_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "NotePlan" DROP CONSTRAINT "NotePlan_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "QASignature" DROP CONSTRAINT "QASignature_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "SkinAndWound" DROP CONSTRAINT "SkinAndWound_unscheduledVisitId_fkey";

-- DropForeignKey
ALTER TABLE "VitalSigns" DROP CONSTRAINT "VitalSigns_unscheduledVisitId_fkey";

-- DropIndex
DROP INDEX "CardioPulmonary_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "GenitoEndo_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "NeuroGastro_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "NoteIntervInst_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "NoteMedication_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "NotePlan_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "QASignature_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "SkinAndWound_unscheduledVisitId_key";

-- DropIndex
DROP INDEX "VitalSigns_unscheduledVisitId_key";

-- AlterTable
ALTER TABLE "CardioPulmonary" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "GenitoEndo" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "NeuroGastro" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "NoteIntervInst" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "NoteIntervention" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" VARCHAR(225);

-- AlterTable
ALTER TABLE "NoteMedication" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "NotePlan" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "QASignature" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "SkinAndWound" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- AlterTable
ALTER TABLE "VitalSigns" DROP COLUMN "unscheduledVisitId",
ADD COLUMN     "skilledNursingNoteId" TEXT;

-- CreateTable
CREATE TABLE "SkilledNursingNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "unscheduledVisitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkilledNursingNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkilledNursingNote_unscheduledVisitId_key" ON "SkilledNursingNote"("unscheduledVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "CardioPulmonary_skilledNursingNoteId_key" ON "CardioPulmonary"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "GenitoEndo_skilledNursingNoteId_key" ON "GenitoEndo"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "NeuroGastro_skilledNursingNoteId_key" ON "NeuroGastro"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteIntervInst_skilledNursingNoteId_key" ON "NoteIntervInst"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteMedication_skilledNursingNoteId_key" ON "NoteMedication"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePlan_skilledNursingNoteId_key" ON "NotePlan"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "QASignature_skilledNursingNoteId_key" ON "QASignature"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinAndWound_skilledNursingNoteId_key" ON "SkinAndWound"("skilledNursingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_skilledNursingNoteId_key" ON "VitalSigns"("skilledNursingNoteId");

-- AddForeignKey
ALTER TABLE "SkilledNursingNote" ADD CONSTRAINT "SkilledNursingNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkilledNursingNote" ADD CONSTRAINT "SkilledNursingNote_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkilledNursingNote" ADD CONSTRAINT "SkilledNursingNote_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioPulmonary" ADD CONSTRAINT "CardioPulmonary_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeuroGastro" ADD CONSTRAINT "NeuroGastro_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenitoEndo" ADD CONSTRAINT "GenitoEndo_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMedication" ADD CONSTRAINT "NoteMedication_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePlan" ADD CONSTRAINT "NotePlan_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QASignature" ADD CONSTRAINT "QASignature_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinAndWound" ADD CONSTRAINT "SkinAndWound_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteIntervention" ADD CONSTRAINT "NoteIntervention_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteIntervInst" ADD CONSTRAINT "NoteIntervInst_skilledNursingNoteId_fkey" FOREIGN KEY ("skilledNursingNoteId") REFERENCES "SkilledNursingNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
