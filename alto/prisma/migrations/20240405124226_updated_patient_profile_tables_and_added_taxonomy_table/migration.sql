/*
  Warnings:

  - You are about to drop the column `patientAccessInformationId` on the `User` table. All the data in the column will be lost.
  - Changed the type of `context` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogContext" AS ENUM ('PATIENT');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_patientAccessInformationId_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "context",
ADD COLUMN     "context" "LogContext" NOT NULL;

-- AlterTable
ALTER TABLE "PatientAccessInformation" ADD COLUMN     "caregivers" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "patientAccessInformationId";

-- DropEnum
DROP TYPE "LogType";

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyCode" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taxonomyId" TEXT,

    CONSTRAINT "TaxonomyCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaxonomyCode" ADD CONSTRAINT "TaxonomyCode_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
