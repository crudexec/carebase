-- CreateEnum
CREATE TYPE "InsuranceSectionType" AS ENUM ('HOSPICE', 'MEDICARE', 'NON_MEDICARE', 'MANAGED_CARE', 'CMS');

-- CreateTable
CREATE TABLE "PatientAuthorization" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" VARCHAR(100),
    "insurance" VARCHAR(225),
    "number" VARCHAR(225),
    "visitsAuthorized" VARCHAR(225),
    "sn" VARCHAR(100),
    "pt" VARCHAR(100),
    "ot" VARCHAR(100),
    "st" VARCHAR(100),
    "msw" VARCHAR(100),
    "rn" VARCHAR(100),
    "lvn" VARCHAR(100),
    "caregiver" VARCHAR(100),
    "hha" VARCHAR(100),
    "rm" VARCHAR(100),
    "assLiv" VARCHAR(100),
    "empAs" VARCHAR(100),
    "peer" VARCHAR(100),
    "counselling" VARCHAR(100),
    "sud" VARCHAR(100),
    "sudg" VARCHAR(100),
    "nurse" VARCHAR(100),
    "psychRe" VARCHAR(100),
    "psychRehg" VARCHAR(100),
    "transp" VARCHAR(100),
    "supEmp" VARCHAR(100),
    "shl" VARCHAR(100),
    "hhc" VARCHAR(100),
    "sls" VARCHAR(100),
    "comment" VARCHAR(255),
    "patientId" TEXT,

    CONSTRAINT "PatientAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientInsurance" (
    "id" TEXT NOT NULL,
    "type" "InsuranceSectionType",
    "status" BOOLEAN DEFAULT false,
    "daysPerEpisode" VARCHAR(100),
    "noOfVisitAuthorized" VARCHAR(100),
    "serviceRequired" TEXT[],
    "company" VARCHAR(100),
    "payerId" VARCHAR(100),
    "insuredId" VARCHAR(100),
    "clearingClaims" VARCHAR(100),
    "patientId" TEXT,

    CONSTRAINT "PatientInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientCommercial" (
    "id" TEXT NOT NULL,
    "insuranceInformation" TEXT[],
    "payId" VARCHAR(100),
    "policyHolder" VARCHAR(100),
    "insuredHolder" VARCHAR(100),
    "uniqueId" VARCHAR(100),
    "gender" "GenderType",
    "dob" TIMESTAMP(3),
    "address" VARCHAR(255),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "zip" VARCHAR(100),
    "phone" VARCHAR(100),
    "employer" VARCHAR(100),
    "groupName" VARCHAR(100),
    "groupNumber" VARCHAR(100),
    "patientId" TEXT,
    "isOtherBenefitPlan" BOOLEAN NOT NULL DEFAULT false,
    "otherInsured" VARCHAR(100),
    "otherBenefitPlanEmployer" VARCHAR(100),
    "otherBenefitPlanDob" TIMESTAMP(3),
    "otherBenefitPlanGroupName" VARCHAR(100),
    "otherBenefitPlanGroupNumber" VARCHAR(100),
    "otherBenefitPlanGender" "GenderType",

    CONSTRAINT "PatientCommercial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientEmergencyContact" (
    "id" TEXT NOT NULL,
    "nextOfKinName" VARCHAR(100),
    "nextOfKinRelation" VARCHAR(100),
    "nextOfKinPhone" VARCHAR(100),
    "nextOfKinExt" VARCHAR(100),
    "nextOfKinAddress" VARCHAR(100),
    "homePet" VARCHAR(100),
    "livesWith" VARCHAR(100),
    "smokesInHome" VARCHAR(100),
    "location" VARCHAR(100),
    "isAdvancedDirective" BOOLEAN DEFAULT false,
    "attorneyPower" VARCHAR(100),
    "poaPhone" VARCHAR(100),
    "legalPaperOption" TEXT[],
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "dayPhone" VARCHAR(100),
    "eveningPhone" VARCHAR(100),
    "relation" VARCHAR(100),
    "address" VARCHAR(100),
    "type" VARCHAR(100),
    "patientId" TEXT,

    CONSTRAINT "PatientEmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientReferralSource" (
    "id" TEXT NOT NULL,
    "referredBy" VARCHAR(100),
    "type" VARCHAR(100),
    "facility" VARCHAR(100),
    "referralDate" TIMESTAMP(3),
    "coordinator" VARCHAR(100),
    "salesRep" VARCHAR(100),
    "referralPhone" VARCHAR(100),
    "ext" VARCHAR(100),
    "disposition" VARCHAR(100),
    "followUp" VARCHAR(100),
    "otherHHA" VARCHAR(100),
    "phone" VARCHAR(100),
    "mrNumber" VARCHAR(100),
    "notes" VARCHAR(255),
    "diagnosis" VARCHAR(255),
    "patientId" TEXT,

    CONSTRAINT "PatientReferralSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "phone" VARCHAR(100),
    "address" VARCHAR(255),
    "fax" VARCHAR(100),
    "patientReferralSourceId" TEXT,

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientInsurance_type_key" ON "PatientInsurance"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PatientCommercial_patientId_key" ON "PatientCommercial"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientEmergencyContact_patientId_key" ON "PatientEmergencyContact"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientReferralSource_patientId_key" ON "PatientReferralSource"("patientId");

-- AddForeignKey
ALTER TABLE "PatientAuthorization" ADD CONSTRAINT "PatientAuthorization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientCommercial" ADD CONSTRAINT "PatientCommercial_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientEmergencyContact" ADD CONSTRAINT "PatientEmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReferralSource" ADD CONSTRAINT "PatientReferralSource_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pharmacy" ADD CONSTRAINT "Pharmacy_patientReferralSourceId_fkey" FOREIGN KEY ("patientReferralSourceId") REFERENCES "PatientReferralSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
