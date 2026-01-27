/*
  Warnings:

  - You are about to drop the column `assessment` on the `ScheduleVisitVerification` table. All the data in the column will be lost.
  - You are about to drop the column `dateAssessmentCompleted` on the `ScheduleVisitVerification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduleVisitVerification" DROP COLUMN "assessment",
DROP COLUMN "dateAssessmentCompleted";

-- AlterTable
ALTER TABLE "UnscheduledVisit" ADD COLUMN     "assessment" VARCHAR(100),
ADD COLUMN     "dateAssessmentCompleted" TIMESTAMP(3);
