export * from "./clinical";
export * from "./evv";
export * from "./patient";
export * from "./qamanager";
export * from "./schedule";
export * from "./taxonomy";
export * from "./user";

import {
  DayType,
  DmeSuppliesType,
  EthnicityType,
  GenderType,
  MaritalStatus,
  ProviderType,
  VisitStatus,
} from "@prisma/client";
import { City, Country, State } from "country-state-city";

import { QueryType } from "@/types";

export const ALLOWED_OBJECT_TYPES = ["users", "forms"];
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/zip",
];
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/zip",
  ...ACCEPTED_IMAGE_TYPES,
];
export const MAX_IMAGE_SIZE = 5000000;
export const MAX_FILE_SIZE = 25 * 1024 * 1024 * 1024;

export const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "strict" as true | false | "lax" | "strict" | "none" | undefined,
  secure: process.env.NODE_ENV === "production",
};

export const DayOptions = [
  { value: DayType.SUNDAY, label: "Sunday" },
  { value: DayType.MONDAY, label: "Monday" },
  { value: DayType.TUESDAY, label: "Tuesday" },
  { value: DayType.WEDNESDAY, label: "Wednesday" },
  { value: DayType.THURSDAY, label: "Thursday" },
  { value: DayType.FRIDAY, label: "Friday" },
  { value: DayType.SATURDAY, label: "Saturday" },
];

export const providerTypeOptions = [
  { value: ProviderType.HOMEHEALTH, label: "Home Health" },
  { value: ProviderType.HOSPICE, label: "Hospice" },
  { value: ProviderType.BOTH, label: "Both" },
];

export const genderOptions = [
  { value: GenderType.MALE, label: "Male" },
  { value: GenderType.FEMALE, label: "Female" },
];

export const maritalStatusOptions = [
  { value: MaritalStatus.MARRIED, label: "Married" },
  { value: MaritalStatus.SINGLE, label: "Single" },
  { value: MaritalStatus.WIDOW, label: "Widow" },
  { value: MaritalStatus.DIVORCED, label: "Divorced" },
  { value: MaritalStatus.SEPARATED, label: "Separated" },
  { value: MaritalStatus.LIFE_PARTNER, label: "Life Partner" },
  { value: MaritalStatus.UNKNOWN, label: "Unknown" },
];

export const ethnicityOptions = [
  { value: EthnicityType.NATIVEAMERICAN, label: "Native American" },
  { value: EthnicityType.ASIAN, label: "Asian" },
  { value: EthnicityType.AFRICANAMERICAN, label: "African American" },
  { value: EthnicityType.HISPANIC, label: "Hispanic" },
  { value: EthnicityType.NATIVEHAWAIIAN, label: "Native Hawaiian" },
  { value: EthnicityType.CAUCASIAN, label: "Caucasian" },
  { value: EthnicityType.OTHERS, label: "Others" },
];

export const dmeSuppliesOptions = [
  { value: DmeSuppliesType.ORDERED, label: "Ordered" },
  { value: DmeSuppliesType.NOTNEEDED, label: "None needed at this time" },
];

export const dateTypeOptions = [
  { value: "O", label: "O" },
  { value: "E", label: "E" },
];

export const functionLimitsOption = [
  { value: "AMPUTATION", label: "Amputation" },
  { value: "SPEECH", label: "Speech" },
  { value: "PARALYSIS", label: "Paralysis" },
  { value: "HEARING", label: "Hearing" },
  { value: "CONTRACTURE", label: "Contracture" },
  { value: "VISION", label: "Vision" },
  { value: "EXTREMITY", label: "Extremity" },
];

export const rueOptions = [
  { value: "RUE", label: "RUE" },
  { value: "RLE", label: "RLE" },
  { value: "LUE", label: "LUE" },
  { value: "LLE", label: "LLE" },
];

export const wtBearingOptions = [
  { value: "FULL", label: "Full" },
  { value: "PARTIAL", label: "Partial" },
  { value: "NONE", label: "None" },
];

export const titleOptions = [
  { value: "LVN", label: "LVN" },
  { value: "LPN", label: "LPN" },
  { value: "RN", label: "RN" },
  { value: "PT", label: "PT" },
  { value: "OT", label: "OT" },
  { value: "ST", label: "ST" },
  { value: "CM", label: "CM" },
  { value: "CT", label: "CT" },
  { value: "SV", label: "SV" },
];

export const serviceOptions = [
  { value: "G0151", label: "Physical Therapy" },
  { value: "G0152", label: "Occupational Therapy" },
  { value: "G0153", label: "Speech Therapy" },
  { value: "G0157", label: "PT Assistant" },
  { value: "G0158", label: "OT Assistant" },
  { value: "G0159", label: "PT Maintenance" },
  { value: "G0160", label: "OT Maintenance" },
  { value: "G0161", label: "S/LP Maintenance" },
];

export const nurseNotesOptions = [
  { value: "BILLABLE", label: "Always Billable" },
  { value: "NONBILLABLE", label: "Always Non-Billable" },
  { value: "BOTH", label: "Can Be Either" },
];

export const assistiveDeviceOptions = [
  { value: "CANE", label: "Cane" },
  { value: "WALKER", label: "Walker" },
  { value: "WHEELCHAIR", label: "Wheelcair" },
];

export const activitiesAndDietOptions = [
  { value: "BEDREST", label: "BEDREST" },
  { value: "OOB", label: "OOB" },
  { value: "BRP", label: "BRP" },
  { value: "AMB", label: "Amb" },
  { value: "TRANSFER", label: "Transfer" },
];

export const foleyCatheterOptions = [
  { value: "YES", label: "Y" },
  { value: "NO", label: "N" },
];

export const serviceReqestedOptions = [
  { value: "SN", label: "SN" },
  { value: "HHA", label: "HHA" },
  { value: "PT", label: "PT" },
  { value: "OT", label: "OT" },
  { value: "ST", label: "ST" },
  { value: "MSW", label: "MSW" },
];

export const insuranceInformationOption = [
  {
    label: "Medicare Advantage (Medicare #)",
    value: "medicate_advantage",
  },
  {
    label: "Tricare Champus (Sponsors SSN)",
    value: "tricare_champus",
  },
  { label: "CHAMPVA (Member ID#)", value: "champva" },
  {
    label: "Group Health Plan(SSN or ID)",
    value: "group_health_plan",
  },
  { label: "FECA BLK LUNG (SSN)", value: "feca_blk_lung" },
  { label: "Other (ID)", value: "other" },
];

export const serviceRequiredOptions = [
  {
    label: "Physical Therapist",
    value: "physical-therapist",
  },
  {
    label: "Occupational Therapist",
    value: "occupational-therapist",
  },
  {
    label: "Speech Therapist",
    value: "speech-therapist",
  },
  {
    label: "Psychiatric Caregivers",
    value: "psychiatric-caregivers",
  },
  {
    label: "Skilled Nurse",
    value: "skilled-nurse",
  },
  {
    label: "Medical Social Worker",
    value: "medical-social-worker",
  },
  {
    label: "Home Health Aide",
    value: "home-health-aide",
  },
  {
    label: "Skilled Caregivers",
    value: "skilled-caregivers",
  },
  {
    label: "Unskilled Caregivers",
    value: "unskilled-caregivers",
  },
];

export const legalPaperOptions = [
  {
    label: "Copy Requested",
    value: "copy-requested",
  },
  {
    label: "Copy Obtained",
    value: "copy-obtained",
  },
  {
    label: "Living Will",
    value: "living-will",
  },
  {
    label: "HC Surrogate",
    value: "hc-surrogate",
  },
];

export const serviceReqestedOptions2 = [
  { value: "NEW", label: "New" },
  { value: "CHANGED", label: "Changed" },
];

export const stageTypeOptions = [
  { value: "STAGE3", label: "Stage 3" },
  { value: "STAGE4", label: "Stage 4" },
];

export const getCountries = () =>
  Country.getAllCountries()?.map((country) => ({
    value: country.isoCode,
    label: `${country.flag} ${country.name}`,
  }));

export const getStates = (country?: string) =>
  country
    ? State.getStatesOfCountry(country)?.map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

export const getCities = (country?: string, state?: string) =>
  country && state
    ? City.getCitiesOfState(country, state)?.map((state) => ({
        value: state.name,
        label: state.name,
      }))
    : [];

export const USERGROUPS = ["therapist", "caregiver", "nurse"];

export const ROLES = [
  {
    value: "nurse",
    label: "Nurse",
  },
  {
    value: "caregiver",
    label: "Caregiver",
  },
  {
    value: "therapist",
    label: "Therapist",
  },
  {
    value: "biller",
    label: "Biller",
  },
  {
    value: "administrator",
    label: "Administrator",
  },
  {
    value: "office_manager",
    label: "Office Manager",
  },
  {
    value: "payroll_manager",
    label: "Payroll Manager",
  },
  {
    value: "office_clinician_don",
    label: "Office/Clinician/Don",
  },
  {
    value: "case_manager",
    label: "Case Manager",
  },
  {
    value: "insurance_case_manager",
    label: "Insurance Case Manager",
  },
  {
    value: "lvn_lpn",
    label: "LVN/LPN",
  },
];

export const patientProfileTabs = [
  {
    label: "Admission",
    value: "admission",
  },
  {
    label: "Referral Source",
    value: "referral_source",
  },
  {
    label: "Emergency Contact",
    value: "emergency_contact",
  },
  {
    label: "Insurance",
    value: "insurance",
  },
  {
    label: "Commercial",
    value: "commercial",
  },
  {
    label: "Authorization",
    value: "authorization",
  },
  {
    label: "Log",
    value: "log",
  },
  {
    label: "Access Information",
    value: "access_info",
  },
];

export const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const dayPeriods = [
  { value: "1", label: "First" },
  { value: "2", label: "Second" },
  { value: "3", label: "Third" },
  { value: "4", label: "Fourth" },
  { value: "-1", label: "Last" },
];

export const extendedDayOptions = [
  { value: "SU", label: "Sunday" },
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
  { value: "DAY", label: "Day" },
  { value: "WEEKDAY", label: "Weekday" },
  { value: "WEEKEND", label: "Weekend" },
];

export const RecurringDayOptions = [
  { value: "SU", label: "Sunday" },
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
];

export const billingCode = [
  { value: "ADHL", label: "Adult Day Care - High Level" },
  { value: "Covd", label: "Covid Testing" },
  { value: "DANCING", label: "Dancing Therapy" },
  { value: "H2014", label: "CFASS - L1 - Individual" },
  { value: "H2015", label: "CFASS - L2 - Individual" },
  { value: "HHA", label: "Home Health Aide – Medicaid" },
  { value: "LPNDIRM", label: "LPN Direct Skilled Care" },
  { value: "LPNVM", label: "LPN/LVN Direct Care Visit - Medicare" },
  { value: "OT", label: "Occupational Therapy–Medicare" },
  { value: "PTEV", label: "Physical Therapy Evaluation Visit" },
  { value: "RNDCM", label: "RN Direct Care- Medicare" },
  { value: "RNDIRM", label: "RN Direct Skilled Care" },
  { value: "RNSUP", label: "RN Supervisory Visit" },
  { value: "RNVM", label: "RN Direct Care - Medicare" },
  { value: "SN", label: "Skilled Nursing – Medicare" },
  { value: "SND", label: "SN - Direct Skilled Services" },
  { value: "TESTBILL", label: "test billable visit" },
  { value: "TRAVTIME", label: "HHA Travel Time" },
];

export const visitStatusOptions = [
  { value: VisitStatus.NOT_COMPLETED, label: "Not Completed (N)", abbv: "N" },
  { value: VisitStatus.HOSPITALIZED, label: "Hospitalized (H)", abbv: "H" },
  { value: VisitStatus.COMPLETED, label: "Completed (C)", abbv: "C" },
  { value: VisitStatus.ON_HOLD, label: "On Hold (O)", abbv: "O" },
  { value: VisitStatus.CANCELLED, label: "Cancelled (A)", abbv: "A" },
  { value: VisitStatus.MISSED, label: "Missed (M)", abbv: "M" },
];

export const initialQuery: QueryType = {
  pageIndex: 0,
  pageSize: 10,
  // search: '',
};

export const infectionTypes = [
  { label: "UTI NO CATHETER", value: "UTI NO CATHETER" },
  { label: "MRSA", value: "MRSA" },
  { label: "RESPIRATORY INFECTION", value: "RESPIRATORY INFECTION" },
  { label: "WOUND INFECTION", value: "WOUND INFECTION" },
  { label: "E/N/T INFECTION", value: "E/N/T INFECTION" },
  { label: "UTI WITH CATHETER", value: "UTI WITH CATHETER" },
  { label: "IV SITE INFECTION", value: "IV SITE INFECTION" },
];

export const referralSources = [
  { label: "A-BAIS ROCHEL", value: "A-BAIS ROCHEL" },
  { label: "A-TASTY TASTY", value: "A-TASTY TASTY" },
  { label: "EMPLOYEE", value: "EMPLOYEE" },
  { label: "GENERAL HOSPITAL DC PLNR", value: "GENERAL HOSPITAL DC PLNR" },
  { label: "HOSPITAL D/C PLANNER", value: "HOSPITAL D/C PLANNER" },
  { label: "HOSPITAL INTAKE SYSTEM", value: "HOSPITAL INTAKE SYSTEM" },
  { label: "MARKETING DEPT", value: "MARKETING DEPT" },
  { label: "MARKETING JANE", value: "MARKETING JANE" },
  { label: "PATIENT", value: "PATIENT" },
];

export const admissionSources = [
  { label: "Clinic Referral", value: "Clinic Referral" },
  { label: "Court/Law Enforcement", value: "Court/Law Enforcement" },
  { label: "Emergency Room", value: "Emergency Room" },
  { label: "HMO Referral", value: "HMO Referral" },
  { label: "Information Not Available", value: "Information Not Available" },
  { label: "Physician Referral", value: "Physician Referral" },
  {
    label: "Readmission to Same Home Health Agency",
    value: "Readmission to Same Home Health Agency",
  },
  {
    label: "Transfer from a Critical Access Hospital",
    value: "Transfer from a Critical Access Hospital",
  },
  { label: "Transfer from a Hospital", value: "Transfer from a Hospital" },
  {
    label: "Transfer from a Skilled Nursing Facility",
    value: "Transfer from a Skilled Nursing Facility",
  },
];

export const relationshipOptions = [
  { label: "Self", value: "Self" },
  { label: "Grandfather or Grandmother", value: "Grandfather or Grandmother" },
  { label: "Spouse", value: "Spouse" },
  { label: "Grandson or Granddaughter", value: "Grandson or Granddaughter" },
  { label: "Nephew or Niece", value: "Nephew or Niece" },
  { label: "Foster Child", value: "Foster Child" },
  { label: "Stepson or Stepdaughter", value: "Stepson or Stepdaughter" },
  { label: "Child", value: "Child" },
  { label: "Employee", value: "Employee" },
  { label: "Unknown", value: "Unknown" },
  { label: "Significant Other", value: "Significant Other" },
  { label: "Mother", value: "Mother" },
  { label: "Father", value: "Father" },
  { label: "Other Relationship", value: "Other Relationship" },
];

export const insuranceTypes = [
  { label: "Primary", value: "Primary" },
  { label: "Secondary", value: "Secondary" },
  { label: "Tertiary", value: "Tertiary" },
  { label: "Non-Insurance", value: "Non-Insurance" },
];

export const assignmentStatuses = [
  { label: "A - Assigned", value: "A - Assigned" },
  {
    label: "B - Assignment Accepted on Clinical Lab Services Only",
    value: "B - Assignment Accepted on Clinical Lab Services Only",
  },
  { label: "C - Not Assigned", value: "C - Not Assigned" },
  {
    label: "P - Patient Refuses to Assign Benefits",
    value: "P - Patient Refuses to Assign Benefits",
  },
];

export const billTypes = [
  {
    label: "32 - Home Health Services under a Plan of Care",
    value: "32 - Home Health Services under a Plan of Care",
  },
  {
    label: "33 - O/P or Part A - usage terminated by Medicare",
    value: "33 - O/P or Part A - usage terminated by Medicare",
  },
  {
    label: "34 - Service Not Under Plan of Treatment",
    value: "34 - Service Not Under Plan of Treatment",
  },
];

export const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
  { label: "Not Applicable", value: "Not Applicable" },
];
export const regionOptions = [
  { label: "Chinese", value: "chinese" },
  { label: "County 1", value: "county_1" },
  { label: "County 2", value: "county_2" },
  { label: "County 3", value: "county_3" },
];

export const patientRelationships = [
  { label: "Parent (of a minor child)", value: "parent" },
  { label: "Spouse", value: "spouse" },
  { label: "Other", value: "other" },
];

export const evacuationLevel = [
  { label: "Level 1 HIGH PRIORITY", value: "level 1" },
  { label: "Level 2", value: "level 2" },
  { label: "Level 3", value: "level 3" },
];

export const signatureSourceCodes = [
  {
    value: "B",
    label:
      "B - Signed signature authorization form(s) for both HCFA-1500 Claim Form blocks 12 and 13 on file",
  },
  { value: "C", label: "C - Signed HCFA-1500 Claim Form on file" },
  {
    value: "M",
    label:
      "M - Signed signature authorization form for HCFA-1500 Claim Form block 13 on file",
  },
  {
    value: "P",
    label:
      "P - Signature generated by provider because patient was not physically present for services",
  },
  {
    value: "S",
    label:
      "S - Signed signature authorization form for HCFA-1500 Claim Form block 12 on file",
  },
];

export const periodOption = [
  { label: "Today", value: "today" },
  { label: "Next 7 days", value: "next-7-days" },
  { label: "Next 30 days", value: "next-30-days" },
  { label: "Custom Range", value: "custom-range" },
];

export const frequencyOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];
export const phraseSections = [
  { value: "advanced-directives", label: "Advanced Directives" },
  { value: "aide-visit-comment", label: "Aide Visit Comment" },
  { value: "aideconnectnotename", label: "AideConnectNoteName" },
  { value: "allergies", label: "Allergies" },
  { value: "caregiver-needs", label: "Caregiver Needs" },
  { value: "careplan-interventions", label: "CarePlan-Interventions" },
  { value: "careplan-pat-cg-response", label: "CarePlan-Pat/CG Response" },
  { value: "clinical", label: "Clinical" },
  { value: "communication-log", label: "Communication Log" },
  { value: "crm", label: "CRM" },
  { value: "discharge-plans", label: "Discharge Plans" },
  { value: "discharge-sum", label: "Discharge Sum" },
  { value: "dme-sup", label: "DME & Sup" },
  { value: "fax-comments", label: "Fax Comments" },
  { value: "goals", label: "Goals" },
  { value: "homebound-status", label: "Homebound Status" },
  { value: "hospice-diagnoses", label: "Hospice Diagnoses" },
  {
    value: "hospice-sn-vn-gastrointestinal",
    label: "Hospice SNVN-Gastrointestinal",
  },
  { value: "hospice-sn-vn-genitourinary", label: "Hospice SNVN-Genitourinary" },
  { value: "hospice-sn-vn-postmortem", label: "Hospice SNVN-Postmortem" },
  { value: "hospice-sn-vn-pulmonary", label: "Hospice SNVN-Pulmonary" },
  { value: "hospice-sn-vn-vital-signs", label: "Hospice SNVN-Vital Signs" },
  { value: "hospice-sn-vn-wound-care", label: "Hospice SNVN-Wound Care" },
  { value: "incident-report", label: "Incident Report" },
  { value: "med-frequency-type", label: "Med Frequency Type" },
  { value: "nomnc", label: "NOMNC" },
  { value: "nonoasis-clinical-summary", label: "NonOASIS-Clinical Summary" },
  { value: "nutrition", label: "Nutrition" },
  { value: "nutritional-req", label: "Nutritional Req" },
  { value: "oasis-homebound-status", label: "OASIS-Homebound Status" },
  { value: "oasis-safety-measures", label: "OASIS-Safety Measures" },
  { value: "orders", label: "Orders" },
  { value: "ot-notes-general", label: "OT Notes General" },
  { value: "otpocgoals", label: "OTPOCGoals" },
  { value: "pat-cg-response", label: "Pat/CG Response" },
  { value: "patient-comments", label: "Patient Comments" },
  { value: "patient-stat-time-asmt", label: "Patient Stat Time Asmt" },
  { value: "phys-cert-statement-poc-plus", label: "Phys.Cert Statement-POC+" },
  { value: "progress-toward-goals", label: "Progress Toward Goals" },
  { value: "psychosocial", label: "Psychosocial" },
  { value: "pt-notes-general", label: "PT Notes General" },
  { value: "pt-notes-medication", label: "PT Notes Medication" },
  { value: "ptpocgoals", label: "PTPOCGoals" },
  { value: "re-admission-factors", label: "Re-Admission Factors" },
  { value: "referral", label: "Referral" },
  { value: "rehab-potential", label: "Rehabilitation Potential" },
  { value: "safety", label: "Safety" },
  { value: "sn-vn-cardiovascular", label: "SN VN-Cardiovascular" },
  { value: "sn-vn-endocrine", label: "SN VN-Endocrine" },
  { value: "sn-vn-gastrointestinal", label: "SN VN-Gastrointestinal" },
  { value: "sn-vn-general-notes", label: "SN VN-General Notes" },
  { value: "sn-vn-genitourinary", label: "SN VN-Genitourinary" },
  { value: "sn-vn-homebound", label: "SN VN-Homebound" },
  { value: "sn-vn-instruction", label: "SN VN-Instruction" },
  { value: "sn-vn-interactionresponse", label: "SN VN-InteractionResponse" },
  { value: "sn-vn-intervention", label: "SN VN-Intervention" },
  { value: "sn-vn-medications", label: "SN VN-Medications" },
  { value: "sn-vn-neuromuscular", label: "SN VN-Neuromuscular" },
  { value: "sn-vn-pulmonary", label: "SN VN-Pulmonary" },
  { value: "sn-vn-skin-wound", label: "SN VN-Skin Wound" },
  { value: "sn-vn-vital-signs", label: "SN VN-Vital Signs" },
  { value: "sn-vn-wound-care", label: "SN VN-Wound Care" },
  { value: "st-notes-general", label: "ST Notes General" },
  { value: "stpocgoals", label: "STPOCGoals" },
  { value: "verbal-order", label: "Verbal Order" },
];

export const assessmentReasons = [
  { value: "1", label: " Start of care, further visits planned" },
  { value: "2", label: "Resumption of care (after in-patient stay)" },
  { value: "3", label: "Recertification (follow-up) reassessment" },
  { value: "4", label: "Other Follow-Up" },
  { value: "5", label: "Patient not discharged from agency" },
  { value: "6", label: "Patient discharged from agency" },
  { value: "7", label: "Death at Home" },
  { value: "8", label: "Discharge from agency" },
];
