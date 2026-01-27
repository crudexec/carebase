/*
  Warnings:

  - You are about to drop the `CardioPulm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CardioPulm" DROP CONSTRAINT "CardioPulm_unscheduledVisitId_fkey";

-- DropTable
DROP TABLE "CardioPulm";

-- CreateTable
CREATE TABLE "CardioPulmonary" (
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

    CONSTRAINT "CardioPulmonary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardioPulmonary_unscheduledVisitId_key" ON "CardioPulmonary"("unscheduledVisitId");

-- AddForeignKey
ALTER TABLE "CardioPulmonary" ADD CONSTRAINT "CardioPulmonary_unscheduledVisitId_fkey" FOREIGN KEY ("unscheduledVisitId") REFERENCES "UnscheduledVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
