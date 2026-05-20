-- CreateEnum
CREATE TYPE "ClientFormRequestStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ClientFormSubmissionStatus" AS ENUM ('SUBMITTED');

-- AlterEnum
ALTER TYPE "FormTemplateType" ADD VALUE 'CLIENT_FORM';

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "settings" JSONB;

-- CreateTable
CREATE TABLE "ClientFormRequest" (
    "id" TEXT NOT NULL,
    "status" "ClientFormRequestStatus" NOT NULL DEFAULT 'ACTIVE',
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxSubmissions" INTEGER,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ClientFormRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFormSubmission" (
    "id" TEXT NOT NULL,
    "status" "ClientFormSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "formSchemaSnapshot" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "isPublicSubmission" BOOLEAN NOT NULL DEFAULT false,
    "submittedByName" TEXT,
    "submittedByEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "requestId" TEXT,
    "submittedById" TEXT,

    CONSTRAINT "ClientFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientFormRequest_tokenHash_key" ON "ClientFormRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientFormRequest_companyId_idx" ON "ClientFormRequest"("companyId");

-- CreateIndex
CREATE INDEX "ClientFormRequest_clientId_idx" ON "ClientFormRequest"("clientId");

-- CreateIndex
CREATE INDEX "ClientFormRequest_templateId_idx" ON "ClientFormRequest"("templateId");

-- CreateIndex
CREATE INDEX "ClientFormRequest_status_idx" ON "ClientFormRequest"("status");

-- CreateIndex
CREATE INDEX "ClientFormRequest_expiresAt_idx" ON "ClientFormRequest"("expiresAt");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_companyId_idx" ON "ClientFormSubmission"("companyId");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_clientId_idx" ON "ClientFormSubmission"("clientId");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_templateId_idx" ON "ClientFormSubmission"("templateId");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_requestId_idx" ON "ClientFormSubmission"("requestId");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_status_idx" ON "ClientFormSubmission"("status");

-- CreateIndex
CREATE INDEX "ClientFormSubmission_submittedAt_idx" ON "ClientFormSubmission"("submittedAt");

-- AddForeignKey
ALTER TABLE "ClientFormRequest" ADD CONSTRAINT "ClientFormRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormRequest" ADD CONSTRAINT "ClientFormRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormRequest" ADD CONSTRAINT "ClientFormRequest_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormRequest" ADD CONSTRAINT "ClientFormRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClientFormRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormSubmission" ADD CONSTRAINT "ClientFormSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
