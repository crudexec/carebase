-- AlterTable
ALTER TABLE "PatientSchedule" ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "schedulerId" VARCHAR(100),
ADD COLUMN     "service" VARCHAR(255),
ADD COLUMN     "status" TEXT;

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
