-- AlterTable
ALTER TABLE "ClientFormRequest" ADD COLUMN     "intakeId" TEXT;

-- AlterTable
ALTER TABLE "ClientFormSubmission" ADD COLUMN     "intakeId" TEXT;

-- CreateTable
CREATE TABLE "IntakeForm" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intakeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,

    CONSTRAINT "IntakeForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntakeForm_templateId_idx" ON "IntakeForm"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeForm_intakeId_templateId_key" ON "IntakeForm"("intakeId", "templateId");

-- CreateIndex
CREATE INDEX "ClientFormRequest_intakeId_idx" ON "ClientFormRequest"("intakeId");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_intakeId_idx" ON "ClientFormSubmission"("intakeId");

-- AddForeignKey
ALTER TABLE "ClientFormRequest" ADD CONSTRAINT "ClientFormRequest_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeForm" ADD CONSTRAINT "IntakeForm_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeForm" ADD CONSTRAINT "IntakeForm_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeForm" ADD CONSTRAINT "IntakeForm_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

