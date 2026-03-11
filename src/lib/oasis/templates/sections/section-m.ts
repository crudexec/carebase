/**
 * OASIS-E2 Section M: Skin Conditions
 */

import type { OasisItemData } from "../../types";

export const SECTION_M_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "M1306",
    label: "Unhealed Pressure Ulcers/Injuries",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" }
      ]
    },
    helpText: "Does this patient have one or more unhealed pressure ulcers/injuries?"
  },
  {
    code: "M1307",
    label: "Oldest Stage 2 Pressure Ulcer",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "1", label: "Was present at most recent SOC/ROC" },
        { value: "2", label: "Developed since most recent SOC/ROC" },
        { value: "NA", label: "No Stage 2 pressure ulcers" }
      ]
    },
    skipLogic: [
      {
        id: "m1307-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1307"
      }
    ]
  },
  {
    code: "M1308A",
    label: "Current Number of Unstageable Pressure Ulcers Due to Non-Removable Dressing",
    order: 3,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308a-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308A"
      }
    ]
  },
  {
    code: "M1308B",
    label: "Current Number of Unstageable Pressure Ulcers Due to Slough/Eschar",
    order: 4,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308b-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308B"
      }
    ]
  },
  {
    code: "M1308C",
    label: "Current Number of Unstageable Pressure Ulcers Due to Deep Tissue Injury",
    order: 5,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308c-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308C"
      }
    ]
  },
  {
    code: "M1308D",
    label: "Current Number of Stage 3 Pressure Ulcers",
    order: 6,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308d-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308D"
      }
    ],
    description: "Stage 3: Full thickness tissue loss. Subcutaneous fat may be visible but bone, tendon or muscle are not exposed."
  },
  {
    code: "M1308E",
    label: "Current Number of Stage 4 Pressure Ulcers",
    order: 7,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308e-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308E"
      }
    ],
    description: "Stage 4: Full thickness tissue loss with exposed bone, tendon or muscle."
  },
  {
    code: "M1308F",
    label: "Number of Stage 3 Pressure Ulcers Present at Most Recent SOC/ROC",
    order: 8,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308f-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308F"
      }
    ]
  },
  {
    code: "M1308G",
    label: "Number of Stage 4 Pressure Ulcers Present at Most Recent SOC/ROC",
    order: 9,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1308g-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1308G"
      }
    ]
  },
  {
    code: "M1309A",
    label: "Number of Unstageable Due to Dressing at Most Recent SOC/ROC",
    order: 10,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1309a-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1309A"
      }
    ]
  },
  {
    code: "M1309B",
    label: "Number of Unstageable Due to Slough/Eschar at Most Recent SOC/ROC",
    order: 11,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1309b-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1309B"
      }
    ]
  },
  {
    code: "M1309C",
    label: "Number of Unstageable Due to Deep Tissue Injury at Most Recent SOC/ROC",
    order: 12,
    fieldType: "NUMERIC_COUNTER",
    required: true,
    visibleAt: ["FU", "DC"],
    config: {
      min: 0,
      max: 9,
      step: 1
    },
    skipLogic: [
      {
        id: "m1309c-skip",
        conditions: [
          { itemCode: "M1306", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "M1309C"
      }
    ]
  },
  {
    code: "M1350",
    label: "Skin Lesion or Open Wound",
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
    },
    helpText: "Does this patient have a skin lesion or an open wound, excluding bowel ostomy, other than those described in M1306-M1340?"
  }
];
