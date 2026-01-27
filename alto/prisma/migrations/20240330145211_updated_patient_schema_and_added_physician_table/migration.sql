/*
  Warnings:

  - You are about to drop the column `admission` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `discharge` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `hospital` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physician` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianAddress` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianCity` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianFax` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianNpi` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianPhone` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianSoc` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianState` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `physicianZip` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `soc` on the `Patient` table. All the data in the column will be lost.
  - The `maritalStatus` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('PART_TIME', 'FULL_TIME', 'NONE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FULL_TIME', 'PART_TIME', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'MILITARY_DUTY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AdmissionPriority" AS ENUM ('ELECTIVE', 'NEWBORN', 'TRAUMA', 'URGENT', 'EMERGENCY', 'INFORMATION_UNAVAILABLE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MARRIED', 'SINGLE', 'WIDOW', 'DIVORCED', 'SEPARATED', 'LIFE_PARTNER', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "admission",
DROP COLUMN "discharge",
DROP COLUMN "hospital",
DROP COLUMN "physician",
DROP COLUMN "physicianAddress",
DROP COLUMN "physicianCity",
DROP COLUMN "physicianFax",
DROP COLUMN "physicianNpi",
DROP COLUMN "physicianPhone",
DROP COLUMN "physicianSoc",
DROP COLUMN "physicianState",
DROP COLUMN "physicianZip",
DROP COLUMN "soc",
ADD COLUMN     "CBSACode" VARCHAR(100),
ADD COLUMN     "admissionPriority" "AdmissionPriority",
ADD COLUMN     "admissionSOC" TIMESTAMP(3),
ADD COLUMN     "admissionSource" VARCHAR(100),
ADD COLUMN     "authorizationNumber" VARCHAR(100),
ADD COLUMN     "conditionRelation" TEXT[],
ADD COLUMN     "controlNumber" VARCHAR(100),
ADD COLUMN     "county" VARCHAR(100),
ADD COLUMN     "employmentStatus" "EmploymentStatus",
ADD COLUMN     "faceToFace" TIMESTAMP(3),
ADD COLUMN     "notAPhysician" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notMedicareNumber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "physicianId" TEXT,
ADD COLUMN     "sharePatient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "PatientStatus",
ADD COLUMN     "student" "StudentType",
ADD COLUMN     "suffix" VARCHAR(100),
ADD COLUMN     "supervisingPhysician" VARCHAR(100),
ADD COLUMN     "supervisingPhysicianNpi" VARCHAR(100),
ADD COLUMN     "taxonomy" VARCHAR(100),
ADD COLUMN     "taxonomyCode" VARCHAR(100),
DROP COLUMN "maritalStatus",
ADD COLUMN     "maritalStatus" "MaritalStatus";

-- DropEnum
DROP TYPE "MaritalStatusType";

-- CreateTable
CREATE TABLE "Physician" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "phone" VARCHAR(100),
    "fax" VARCHAR(100),
    "address" VARCHAR(100),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zip" VARCHAR(100),
    "npi" VARCHAR(100),
    "M0030_SOC" TIMESTAMP(3),
    "admission" TIMESTAMP(3),
    "hospital" VARCHAR(100),
    "discharge" TIMESTAMP(3),
    "soc" TIMESTAMP(3),

    CONSTRAINT "Physician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Physician_name_key" ON "Physician"("name");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "Physician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
