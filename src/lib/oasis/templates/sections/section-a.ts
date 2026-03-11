/**
 * OASIS-E2 Section A: Administrative Information
 */

import type { OasisItemData } from "../../types";

export const SECTION_A_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "M0010",
    label: "CMS Certification Number",
    order: 1,
    fieldType: "STRUCTURED_ID",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 6, type: "numeric", label: "CCN" }
      ],
      separator: "",
      placeholder: "______"
    },
    helpText: "Enter the 6-digit CMS Certification Number (CCN) for the HHA."
  },
  {
    code: "M0014",
    label: "Branch State",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      digits: 2,
      format: "text",
      options: []
    },
    helpText: "Enter the two-letter postal code for the state where the branch providing services is located."
  },
  {
    code: "M0016",
    label: "Branch ID Number",
    order: 3,
    fieldType: "STRUCTURED_ID",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 10, type: "alphanumeric", label: "Branch ID" }
      ],
      separator: ""
    },
    helpText: "Enter the branch identification number assigned by the HHA to the branch location."
  },
  {
    code: "M0018",
    label: "National Provider Identifier (NPI)",
    order: 4,
    fieldType: "STRUCTURED_ID",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 10, type: "numeric", label: "NPI" }
      ],
      separator: "",
      placeholder: "__________"
    },
    helpText: "Enter the 10-digit National Provider Identifier (NPI) for the HHA."
  },
  {
    code: "M0020",
    label: "Patient ID Number",
    order: 5,
    fieldType: "TEXT_SHORT",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      maxLength: 20
    },
    helpText: "Enter the patient ID number assigned by the HHA."
  },
  {
    code: "M0030",
    label: "Start of Care Date",
    order: 6,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      allowNA: false,
      allowUK: false
    },
    helpText: "Enter the date of the first Medicare or Medicaid billable visit."
  },
  {
    code: "M0032",
    label: "Resumption of Care Date",
    order: 7,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["ROC"],
    config: {
      allowNA: true,
      naLabel: "NA - Not Applicable"
    },
    skipLogic: [
      {
        id: "m0032-soc-hide",
        conditions: [
          { itemCode: "M0100", operator: "equals", value: "01" }
        ],
        action: "hide",
        target: "M0032"
      }
    ],
    helpText: "Enter the date care resumed following an inpatient stay."
  },
  {
    code: "M0040",
    label: "Patient Last Name",
    order: 8,
    fieldType: "TEXT_SHORT",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      maxLength: 30
    }
  },
  {
    code: "M0040A",
    label: "Patient Suffix",
    order: 9,
    fieldType: "TEXT_SHORT",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      maxLength: 5
    }
  },
  {
    code: "M0050",
    label: "Patient First Name",
    order: 10,
    fieldType: "TEXT_SHORT",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      maxLength: 20
    }
  },
  {
    code: "M0055",
    label: "Patient Middle Initial",
    order: 11,
    fieldType: "TEXT_SHORT",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      maxLength: 1
    }
  },
  {
    code: "M0060",
    label: "Patient State of Residence",
    order: 12,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      digits: 2,
      format: "text"
    },
    helpText: "Enter the two-letter postal code for the patient's state of residence."
  },
  {
    code: "M0063",
    label: "Medicare Number",
    order: 13,
    fieldType: "STRUCTURED_ID",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 11, type: "alphanumeric", label: "MBI" }
      ],
      allowNA: true,
      naLabel: "NA - No Medicare"
    },
    helpText: "Enter the patient's Medicare Beneficiary Identifier (MBI)."
  },
  {
    code: "M0064",
    label: "Social Security Number",
    order: 14,
    fieldType: "STRUCTURED_ID",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 3, type: "numeric" },
        { length: 2, type: "numeric" },
        { length: 4, type: "numeric" }
      ],
      separator: "-",
      allowUK: true,
      ukLabel: "UK - Unknown"
    }
  },
  {
    code: "M0065",
    label: "Medicaid Number",
    order: 15,
    fieldType: "STRUCTURED_ID",
    required: false,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      segments: [
        { length: 14, type: "alphanumeric", label: "Medicaid ID" }
      ],
      allowNA: true,
      naLabel: "NA - No Medicaid"
    }
  },
  {
    code: "M0066",
    label: "Birth Date",
    order: 16,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      allowNA: false,
      allowUK: false
    }
  },
  {
    code: "M0069",
    label: "Gender",
    order: 17,
    fieldType: "SINGLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      options: [
        { value: "1", label: "Male" },
        { value: "2", label: "Female" }
      ],
      layout: "horizontal"
    }
  },
  {
    code: "M0080",
    label: "Discipline of Person Completing Assessment",
    order: 18,
    fieldType: "SINGLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      options: [
        { value: "01", label: "RN" },
        { value: "02", label: "PT" },
        { value: "03", label: "SLP/ST" },
        { value: "04", label: "OT" }
      ],
      layout: "vertical"
    }
  },
  {
    code: "M0090",
    label: "Date Assessment Completed",
    order: 19,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      allowNA: false,
      allowUK: false
    }
  },
  {
    code: "M0100",
    label: "Reason for Assessment",
    order: 20,
    fieldType: "SINGLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
    config: {
      options: [
        { value: "01", label: "Start of care - further visits planned" },
        { value: "03", label: "Resumption of care (after inpatient stay)" },
        { value: "04", label: "Recertification (follow-up) reassessment" },
        { value: "06", label: "Transfer to an inpatient facility - patient not discharged from agency" },
        { value: "07", label: "Transfer to an inpatient facility - patient discharged from agency" },
        { value: "08", label: "Death at home" },
        { value: "09", label: "Discharge from agency" }
      ],
      layout: "vertical"
    },
    helpText: "Select the reason for this assessment."
  },
  {
    code: "M0102",
    label: "Date of Physician-ordered Start of Care (Resumption of Care)",
    order: 21,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      allowNA: true,
      naLabel: "NA - No specific date ordered"
    },
    helpText: "Enter the date the physician ordered the start (or resumption) of care."
  },
  {
    code: "M0104",
    label: "Date of Referral",
    order: 22,
    fieldType: "DATE_PARTS",
    required: true,
    visibleAt: ["SOC"],
    config: {
      allowNA: false,
      allowUK: true,
      ukLabel: "UK - Unknown"
    },
    helpText: "Enter the date the agency received the referral for home health services."
  },
  {
    code: "M0110",
    label: "Episode Timing",
    order: 23,
    fieldType: "SINGLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      options: [
        { value: "01", label: "Early" },
        { value: "02", label: "Later" },
        { value: "UK", label: "Unknown" }
      ],
      layout: "horizontal"
    },
    helpText: "Indicate whether the patient is in an early or later episode at start/resumption of care."
  }
];
