/*
  Warnings:

  - You are about to drop the `PrintCalendar` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "VisitStatus" ADD VALUE 'UNASSIGNED';

-- DropTable
DROP TABLE "PrintCalendar";
