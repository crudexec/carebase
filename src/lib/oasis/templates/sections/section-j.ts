/**
 * OASIS-E2 Section J: Health Conditions
 */

import type { OasisItemData } from "../../types";

export const SECTION_J_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "J0510",
    label: "Pain Effect on Sleep",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Does not apply - I have not had any pain or hurting in the past 5 days" },
        { value: "1", label: "Rarely or not at all" },
        { value: "2", label: "Occasionally" },
        { value: "3", label: "Frequently" },
        { value: "4", label: "Almost constantly" },
        { value: "8", label: "Unable to answer" }
      ]
    },
    helpText: "In the past 5 days, how often has pain made it hard for you to sleep at night?"
  },
  {
    code: "J0520",
    label: "Pain Interference with Therapy Activities",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Does not apply - I have not had any pain or hurting in the past 5 days" },
        { value: "1", label: "Rarely or not at all" },
        { value: "2", label: "Occasionally" },
        { value: "3", label: "Frequently" },
        { value: "4", label: "Almost constantly" },
        { value: "8", label: "Unable to answer" }
      ]
    },
    helpText: "In the past 5 days, how often have you limited your day-to-day activities because of pain?"
  },
  {
    code: "J0530",
    label: "Pain Interference with Day-to-Day Activities",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Does not apply - I have not had any pain or hurting in the past 5 days" },
        { value: "1", label: "Rarely or not at all" },
        { value: "2", label: "Occasionally" },
        { value: "3", label: "Frequently" },
        { value: "4", label: "Almost constantly" },
        { value: "8", label: "Unable to answer" }
      ]
    }
  },
  {
    code: "J1800",
    label: "Any Falls Since SOC/ROC",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    },
    helpText: "Has the patient had any falls since start of care or last follow-up assessment?"
  },
  {
    code: "J1900A",
    label: "Number of Falls - No Injury",
    order: 5,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 99,
      step: 1
    },
    skipLogic: [
      {
        id: "j1900a-skip",
        conditions: [
          { itemCode: "J1800", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "J1900A"
      }
    ],
    helpText: "Number of falls with no injury (no evidence of physical injury)."
  },
  {
    code: "J1900B",
    label: "Number of Falls - Injury (except major)",
    order: 6,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 99,
      step: 1
    },
    skipLogic: [
      {
        id: "j1900b-skip",
        conditions: [
          { itemCode: "J1800", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "J1900B"
      }
    ],
    helpText: "Number of falls with injury except major injury."
  },
  {
    code: "J1900C",
    label: "Number of Falls - Major Injury",
    order: 7,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 99,
      step: 1
    },
    skipLogic: [
      {
        id: "j1900c-skip",
        conditions: [
          { itemCode: "J1800", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "J1900C"
      }
    ],
    helpText: "Number of falls with major injury (bone fractures, joint dislocations, closed head injuries with altered consciousness, subdural hematoma)."
  },
  {
    code: "M1033",
    label: "Risk for Hospitalization",
    order: 8,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU"],
    config: {
      options: [
        { value: "1", label: "History of falls (2 or more falls - or any fall with an injury - in the past 12 months)" },
        { value: "2", label: "Unintentional weight loss of a total of 10 pounds or more in the last 12 months" },
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
    }
  },
  {
    code: "M1242",
    label: "Frequency of Pain Interfering with Activity or Movement",
    order: 9,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Patient has no pain" },
        { value: "1", label: "Patient has pain that does not interfere with activity or movement" },
        { value: "2", label: "Less often than daily" },
        { value: "3", label: "Daily, but not constantly" },
        { value: "4", label: "All of the time" }
      ]
    }
  },
  {
    code: "M1311A",
    label: "Current Number of Unhealed Pressure Ulcers/Injuries at Stage 2",
    order: 10,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    description: "Stage 2 pressure ulcer: Partial thickness loss of dermis."
  },
  {
    code: "M1311B",
    label: "Number of Stage 2 Pressure Ulcers Present at Most Recent SOC/ROC",
    order: 11,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    }
  },
  {
    code: "M1322",
    label: "Current Number of Stage 1 Pressure Injuries",
    order: 12,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    description: "Stage 1 pressure injury: Intact skin with non-blanchable redness."
  },
  {
    code: "M1324A",
    label: "Stage of Most Problematic Unhealed Pressure Ulcer That is Stageable",
    order: 13,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No pressure ulcer" },
        { value: "1", label: "Stage 1" },
        { value: "2", label: "Stage 2" },
        { value: "3", label: "Stage 3" },
        { value: "4", label: "Stage 4" },
        { value: "NA", label: "Patient has no stageable pressure ulcers" }
      ]
    }
  },
  {
    code: "M1332",
    label: "Current Number of Stasis Ulcers",
    order: 14,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    description: "Number of observable stasis ulcers."
  },
  {
    code: "M1334",
    label: "Status of Most Problematic Stasis Ulcer",
    order: 15,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Newly epithelialized" },
        { value: "1", label: "Fully granulating" },
        { value: "2", label: "Early/partial granulation" },
        { value: "3", label: "Not healing" },
        { value: "NA", label: "No stasis ulcer" }
      ]
    },
    skipLogic: [
      {
        id: "m1334-skip",
        conditions: [
          { itemCode: "M1332", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1334"
      }
    ]
  },
  {
    code: "M1340",
    label: "Surgical Wound Present",
    order: 16,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes, patient has at least one observable surgical wound" }
      ]
    },
    helpText: "Does the patient have at least one surgical wound?"
  },
  {
    code: "M1342",
    label: "Status of Most Problematic Surgical Wound",
    order: 17,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Newly epithelialized" },
        { value: "1", label: "Fully granulating" },
        { value: "2", label: "Early/partial granulation" },
        { value: "3", label: "Not healing" },
        { value: "NA", label: "No surgical wound" }
      ]
    },
    skipLogic: [
      {
        id: "m1342-skip",
        conditions: [
          { itemCode: "M1340", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1342"
      }
    ]
  },
  {
    code: "M1400",
    label: "When is the Patient Dyspneic or Noticeably Short of Breath",
    order: 18,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Patient is not short of breath" },
        { value: "1", label: "When walking more than 20 feet, climbing stairs" },
        { value: "2", label: "With moderate exertion (e.g., while dressing, using commode or bedpan, walking distances less than 20 feet)" },
        { value: "3", label: "With minimal exertion (e.g., while eating, talking, or performing other ADLs) or with agitation" },
        { value: "4", label: "At rest (during day or night)" }
      ]
    }
  }
];
