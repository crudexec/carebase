-- AlterTable
ALTER TABLE "ScheduleVisitVerification" ADD COLUMN     "assessment" VARCHAR(100),
ADD COLUMN     "dateAssessmentCompleted" TIMESTAMP(3);
