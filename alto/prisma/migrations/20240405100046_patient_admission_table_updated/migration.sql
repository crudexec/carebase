-- AlterTable
ALTER TABLE "PatientAdmission" ADD COLUMN     "actionDate" TIMESTAMP(3),
ADD COLUMN     "otherReason" VARCHAR(255),
ADD COLUMN     "reason" VARCHAR(255);
