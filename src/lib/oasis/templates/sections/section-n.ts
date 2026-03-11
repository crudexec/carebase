/**
 * OASIS-E2 Section N: Medications
 */

import type { OasisItemData } from "../../types";

export const SECTION_N_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "N0415",
    label: "High-Risk Drug Classes: Use and Indication",
    order: 1,
    fieldType: "MATRIX_GRID",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      rows: [
        { id: "A", label: "Anticoagulant" },
        { id: "B", label: "Antidiabetic" },
        { id: "C", label: "Opioid" }
      ],
      columns: [
        { id: "1", label: "Is Taking (Check if applicable)" },
        { id: "2", label: "Indication Noted (Check if applicable)" }
      ],
      cellType: "checkbox"
    },
    helpText: "For each drug class, indicate if patient is taking and if indication is noted in the medical record."
  },
  {
    code: "M2001",
    label: "Drug Regimen Review",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No - No issues found during review" },
        { value: "1", label: "Yes - Issues found during review" },
        { value: "9", label: "NA - Patient is not taking any medications" }
      ]
    },
    helpText: "Did a complete drug regimen review identify potential clinically significant medication issues?"
  },
  {
    code: "M2003",
    label: "Medication Follow-up",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    },
    skipLogic: [
      {
        id: "m2003-skip",
        conditions: [
          { itemCode: "M2001", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M2003"
      },
      {
        id: "m2003-skip-na",
        conditions: [
          { itemCode: "M2001", operator: "equals", value: "9" }
        ],
        action: "hide",
        target: "M2003"
      }
    ],
    helpText: "Was physician/prescriber contact made to resolve identified medication issues?"
  },
  {
    code: "M2005",
    label: "Medication Intervention",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
        { value: "9", label: "NA - No potential clinically significant medication issues identified OR patient is not taking any medications" }
      ]
    },
    helpText: "Did the agency implement medication intervention(s)?"
  },
  {
    code: "M2010",
    label: "Patient/Caregiver High-Risk Drug Education",
    order: 5,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
        { value: "9", label: "NA - Patient not taking any high-risk drugs OR patient/caregiver fully knowledgeable about all high-risk drugs" }
      ]
    },
    helpText: "Has the patient/caregiver been instructed on special precautions for high-risk medications?"
  },
  {
    code: "M2015",
    label: "Patient/Caregiver Drug Education Intervention",
    order: 6,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
        { value: "9", label: "NA - Patient not taking any medications" }
      ]
    },
    helpText: "Has the patient/caregiver been instructed on drug interactions?"
  },
  {
    code: "M2020",
    label: "Management of Oral Medications",
    order: 7,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Able to independently take the correct oral medication(s) and proper dosage(s) at correct times" },
        { value: "1", label: "Able to take medication(s) at correct times if individual doses are prepared in advance and/or a drug diary or chart is used" },
        { value: "2", label: "Able to take medication(s) at correct times if given reminders" },
        { value: "3", label: "Unable to take medication unless administered by another person" },
        { value: "NA", label: "No oral medications prescribed" }
      ]
    },
    helpText: "Patient's current ability to prepare and take all oral medications reliably and safely."
  },
  {
    code: "M2030",
    label: "Management of Injectable Medications",
    order: 8,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Able to independently take the correct medication(s) and proper dosage(s) at correct times" },
        { value: "1", label: "Able to take medication(s) at correct times if individual doses are prepared in advance and/or chart is used" },
        { value: "2", label: "Able to take medication(s) at correct times if given reminders" },
        { value: "3", label: "Unable to take medication unless administered by another person" },
        { value: "NA", label: "No injectable medications prescribed" }
      ]
    },
    helpText: "Patient's current ability to prepare and take all injectable medications reliably and safely."
  },
  {
    code: "M2040",
    label: "Prior Medication Management",
    order: 9,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      options: [
        { value: "0", label: "Independent: Takes medications on own" },
        { value: "1", label: "Assistance from caregiver" },
        { value: "2", label: "Uses medication reminders (pill box, alarm)" },
        { value: "3", label: "Medications administered by another" },
        { value: "UK", label: "Unknown" }
      ],
      layout: "vertical",
      allowMultiple: true
    },
    helpText: "How did the patient manage medications prior to this episode?"
  }
];
