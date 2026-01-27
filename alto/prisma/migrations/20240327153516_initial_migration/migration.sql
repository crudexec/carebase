-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('HOMEHEALTH', 'HOSPICE', 'BOTH');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('REFERRED', 'ACTIVE', 'DISCHARGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('MEDICARE_PATIENT', 'MEDICARE_ADV', 'MANAGED_CARE', 'PROF', 'HOSPICE');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('TWILIO');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatusType" AS ENUM ('MARRIED', 'SINGLE', 'WIDOW', 'DIVORCED');

-- CreateEnum
CREATE TYPE "EthnicityType" AS ENUM ('NATIVEAMERICAN', 'ASIAN', 'AFRICANAMERICAN', 'HISPANIC', 'NATIVEHAWAIIAN', 'CAUCASIAN', 'OTHERS');

-- CreateEnum
CREATE TYPE "DmeSuppliesType" AS ENUM ('ORDERED', 'NOTNEEDED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('G0151', 'G0152', 'G0153', 'G0157', 'G0158', 'G0159', 'G0160', 'G0161');

-- CreateTable
CREATE TABLE "casbin_rule" (
    "id" TEXT NOT NULL,
    "ptype" VARCHAR(100) NOT NULL,
    "v0" VARCHAR(100),
    "v1" VARCHAR(100),
    "v2" VARCHAR(100),
    "v3" VARCHAR(100),
    "v4" VARCHAR(100),
    "v5" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casbin_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "providerName" VARCHAR(100),
    "billingName" VARCHAR(100),
    "providerNumber" VARCHAR(20),
    "contact1" VARCHAR(20),
    "contact2" VARCHAR(20),
    "address1" VARCHAR(255),
    "address2" VARCHAR(255),
    "state" VARCHAR(10),
    "city" VARCHAR(100),
    "zipCode" VARCHAR(10),
    "tpi" VARCHAR(100),
    "clientId" VARCHAR(100),
    "dmetpi" VARCHAR(100),
    "identifierName" VARCHAR(100),
    "benefitCode" VARCHAR(100),
    "npi" VARCHAR(100),
    "taxId" VARCHAR(100),
    "stateId" VARCHAR(100),
    "branchId" VARCHAR(100),
    "phone" VARCHAR(20),
    "cellPhone" VARCHAR(20),
    "fax" VARCHAR(100),
    "email" VARCHAR(100),
    "startDay" "DayType",
    "taxonomy" VARCHAR(100),
    "licenseNumber" VARCHAR(100),
    "name" VARCHAR(100),
    "novaetusId" VARCHAR(100),
    "providerType" "ProviderType",
    "qioAddress1" VARCHAR(255),
    "qioAddress2" VARCHAR(255),
    "qioCity" VARCHAR(100),
    "qioState" VARCHAR(100),
    "qioZipCode" VARCHAR(10),
    "qioPhone" VARCHAR(100),
    "qioFax" VARCHAR(100),
    "qioLocalPhone" VARCHAR(20),
    "ppiName" VARCHAR(100),
    "ppiNpi" VARCHAR(100),
    "ppiAddress1" VARCHAR(255),
    "ppiAddress2" VARCHAR(255),
    "ppiCity" VARCHAR(100),
    "ppiState" VARCHAR(100),
    "ppiZipCode" VARCHAR(100),
    "ppiTaxId" VARCHAR(100),
    "ppiTaxType" VARCHAR(100),
    "ppiProviderId" VARCHAR(100),
    "ppiProviderNumber" VARCHAR(20),
    "ppiSecId1" VARCHAR(100),
    "ppiSecId2" VARCHAR(100),
    "ppiSecType1" VARCHAR(100),
    "stateAssignedId" VARCHAR(100),
    "pressGaneyClientId" VARCHAR(100),
    "ppiSecType2" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "middleName" TEXT,
    "licenseNo" VARCHAR(100),
    "service" "ServiceType",
    "jobTitle" VARCHAR(100),
    "taxonomy" VARCHAR(100),
    "name" VARCHAR(100),
    "notes" VARCHAR(100),
    "addressLine1" VARCHAR(100),
    "addressLine2" VARCHAR(100),
    "country" VARCHAR(100),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "postalCode" VARCHAR(100),
    "homePhone" VARCHAR(100),
    "cellPhone" VARCHAR(100),
    "fax" VARCHAR(100),
    "memo" VARCHAR(255),
    "groupId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mediaId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socialSecurity" TEXT,
    "dob" TIMESTAMP(3),
    "driversLicenseId" TEXT,
    "professionalLicenseId" TEXT,
    "hireDate" TIMESTAMP(3),
    "lastDate" TIMESTAMP(3),
    "evaluationDueDate" TIMESTAMP(3),
    "oigMonthlyUpdate" TEXT,
    "yearlyEvaluationDueDate" TIMESTAMP(3),
    "criminalCheckDueDate" TIMESTAMP(3),
    "screeningDueDate" TIMESTAMP(3),
    "lastCPRTraining" TIMESTAMP(3),
    "CPRExpiration" TIMESTAMP(3),
    "insuranceExpiration" TIMESTAMP(3),
    "lastAidRegistry" TIMESTAMP(3),
    "lastMisconductRegistry" TIMESTAMP(3),
    "greenCardExpiration" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverCertification" (
    "id" TEXT NOT NULL,
    "certification" VARCHAR(255),
    "expires" TIMESTAMP(3),
    "userHistoryId" TEXT,

    CONSTRAINT "CaregiverCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "expires" TIMESTAMP(3),

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "fileType" VARCHAR(100),
    "fileName" VARCHAR(100),
    "mediaId" TEXT NOT NULL,
    "src" TEXT,
    "alt" TEXT,
    "size" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedOn" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userHistoryId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProvider" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(100) NOT NULL,
    "providerId" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" "VendorType" NOT NULL,
    "providerId" VARCHAR(100) NOT NULL,
    "credentials" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100),
    "middleInitial" VARCHAR(100),
    "lastName" VARCHAR(100),
    "dob" TIMESTAMP(3),
    "ssn" VARCHAR(100),
    "phone" VARCHAR(100),
    "medicaidNumber" VARCHAR(100),
    "medicareNumber" VARCHAR(100),
    "address1" VARCHAR(255),
    "address2" VARCHAR(255),
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zip" VARCHAR(100),
    "gender" "GenderType",
    "maritalStatus" "MaritalStatusType",
    "workersComp" VARCHAR(100),
    "race" "EthnicityType",
    "referralSource" VARCHAR(100),
    "physician" VARCHAR(100),
    "physicianPhone" VARCHAR(100),
    "physicianFax" VARCHAR(100),
    "physicianAddress" VARCHAR(100),
    "physicianCity" VARCHAR(100),
    "physicianState" VARCHAR(100),
    "physicianZip" VARCHAR(100),
    "physicianNpi" VARCHAR(100),
    "hospital" VARCHAR(100),
    "admission" VARCHAR(100),
    "discharge" VARCHAR(100),
    "soc" VARCHAR(100),
    "physicianSoc" VARCHAR(100),
    "dme" VARCHAR(100),
    "dmeSupplies" "DmeSuppliesType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "ulcerComments" VARCHAR(255),
    "pressureUlcer" VARCHAR(255),
    "functionLimits" TEXT[],
    "rue" VARCHAR(100),
    "activitiesAndDiet" TEXT[],
    "wtBearing" VARCHAR(100),
    "assistiveDevice" VARCHAR(100),
    "diet" VARCHAR(100),
    "allergies" VARCHAR(255),
    "M1045InfluenzaVaccine" TIMESTAMP(3),
    "M1045InfluenzaVaccineReceived" VARCHAR(100),
    "M1055PneumococcalVaccine" TIMESTAMP(3),
    "M1055PneumococcalVaccineReceived" VARCHAR(100),
    "tetanusVaccine" TIMESTAMP(3),
    "tetanusVaccineReceived" VARCHAR(100),
    "otherVaccine" TIMESTAMP(3),
    "otherVaccineReceived" VARCHAR(100),
    "foleyCatheter" VARCHAR(100),
    "foleyCatheterSize" VARCHAR(100),
    "foleyCatheterFrequency" VARCHAR(100),
    "foleyCatheterLabWork" VARCHAR(100),
    "foleyCatheterDate" TIMESTAMP(3),
    "primaryCaregiver" VARCHAR(100),
    "physicianOrders" VARCHAR(100),
    "emergencyContact" VARCHAR(100),
    "contactNumber" VARCHAR(100),
    "medicareAEffective" VARCHAR(100),
    "medicareBEffective" VARCHAR(100),
    "medicareAEffectiveDate" TIMESTAMP(3),
    "medicareBEffectiveDate" TIMESTAMP(3),
    "initalIntakeNurse" TEXT,
    "initialReferral" TEXT,
    "initialReferralTime" TEXT,
    "finalIntakeNurse" TEXT,
    "finalReferral" TEXT,
    "finalReferralTime" TEXT,
    "nurseComments" TEXT,
    "proposedAdmission" TEXT,
    "proposedAdmissionTime" TEXT,
    "admissionsourceCodeC" TEXT,
    "admissionSourceCodeB" TEXT,
    "serviceRequestedComments" VARCHAR(255),
    "serviceRequestedMedication" VARCHAR(255),
    "auxiliaryService" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "drug" VARCHAR(100),
    "dose" VARCHAR(100),
    "frequency" VARCHAR(100),
    "route" VARCHAR(100),
    "NorC" VARCHAR(100),
    "sideEffect" VARCHAR(100),
    "medClassification" VARCHAR(100),
    "dcDate" TIMESTAMP(3),
    "signature" VARCHAR(100),
    "patientMedicationId" TEXT,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimaryDx" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "dateType" VARCHAR(10),
    "date" TIMESTAMP(3),
    "patientMedicationId" TEXT,

    CONSTRAINT "PrimaryDx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MIO12InpatientProcedure" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "dateType" VARCHAR(10),
    "date" TIMESTAMP(3),
    "patientMedicationId" TEXT,

    CONSTRAINT "MIO12InpatientProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequested" (
    "id" TEXT NOT NULL,
    "service" VARCHAR(255),
    "discipline" VARCHAR(255),
    "frequency" VARCHAR(255),
    "patientMedicationId" TEXT,

    CONSTRAINT "ServiceRequested_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAdmission" (
    "id" TEXT NOT NULL,
    "patientId" VARCHAR(100) NOT NULL,
    "payer" "PayerType",
    "status" "PatientStatus",
    "actionById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAdmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserHistory_userId_key" ON "UserHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_mediaId_key" ON "Media"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PatientMedication_patientId_key" ON "PatientMedication"("patientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_driversLicenseId_fkey" FOREIGN KEY ("driversLicenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_professionalLicenseId_fkey" FOREIGN KEY ("professionalLicenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverCertification" ADD CONSTRAINT "CaregiverCertification_userHistoryId_fkey" FOREIGN KEY ("userHistoryId") REFERENCES "UserHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userHistoryId_fkey" FOREIGN KEY ("userHistoryId") REFERENCES "UserHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProvider" ADD CONSTRAINT "UserProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProvider" ADD CONSTRAINT "UserProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_patientMedicationId_fkey" FOREIGN KEY ("patientMedicationId") REFERENCES "PatientMedication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrimaryDx" ADD CONSTRAINT "PrimaryDx_patientMedicationId_fkey" FOREIGN KEY ("patientMedicationId") REFERENCES "PatientMedication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MIO12InpatientProcedure" ADD CONSTRAINT "MIO12InpatientProcedure_patientMedicationId_fkey" FOREIGN KEY ("patientMedicationId") REFERENCES "PatientMedication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequested" ADD CONSTRAINT "ServiceRequested_patientMedicationId_fkey" FOREIGN KEY ("patientMedicationId") REFERENCES "PatientMedication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAdmission" ADD CONSTRAINT "PatientAdmission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAdmission" ADD CONSTRAINT "PatientAdmission_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
