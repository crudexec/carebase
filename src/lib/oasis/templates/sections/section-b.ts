/**
 * OASIS-E2 Section B: Patient History and Diagnoses
 */

import type { OasisItemData } from "../../types";

export const SECTION_B_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "M1000",
    label: "Inpatient Discharge Date",
    order: 1,
    fieldType: "DATE_PARTS",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      allowNA: true,
      naLabel: "NA - No inpatient facility discharge in past 14 days",
      allowUK: true,
      ukLabel: "UK - Unknown"
    },
    helpText: "Enter the discharge date from the most recent inpatient facility stay within the past 14 days."
  },
  {
    code: "M1005",
    label: "Inpatient Facility Discharge Diagnosis",
    order: 2,
    fieldType: "MULTI_DIAGNOSIS",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      maxDiagnoses: 6,
      codeSystem: "ICD-10-CM",
      requireDescription: true,
      allowNA: true,
      naLabel: "NA - No inpatient facility discharge diagnosis"
    },
    skipLogic: [
      {
        id: "m1005-na-skip",
        conditions: [
          { itemCode: "M1000", operator: "equals", value: "NA" }
        ],
        action: "hide",
        target: "M1005"
      }
    ],
    helpText: "List the ICD-10-CM diagnosis codes for conditions requiring inpatient treatment."
  },
  {
    code: "M1021",
    label: "Primary Diagnosis",
    order: 3,
    fieldType: "MULTI_DIAGNOSIS",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      maxDiagnoses: 1,
      codeSystem: "ICD-10-CM",
      requireDescription: true,
      requireSymptomControl: true,
      symptomControlOptions: [
        { value: "0", label: "Asymptomatic" },
        { value: "1", label: "Symptoms well controlled" },
        { value: "2", label: "Symptoms poorly controlled" },
        { value: "3", label: "Symptom control NA" }
      ]
    },
    helpText: "Enter the primary diagnosis that represents the chief reason for home health services."
  },
  {
    code: "M1023",
    label: "Other Diagnoses",
    order: 4,
    fieldType: "MULTI_DIAGNOSIS",
    required: false,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      maxDiagnoses: 24,
      codeSystem: "ICD-10-CM",
      requireDescription: true,
      requireSymptomControl: true,
      symptomControlOptions: [
        { value: "0", label: "Asymptomatic" },
        { value: "1", label: "Symptoms well controlled" },
        { value: "2", label: "Symptoms poorly controlled" },
        { value: "3", label: "Symptom control NA" }
      ],
      groupByCategory: true
    },
    helpText: "Enter all other diagnoses that co-exist at the time of assessment and affect care/treatment."
  },
  {
    code: "M1028",
    label: "Active Diagnoses - Comorbidities and Co-existing Conditions",
    order: 5,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      options: [
        { value: "1", label: "Peripheral Vascular Disease (PVD) or Peripheral Arterial Disease (PAD)" },
        { value: "2", label: "Diabetes Mellitus (DM)" },
        { value: "3", label: "None of the above" }
      ],
      layout: "vertical",
      allowMultiple: true,
      exclusiveOptions: ["3"]
    },
    helpText: "Check all conditions that apply."
  },
  {
    code: "M1030",
    label: "Therapies at Home",
    order: 6,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      options: [
        { value: "1", label: "IV/Infusion therapy (excludes TPN)" },
        { value: "2", label: "Parenteral nutrition (TPN or lipids)" },
        { value: "3", label: "Enteral nutrition (nasogastric, gastrostomy, jejunostomy, or any other artificial entry)" },
        { value: "4", label: "None of the above" }
      ],
      layout: "vertical",
      allowMultiple: true,
      exclusiveOptions: ["4"]
    },
    helpText: "Check all therapies the patient is receiving at home."
  },
  {
    code: "M1033",
    label: "Risk for Hospitalization",
    order: 7,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      options: [
        { value: "1", label: "History of falls (2 or more falls in the past 12 months)" },
        { value: "2", label: "Unintentional weight loss of a total of 10 pounds or more in the past 12 months" },
        { value: "3", label: "Multiple hospitalizations (2 or more) in the past 6 months" },
        { value: "4", label: "Multiple emergency department visits (2 or more) in the past 6 months" },
        { value: "5", label: "Decline in mental, emotional, or behavioral status in the past 3 months" },
        { value: "6", label: "Reported or observed history of difficulty complying with any medical instructions in the past 3 months" },
        { value: "7", label: "Currently taking 5 or more medications" },
        { value: "8", label: "Currently reports exhaustion" },
        { value: "9", label: "Other risk(s) not listed in 1-8" },
        { value: "10", label: "None of the above" }
      ],
      layout: "vertical",
      allowMultiple: true,
      exclusiveOptions: ["10"]
    },
    helpText: "Check all risk factors that apply to this patient."
  }
];
