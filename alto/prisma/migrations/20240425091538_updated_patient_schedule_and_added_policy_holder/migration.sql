/*
  Warnings:

  - You are about to drop the column `active` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `archivedOn` on the `PatientSchedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId,type]` on the table `PatientInsurance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PatientScheduleStatus" AS ENUM ('SKIPPED', 'ARCHIVED', 'ACTIVE');

-- DropIndex
DROP INDEX "PatientInsurance_type_key";

-- AlterTable
ALTER TABLE "PatientAdmission" ADD COLUMN     "certEndDate" TIMESTAMP(3),
ADD COLUMN     "certStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "daysPerEpisode" VARCHAR(100);

-- AlterTable
ALTER TABLE "PatientInsurance" ALTER COLUMN "daysPerEpisode" SET DEFAULT '0';

-- AlterTable
ALTER TABLE "PatientSchedule" DROP COLUMN "active",
DROP COLUMN "archivedOn",
ADD COLUMN     "certEndDate" TIMESTAMP(3),
ADD COLUMN     "certStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "PatientScheduleStatus";

-- CreateTable
CREATE TABLE "PatientPolicyHolder" (
    "id" TEXT NOT NULL,
    "policyPayer" VARCHAR(100),
    "payerId" VARCHAR(100),
    "policyHolder" VARCHAR(100),
    "insuredPolicyHolder" VARCHAR(100),
    "uniqueId" VARCHAR(100),
    "patientId" VARCHAR(100) NOT NULL,
    "gender" "GenderType",
    "dob" TIMESTAMP(3),
    "address" VARCHAR(100),
    "country" VARCHAR(100),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "zipCode" VARCHAR(100),
    "phone" VARCHAR(100),
    "employerOrSchool" VARCHAR(100),
    "groupName" VARCHAR(100),
    "groupNumber" VARCHAR(100),
    "isOtherBenefitPlan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPolicyHolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientPolicyHolder_patientId_key" ON "PatientPolicyHolder"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientInsurance_patientId_type_key" ON "PatientInsurance"("patientId", "type");

-- AddForeignKey
ALTER TABLE "PatientPolicyHolder" ADD CONSTRAINT "PatientPolicyHolder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
