-- CreateEnum
CREATE TYPE "OfferLetterTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OfferLetterStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OfferLetterTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "status" "OfferLetterTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "OfferLetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferLetter" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "OfferLetterStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientEmail" TEXT NOT NULL,
    "recipientFirstName" TEXT NOT NULL,
    "recipientLastName" TEXT NOT NULL,
    "recipientPhone" TEXT,
    "recipientRole" "UserRole",
    "recipientSnapshot" JSONB NOT NULL,
    "offerData" JSONB NOT NULL,
    "renderedSubject" TEXT NOT NULL,
    "renderedBodyHtml" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "signatureData" TEXT,
    "signedIpAddress" TEXT,
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "employeeId" TEXT,
    "sentById" TEXT NOT NULL,

    CONSTRAINT "OfferLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferLetterTemplate_companyId_idx" ON "OfferLetterTemplate"("companyId");
CREATE INDEX "OfferLetterTemplate_status_idx" ON "OfferLetterTemplate"("status");
CREATE INDEX "OfferLetterTemplate_createdById_idx" ON "OfferLetterTemplate"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "OfferLetter_token_key" ON "OfferLetter"("token");
CREATE INDEX "OfferLetter_companyId_idx" ON "OfferLetter"("companyId");
CREATE INDEX "OfferLetter_templateId_idx" ON "OfferLetter"("templateId");
CREATE INDEX "OfferLetter_employeeId_idx" ON "OfferLetter"("employeeId");
CREATE INDEX "OfferLetter_sentById_idx" ON "OfferLetter"("sentById");
CREATE INDEX "OfferLetter_token_idx" ON "OfferLetter"("token");
CREATE INDEX "OfferLetter_status_idx" ON "OfferLetter"("status");
CREATE INDEX "OfferLetter_recipientEmail_idx" ON "OfferLetter"("recipientEmail");
CREATE INDEX "OfferLetter_expiresAt_idx" ON "OfferLetter"("expiresAt");

-- AddForeignKey
ALTER TABLE "OfferLetterTemplate" ADD CONSTRAINT "OfferLetterTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfferLetterTemplate" ADD CONSTRAINT "OfferLetterTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfferLetter" ADD CONSTRAINT "OfferLetter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfferLetter" ADD CONSTRAINT "OfferLetter_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OfferLetterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OfferLetter" ADD CONSTRAINT "OfferLetter_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfferLetter" ADD CONSTRAINT "OfferLetter_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
