/*
  Warnings:

  - You are about to drop the column `groupId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_groupId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "PatientSchedule" (
    "id" TEXT NOT NULL,
    "patientId" VARCHAR(100) NOT NULL,
    "date" TEXT NOT NULL,
    "service" VARCHAR(100) NOT NULL,
    "timeIn" VARCHAR(100) NOT NULL,
    "timeOut" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "clinicianId" TEXT NOT NULL,

    CONSTRAINT "PatientSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
