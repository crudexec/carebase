import { StudentType } from "@prisma/client";
export * from "./medication";
export * from "./schedule";
export * from "./unscheduled-visit";

import { ColType } from "@/types";

export const suffixes = [
  { value: "B.V.M.", label: "B.V.M." },
  { value: "CFRE", label: "CFRE" },
  { value: "CLU", label: "CLU" },
  { value: "CPA", label: "CPA" },
  { value: "C.S.C.", label: "C.S.C." },
  { value: "C.S.J.", label: "C.S.J." },
  { value: "D.C.", label: "D.C." },
  { value: "D.D.", label: "D.D." },
  { value: "D.D.S.", label: "D.D.S." },
  { value: "D.M.D.", label: "D.M.D." },
  { value: "D.O.", label: "D.O." },
  { value: "D.V.M.", label: "D.V.M." },
  { value: "Ed.D.", label: "Ed.D." },
  { value: "Esq.", label: "Esq." },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "Inc", label: "Inc" },
  { value: "J.D.", label: "J.D." },
  { value: "Jr.", label: "Jr." },
  { value: "LL.D.", label: "LL.D." },
  { value: "Ltd.", label: "Ltd." },
  { value: "M.D.", label: "M.D." },
  { value: "O.D.", label: "O.D." },
  { value: "O.S.B.", label: "O.S.B." },
  { value: "P.C.", label: "P.C." },
  { value: "P.E.", label: "P.E." },
  { value: "Ph.D.", label: "Ph.D." },
  { value: "Ret.", label: "Ret." },
  { value: "R.G.S", label: "R.G.S" },
  { value: "R.N.", label: "R.N." },
  { value: "R.N.C.", label: "R.N.C." },
  { value: "S.H.C.J.", label: "S.H.C.J." },
  { value: "S.J.", label: "S.J." },
  { value: "S.N.J.M.", label: "S.N.J.M." },
  { value: "Sr.", label: "Sr." },
  { value: "S.S.M.O.", label: "S.S.M.O." },
  { value: "USA", label: "USA" },
  { value: "USAF", label: "USAF" },
  { value: "USAFR", label: "USAFR" },
  { value: "USAR", label: "USAR" },
  { value: "USCG", label: "USCG" },
  { value: "USMC", label: "USMC" },
  { value: "USMCR", label: "USMCR" },
  { value: "USN", label: "USN" },
  { value: "USNR", label: "USNR" },
];
export const ReferralSourceType = [
  { label: "Individual", value: "individual" },
  { label: "Clinic", value: "clinic" },
  { label: "Private Organization", value: "private_organization" },
  { label: "Local Health Department", value: "local_health_department" },
  { label: "Social Services Agency", value: "social_services_agency" },
  { label: "Another Home Health", value: "another_home_health" },
  { label: "Other Govt. Agency", value: "other_govt_agency" },
  { label: "Insurance Company", value: "insurance_company" },
  { label: "Employment Agency", value: "employment_agency" },
  { label: "State Hospital", value: "state_hospital" },
  { label: "Jail Diversion", value: "jail_diversion" },
  {
    label: "Emergency Department Diversion",
    value: "emergency_department_diversion",
  },
  { label: "Other", value: "10" },
];

export const admissionSource = [
  {
    value: "1 Non-Health Care Facility Point of Origin",
    label: "1 Non-Health Care Facility Point of Origin",
  },
  {
    value: "1 Transfer from another Home Health Agency",
    label: "1 Transfer from another Home Health Agency",
  },
  { value: "2 Clinic", label: "2 Clinic" },
  {
    value: "4 Transfer from a Hospital (Different Facility)",
    label: "4 Transfer from a Hospital (Different Facility)",
  },
  {
    value: "5 Transfer from SNF or ICF or ALF/Born In Hospital",
    label: "5 Transfer from SNF or ICF or ALF/Born In Hospital",
  },
  {
    value:
      "6 Transfer from another Health Care Facility/ Born Outside Hospital",
    label:
      "6 Transfer from another Health Care Facility/ Born Outside Hospital",
  },
  { value: "8 Court / Law Enforcement", label: "8 Court / Law Enforcement" },
  {
    value: "9 Information not available",
    label: "9 Information not available",
  },
  {
    value:
      "D Transfer between Distinct Units of Same Hospital (Separate Claims)",
    label:
      "D Transfer between Distinct Units of Same Hospital (Separate Claims)",
  },
  {
    value: "E Transfer from Ambulatory Surgery Center",
    label: "E Transfer from Ambulatory Surgery Center",
  },
  {
    value: "F Transfer from Hospice Facility",
    label: "F Transfer from Hospice Facility",
  },
];

export const CBSACode = [
  { value: "47894 PRINCE GEORGES 2024", label: "47894 PRINCE GEORGES 2024" },
  { value: "47894 PRINCE GEORGES 2023", label: "47894 PRINCE GEORGES 2023" },
  { value: "47894 PRINCE GEORGES 2022", label: "47894 PRINCE GEORGES 2022" },
];

export const studentType = [
  { value: StudentType.FULL_TIME, label: "Full Time" },
  { value: StudentType.PART_TIME, label: "Part Time" },
  { value: StudentType.NONE, label: "Not a Student" },
];

export const employmentStatus = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "SELF_EMPLOYED", label: "Self Employed" },
  { value: "RETIRED", label: "Retired" },
  { value: "MILITARY_DUTY", label: "Military Duty" },
  { value: "UNKNOWN", label: "Unknown" },
];

export const admissionPriority = [
  { value: "ELECTIVE", label: "Elective" },
  { value: "NEWBORN", label: "Newborn" },
  { value: "TRAUMA", label: "Trauma" },
  { value: "URGENT", label: "Urgent" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "INFORMATION_UNAVAILABLE", label: "Information Unavailable" },
];

export const patientConditionRelatedTo = [
  { value: "employment", label: "Employment" },
  { value: "auto-accident", label: "Auto Accident" },
  { value: "other-accident", label: "Other Accident" },
];

export const dischargeReasons = [
  {
    value: "01",
    label: "Discharged to home or self-care (routine discharge).",
  },
  {
    value: "02",
    label:
      "Discharged/transferred to a short-term general hospital for inpatient care.",
  },
  {
    value: "03",
    label:
      "Discharged/transferred to SNF with Medicare Cert in anticipation of covered skilled care.",
  },
  {
    value: "04",
    label:
      "Discharged/transferred to facility that provides custodial or supportive care.",
  },
  {
    value: "05",
    label:
      "Discharged/transferred to Designated Cancer Center or Children's Hospital",
  },
  {
    value: "06",
    label:
      "Discharged to home under care of organised HH serv org pending covered skilled care.",
  },
  { value: "07", label: "Left against medical advice or discontinued care." },
  {
    value: "08",
    label:
      "Discharged/transferred to home under care of home IV drug therapy provider (not Medicare cert).",
  },
  { value: "09", label: "Admitted as an in-patient to this hospital" },
  {
    value: "20",
    label: "Expired (or did not recover - Christian Sciene Patient)",
  },
  { value: "21", label: "Discharged/transferred to Court/Law Enforcement" },
  { value: "30", label: "Still our patient. (Use 30 too if new Patient.)" },
  { value: "40", label: "Expired at home." },
  { value: "41", label: "Expired in hospital/SNF/ICF" },
  { value: "42", label: "Expired - place unknown." },
  {
    value: "43",
    label: "Discharged/transferred to a federal health-care facility.",
  },
  { value: "50", label: "Discharged to hospice home." },
  { value: "51", label: "Discharged to hospital medical facility." },
  {
    value: "61",
    label:
      "Discharged/transferred to a hospital-based, Medicare-approved swing bed.",
  },
  { value: "62", label: "Discharged to rehabilitation facility/unit." },
  { value: "63", label: "Discharged to long-term care (LTC) hospital." },
  {
    value: "64",
    label:
      "Discharged/transferred to nursing home certified under Medicaid (but not Medicare)",
  },
  {
    value: "65",
    label:
      "Discharged/transferred to a psych hospital or psych-distinct-part unit of hospital.",
  },
  {
    value: "66",
    label: "Discharged/transferred to Critical Access Hospitals.",
  },
  {
    value: "69",
    label:
      "Discharged/transferred to a designated disaster alternative care site",
  },
  {
    value: "70",
    label:
      "Discharged/transferred to another Institution Type not Defined Elsewhere in this List",
  },
  {
    value: "81",
    label:
      "Discharged to home or self-care with a planned acute care hospital inpatient readmission",
  },
];

export const otherDischargeReasons = [
  { value: "Goals", label: "Goals Met" },
  { value: "leftArea", label: "Patient Left the Area" },
  { value: "Refusal", label: "Patient Refused Service" },
  { value: "Unavoidable", label: "Unavoidable" },
  { value: "ptc", label: "Patient Choice" },
  { value: "DNR", label: "Patient was DNR" },
  { value: "Accident", label: "Accident" },
  { value: "Term", label: "Terminal Illness" },
  { value: "Alone", label: "Alone in home" },
  { value: "Expired", label: "NO READMIT Expired" },
  { value: "Noncompliance", label: "NO READMIT Noncompliance" },
  { value: "Nonpayment", label: "NO READMIT Insurance Nonpayment" },
  { value: "NRRefusal", label: "NO READMIT Pt Refused Services" },
  { value: "transferred", label: "Transferred to Nursing Home" },
  { value: "hospitalized", label: "Hospitalized" },
  { value: "died", label: "Died at Home" },
  { value: "transferredtoAnotherAgency", label: "Transfer to Another Agency" },
  { value: "movedOut", label: "Moved out of Service Area" },
  { value: "ptRefusedServices", label: "PT Refused Services" },
  { value: "other", label: "D. Other (Specify)" },
];

export const payersOption = [
  { value: "medicare_advantage", label: "Medicare Advantage (Medicare #)" },
  { value: "tricare", label: "Tricare E&W Champus(Sponsors SSN)" },
  { value: "champva", label: "CHAMPVA (Member ID#)" },
  { value: "group_health", label: "Group Health Plan(SSN or ID)" },
  { value: "feca_blk", label: "FECA BLK LUNG (SSN)" },
  { value: "Other", label: "Other (ID)" },
];

export const policyHolders = [
  { value: "01", label: "01 Spouse" },
  { value: "04", label: "04 Grandfather or Grandmother (4010 Only)" },
  { value: "05", label: "05 Grandson or Granddaughter (4010 Only)" },
  { value: "07", label: "07 Nephew or Neice (4010 Only)" },
  { value: "10", label: "10 Foster Child (4010 Only)" },
  { value: "15", label: "15 Ward (4010 Only)" },
  { value: "17", label: "17 Stepson or Stepdaughter (4010 Only)" },
  { value: "18", label: "18 Self" },
  { value: "19", label: "19 Child" },
  { value: "20", label: "20 Employee" },
  { value: "21", label: "21 Unknown" },
  { value: "22", label: "22 Handicapped Dependent (4010 Only)" },
  { value: "23", label: "23 Sponsored Dependent (4010 Only)" },
  { value: "24", label: "24 Dependent of a Minor Dependent (4010 Only)" },
  { value: "29", label: "29 Significant Other (4010 Only)" },
  { value: "32", label: "32 Mother (4010 Only)" },
  { value: "33", label: "33 Father (4010 Only)" },
  { value: "34", label: "34 Other Adult (4010 Only)" },
  { value: "36", label: "36 Emancipated Minor (4010 Only)" },
  { value: "39", label: "39 Organ Doner" },
  { value: "40", label: "40 Cadaver Doner" },
  { value: "41", label: "41 Injured Plaintiff (4010 Only)" },
  {
    value: "43",
    label: "43 Child Where Insured Has No Financial Responsibility (4010 Only)",
  },
  { value: "53", label: "53 Life Partner" },
  { value: "76", label: "76 Dependent (4010 only)" },
  { value: "G8", label: "G8 Other Relationship" },
];

export const patientColumns: ColType[] = [
  {
    key: "firstName",
    label: "First Name",
    visible: true,
  },
  {
    key: "middleInitial",
    label: "Middle Initial",
    visible: true,
  },
  {
    key: "lastName",
    label: "Last Name",
    visible: true,
  },
  {
    key: "patientId",
    label: "Patient ID",
    visible: true,
  },

  {
    key: "payer",
    label: "Payer",
    visible: true,
  },
  {
    key: "soc",
    label: "SOC",
    visible: true,
  },
  {
    key: "dischargeDate",
    label: "Discharge Date",
    visible: true,
  },
  {
    key: "address",
    label: "Address",
    visible: true,
  },
  {
    key: "insurance",
    label: "Insurance",
    visible: true,
  },

  {
    key: "diagnosis",
    label: "Diagnosis",
    visible: true,
  },
  {
    key: "doctor",
    label: "Doctor",
    visible: true,
  },
  {
    key: "disciplines",
    label: "Disciplines",
    visible: true,
  },
  {
    key: "certPeriod",
    label: "Certification Period",
    visible: true,
  },
  {
    key: "createdAt",
    label: "Created At",
    visible: false,
  },
];
