/*
  Warnings:

  - Added the required column `groupId` to the `PatientSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PatientSchedule" ADD COLUMN     "groupId" TEXT NOT NULL,
ADD COLUMN     "physicianId" TEXT;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "Physician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
