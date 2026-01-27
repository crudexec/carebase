-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('PATIENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "patientAccessInformationId" TEXT;

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "context" "LogType" NOT NULL,
    "contextId" VARCHAR(100) NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAccessInformation" (
    "id" TEXT NOT NULL,
    "patientId" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAccessInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccessInformation_patientId_key" ON "PatientAccessInformation"("patientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_patientAccessInformationId_fkey" FOREIGN KEY ("patientAccessInformationId") REFERENCES "PatientAccessInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAccessInformation" ADD CONSTRAINT "PatientAccessInformation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
