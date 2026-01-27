/*
  Warnings:

  - You are about to drop the column `certEndDate` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `certStartDate` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `clinicianId` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `physicianId` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `timeIn` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `timeOut` on the `PatientSchedule` table. All the data in the column will be lost.
  - You are about to alter the column `groupId` on the `PatientSchedule` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- CreateEnum
CREATE TYPE "Occurence" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('NOT_COMPLETED', 'COMPLETED', 'CANCELLED', 'HOSPITALIZED', 'ON_HOLD', 'MISSED');

-- DropForeignKey
ALTER TABLE "PatientSchedule" DROP CONSTRAINT "PatientSchedule_clinicianId_fkey";

-- DropForeignKey
ALTER TABLE "PatientSchedule" DROP CONSTRAINT "PatientSchedule_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientSchedule" DROP CONSTRAINT "PatientSchedule_physicianId_fkey";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "PatientSchedule" DROP COLUMN "certEndDate",
DROP COLUMN "certStartDate",
DROP COLUMN "clinicianId",
DROP COLUMN "comments",
DROP COLUMN "date",
DROP COLUMN "physicianId",
DROP COLUMN "service",
DROP COLUMN "status",
DROP COLUMN "timeIn",
DROP COLUMN "timeOut",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "administrativeComments" VARCHAR(255),
ADD COLUMN     "appointmentEndTime" TIMESTAMP(3),
ADD COLUMN     "appointmentStartTime" TIMESTAMP(3),
ADD COLUMN     "archivedOn" TIMESTAMP(3),
ADD COLUMN     "billable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "billingCode" VARCHAR(100),
ADD COLUMN     "caregiverComments" VARCHAR(255),
ADD COLUMN     "caregiverId" TEXT,
ADD COLUMN     "expense" VARCHAR(100),
ADD COLUMN     "miles" VARCHAR(100),
ADD COLUMN     "monitoredForQA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overTime" VARCHAR(100),
ADD COLUMN     "travelTime" VARCHAR(100),
ADD COLUMN     "validateForTimeConflict" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visitLocation" VARCHAR(100),
ADD COLUMN     "visitStatus" "VisitStatus",
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "patientId" SET DATA TYPE TEXT,
ALTER COLUMN "groupId" DROP NOT NULL,
ALTER COLUMN "groupId" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "ScheduleRecurrence" (
    "id" TEXT NOT NULL,
    "patientScheduleId" TEXT,
    "isRecurringEvent" BOOLEAN NOT NULL DEFAULT false,
    "pattern" "Occurence",
    "startDate" TIMESTAMP(3),
    "endAfter" BOOLEAN NOT NULL DEFAULT false,
    "frequency" VARCHAR(100),
    "endBy" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TIMESTAMP(3),
    "isEveryday" BOOLEAN NOT NULL DEFAULT false,
    "isEveryWeekday" BOOLEAN NOT NULL DEFAULT false,
    "dayFrequency" VARCHAR(100),
    "weekFrequency" VARCHAR(100),
    "recurringDays" TEXT[],
    "isDayMonth" BOOLEAN NOT NULL DEFAULT false,
    "dayMonth" VARCHAR(100),
    "dayMonthFrequency" VARCHAR(100),
    "isMonth" BOOLEAN NOT NULL DEFAULT false,
    "monthPosition" VARCHAR(100),
    "monthDay" VARCHAR(100),
    "monthFrequency" VARCHAR(100),
    "isEveryYear" BOOLEAN NOT NULL DEFAULT false,
    "everyYearMonth" VARCHAR(100),
    "everyYearDay" VARCHAR(100),
    "isYear" BOOLEAN NOT NULL DEFAULT false,
    "yearPosition" VARCHAR(100),
    "yearDay" VARCHAR(100),
    "yearMonth" VARCHAR(100),
    "occurence" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleRecurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintCalendar" (
    "id" TEXT NOT NULL,
    "calendarBy" VARCHAR(100),
    "month" VARCHAR(100),
    "year" VARCHAR(100),
    "weekDay" TIMESTAMP(3),
    "certPeriod" VARCHAR(100),
    "dateRangeFrom" TIMESTAMP(3),
    "dateRangeThrough" TIMESTAMP(3),
    "printCalendarFor" VARCHAR(100),
    "patient" VARCHAR(100),
    "allPatient" BOOLEAN DEFAULT false,
    "caregiver" VARCHAR(100),
    "allCaregiver" BOOLEAN DEFAULT false,
    "calendarFontSize" VARCHAR(100),
    "office" VARCHAR(100),
    "allOffice" BOOLEAN DEFAULT false,
    "visitStatus" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleRecurrence_patientScheduleId_key" ON "ScheduleRecurrence"("patientScheduleId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRecurrence" ADD CONSTRAINT "ScheduleRecurrence_patientScheduleId_fkey" FOREIGN KEY ("patientScheduleId") REFERENCES "PatientSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
