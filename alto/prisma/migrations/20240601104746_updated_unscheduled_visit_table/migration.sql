/*
  Warnings:

  - You are about to alter the column `miles` on the `UnscheduledVisit` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `milesComments` on the `UnscheduledVisit` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "UnscheduledVisit" ADD COLUMN     "comments" VARCHAR(255),
ALTER COLUMN "miles" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "milesComments" SET DATA TYPE VARCHAR(100);
