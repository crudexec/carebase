/*
  Warnings:

  - You are about to drop the column `careConnect` on the `PatientOtherInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId]` on the table `DischargeSummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patientId]` on the table `PatientOtherInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `patientId` to the `PatientOtherInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PatientOtherInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PatientOtherInfo" DROP COLUMN "careConnect",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "excludeCareConnect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patientId" TEXT NOT NULL,
ADD COLUMN     "physicianId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DischargeSummary_patientId_key" ON "DischargeSummary"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientOtherInfo_patientId_key" ON "PatientOtherInfo"("patientId");

-- AddForeignKey
ALTER TABLE "PatientOtherInfo" ADD CONSTRAINT "PatientOtherInfo_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientOtherInfo" ADD CONSTRAINT "PatientOtherInfo_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "Physician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
