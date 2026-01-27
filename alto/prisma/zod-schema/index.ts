import { z } from "zod";
import { Prisma } from "@prisma/client";

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput =
  | Prisma.JsonValue
  | null
  | "JsonNull"
  | "DbNull"
  | Prisma.NullTypes.DbNull
  | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === "DbNull") return Prisma.NullTypes.DbNull;
  if (v === "JsonNull") return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(
      z.string(),
      z.lazy(() => JsonValueSchema.optional()),
    ),
    z.array(z.lazy(() => JsonValueSchema)),
  ]),
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal("DbNull"), z.literal("JsonNull")])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(
  () =>
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.object({ toJSON: z.any() }),
      z.record(
        z.string(),
        z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)])),
      ),
      z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    ]),
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  "ReadUncommitted",
  "ReadCommitted",
  "RepeatableRead",
  "Serializable",
]);

export const AssessmentScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "caregiverId",
  "patientScheduleId",
  "source",
  "reasons",
  "qaStatus",
  "qaComment",
  "exportStatus",
  "dateCompleted",
  "patientId",
  "patientTracking",
  "historyAndDiagnosis",
  "livingFinancial",
  "oasisAssessment",
  "nursingAssessment",
  "ptEval",
  "walkTest",
  "snVisit",
  "otEval",
  "otVisit",
  "ptVisit",
  "hhaVisit",
  "socAccess",
  "stEval",
  "stVisit",
  "oasisFollowUp",
  "consent",
  "qaed",
  "submittedAt",
  "visitDate",
  "timeIn",
  "timeOut",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const CasbinRuleScalarFieldEnumSchema = z.enum([
  "id",
  "ptype",
  "v0",
  "v1",
  "v2",
  "v3",
  "v4",
  "v5",
  "createdAt",
  "updatedAt",
]);

export const ProviderScalarFieldEnumSchema = z.enum([
  "id",
  "providerName",
  "billingName",
  "providerNumber",
  "contact1",
  "contact2",
  "address1",
  "address2",
  "state",
  "city",
  "zipCode",
  "tpi",
  "clientId",
  "dmetpi",
  "identifierName",
  "benefitCode",
  "npi",
  "taxId",
  "stateId",
  "branchId",
  "phone",
  "cellPhone",
  "fax",
  "email",
  "startDay",
  "taxonomy",
  "licenseNumber",
  "taxonomyCode",
  "novaetusId",
  "providerType",
  "qioAddress1",
  "qioAddress2",
  "qioCity",
  "qioState",
  "qioZipCode",
  "qioPhone",
  "qioFax",
  "qioLocalPhone",
  "ppiName",
  "ppiNpi",
  "ppiAddress1",
  "ppiAddress2",
  "ppiCity",
  "ppiState",
  "ppiZipCode",
  "ppiTaxId",
  "ppiTaxType",
  "ppiProviderId",
  "ppiProviderNumber",
  "ppiSecId1",
  "ppiSecId2",
  "ppiSecType1",
  "stateAssignedId",
  "pressGaneyClientId",
  "ppiSecType2",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const UserScalarFieldEnumSchema = z.enum([
  "id",
  "email",
  "password",
  "firstName",
  "lastName",
  "middleName",
  "licenseNo",
  "service",
  "jobTitle",
  "taxonomy",
  "taxonomyCode",
  "notes",
  "addressLine1",
  "addressLine2",
  "country",
  "state",
  "city",
  "postalCode",
  "homePhone",
  "cellPhone",
  "fax",
  "memo",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
  "mediaId",
]);

export const UserHistoryScalarFieldEnumSchema = z.enum([
  "id",
  "userId",
  "socialSecurity",
  "dob",
  "driversLicenseId",
  "professionalLicenseId",
  "hireDate",
  "lastDate",
  "evaluationDueDate",
  "oigMonthlyUpdate",
  "yearlyEvaluationDueDate",
  "criminalCheckDueDate",
  "screeningDueDate",
  "lastCPRTraining",
  "CPRExpiration",
  "insuranceExpiration",
  "lastAidRegistry",
  "lastMisconductRegistry",
  "greenCardExpiration",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const CaregiverCertificationScalarFieldEnumSchema = z.enum([
  "id",
  "certification",
  "expires",
  "userHistoryId",
]);

export const LicenseScalarFieldEnumSchema = z.enum(["id", "name", "expires"]);

export const MediaScalarFieldEnumSchema = z.enum([
  "id",
  "fileType",
  "fileName",
  "mediaId",
  "src",
  "alt",
  "size",
  "updatedAt",
  "createdAt",
  "archivedOn",
  "active",
  "userHistoryId",
]);

export const UserProviderScalarFieldEnumSchema = z.enum([
  "id",
  "userId",
  "providerId",
  "createdAt",
  "updatedAt",
]);

export const VendorScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "providerId",
  "credentials",
  "active",
  "createdAt",
  "updatedAt",
]);

export const GroupScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "active",
  "createdAt",
  "updatedAt",
]);

export const PermissionScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "active",
  "createdAt",
  "updatedAt",
]);

export const PatientScalarFieldEnumSchema = z.enum([
  "id",
  "firstName",
  "middleInitial",
  "lastName",
  "patientNo",
  "providerId",
  "dob",
  "suffix",
  "ssn",
  "phone",
  "medicaidNumber",
  "medicareNumber",
  "address1",
  "address2",
  "country",
  "city",
  "state",
  "zip",
  "gender",
  "maritalStatus",
  "workersComp",
  "race",
  "referralSource",
  "physicianId",
  "dme",
  "controlNumber",
  "admissionSOC",
  "notAPhysician",
  "notMedicareNumber",
  "CBSACode",
  "admissionSource",
  "admissionPriority",
  "authorizationNumber",
  "employmentStatus",
  "faceToFace",
  "taxonomy",
  "taxonomyCode",
  "conditionRelation",
  "county",
  "autoAccidentState",
  "sharePatient",
  "dmeSupplies",
  "student",
  "supervisingPhysician",
  "supervisingPhysicianNpi",
  "status",
  "createdAt",
  "updatedAt",
  "active",
  "archivedOn",
  "caregiverId",
  "pan",
  "dnr",
  "infectionControl",
  "admitInfection",
  "transferredFrom",
]);

export const PatientAuthorizationScalarFieldEnumSchema = z.enum([
  "id",
  "startDate",
  "endDate",
  "status",
  "insurance",
  "number",
  "visitsAuthorized",
  "sn",
  "pt",
  "ot",
  "st",
  "msw",
  "rn",
  "lvn",
  "caregiver",
  "hha",
  "rm",
  "assLiv",
  "empAs",
  "peer",
  "counselling",
  "sud",
  "sudg",
  "nurse",
  "psychRe",
  "psychRehg",
  "transp",
  "supEmp",
  "shl",
  "hhc",
  "sls",
  "comment",
  "patientId",
]);

export const PayerScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "phone",
  "fax",
  "providerId",
  "address",
  "city",
  "state",
  "zip",
  "npi",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const PatientInsuranceScalarFieldEnumSchema = z.enum([
  "id",
  "type",
  "status",
  "daysPerEpisode",
  "noOfVisitAuthorized",
  "serviceRequired",
  "company",
  "payerId",
  "insuredId",
  "clearingClaims",
  "patientId",
  "payerResponsibility",
  "memberId",
  "groupName",
  "groupNumber",
  "insuranceCaseManagerId",
  "billType",
  "assignBenefits",
  "providerAcceptAssignment",
  "effectiveFrom",
  "effectiveThrough",
  "patientRelationship",
  "lastName",
  "firstName",
  "middleName",
  "suffix",
  "dob",
  "sex",
  "address1",
  "address2",
  "city",
  "state",
  "zip",
  "relationshipToPatient",
  "copayType",
  "copayAmount",
  "comment",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const PatientFrequencyScalarFieldEnumSchema = z.enum([
  "id",
  "patientId",
  "disciplineId",
  "visit",
  "perDay",
  "effectiveFrom",
  "effectiveThrough",
  "comment",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const RelatedCaregiverScalarFieldEnumSchema = z.enum([
  "id",
  "caregiverId",
  "relationShip",
  "patientInsuranceId",
]);

export const PatientOtherInfoScalarFieldEnumSchema = z.enum([
  "id",
  "comment",
  "patientId",
  "noPublicity",
  "telephony",
  "referralDate",
  "region",
  "sentDate",
  "receivedDate",
  "pharmacyName",
  "pharmacyPhone",
  "pharmacyFax",
  "excludeCareConnect",
  "evacuationLevel",
  "releaseInformation",
  "patientSignatureSourceCode",
  "patientConditions",
  "patientConditionState",
  "patientConditionDate",
  "createdAt",
  "updatedAt",
  "physicianId",
]);

export const OtherPhysicianScalarFieldEnumSchema = z.enum([
  "id",
  "physicianId",
  "comment",
  "patientOtherInfoId",
]);

export const PatientCommercialScalarFieldEnumSchema = z.enum([
  "id",
  "insuranceInformation",
  "payId",
  "policyHolder",
  "insuredHolder",
  "uniqueId",
  "gender",
  "dob",
  "address",
  "state",
  "city",
  "country",
  "zip",
  "phone",
  "employer",
  "groupName",
  "groupNumber",
  "patientId",
  "isOtherBenefitPlan",
  "otherInsured",
  "otherBenefitPlanEmployer",
  "otherBenefitPlanDob",
  "otherBenefitPlanGroupName",
  "otherBenefitPlanGroupNumber",
  "otherBenefitPlanGender",
]);

export const PatientEmergencyContactScalarFieldEnumSchema = z.enum([
  "id",
  "nextOfKinName",
  "nextOfKinRelation",
  "nextOfKinPhone",
  "nextOfKinExt",
  "nextOfKinAddress",
  "homePet",
  "livesWith",
  "smokesInHome",
  "location",
  "isAdvancedDirective",
  "attorneyPower",
  "poaPhone",
  "legalPaperOption",
  "firstName",
  "lastName",
  "dayPhone",
  "eveningPhone",
  "relation",
  "address",
  "type",
  "patientId",
]);

export const PatientReferralSourceScalarFieldEnumSchema = z.enum([
  "id",
  "referredBy",
  "type",
  "facility",
  "referralDate",
  "coordinator",
  "salesRep",
  "referralPhone",
  "ext",
  "disposition",
  "followUp",
  "otherHHA",
  "phone",
  "mrNumber",
  "notes",
  "diagnosis",
  "patientId",
]);

export const PharmacyScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "phone",
  "address",
  "fax",
  "patientReferralSourceId",
]);

export const PatientMedicationScalarFieldEnumSchema = z.enum([
  "id",
  "patientId",
  "ulcerComments",
  "pressureUlcer",
  "functionLimits",
  "rue",
  "activitiesAndDiet",
  "wtBearing",
  "assistiveDevice",
  "diet",
  "allergies",
  "M1045InfluenzaVaccine",
  "M1045InfluenzaVaccineReceived",
  "M1055PneumococcalVaccine",
  "M1055PneumococcalVaccineReceived",
  "tetanusVaccine",
  "tetanusVaccineReceived",
  "otherVaccine",
  "otherVaccineReceived",
  "foleyCatheter",
  "foleyCatheterSize",
  "foleyCatheterFrequency",
  "foleyCatheterLabWork",
  "foleyCatheterDate",
  "primaryCaregiver",
  "physicianOrders",
  "emergencyContact",
  "contactNumber",
  "medicareAEffective",
  "medicareBEffective",
  "medicareAEffectiveDate",
  "medicareBEffectiveDate",
  "initalIntakeNurse",
  "initialReferral",
  "initialReferralTime",
  "finalIntakeNurse",
  "finalReferral",
  "finalReferralTime",
  "nurseComments",
  "proposedAdmission",
  "proposedAdmissionTime",
  "admissionsourceCodeC",
  "admissionSourceCodeB",
  "serviceRequestedComments",
  "serviceRequestedMedication",
  "auxiliaryService",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const PhysicianScalarFieldEnumSchema = z.enum([
  "id",
  "firstName",
  "lastName",
  "upin",
  "providerId",
  "phone",
  "fax",
  "address",
  "city",
  "state",
  "zip",
  "npi",
  "M0030_SOC",
  "admission",
  "hospital",
  "discharge",
  "soc",
]);

export const MedicationScalarFieldEnumSchema = z.enum([
  "id",
  "date",
  "drug",
  "dose",
  "frequency",
  "route",
  "NorC",
  "sideEffect",
  "medClassification",
  "dcDate",
  "signature",
  "patientMedicationId",
]);

export const PrimaryDxScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "dateType",
  "date",
  "patientMedicationId",
]);

export const MIO12InpatientProcedureScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "dateType",
  "date",
  "patientMedicationId",
]);

export const ServiceRequestedScalarFieldEnumSchema = z.enum([
  "id",
  "service",
  "discipline",
  "frequency",
  "patientMedicationId",
]);

export const PatientAdmissionScalarFieldEnumSchema = z.enum([
  "id",
  "patientId",
  "payer",
  "status",
  "actionDate",
  "reason",
  "otherReason",
  "actionById",
  "certStartDate",
  "certEndDate",
  "daysPerEpisode",
  "createdAt",
  "updatedAt",
]);

export const PatientAccessInformationScalarFieldEnumSchema = z.enum([
  "id",
  "patientId",
  "caregivers",
  "createdAt",
  "updatedAt",
]);

export const LogScalarFieldEnumSchema = z.enum([
  "id",
  "context",
  "providerId",
  "contextId",
  "text",
  "createdAt",
  "updatedAt",
]);

export const TaxonomyScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "createdAt",
  "updatedAt",
]);

export const TaxonomyCodeScalarFieldEnumSchema = z.enum([
  "id",
  "code",
  "createdAt",
  "updatedAt",
  "taxonomyId",
]);

export const PatientPolicyHolderScalarFieldEnumSchema = z.enum([
  "id",
  "policyPayer",
  "payerId",
  "policyHolder",
  "insuredPolicyHolder",
  "uniqueId",
  "patientId",
  "gender",
  "dob",
  "address",
  "country",
  "state",
  "city",
  "zipCode",
  "phone",
  "employerOrSchool",
  "groupName",
  "groupNumber",
  "isOtherBenefitPlan",
  "createdAt",
  "updatedAt",
]);

export const PatientScheduleScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "patientId",
  "caregiverId",
  "service",
  "appointmentStartTime",
  "appointmentEndTime",
  "schedulerId",
  "completedDate",
  "groupId",
  "status",
  "visitStatus",
  "travelTime",
  "overTime",
  "miles",
  "expense",
  "caregiverComments",
  "validateForTimeConflict",
  "monitoredForQA",
  "administrativeComments",
  "visitLocation",
  "billable",
  "billingCode",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
  "unscheduledVisitId",
]);

export const ScheduleRecurrenceScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "patientScheduleId",
  "isRecurringEvent",
  "pattern",
  "startDate",
  "endAfter",
  "frequency",
  "endBy",
  "endDate",
  "isEveryday",
  "isEveryWeekday",
  "dayFrequency",
  "weekFrequency",
  "recurringDays",
  "isDayMonth",
  "dayMonth",
  "dayMonthFrequency",
  "isMonth",
  "monthPosition",
  "monthDay",
  "monthFrequency",
  "isEveryYear",
  "everyYearMonth",
  "everyYearDay",
  "isYear",
  "yearPosition",
  "yearDay",
  "yearMonth",
  "occurence",
  "createdAt",
  "updatedAt",
]);

export const ScheduleVisitVerificationScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "mediaId",
  "signatureDate",
  "patientScheduleId",
  "comment",
  "temperature",
  "temperatureType",
  "pulse",
  "pulseType",
  "pulseTypeRegular",
  "respiration",
  "respirationType",
  "notes",
  "bloodPressureRight",
  "bloodPressureLeft",
  "bloodPressureWeight",
  "bloodPressureType",
  "painDenied",
  "painLocation",
  "painIntensity",
  "otherPain",
  "painDuration",
  "medicationTaken",
  "painDescription",
  "painLevel",
  "painManagement",
  "createdAt",
  "updatedAt",
]);

export const PatientDisciplineScalarFieldEnumSchema = z.enum([
  "id",
  "patientId",
  "SN",
  "SNDischargeDate",
  "SNDischargeComment",
  "OT",
  "OTDischargeDate",
  "OTDischargeComment",
  "PT",
  "PTDischargeDate",
  "PTDischargeComment",
  "ST",
  "STDischargeDate",
  "STDischargeComment",
  "MSW",
  "MSWDischargeDate",
  "MSWDischargeComment",
  "HHA",
  "HHADischargeDate",
  "HHADischargeComment",
  "OTHER",
  "OTHERDischargeDate",
  "OTHERDischargeComment",
]);

export const DischargeSummaryScalarFieldEnumSchema = z.enum([
  "id",
  "type",
  "patientId",
  "dischargeReason",
  "otherReason",
  "careSummary",
  "comment",
  "summaryDateSent",
  "sentVia",
  "signatureType",
  "digitalSignatureChecked",
  "mediaId",
  "signatureDate",
  "createdAt",
  "updatedAt",
]);

export const DisciplineScalarFieldEnumSchema = z.enum([
  "id",
  "name",
  "active",
  "createdAt",
  "updatedAt",
  "providerId",
]);

export const SkilledNursingNoteScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "patientId",
  "caregiverId",
  "unscheduledVisitId",
  "snNoteType",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const UnscheduledVisitScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "patientMediaId",
  "patientSignatureDate",
  "caregiverMediaId",
  "caregiverSignatureDate",
  "patientId",
  "caregiverId",
  "comments",
  "miles",
  "milesComments",
  "startTime",
  "endTime",
  "dateAssessmentCompleted",
  "assessment",
  "createdAt",
  "updatedAt",
]);

export const MissedNotesScalarFieldEnumSchema = z.enum([
  "id",
  "caregiver",
  "scheduledVisit",
  "unscheduledVisitId",
  "startTime",
  "endTime",
  "visitType",
  "otherVisitType",
  "reasonType",
  "reasonTypeComment",
  "physicianNotified",
  "physicianNotifiedDate",
  "caseManagerNotified",
  "caseManagerNotifiedDate",
  "additionalComments",
  "createdAt",
  "updatedAt",
]);

export const InsurancePriorAuthorizationScalarFieldEnumSchema = z.enum([
  "providerId",
  "id",
  "disciplineId",
  "patientInsuranceId",
  "dateRequestSent",
  "dateAuthorizationReceived",
  "authCode",
  "visitAuth",
  "effectiveFrom",
  "effectiveThrough",
  "hoursAuth",
  "units",
  "notes",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const VitalSignsScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "scheduledVisitId",
  "startTime",
  "endTime",
  "visitType",
  "otherVisitType",
  "shiftNote",
  "homeboundReason",
  "otherHomeBoundReason",
  "homeboundComment",
  "temperature",
  "temperatureType",
  "pulse",
  "pulseType",
  "pulseTypeRegular",
  "respiration",
  "respirationType",
  "notes",
  "bloodPressureRight",
  "bloodPressureLeft",
  "bloodPressureWeight",
  "bloodPressureType",
  "painDenied",
  "painLocation",
  "painIntensity",
  "otherPain",
  "painDuration",
  "medicationTaken",
  "painDescription",
  "painLevel",
  "painManagement",
  "createdAt",
  "updatedAt",
]);

export const CardioPulmonaryScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "cardiovascularNormal",
  "heartSound",
  "heartSoundNote",
  "edema",
  "edemaSeverity",
  "edemaLocation",
  "chestPain",
  "chestPainLocation",
  "otherChestPainLocation",
  "painDuration",
  "painIntensity",
  "painType",
  "relievingFactor",
  "cardiovascularNote",
  "pulmonaryNormal",
  "lungSound",
  "anterior",
  "posterior",
  "cough",
  "coughNote",
  "respiratoryStatus",
  "oxygen",
  "pulseOximetry",
  "pulmonaryNote",
  "createdAt",
  "updatedAt",
]);

export const NeuroGastroScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "neuromuscularNormal",
  "mentalStatus",
  "mentalStatusOrientedTo",
  "headache",
  "impairment",
  "markApplicableNeuro",
  "gripStrength",
  "gripLeft",
  "gripRight",
  "pupils",
  "otherPupils",
  "falls",
  "neuromuscularNote",
  "gastrointestinalNormal",
  "bowelSounds",
  "bowelSoundsNote",
  "abdominalPainNone",
  "abdominalPain",
  "abdominalPainNote",
  "apetite",
  "nutritionalRequirement",
  "tubeFeeding",
  "tubeFeedingContinuous",
  "npo",
  "bowelMovementNormal",
  "bowelMovement",
  "lastBM",
  "enema",
  "markApplicableGastro",
  "gastrointestinalNote",
  "createdAt",
  "updatedAt",
]);

export const GenitoEndoScalarFieldEnumSchema = z.enum([
  "id",
  "genitourinaryNormal",
  "skilledNursingNoteId",
  "urineFrequency",
  "urineColor",
  "urineOdor",
  "symptoms",
  "urinaryCathetherType",
  "urinaryCathetherSize",
  "urinaryCathetherLastChanged",
  "urinaryCathetherIrrigation",
  "urinaryCathetherBulbInflated",
  "genitourinaryNote",
  "endocrineNormal",
  "bloodSugar",
  "glucometerReading",
  "bloodSugarFasting",
  "testingFrequency",
  "diabetesControlledWith",
  "administeredBy",
  "otherAdministeredBy",
  "hypoFrequency",
  "patientAware",
  "endocrineNote",
  "createdAt",
  "updatedAt",
]);

export const NoteMedicationScalarFieldEnumSchema = z.enum([
  "id",
  "medicationChanged",
  "skilledNursingNoteId",
  "medicationDose",
  "medicationUpdated",
  "allergyNote",
  "administeredBy",
  "otherAdministeredBy",
  "missedDoses",
  "missedDoseNote",
  "medicationNote",
  "therapyNA",
  "therapyRoute",
  "therapySite",
  "dressingChange",
  "otherDressingChange",
  "lineFlush",
  "otherLineFlush",
  "lineFlushSaline",
  "teachingProvidedTo",
  "otherTeachingProvidedTo",
  "teachingResponse",
  "otherTeachingResponse",
  "therapyNote",
  "createdAt",
  "updatedAt",
]);

export const NotePlanScalarFieldEnumSchema = z.enum([
  "id",
  "carePlan",
  "skilledNursingNoteId",
  "nurseVisit",
  "physicianVisit",
  "careCordinationWith",
  "otherCareCordinationWith",
  "providedBillableSupplies",
  "planNote",
  "aideName",
  "aidePresent",
  "aideFamilySatisfied",
  "aideTaskObserved",
  "aideVisitDate",
  "lpnName",
  "lpnPresent",
  "lpnFamilySatisfied",
  "lpnTaskObserved",
  "lpnVisitDate",
  "generalNotes",
  "createdAt",
  "updatedAt",
]);

export const QASignatureScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "status",
  "patientMediaId",
  "patientSignatureDate",
  "nurseMediaId",
  "nurseSignatureDate",
  "QANote",
  "createdAt",
  "updatedAt",
]);

export const SkinAndWoundScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "normalSkin",
  "signAndSymptoms",
  "symptomsExplanation",
  "skinColor",
  "skinTugor",
  "skinNote",
  "temperature",
  "skinCondition",
  "teachingProvidedTo",
  "otherTeachingProvidedTo",
  "woundCareProcedure",
  "responseToTeaching",
  "otherResponseToTeaching",
  "procedureDifficultyExplain",
  "doctorNotified",
  "createdAt",
  "updatedAt",
]);

export const WoundScalarFieldEnumSchema = z.enum([
  "id",
  "woundType",
  "woundLocation",
  "skinAndWoundId",
  "location",
  "length",
  "depth",
  "width",
  "tissueThickness",
  "drainageType",
  "drainageAmount",
  "undermining",
  "bedColor",
  "tunnelling",
  "tunnellingLocation",
  "odor",
  "edema",
  "woundEdge",
  "bedTissue",
  "surroundingTissue",
  "notes",
  "NPWT",
  "createdAt",
  "updatedAt",
]);

export const NoteInterventionScalarFieldEnumSchema = z.enum([
  "id",
  "bodySystem",
  "skilledNursingNoteId",
  "effectiveDate",
  "interventions",
  "patientResponse",
  "orders",
  "goals",
  "goalMet",
  "goalMetDate",
  "createdAt",
  "updatedAt",
]);

export const NoteIntervInstScalarFieldEnumSchema = z.enum([
  "id",
  "skilledNursingNoteId",
  "interventions",
  "interventionNote",
  "cardiacFluid",
  "cardiacExacerbation",
  "cardiacExacerbationNote",
  "cardiacDietTeaching",
  "cardiacDietTeachingNote",
  "respiratory",
  "gigu",
  "endocrine",
  "endocrineDietTeaching",
  "integumentary",
  "pain",
  "safety",
  "safetyDiseaseManagement",
  "interactionResponse",
  "instructionsNote",
  "goals",
  "createdAt",
  "updatedAt",
]);

export const PlanOfCareScalarFieldEnumSchema = z.enum([
  "id",
  "providerId",
  "patientId",
  "caregiverId",
  "certStartDate",
  "certEndDate",
  "signatureSentDate",
  "signatureReceivedDate",
  "mainInternalNote",
  "dmeSupplies",
  "safetyMeasures",
  "nutritionalRequirement",
  "allergies",
  "functionalLimitations",
  "otherFunctionalLimit",
  "activitiesPermitted",
  "otherActivitiesPermit",
  "mentalStatus",
  "otherMentalStatus",
  "prognosis",
  "certStatement",
  "cognitiveStatus",
  "rehabPotential",
  "dischargePlan",
  "riskIntervention",
  "informationRelatedTo",
  "caregiverNeeds",
  "homeboundStatus",
  "clinicalSummary",
  "physicianId",
  "modifyPhysicianCert",
  "caseManagerId",
  "verbalSOC",
  "qAstatus",
  "nurseMediaId",
  "nurseSignatureDate",
  "QANote",
  "carePreferences",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
  "medication",
  "isCert485",
  "cert485Orders",
  "cert485Goals",
]);

export const PocDiagnosisProcedureScalarFieldEnumSchema = z.enum([
  "id",
  "planOfCareId",
  "diagnosisProcedureId",
  "date",
  "type",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const OrdersAndGoalsScalarFieldEnumSchema = z.enum([
  "id",
  "planOfCareId",
  "carePlanType",
  "disciplineId",
  "isFrequencyOrder",
  "bodySystem",
  "effectiveDate",
  "orders",
  "orderexplanation",
  "goals",
  "goalsExplanation",
  "goalsMet",
  "goalsOngoing",
  "discontinue",
  "goalsMetDate",
  "active",
  "archivedOn",
  "createdAt",
  "updatedAt",
]);

export const PhraseScalarFieldEnumSchema = z.enum([
  "id",
  "section",
  "name",
  "description",
  "createdAt",
  "updatedAt",
]);

export const DiagnosisProcedureScalarFieldEnumSchema = z.enum([
  "id",
  "code",
  "description",
  "warning",
  "scope",
  "createdAt",
  "updatedAt",
]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const NullableJsonNullValueInputSchema = z
  .enum(["DbNull", "JsonNull"])
  .transform((value) =>
    value === "JsonNull"
      ? Prisma.JsonNull
      : value === "DbNull"
        ? Prisma.DbNull
        : value,
  );

export const QueryModeSchema = z.enum(["default", "insensitive"]);

export const JsonNullValueFilterSchema = z
  .enum(["DbNull", "JsonNull", "AnyNull"])
  .transform((value) =>
    value === "JsonNull"
      ? Prisma.JsonNull
      : value === "DbNull"
        ? Prisma.DbNull
        : value === "AnyNull"
          ? Prisma.AnyNull
          : value,
  );

export const NullsOrderSchema = z.enum(["first", "last"]);

export const StudentTypeSchema = z.enum(["PART_TIME", "FULL_TIME", "NONE"]);

export type StudentTypeType = `${z.infer<typeof StudentTypeSchema>}`;

export const QAStatusSchema = z.enum([
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "INUSE",
]);

export type QAStatusType = `${z.infer<typeof QAStatusSchema>}`;

export const DischargeSummaryTypeSchema = z.enum([
  "SN",
  "PT",
  "OT",
  "ST",
  "MSW",
  "HHA",
  "OTHER",
]);

export type DischargeSummaryTypeType =
  `${z.infer<typeof DischargeSummaryTypeSchema>}`;

export const LogContextSchema = z.enum(["PATIENT"]);

export type LogContextType = `${z.infer<typeof LogContextSchema>}`;

export const EmploymentStatusSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "UNEMPLOYED",
  "SELF_EMPLOYED",
  "RETIRED",
  "MILITARY_DUTY",
  "UNKNOWN",
]);

export type EmploymentStatusType = `${z.infer<typeof EmploymentStatusSchema>}`;

export const OccurenceSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export type OccurenceType = `${z.infer<typeof OccurenceSchema>}`;

export const VisitStatusSchema = z.enum([
  "UNASSIGNED",
  "NOT_COMPLETED",
  "COMPLETED",
  "CANCELLED",
  "HOSPITALIZED",
  "ON_HOLD",
  "MISSED",
]);

export type VisitStatusType = `${z.infer<typeof VisitStatusSchema>}`;

export const AdmissionPrioritySchema = z.enum([
  "ELECTIVE",
  "NEWBORN",
  "TRAUMA",
  "URGENT",
  "EMERGENCY",
  "INFORMATION_UNAVAILABLE",
]);

export type AdmissionPriorityType =
  `${z.infer<typeof AdmissionPrioritySchema>}`;

export const ProviderTypeSchema = z.enum(["HOMEHEALTH", "HOSPICE", "BOTH"]);

export type ProviderTypeType = `${z.infer<typeof ProviderTypeSchema>}`;

export const InsuranceSectionTypeSchema = z.enum([
  "HOSPICE",
  "MEDICARE",
  "NON_MEDICARE",
  "MANAGED_CARE",
  "CMS",
]);

export type InsuranceSectionTypeType =
  `${z.infer<typeof InsuranceSectionTypeSchema>}`;

export const PatientStatusSchema = z.enum([
  "REFERRED",
  "ACTIVE",
  "DISCHARGED",
  "ARCHIVED",
]);

export type PatientStatusType = `${z.infer<typeof PatientStatusSchema>}`;

export const PayerTypeSchema = z.enum([
  "MEDICARE_PATIENT",
  "MEDICARE_ADV",
  "MANAGED_CARE",
  "PROF",
  "HOSPICE",
]);

export type PayerTypeType = `${z.infer<typeof PayerTypeSchema>}`;

export const DayTypeSchema = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

export type DayTypeType = `${z.infer<typeof DayTypeSchema>}`;

export const VendorTypeSchema = z.enum(["TWILIO"]);

export type VendorTypeType = `${z.infer<typeof VendorTypeSchema>}`;

export const GenderTypeSchema = z.enum(["MALE", "FEMALE"]);

export type GenderTypeType = `${z.infer<typeof GenderTypeSchema>}`;

export const MaritalStatusSchema = z.enum([
  "MARRIED",
  "SINGLE",
  "WIDOW",
  "DIVORCED",
  "SEPARATED",
  "LIFE_PARTNER",
  "UNKNOWN",
]);

export type MaritalStatusType = `${z.infer<typeof MaritalStatusSchema>}`;

export const EthnicityTypeSchema = z.enum([
  "NATIVEAMERICAN",
  "ASIAN",
  "AFRICANAMERICAN",
  "HISPANIC",
  "NATIVEHAWAIIAN",
  "CAUCASIAN",
  "OTHERS",
]);

export type EthnicityTypeType = `${z.infer<typeof EthnicityTypeSchema>}`;

export const DmeSuppliesTypeSchema = z.enum(["ORDERED", "NOTNEEDED"]);

export type DmeSuppliesTypeType = `${z.infer<typeof DmeSuppliesTypeSchema>}`;

export const ServiceTypeSchema = z.enum([
  "G0151",
  "G0152",
  "G0153",
  "G0157",
  "G0158",
  "G0159",
  "G0160",
  "G0161",
]);

export type ServiceTypeType = `${z.infer<typeof ServiceTypeSchema>}`;

export const PatientScheduleStatusSchema = z.enum([
  "SKIPPED",
  "ARCHIVED",
  "ACTIVE",
]);

export type PatientScheduleStatusType =
  `${z.infer<typeof PatientScheduleStatusSchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ASSESSMENT SCHEMA
/////////////////////////////////////////

export const AssessmentSchema = z.object({
  qaStatus: QAStatusSchema.nullish(),
  id: z.string(),
  providerId: z.string(),
  caregiverId: z.string(),
  patientScheduleId: z.string().nullish(),
  source: z.string().nullish(),
  reasons: z.string().array(),
  qaComment: z.string().nullish(),
  exportStatus: z.string().nullish(),
  dateCompleted: z.date().nullish(),
  patientId: z.string().nullish(),
  patientTracking: JsonValueSchema.nullable(),
  historyAndDiagnosis: JsonValueSchema.nullable(),
  livingFinancial: JsonValueSchema.nullable(),
  oasisAssessment: JsonValueSchema.nullable(),
  nursingAssessment: JsonValueSchema.nullable(),
  ptEval: JsonValueSchema.nullable(),
  walkTest: JsonValueSchema.nullable(),
  snVisit: JsonValueSchema.nullable(),
  otEval: JsonValueSchema.nullable(),
  otVisit: JsonValueSchema.nullable(),
  ptVisit: JsonValueSchema.nullable(),
  hhaVisit: JsonValueSchema.nullable(),
  socAccess: JsonValueSchema.nullable(),
  stEval: JsonValueSchema.nullable(),
  stVisit: JsonValueSchema.nullable(),
  oasisFollowUp: JsonValueSchema.nullable(),
  consent: JsonValueSchema.nullable(),
  qaed: z.boolean().nullish(),
  submittedAt: z.date().nullish(),
  visitDate: z.date().nullish(),
  timeIn: z.string().nullish(),
  timeOut: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;

/////////////////////////////////////////
// CASBIN RULE SCHEMA
/////////////////////////////////////////

export const CasbinRuleSchema = z.object({
  id: z.string(),
  ptype: z.string(),
  v0: z.string().nullish(),
  v1: z.string().nullish(),
  v2: z.string().nullish(),
  v3: z.string().nullish(),
  v4: z.string().nullish(),
  v5: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CasbinRule = z.infer<typeof CasbinRuleSchema>;

/////////////////////////////////////////
// PROVIDER SCHEMA
/////////////////////////////////////////

export const ProviderSchema = z.object({
  startDay: DayTypeSchema.nullish(),
  providerType: ProviderTypeSchema.nullish(),
  id: z.string(),
  providerName: z.string().nullish(),
  billingName: z.string().nullish(),
  providerNumber: z.string().nullish(),
  contact1: z.string().nullish(),
  contact2: z.string().nullish(),
  address1: z.string().nullish(),
  address2: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  zipCode: z.string().nullish(),
  tpi: z.string().nullish(),
  clientId: z.string().nullish(),
  dmetpi: z.string().nullish(),
  identifierName: z.string().nullish(),
  benefitCode: z.string().nullish(),
  npi: z.string().nullish(),
  taxId: z.string().nullish(),
  stateId: z.string().nullish(),
  branchId: z.string().nullish(),
  phone: z.string().nullish(),
  cellPhone: z.string().nullish(),
  fax: z.string().nullish(),
  email: z.string().nullish(),
  taxonomy: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  taxonomyCode: z.string().nullish(),
  novaetusId: z.string().nullish(),
  qioAddress1: z.string().nullish(),
  qioAddress2: z.string().nullish(),
  qioCity: z.string().nullish(),
  qioState: z.string().nullish(),
  qioZipCode: z.string().nullish(),
  qioPhone: z.string().nullish(),
  qioFax: z.string().nullish(),
  qioLocalPhone: z.string().nullish(),
  ppiName: z.string().nullish(),
  ppiNpi: z.string().nullish(),
  ppiAddress1: z.string().nullish(),
  ppiAddress2: z.string().nullish(),
  ppiCity: z.string().nullish(),
  ppiState: z.string().nullish(),
  ppiZipCode: z.string().nullish(),
  ppiTaxId: z.string().nullish(),
  ppiTaxType: z.string().nullish(),
  ppiProviderId: z.string().nullish(),
  ppiProviderNumber: z.string().nullish(),
  ppiSecId1: z.string().nullish(),
  ppiSecId2: z.string().nullish(),
  ppiSecType1: z.string().nullish(),
  stateAssignedId: z.string().nullish(),
  pressGaneyClientId: z.string().nullish(),
  ppiSecType2: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Provider = z.infer<typeof ProviderSchema>;

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  service: ServiceTypeSchema.nullish(),
  id: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  middleName: z.string().nullish(),
  licenseNo: z.string().nullish(),
  jobTitle: z.string().nullish(),
  taxonomy: z.string().nullish(),
  taxonomyCode: z.string().nullish(),
  notes: z.string().nullish(),
  addressLine1: z.string().nullish(),
  addressLine2: z.string().nullish(),
  country: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  postalCode: z.string().nullish(),
  homePhone: z.string().nullish(),
  cellPhone: z.string().nullish(),
  fax: z.string().nullish(),
  memo: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mediaId: z.string().nullish(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// USER HISTORY SCHEMA
/////////////////////////////////////////

export const UserHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  socialSecurity: z.string().nullish(),
  dob: z.date().nullish(),
  driversLicenseId: z.string().nullish(),
  professionalLicenseId: z.string().nullish(),
  hireDate: z.date().nullish(),
  lastDate: z.date().nullish(),
  evaluationDueDate: z.date().nullish(),
  oigMonthlyUpdate: z.string().nullish(),
  yearlyEvaluationDueDate: z.date().nullish(),
  criminalCheckDueDate: z.date().nullish(),
  screeningDueDate: z.date().nullish(),
  lastCPRTraining: z.date().nullish(),
  CPRExpiration: z.date().nullish(),
  insuranceExpiration: z.date().nullish(),
  lastAidRegistry: z.date().nullish(),
  lastMisconductRegistry: z.date().nullish(),
  greenCardExpiration: z.date().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserHistory = z.infer<typeof UserHistorySchema>;

/////////////////////////////////////////
// CAREGIVER CERTIFICATION SCHEMA
/////////////////////////////////////////

export const CaregiverCertificationSchema = z.object({
  id: z.string(),
  certification: z.string().nullish(),
  expires: z.date().nullish(),
  userHistoryId: z.string().nullish(),
});

export type CaregiverCertification = z.infer<
  typeof CaregiverCertificationSchema
>;

/////////////////////////////////////////
// LICENSE SCHEMA
/////////////////////////////////////////

export const LicenseSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  expires: z.date().nullish(),
});

export type License = z.infer<typeof LicenseSchema>;

/////////////////////////////////////////
// MEDIA SCHEMA
/////////////////////////////////////////

export const MediaSchema = z.object({
  id: z.string(),
  fileType: z.string().nullish(),
  fileName: z.string().nullish(),
  mediaId: z.string(),
  src: z.string().nullish(),
  alt: z.string().nullish(),
  size: z.number().nullish(),
  updatedAt: z.date(),
  createdAt: z.date(),
  archivedOn: z.date().nullish(),
  active: z.boolean(),
  userHistoryId: z.string().nullish(),
});

export type Media = z.infer<typeof MediaSchema>;

/////////////////////////////////////////
// USER PROVIDER SCHEMA
/////////////////////////////////////////

export const UserProviderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  providerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProvider = z.infer<typeof UserProviderSchema>;

/////////////////////////////////////////
// VENDOR SCHEMA
/////////////////////////////////////////

export const VendorSchema = z.object({
  name: VendorTypeSchema,
  id: z.string(),
  providerId: z.string(),
  credentials: JsonValueSchema.nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Vendor = z.infer<typeof VendorSchema>;

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Group = z.infer<typeof GroupSchema>;

/////////////////////////////////////////
// PERMISSION SCHEMA
/////////////////////////////////////////

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Permission = z.infer<typeof PermissionSchema>;

/////////////////////////////////////////
// PATIENT SCHEMA
/////////////////////////////////////////

export const PatientSchema = z.object({
  gender: GenderTypeSchema.nullish(),
  maritalStatus: MaritalStatusSchema.nullish(),
  race: EthnicityTypeSchema.nullish(),
  admissionPriority: AdmissionPrioritySchema.nullish(),
  employmentStatus: EmploymentStatusSchema.nullish(),
  dmeSupplies: DmeSuppliesTypeSchema.nullish(),
  student: StudentTypeSchema.nullish(),
  status: PatientStatusSchema.nullish(),
  id: z.string(),
  firstName: z.string().nullish(),
  middleInitial: z.string().nullish(),
  lastName: z.string().nullish(),
  patientNo: z.string().nullish(),
  providerId: z.string().nullish(),
  dob: z.date().nullish(),
  suffix: z.string().nullish(),
  ssn: z.string().nullish(),
  phone: z.string().nullish(),
  medicaidNumber: z.string().nullish(),
  medicareNumber: z.string().nullish(),
  address1: z.string().nullish(),
  address2: z.string().nullish(),
  country: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  workersComp: z.string().nullish(),
  referralSource: z.string().nullish(),
  physicianId: z.string().nullish(),
  dme: z.string().nullish(),
  controlNumber: z.string().nullish(),
  admissionSOC: z.date().nullish(),
  notAPhysician: z.boolean(),
  notMedicareNumber: z.boolean(),
  CBSACode: z.string().nullish(),
  admissionSource: z.string().nullish(),
  authorizationNumber: z.string().nullish(),
  faceToFace: z.date().nullish(),
  taxonomy: z.string().nullish(),
  taxonomyCode: z.string().nullish(),
  conditionRelation: z.string().array(),
  county: z.string().nullish(),
  autoAccidentState: z.string().nullish(),
  sharePatient: z.boolean(),
  supervisingPhysician: z.string().nullish(),
  supervisingPhysicianNpi: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  caregiverId: z.string().nullish(),
  pan: z.string().nullish(),
  dnr: z.string().nullish(),
  infectionControl: z.string().nullish(),
  admitInfection: z.string().nullish(),
  transferredFrom: z.boolean(),
});

export type Patient = z.infer<typeof PatientSchema>;

/////////////////////////////////////////
// PATIENT AUTHORIZATION SCHEMA
/////////////////////////////////////////

export const PatientAuthorizationSchema = z.object({
  id: z.string(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  status: z.string().nullish(),
  insurance: z.string().nullish(),
  number: z.string().nullish(),
  visitsAuthorized: z.string().nullish(),
  sn: z.string().nullish(),
  pt: z.string().nullish(),
  ot: z.string().nullish(),
  st: z.string().nullish(),
  msw: z.string().nullish(),
  rn: z.string().nullish(),
  lvn: z.string().nullish(),
  caregiver: z.string().nullish(),
  hha: z.string().nullish(),
  rm: z.string().nullish(),
  assLiv: z.string().nullish(),
  empAs: z.string().nullish(),
  peer: z.string().nullish(),
  counselling: z.string().nullish(),
  sud: z.string().nullish(),
  sudg: z.string().nullish(),
  nurse: z.string().nullish(),
  psychRe: z.string().nullish(),
  psychRehg: z.string().nullish(),
  transp: z.string().nullish(),
  supEmp: z.string().nullish(),
  shl: z.string().nullish(),
  hhc: z.string().nullish(),
  sls: z.string().nullish(),
  comment: z.string().nullish(),
  patientId: z.string().nullish(),
});

export type PatientAuthorization = z.infer<typeof PatientAuthorizationSchema>;

/////////////////////////////////////////
// PAYER SCHEMA
/////////////////////////////////////////

export const PayerSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  fax: z.string().nullish(),
  providerId: z.string(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  npi: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payer = z.infer<typeof PayerSchema>;

/////////////////////////////////////////
// PATIENT INSURANCE SCHEMA
/////////////////////////////////////////

export const PatientInsuranceSchema = z.object({
  type: InsuranceSectionTypeSchema.nullish(),
  id: z.string(),
  status: z.boolean().nullish(),
  daysPerEpisode: z.string().nullish(),
  noOfVisitAuthorized: z.string().nullish(),
  serviceRequired: z.string().array(),
  company: z.string().nullish(),
  payerId: z.string().nullish(),
  insuredId: z.string().nullish(),
  clearingClaims: z.string().nullish(),
  patientId: z.string().nullish(),
  payerResponsibility: z.string().nullish(),
  memberId: z.string().nullish(),
  groupName: z.string().nullish(),
  groupNumber: z.string().nullish(),
  insuranceCaseManagerId: z.string().nullish(),
  billType: z.string().nullish(),
  assignBenefits: z.string().nullish(),
  providerAcceptAssignment: z.string().nullish(),
  effectiveFrom: z.date().nullish(),
  effectiveThrough: z.date().nullish(),
  patientRelationship: z.string().nullish(),
  lastName: z.string().nullish(),
  firstName: z.string().nullish(),
  middleName: z.string().nullish(),
  suffix: z.string().nullish(),
  dob: z.string().nullish(),
  sex: z.string().nullish(),
  address1: z.string().nullish(),
  address2: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  relationshipToPatient: z.string().nullish(),
  copayType: z.string().nullish(),
  copayAmount: z.string().nullish(),
  comment: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientInsurance = z.infer<typeof PatientInsuranceSchema>;

/////////////////////////////////////////
// PATIENT FREQUENCY SCHEMA
/////////////////////////////////////////

export const PatientFrequencySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  disciplineId: z.string().nullish(),
  visit: z.string().nullish(),
  perDay: z.string().nullish(),
  effectiveFrom: z.date().nullish(),
  effectiveThrough: z.date().nullish(),
  comment: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientFrequency = z.infer<typeof PatientFrequencySchema>;

/////////////////////////////////////////
// RELATED CAREGIVER SCHEMA
/////////////////////////////////////////

export const RelatedCaregiverSchema = z.object({
  id: z.string(),
  caregiverId: z.string().nullish(),
  relationShip: z.string().nullish(),
  patientInsuranceId: z.string().nullish(),
});

export type RelatedCaregiver = z.infer<typeof RelatedCaregiverSchema>;

/////////////////////////////////////////
// PATIENT OTHER INFO SCHEMA
/////////////////////////////////////////

export const PatientOtherInfoSchema = z.object({
  id: z.string(),
  comment: z.string().nullish(),
  patientId: z.string(),
  noPublicity: z.boolean(),
  telephony: z.boolean(),
  referralDate: z.date().nullish(),
  region: z.string().nullish(),
  sentDate: z.date().nullish(),
  receivedDate: z.date().nullish(),
  pharmacyName: z.string().nullish(),
  pharmacyPhone: z.string().nullish(),
  pharmacyFax: z.string().nullish(),
  excludeCareConnect: z.boolean(),
  evacuationLevel: z.string().nullish(),
  releaseInformation: z.string().nullish(),
  patientSignatureSourceCode: z.string().nullish(),
  patientConditions: z.string().array(),
  patientConditionState: z.string().nullish(),
  patientConditionDate: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  physicianId: z.string().nullish(),
});

export type PatientOtherInfo = z.infer<typeof PatientOtherInfoSchema>;

/////////////////////////////////////////
// OTHER PHYSICIAN SCHEMA
/////////////////////////////////////////

export const OtherPhysicianSchema = z.object({
  id: z.string(),
  physicianId: z.string().nullish(),
  comment: z.string().nullish(),
  patientOtherInfoId: z.string().nullish(),
});

export type OtherPhysician = z.infer<typeof OtherPhysicianSchema>;

/////////////////////////////////////////
// PATIENT COMMERCIAL SCHEMA
/////////////////////////////////////////

export const PatientCommercialSchema = z.object({
  gender: GenderTypeSchema.nullish(),
  otherBenefitPlanGender: GenderTypeSchema.nullish(),
  id: z.string(),
  insuranceInformation: z.string().array(),
  payId: z.string().nullish(),
  policyHolder: z.string().nullish(),
  insuredHolder: z.string().nullish(),
  uniqueId: z.string().nullish(),
  dob: z.date().nullish(),
  address: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  zip: z.string().nullish(),
  phone: z.string().nullish(),
  employer: z.string().nullish(),
  groupName: z.string().nullish(),
  groupNumber: z.string().nullish(),
  patientId: z.string().nullish(),
  isOtherBenefitPlan: z.boolean(),
  otherInsured: z.string().nullish(),
  otherBenefitPlanEmployer: z.string().nullish(),
  otherBenefitPlanDob: z.date().nullish(),
  otherBenefitPlanGroupName: z.string().nullish(),
  otherBenefitPlanGroupNumber: z.string().nullish(),
});

export type PatientCommercial = z.infer<typeof PatientCommercialSchema>;

/////////////////////////////////////////
// PATIENT EMERGENCY CONTACT SCHEMA
/////////////////////////////////////////

export const PatientEmergencyContactSchema = z.object({
  id: z.string(),
  nextOfKinName: z.string().nullish(),
  nextOfKinRelation: z.string().nullish(),
  nextOfKinPhone: z.string().nullish(),
  nextOfKinExt: z.string().nullish(),
  nextOfKinAddress: z.string().nullish(),
  homePet: z.string().nullish(),
  livesWith: z.string().nullish(),
  smokesInHome: z.string().nullish(),
  location: z.string().nullish(),
  isAdvancedDirective: z.boolean().nullish(),
  attorneyPower: z.string().nullish(),
  poaPhone: z.string().nullish(),
  legalPaperOption: z.string().array(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  dayPhone: z.string().nullish(),
  eveningPhone: z.string().nullish(),
  relation: z.string().nullish(),
  address: z.string().nullish(),
  type: z.string().nullish(),
  patientId: z.string().nullish(),
});

export type PatientEmergencyContact = z.infer<
  typeof PatientEmergencyContactSchema
>;

/////////////////////////////////////////
// PATIENT REFERRAL SOURCE SCHEMA
/////////////////////////////////////////

export const PatientReferralSourceSchema = z.object({
  id: z.string(),
  referredBy: z.string().nullish(),
  type: z.string().nullish(),
  facility: z.string().nullish(),
  referralDate: z.date().nullish(),
  coordinator: z.string().nullish(),
  salesRep: z.string().nullish(),
  referralPhone: z.string().nullish(),
  ext: z.string().nullish(),
  disposition: z.string().nullish(),
  followUp: z.string().nullish(),
  otherHHA: z.string().nullish(),
  phone: z.string().nullish(),
  mrNumber: z.string().nullish(),
  notes: z.string().nullish(),
  diagnosis: z.string().nullish(),
  patientId: z.string().nullish(),
});

export type PatientReferralSource = z.infer<typeof PatientReferralSourceSchema>;

/////////////////////////////////////////
// PHARMACY SCHEMA
/////////////////////////////////////////

export const PharmacySchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  fax: z.string().nullish(),
  patientReferralSourceId: z.string().nullish(),
});

export type Pharmacy = z.infer<typeof PharmacySchema>;

/////////////////////////////////////////
// PATIENT MEDICATION SCHEMA
/////////////////////////////////////////

export const PatientMedicationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  ulcerComments: z.string().nullish(),
  pressureUlcer: z.string().nullish(),
  functionLimits: z.string().array(),
  rue: z.string().nullish(),
  activitiesAndDiet: z.string().array(),
  wtBearing: z.string().nullish(),
  assistiveDevice: z.string().nullish(),
  diet: z.string().nullish(),
  allergies: z.string().nullish(),
  M1045InfluenzaVaccine: z.date().nullish(),
  M1045InfluenzaVaccineReceived: z.string().nullish(),
  M1055PneumococcalVaccine: z.date().nullish(),
  M1055PneumococcalVaccineReceived: z.string().nullish(),
  tetanusVaccine: z.date().nullish(),
  tetanusVaccineReceived: z.string().nullish(),
  otherVaccine: z.date().nullish(),
  otherVaccineReceived: z.string().nullish(),
  foleyCatheter: z.string().nullish(),
  foleyCatheterSize: z.string().nullish(),
  foleyCatheterFrequency: z.string().nullish(),
  foleyCatheterLabWork: z.string().nullish(),
  foleyCatheterDate: z.date().nullish(),
  primaryCaregiver: z.string().nullish(),
  physicianOrders: z.string().nullish(),
  emergencyContact: z.string().nullish(),
  contactNumber: z.string().nullish(),
  medicareAEffective: z.string().nullish(),
  medicareBEffective: z.string().nullish(),
  medicareAEffectiveDate: z.date().nullish(),
  medicareBEffectiveDate: z.date().nullish(),
  initalIntakeNurse: z.string().nullish(),
  initialReferral: z.string().nullish(),
  initialReferralTime: z.string().nullish(),
  finalIntakeNurse: z.string().nullish(),
  finalReferral: z.string().nullish(),
  finalReferralTime: z.string().nullish(),
  nurseComments: z.string().nullish(),
  proposedAdmission: z.string().nullish(),
  proposedAdmissionTime: z.string().nullish(),
  admissionsourceCodeC: z.string().nullish(),
  admissionSourceCodeB: z.string().nullish(),
  serviceRequestedComments: z.string().nullish(),
  serviceRequestedMedication: z.string().nullish(),
  auxiliaryService: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientMedication = z.infer<typeof PatientMedicationSchema>;

/////////////////////////////////////////
// PHYSICIAN SCHEMA
/////////////////////////////////////////

export const PhysicianSchema = z.object({
  id: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  upin: z.string().nullish(),
  providerId: z.string().nullish(),
  phone: z.string().nullish(),
  fax: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  npi: z.string().nullish(),
  M0030_SOC: z.date().nullish(),
  admission: z.date().nullish(),
  hospital: z.string().nullish(),
  discharge: z.date().nullish(),
  soc: z.date().nullish(),
});

export type Physician = z.infer<typeof PhysicianSchema>;

/////////////////////////////////////////
// MEDICATION SCHEMA
/////////////////////////////////////////

export const MedicationSchema = z.object({
  id: z.string(),
  date: z.date().nullish(),
  drug: z.string().nullish(),
  dose: z.string().nullish(),
  frequency: z.string().nullish(),
  route: z.string().nullish(),
  NorC: z.string().nullish(),
  sideEffect: z.string().nullish(),
  medClassification: z.string().nullish(),
  dcDate: z.date().nullish(),
  signature: z.string().nullish(),
  patientMedicationId: z.string().nullish(),
});

export type Medication = z.infer<typeof MedicationSchema>;

/////////////////////////////////////////
// PRIMARY DX SCHEMA
/////////////////////////////////////////

export const PrimaryDxSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  dateType: z.string().nullish(),
  date: z.date().nullish(),
  patientMedicationId: z.string().nullish(),
});

export type PrimaryDx = z.infer<typeof PrimaryDxSchema>;

/////////////////////////////////////////
// MIO 12 INPATIENT PROCEDURE SCHEMA
/////////////////////////////////////////

export const MIO12InpatientProcedureSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  dateType: z.string().nullish(),
  date: z.date().nullish(),
  patientMedicationId: z.string().nullish(),
});

export type MIO12InpatientProcedure = z.infer<
  typeof MIO12InpatientProcedureSchema
>;

/////////////////////////////////////////
// SERVICE REQUESTED SCHEMA
/////////////////////////////////////////

export const ServiceRequestedSchema = z.object({
  id: z.string(),
  service: z.string().nullish(),
  discipline: z.string().nullish(),
  frequency: z.string().nullish(),
  patientMedicationId: z.string().nullish(),
});

export type ServiceRequested = z.infer<typeof ServiceRequestedSchema>;

/////////////////////////////////////////
// PATIENT ADMISSION SCHEMA
/////////////////////////////////////////

export const PatientAdmissionSchema = z.object({
  payer: PayerTypeSchema.nullish(),
  status: PatientStatusSchema.nullish(),
  id: z.string(),
  patientId: z.string(),
  actionDate: z.date().nullish(),
  reason: z.string().nullish(),
  otherReason: z.string().nullish(),
  actionById: z.string().nullish(),
  certStartDate: z.date().nullish(),
  certEndDate: z.date().nullish(),
  daysPerEpisode: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientAdmission = z.infer<typeof PatientAdmissionSchema>;

/////////////////////////////////////////
// PATIENT ACCESS INFORMATION SCHEMA
/////////////////////////////////////////

export const PatientAccessInformationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  caregivers: z.string().array(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientAccessInformation = z.infer<
  typeof PatientAccessInformationSchema
>;

/////////////////////////////////////////
// LOG SCHEMA
/////////////////////////////////////////

export const LogSchema = z.object({
  context: LogContextSchema,
  id: z.string(),
  providerId: z.string().nullish(),
  contextId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Log = z.infer<typeof LogSchema>;

/////////////////////////////////////////
// TAXONOMY SCHEMA
/////////////////////////////////////////

export const TaxonomySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Taxonomy = z.infer<typeof TaxonomySchema>;

/////////////////////////////////////////
// TAXONOMY CODE SCHEMA
/////////////////////////////////////////

export const TaxonomyCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taxonomyId: z.string().nullish(),
});

export type TaxonomyCode = z.infer<typeof TaxonomyCodeSchema>;

/////////////////////////////////////////
// PATIENT POLICY HOLDER SCHEMA
/////////////////////////////////////////

export const PatientPolicyHolderSchema = z.object({
  gender: GenderTypeSchema.nullish(),
  id: z.string(),
  policyPayer: z.string().nullish(),
  payerId: z.string().nullish(),
  policyHolder: z.string().nullish(),
  insuredPolicyHolder: z.string().nullish(),
  uniqueId: z.string().nullish(),
  patientId: z.string(),
  dob: z.date().nullish(),
  address: z.string().nullish(),
  country: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  zipCode: z.string().nullish(),
  phone: z.string().nullish(),
  employerOrSchool: z.string().nullish(),
  groupName: z.string().nullish(),
  groupNumber: z.string().nullish(),
  isOtherBenefitPlan: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientPolicyHolder = z.infer<typeof PatientPolicyHolderSchema>;

/////////////////////////////////////////
// PATIENT SCHEDULE SCHEMA
/////////////////////////////////////////

export const PatientScheduleSchema = z.object({
  visitStatus: VisitStatusSchema.nullish(),
  id: z.string(),
  providerId: z.string().nullish(),
  patientId: z.string().nullish(),
  caregiverId: z.string().nullish(),
  service: z.string().nullish(),
  appointmentStartTime: z.date().nullish(),
  appointmentEndTime: z.date().nullish(),
  schedulerId: z.string().nullish(),
  completedDate: z.date().nullish(),
  groupId: z.string().nullish(),
  status: z.string().nullish(),
  travelTime: z.string().nullish(),
  overTime: z.string().nullish(),
  miles: z.string().nullish(),
  expense: z.string().nullish(),
  caregiverComments: z.string().nullish(),
  validateForTimeConflict: z.boolean(),
  monitoredForQA: z.boolean(),
  administrativeComments: z.string().nullish(),
  visitLocation: z.string().nullish(),
  billable: z.boolean(),
  billingCode: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  unscheduledVisitId: z.string().nullish(),
});

export type PatientSchedule = z.infer<typeof PatientScheduleSchema>;

/////////////////////////////////////////
// SCHEDULE RECURRENCE SCHEMA
/////////////////////////////////////////

export const ScheduleRecurrenceSchema = z.object({
  pattern: OccurenceSchema.nullish(),
  id: z.string(),
  providerId: z.string().nullish(),
  patientScheduleId: z.string().nullish(),
  isRecurringEvent: z.boolean(),
  startDate: z.date().nullish(),
  endAfter: z.boolean(),
  frequency: z.string().nullish(),
  endBy: z.boolean(),
  endDate: z.date().nullish(),
  isEveryday: z.boolean(),
  isEveryWeekday: z.boolean(),
  dayFrequency: z.string().nullish(),
  weekFrequency: z.string().nullish(),
  recurringDays: z.string().array(),
  isDayMonth: z.boolean(),
  dayMonth: z.string().nullish(),
  dayMonthFrequency: z.string().nullish(),
  isMonth: z.boolean(),
  monthPosition: z.string().nullish(),
  monthDay: z.string().nullish(),
  monthFrequency: z.string().nullish(),
  isEveryYear: z.boolean(),
  everyYearMonth: z.string().nullish(),
  everyYearDay: z.string().nullish(),
  isYear: z.boolean(),
  yearPosition: z.string().nullish(),
  yearDay: z.string().nullish(),
  yearMonth: z.string().nullish(),
  occurence: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScheduleRecurrence = z.infer<typeof ScheduleRecurrenceSchema>;

/////////////////////////////////////////
// SCHEDULE VISIT VERIFICATION SCHEMA
/////////////////////////////////////////

export const ScheduleVisitVerificationSchema = z.object({
  id: z.string(),
  providerId: z.string().nullish(),
  mediaId: z.string().nullish(),
  signatureDate: z.date().nullish(),
  patientScheduleId: z.string(),
  comment: z.string().nullish(),
  temperature: z.string().nullish(),
  temperatureType: z.string().nullish(),
  pulse: z.string().nullish(),
  pulseType: z.string().nullish(),
  pulseTypeRegular: z.string().nullish(),
  respiration: z.string().nullish(),
  respirationType: z.string().nullish(),
  notes: z.string().nullish(),
  bloodPressureRight: z.string().nullish(),
  bloodPressureLeft: z.string().nullish(),
  bloodPressureWeight: z.string().nullish(),
  bloodPressureType: z.string().nullish(),
  painDenied: z.boolean().nullish(),
  painLocation: z.string().nullish(),
  painIntensity: z.string().nullish(),
  otherPain: z.string().nullish(),
  painDuration: z.string().nullish(),
  medicationTaken: z.string().nullish(),
  painDescription: z.string().nullish(),
  painLevel: z.string().nullish(),
  painManagement: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScheduleVisitVerification = z.infer<
  typeof ScheduleVisitVerificationSchema
>;

/////////////////////////////////////////
// PATIENT DISCIPLINE SCHEMA
/////////////////////////////////////////

export const PatientDisciplineSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  SN: z.boolean(),
  SNDischargeDate: z.date().nullish(),
  SNDischargeComment: z.string().nullish(),
  OT: z.boolean(),
  OTDischargeDate: z.date().nullish(),
  OTDischargeComment: z.string().nullish(),
  PT: z.boolean(),
  PTDischargeDate: z.date().nullish(),
  PTDischargeComment: z.string().nullish(),
  ST: z.boolean(),
  STDischargeDate: z.date().nullish(),
  STDischargeComment: z.string().nullish(),
  MSW: z.boolean(),
  MSWDischargeDate: z.date().nullish(),
  MSWDischargeComment: z.string().nullish(),
  HHA: z.boolean(),
  HHADischargeDate: z.date().nullish(),
  HHADischargeComment: z.string().nullish(),
  OTHER: z.boolean(),
  OTHERDischargeDate: z.date().nullish(),
  OTHERDischargeComment: z.string().nullish(),
});

export type PatientDiscipline = z.infer<typeof PatientDisciplineSchema>;

/////////////////////////////////////////
// DISCHARGE SUMMARY SCHEMA
/////////////////////////////////////////

export const DischargeSummarySchema = z.object({
  type: DischargeSummaryTypeSchema,
  id: z.string(),
  patientId: z.string(),
  dischargeReason: z.string().nullish(),
  otherReason: z.string().nullish(),
  careSummary: z.string().nullish(),
  comment: z.string().nullish(),
  summaryDateSent: z.date().nullish(),
  sentVia: z.string().nullish(),
  signatureType: z.string().nullish(),
  digitalSignatureChecked: z.boolean(),
  mediaId: z.string().nullish(),
  signatureDate: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DischargeSummary = z.infer<typeof DischargeSummarySchema>;

/////////////////////////////////////////
// DISCIPLINE SCHEMA
/////////////////////////////////////////

export const DisciplineSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  providerId: z.string().nullish(),
});

export type Discipline = z.infer<typeof DisciplineSchema>;

/////////////////////////////////////////
// SKILLED NURSING NOTE SCHEMA
/////////////////////////////////////////

export const SkilledNursingNoteSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  patientId: z.string(),
  caregiverId: z.string(),
  unscheduledVisitId: z.string().nullish(),
  snNoteType: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SkilledNursingNote = z.infer<typeof SkilledNursingNoteSchema>;

/////////////////////////////////////////
// UNSCHEDULED VISIT SCHEMA
/////////////////////////////////////////

export const UnscheduledVisitSchema = z.object({
  id: z.string(),
  providerId: z.string().nullish(),
  patientMediaId: z.string().nullish(),
  patientSignatureDate: z.date().nullish(),
  caregiverMediaId: z.string().nullish(),
  caregiverSignatureDate: z.date().nullish(),
  patientId: z.string(),
  caregiverId: z.string().nullish(),
  comments: z.string().nullish(),
  miles: z.string().nullish(),
  milesComments: z.string().nullish(),
  startTime: z.date().nullish(),
  endTime: z.date().nullish(),
  dateAssessmentCompleted: z.date().nullish(),
  assessment: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UnscheduledVisit = z.infer<typeof UnscheduledVisitSchema>;

/////////////////////////////////////////
// MISSED NOTES SCHEMA
/////////////////////////////////////////

export const MissedNotesSchema = z.object({
  id: z.string(),
  caregiver: z.string(),
  scheduledVisit: z.date().nullish(),
  unscheduledVisitId: z.string(),
  startTime: z.date().nullish(),
  endTime: z.date().nullish(),
  visitType: z.string().nullish(),
  otherVisitType: z.string().nullish(),
  reasonType: z.string().nullish(),
  reasonTypeComment: z.string().nullish(),
  physicianNotified: z.string().nullish(),
  physicianNotifiedDate: z.date().nullish(),
  caseManagerNotified: z.string().nullish(),
  caseManagerNotifiedDate: z.date().nullish(),
  additionalComments: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MissedNotes = z.infer<typeof MissedNotesSchema>;

/////////////////////////////////////////
// INSURANCE PRIOR AUTHORIZATION SCHEMA
/////////////////////////////////////////

export const InsurancePriorAuthorizationSchema = z.object({
  providerId: z.string().nullish(),
  id: z.string(),
  disciplineId: z.string().nullish(),
  patientInsuranceId: z.string(),
  dateRequestSent: z.date().nullish(),
  dateAuthorizationReceived: z.date().nullish(),
  authCode: z.string().nullish(),
  visitAuth: z.string().nullish(),
  effectiveFrom: z.date().nullish(),
  effectiveThrough: z.date().nullish(),
  hoursAuth: z.string().nullish(),
  units: z.string().nullish(),
  notes: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsurancePriorAuthorization = z.infer<
  typeof InsurancePriorAuthorizationSchema
>;

/////////////////////////////////////////
// VITAL SIGNS SCHEMA
/////////////////////////////////////////

export const VitalSignsSchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  scheduledVisitId: z.string().nullish(),
  startTime: z.date().nullish(),
  endTime: z.date().nullish(),
  visitType: z.string().nullish(),
  otherVisitType: z.string().nullish(),
  shiftNote: z.string().array(),
  homeboundReason: z.string().array(),
  otherHomeBoundReason: z.string().nullish(),
  homeboundComment: z.string().nullish(),
  temperature: z.string().nullish(),
  temperatureType: z.string().nullish(),
  pulse: z.string().nullish(),
  pulseType: z.string().nullish(),
  pulseTypeRegular: z.string().nullish(),
  respiration: z.string().nullish(),
  respirationType: z.string().nullish(),
  notes: z.string().nullish(),
  bloodPressureRight: z.string().nullish(),
  bloodPressureLeft: z.string().nullish(),
  bloodPressureWeight: z.string().nullish(),
  bloodPressureType: z.string().nullish(),
  painDenied: z.boolean(),
  painLocation: z.string().nullish(),
  painIntensity: z.string().nullish(),
  otherPain: z.string().nullish(),
  painDuration: z.string().nullish(),
  medicationTaken: z.string().nullish(),
  painDescription: z.string().nullish(),
  painLevel: z.string().nullish(),
  painManagement: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VitalSigns = z.infer<typeof VitalSignsSchema>;

/////////////////////////////////////////
// CARDIO PULMONARY SCHEMA
/////////////////////////////////////////

export const CardioPulmonarySchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  cardiovascularNormal: z.boolean(),
  heartSound: z.string().nullish(),
  heartSoundNote: z.string().nullish(),
  edema: z.string().array(),
  edemaSeverity: z.string().nullish(),
  edemaLocation: z.string().nullish(),
  chestPain: z.boolean(),
  chestPainLocation: z.string().array(),
  otherChestPainLocation: z.string().nullish(),
  painDuration: z.string().nullish(),
  painIntensity: z.string().nullish(),
  painType: z.string().array(),
  relievingFactor: z.string().nullish(),
  cardiovascularNote: z.string().nullish(),
  pulmonaryNormal: z.boolean(),
  lungSound: z.string().array(),
  anterior: z.string().array(),
  posterior: z.string().array(),
  cough: z.string().array(),
  coughNote: z.string(),
  respiratoryStatus: z.string().array(),
  oxygen: z.string().nullish(),
  pulseOximetry: z.string().nullish(),
  pulmonaryNote: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CardioPulmonary = z.infer<typeof CardioPulmonarySchema>;

/////////////////////////////////////////
// NEURO GASTRO SCHEMA
/////////////////////////////////////////

export const NeuroGastroSchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  neuromuscularNormal: z.boolean(),
  mentalStatus: z.string().array(),
  mentalStatusOrientedTo: z.string().array(),
  headache: z.boolean(),
  impairment: z.string().array(),
  markApplicableNeuro: z.string().array(),
  gripStrength: z.string().nullish(),
  gripLeft: z.string().nullish(),
  gripRight: z.string().nullish(),
  pupils: z.string().nullish(),
  otherPupils: z.string().nullish(),
  falls: z.string().nullish(),
  neuromuscularNote: z.string().nullish(),
  gastrointestinalNormal: z.boolean(),
  bowelSounds: z.string().array(),
  bowelSoundsNote: z.string().nullish(),
  abdominalPainNone: z.boolean(),
  abdominalPain: z.string().array(),
  abdominalPainNote: z.string().nullish(),
  apetite: z.string().nullish(),
  nutritionalRequirement: z.string().nullish(),
  tubeFeeding: z.string().nullish(),
  tubeFeedingContinuous: z.string().nullish(),
  npo: z.boolean(),
  bowelMovementNormal: z.boolean(),
  bowelMovement: z.string().array(),
  lastBM: z.string().nullish(),
  enema: z.string().nullish(),
  markApplicableGastro: z.string().array(),
  gastrointestinalNote: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NeuroGastro = z.infer<typeof NeuroGastroSchema>;

/////////////////////////////////////////
// GENITO ENDO SCHEMA
/////////////////////////////////////////

export const GenitoEndoSchema = z.object({
  id: z.string(),
  genitourinaryNormal: z.boolean(),
  skilledNursingNoteId: z.string().nullish(),
  urineFrequency: z.string().nullish(),
  urineColor: z.string().nullish(),
  urineOdor: z.string().nullish(),
  symptoms: z.string().array(),
  urinaryCathetherType: z.string().nullish(),
  urinaryCathetherSize: z.string().nullish(),
  urinaryCathetherLastChanged: z.date().nullish(),
  urinaryCathetherIrrigation: z.string().nullish(),
  urinaryCathetherBulbInflated: z.string().nullish(),
  genitourinaryNote: z.string().nullish(),
  endocrineNormal: z.boolean(),
  bloodSugar: z.string().nullish(),
  glucometerReading: z.string().nullish(),
  bloodSugarFasting: z.string().nullish(),
  testingFrequency: z.string().nullish(),
  diabetesControlledWith: z.string().array(),
  administeredBy: z.string().array(),
  otherAdministeredBy: z.string().nullish(),
  hypoFrequency: z.string().nullish(),
  patientAware: z.string().nullish(),
  endocrineNote: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GenitoEndo = z.infer<typeof GenitoEndoSchema>;

/////////////////////////////////////////
// NOTE MEDICATION SCHEMA
/////////////////////////////////////////

export const NoteMedicationSchema = z.object({
  id: z.string(),
  medicationChanged: z.string().nullish(),
  skilledNursingNoteId: z.string().nullish(),
  medicationDose: z.string().nullish(),
  medicationUpdated: z.string().array(),
  allergyNote: z.string().nullish(),
  administeredBy: z.string().nullish(),
  otherAdministeredBy: z.string().nullish(),
  missedDoses: z.boolean(),
  missedDoseNote: z.string().nullish(),
  medicationNote: z.string().nullish(),
  therapyNA: z.boolean(),
  therapyRoute: z.string().array(),
  therapySite: z.string().nullish(),
  dressingChange: z.string().nullish(),
  otherDressingChange: z.string().nullish(),
  lineFlush: z.string().nullish(),
  otherLineFlush: z.string().nullish(),
  lineFlushSaline: z.string().array(),
  teachingProvidedTo: z.string().array(),
  otherTeachingProvidedTo: z.string().nullish(),
  teachingResponse: z.string().array(),
  otherTeachingResponse: z.string().nullish(),
  therapyNote: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NoteMedication = z.infer<typeof NoteMedicationSchema>;

/////////////////////////////////////////
// NOTE PLAN SCHEMA
/////////////////////////////////////////

export const NotePlanSchema = z.object({
  id: z.string(),
  carePlan: z.string().array(),
  skilledNursingNoteId: z.string().nullish(),
  nurseVisit: z.string().nullish(),
  physicianVisit: z.string().nullish(),
  careCordinationWith: z.string().array(),
  otherCareCordinationWith: z.string().nullish(),
  providedBillableSupplies: z.boolean(),
  planNote: z.string().nullish(),
  aideName: z.string().nullish(),
  aidePresent: z.string().nullish(),
  aideFamilySatisfied: z.boolean(),
  aideTaskObserved: z.string().nullish(),
  aideVisitDate: z.date().nullish(),
  lpnName: z.string().nullish(),
  lpnPresent: z.string().nullish(),
  lpnFamilySatisfied: z.boolean(),
  lpnTaskObserved: z.string().nullish(),
  lpnVisitDate: z.date().nullish(),
  generalNotes: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotePlan = z.infer<typeof NotePlanSchema>;

/////////////////////////////////////////
// QA SIGNATURE SCHEMA
/////////////////////////////////////////

export const QASignatureSchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  status: z.string().nullish(),
  patientMediaId: z.string().nullish(),
  patientSignatureDate: z.date().nullish(),
  nurseMediaId: z.string().nullish(),
  nurseSignatureDate: z.date().nullish(),
  QANote: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QASignature = z.infer<typeof QASignatureSchema>;

/////////////////////////////////////////
// SKIN AND WOUND SCHEMA
/////////////////////////////////////////

export const SkinAndWoundSchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  normalSkin: z.boolean(),
  signAndSymptoms: z.string().nullish(),
  symptomsExplanation: z.string().nullish(),
  skinColor: z.string().nullish(),
  skinTugor: z.string().nullish(),
  skinNote: z.string().nullish(),
  temperature: z.string().nullish(),
  skinCondition: z.string().nullish(),
  teachingProvidedTo: z.string().array(),
  otherTeachingProvidedTo: z.string().nullish(),
  woundCareProcedure: z.string().nullish(),
  responseToTeaching: z.string().array(),
  otherResponseToTeaching: z.string().nullish(),
  procedureDifficultyExplain: z.string().nullish(),
  doctorNotified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SkinAndWound = z.infer<typeof SkinAndWoundSchema>;

/////////////////////////////////////////
// WOUND SCHEMA
/////////////////////////////////////////

export const WoundSchema = z.object({
  id: z.string(),
  woundType: z.string().nullish(),
  woundLocation: JsonValueSchema.array(),
  skinAndWoundId: z.string().nullish(),
  location: z.string().nullish(),
  length: z.string().nullish(),
  depth: z.string().nullish(),
  width: z.string().nullish(),
  tissueThickness: z.string().nullish(),
  drainageType: z.string().nullish(),
  drainageAmount: z.string().nullish(),
  undermining: z.string().nullish(),
  bedColor: z.string().nullish(),
  tunnelling: z.string().nullish(),
  tunnellingLocation: z.string().nullish(),
  odor: z.string().nullish(),
  edema: z.string().nullish(),
  woundEdge: z.string().nullish(),
  bedTissue: z.string().array(),
  surroundingTissue: z.string().array(),
  notes: z.string().nullish(),
  NPWT: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Wound = z.infer<typeof WoundSchema>;

/////////////////////////////////////////
// NOTE INTERVENTION SCHEMA
/////////////////////////////////////////

export const NoteInterventionSchema = z.object({
  id: z.string(),
  bodySystem: z.string().nullish(),
  skilledNursingNoteId: z.string().nullish(),
  effectiveDate: z.date().nullish(),
  interventions: z.string().nullish(),
  patientResponse: z.string().nullish(),
  orders: z.string().nullish(),
  goals: z.string().nullish(),
  goalMet: z.string().nullish(),
  goalMetDate: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NoteIntervention = z.infer<typeof NoteInterventionSchema>;

/////////////////////////////////////////
// NOTE INTERV INST SCHEMA
/////////////////////////////////////////

export const NoteIntervInstSchema = z.object({
  id: z.string(),
  skilledNursingNoteId: z.string().nullish(),
  interventions: z.string().array(),
  interventionNote: z.string().nullish(),
  cardiacFluid: z.boolean(),
  cardiacExacerbation: z.boolean(),
  cardiacExacerbationNote: z.string().nullish(),
  cardiacDietTeaching: z.boolean(),
  cardiacDietTeachingNote: z.string().nullish(),
  respiratory: z.string().array(),
  gigu: z.string().array(),
  endocrine: z.string().array(),
  endocrineDietTeaching: z.string().nullish(),
  integumentary: z.string().array(),
  pain: z.string().array(),
  safety: z.string().array(),
  safetyDiseaseManagement: z.string().nullish(),
  interactionResponse: z.string().nullish(),
  instructionsNote: z.string().nullish(),
  goals: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NoteIntervInst = z.infer<typeof NoteIntervInstSchema>;

/////////////////////////////////////////
// PLAN OF CARE SCHEMA
/////////////////////////////////////////

export const PlanOfCareSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  patientId: z.string(),
  caregiverId: z.string(),
  certStartDate: z.date().nullish(),
  certEndDate: z.date().nullish(),
  signatureSentDate: z.date().nullish(),
  signatureReceivedDate: z.date().nullish(),
  mainInternalNote: z.string().nullish(),
  dmeSupplies: z.string().nullish(),
  safetyMeasures: z.string().nullish(),
  nutritionalRequirement: z.string().nullish(),
  allergies: z.string().nullish(),
  functionalLimitations: z.string().array(),
  otherFunctionalLimit: z.string().nullish(),
  activitiesPermitted: z.string().array(),
  otherActivitiesPermit: z.string().nullish(),
  mentalStatus: z.string().array(),
  otherMentalStatus: z.string().nullish(),
  prognosis: z.string().nullish(),
  certStatement: z.string().nullish(),
  cognitiveStatus: z.string().nullish(),
  rehabPotential: z.string().nullish(),
  dischargePlan: z.string().nullish(),
  riskIntervention: z.string().nullish(),
  informationRelatedTo: z.string().nullish(),
  caregiverNeeds: z.string().nullish(),
  homeboundStatus: z.string().nullish(),
  clinicalSummary: z.string().nullish(),
  physicianId: z.string().nullish(),
  modifyPhysicianCert: z.boolean(),
  caseManagerId: z.string().nullish(),
  verbalSOC: z.date().nullish(),
  qAstatus: z.string().nullish(),
  nurseMediaId: z.string().nullish(),
  nurseSignatureDate: z.date().nullish(),
  QANote: z.string().nullish(),
  carePreferences: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  medication: z.string().nullish(),
  isCert485: z.boolean(),
  cert485Orders: z.string().nullish(),
  cert485Goals: z.string().nullish(),
});

export type PlanOfCare = z.infer<typeof PlanOfCareSchema>;

/////////////////////////////////////////
// POC DIAGNOSIS PROCEDURE SCHEMA
/////////////////////////////////////////

export const PocDiagnosisProcedureSchema = z.object({
  id: z.string(),
  planOfCareId: z.string(),
  diagnosisProcedureId: z.string(),
  date: z.date().nullish(),
  type: z.string().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PocDiagnosisProcedure = z.infer<typeof PocDiagnosisProcedureSchema>;

/////////////////////////////////////////
// ORDERS AND GOALS SCHEMA
/////////////////////////////////////////

export const OrdersAndGoalsSchema = z.object({
  id: z.string(),
  planOfCareId: z.string(),
  carePlanType: z.string().nullish(),
  disciplineId: z.string().nullish(),
  isFrequencyOrder: z.boolean(),
  bodySystem: z.string().nullish(),
  effectiveDate: z.date().nullish(),
  orders: z.string().nullish(),
  orderexplanation: z.string().nullish(),
  goals: z.string().nullish(),
  goalsExplanation: z.string().nullish(),
  goalsMet: z.boolean(),
  goalsOngoing: z.boolean(),
  discontinue: z.boolean(),
  goalsMetDate: z.date().nullish(),
  active: z.boolean(),
  archivedOn: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrdersAndGoals = z.infer<typeof OrdersAndGoalsSchema>;

/////////////////////////////////////////
// PHRASE SCHEMA
/////////////////////////////////////////

export const PhraseSchema = z.object({
  id: z.string(),
  section: z.string(),
  name: z.string().nullish(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Phrase = z.infer<typeof PhraseSchema>;

/////////////////////////////////////////
// DIAGNOSIS PROCEDURE SCHEMA
/////////////////////////////////////////

export const DiagnosisProcedureSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullish(),
  warning: z.string().nullish(),
  scope: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DiagnosisProcedure = z.infer<typeof DiagnosisProcedureSchema>;
