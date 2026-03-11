/**
 * OASIS-E2 Section O: Special Treatments, Procedures, and Programs
 */

import type { OasisItemData } from "../../types";

export const SECTION_O_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "O0110A1",
    label: "Special Treatments - Chemotherapy (IV, Oral, Other)",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes - Patient is receiving chemotherapy while a patient of this agency" }
      ]
    }
  },
  {
    code: "O0110A2",
    label: "Special Treatments - Chemotherapy (At SOC/ROC)",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110B1",
    label: "Special Treatments - IV Medications (Not Chemotherapy)",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes - IV medications (not including fluids)" }
      ]
    }
  },
  {
    code: "O0110B2",
    label: "Special Treatments - IV Medications (At SOC/ROC)",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110C1",
    label: "Special Treatments - Transfusions",
    order: 5,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110C2",
    label: "Special Treatments - Transfusions (At SOC/ROC)",
    order: 6,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110D1",
    label: "Special Treatments - Dialysis",
    order: 7,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110D2",
    label: "Special Treatments - Dialysis (At SOC/ROC)",
    order: 8,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110E1",
    label: "Special Treatments - Oxygen (Intermittent or Continuous)",
    order: 9,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110E2",
    label: "Special Treatments - Oxygen (At SOC/ROC)",
    order: 10,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110F1",
    label: "Special Treatments - Suctioning (Oral or Tracheal)",
    order: 11,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110F2",
    label: "Special Treatments - Suctioning (At SOC/ROC)",
    order: 12,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110G1",
    label: "Special Treatments - Tracheostomy Care",
    order: 13,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110G2",
    label: "Special Treatments - Tracheostomy Care (At SOC/ROC)",
    order: 14,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110H1",
    label: "Special Treatments - Invasive Mechanical Ventilator",
    order: 15,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110H2",
    label: "Special Treatments - Invasive Mechanical Ventilator (At SOC/ROC)",
    order: 16,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110I1",
    label: "Special Treatments - Non-Invasive Mechanical Ventilator (BiPAP, CPAP)",
    order: 17,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110I2",
    label: "Special Treatments - Non-Invasive Mechanical Ventilator (At SOC/ROC)",
    order: 18,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110J1",
    label: "Special Treatments - IV Access (Peripheral and/or Central)",
    order: 19,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "O0110J2",
    label: "Special Treatments - IV Access (At SOC/ROC)",
    order: 20,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2102",
    label: "Types and Sources of Assistance",
    order: 21,
    fieldType: "HIERARCHICAL_CHECKBOX",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      categories: [
        {
          id: "adl",
          label: "ADL Assistance",
          options: [
            { id: "adl-spouse", label: "Spouse or significant other" },
            { id: "adl-family", label: "Other family" },
            { id: "adl-friends", label: "Friends, neighbors, community" },
            { id: "adl-paid", label: "Paid help" },
            { id: "adl-none", label: "None of the above" }
          ]
        },
        {
          id: "iadl",
          label: "IADL Assistance",
          options: [
            { id: "iadl-spouse", label: "Spouse or significant other" },
            { id: "iadl-family", label: "Other family" },
            { id: "iadl-friends", label: "Friends, neighbors, community" },
            { id: "iadl-paid", label: "Paid help" },
            { id: "iadl-none", label: "None of the above" }
          ]
        }
      ]
    },
    helpText: "Identify types and sources of assistance for ADL and IADL care."
  },
  {
    code: "M2110",
    label: "Frequency of Informal ADL Assistance",
    order: 22,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "At least daily" },
        { value: "1", label: "Three or more times per week" },
        { value: "2", label: "One to two times per week" },
        { value: "3", label: "Received, but less often than weekly" },
        { value: "4", label: "No assistance received" },
        { value: "UK", label: "Unknown" }
      ]
    },
    helpText: "How often does the patient receive unpaid ADL assistance from friends or family?"
  },
  {
    code: "M2200",
    label: "Therapy Need",
    order: 23,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    },
    helpText: "Does the physician-ordered plan of care include PT, OT, or SLP therapy?"
  },
  {
    code: "M2250A",
    label: "Emergent Care - Reason: Improper medication administration",
    order: 24,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    },
    description: "Since the last OASIS assessment, was the patient treated in an emergency department due to improper medication administration, medication side effects, toxicity, or anaphylaxis?"
  },
  {
    code: "M2250B",
    label: "Emergent Care - Reason: Injury caused by fall",
    order: 25,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250C",
    label: "Emergent Care - Reason: Respiratory infection",
    order: 26,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250D",
    label: "Emergent Care - Reason: Other respiratory problem",
    order: 27,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250E",
    label: "Emergent Care - Reason: Heart failure",
    order: 28,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250F",
    label: "Emergent Care - Reason: Cardiac dysrhythmia",
    order: 29,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250G",
    label: "Emergent Care - Reason: Myocardial infarction",
    order: 30,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250H",
    label: "Emergent Care - Reason: Other heart disease",
    order: 31,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250I",
    label: "Emergent Care - Reason: Stroke (CVA) or TIA",
    order: 32,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2250J",
    label: "Emergent Care - Reason: Hypo/hyperglycemia, diabetes out of control",
    order: 33,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    }
  },
  {
    code: "M2301",
    label: "Emergent Care - Overall",
    order: 34,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "TRN", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes, one time" },
        { value: "2", label: "Yes, two or more times" },
        { value: "UK", label: "Unknown" }
      ]
    },
    helpText: "Since the last OASIS assessment, has the patient received emergent care for any reason?"
  },
  {
    code: "M2401",
    label: "Intervention Synopsis",
    order: 35,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["TRN", "DC"],
    config: {
      options: [
        { value: "A", label: "Patient/caregiver education about specific disease process" },
        { value: "B", label: "Patient/caregiver instruction/management of medications" },
        { value: "C", label: "Patient/caregiver instruction on signs/symptoms to report" },
        { value: "D", label: "Patient/caregiver instruction on medication management" },
        { value: "E", label: "Skin care interventions" },
        { value: "F", label: "Fall prevention" },
        { value: "G", label: "Depression intervention" },
        { value: "H", label: "Intervention for impaired cognition" },
        { value: "I", label: "Pain assessment" },
        { value: "J", label: "Pain intervention" },
        { value: "K", label: "Preventive and immunization education" },
        { value: "Z", label: "None of the above" }
      ],
      layout: "vertical",
      allowMultiple: true,
      exclusiveOptions: ["Z"]
    },
    helpText: "Select all interventions that were implemented during this episode of care."
  }
];
