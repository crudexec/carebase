/**
 * OASIS-E2 Section D: Mood (PHQ-2 to 9)
 */

import type { OasisItemData } from "../../types";

export const SECTION_D_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "D0100",
    label: "Should the PHQ-2 to 9 be Conducted?",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No (patient is rarely/never understood verbally, in writing, or using another method) → Skip to D0600" },
        { value: "1", label: "Yes → Continue to D0150" }
      ]
    },
    helpText: "Interview should be attempted with all patients who are able to communicate."
  },
  {
    code: "D0150A1",
    label: "PHQ-2: Little interest or pleasure in doing things - Symptom Presence",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
        { value: "9", label: "No response" }
      ]
    },
    skipLogic: [
      {
        id: "d0150a1-skip",
        conditions: [
          { itemCode: "D0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "D0150A1"
      }
    ],
    helpText: "Over the last 2 weeks, have you had little interest or pleasure in doing things?"
  },
  {
    code: "D0150A2",
    label: "PHQ-2: Little interest or pleasure in doing things - Symptom Frequency",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" }
      ]
    },
    skipLogic: [
      {
        id: "d0150a2-skip",
        conditions: [
          { itemCode: "D0150A1", operator: "notEquals", value: "1" }
        ],
        action: "hide",
        target: "D0150A2"
      }
    ],
    helpText: "How often have you been bothered by this in the last 2 weeks?"
  },
  {
    code: "D0150B1",
    label: "PHQ-2: Feeling down, depressed, or hopeless - Symptom Presence",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
        { value: "9", label: "No response" }
      ]
    },
    skipLogic: [
      {
        id: "d0150b1-skip",
        conditions: [
          { itemCode: "D0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "D0150B1"
      }
    ],
    helpText: "Over the last 2 weeks, have you felt down, depressed, or hopeless?"
  },
  {
    code: "D0150B2",
    label: "PHQ-2: Feeling down, depressed, or hopeless - Symptom Frequency",
    order: 5,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" }
      ]
    },
    skipLogic: [
      {
        id: "d0150b2-skip",
        conditions: [
          { itemCode: "D0150B1", operator: "notEquals", value: "1" }
        ],
        action: "hide",
        target: "D0150B2"
      }
    ],
    helpText: "How often have you been bothered by this in the last 2 weeks?"
  },
  {
    code: "D0160",
    label: "PHQ-2 Total Severity Score",
    order: 6,
    fieldType: "CALCULATED_SCORE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      minScore: 0,
      maxScore: 6,
      scoring: {
        method: "SUM",
        sourceItems: ["D0150A2", "D0150B2"]
      },
      thresholds: [
        { min: 0, max: 2, label: "No depression indication", color: "green" },
        { min: 3, max: 6, label: "Continue to PHQ-9", color: "yellow" }
      ],
      autoCalculate: true
    },
    skipLogic: [
      {
        id: "d0160-skip",
        conditions: [
          { itemCode: "D0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "D0160"
      }
    ],
    helpText: "Sum of D0150A2 and D0150B2. Score of 3 or greater → Continue to D0200."
  },
  {
    code: "D0200A2",
    label: "PHQ-9: Trouble falling or staying asleep, or sleeping too much",
    order: 7,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200a2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200A2"
      }
    ]
  },
  {
    code: "D0200B2",
    label: "PHQ-9: Feeling tired or having little energy",
    order: 8,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200b2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200B2"
      }
    ]
  },
  {
    code: "D0200C2",
    label: "PHQ-9: Poor appetite or overeating",
    order: 9,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200c2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200C2"
      }
    ]
  },
  {
    code: "D0200D2",
    label: "PHQ-9: Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    order: 10,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200d2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200D2"
      }
    ]
  },
  {
    code: "D0200E2",
    label: "PHQ-9: Trouble concentrating on things, such as reading the newspaper or watching television",
    order: 11,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200e2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200E2"
      }
    ]
  },
  {
    code: "D0200F2",
    label: "PHQ-9: Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless",
    order: 12,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200f2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200F2"
      }
    ]
  },
  {
    code: "D0200G2",
    label: "PHQ-9: Thoughts that you would be better off dead, or of hurting yourself in some way",
    order: 13,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Not at all (0 points)" },
        { value: "1", label: "Several days (1 point)" },
        { value: "2", label: "More than half the days (2 points)" },
        { value: "3", label: "Nearly every day (3 points)" },
        { value: "8", label: "N/A - Unable to respond" }
      ]
    },
    skipLogic: [
      {
        id: "d0200g2-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0200G2"
      }
    ],
    helpText: "IMPORTANT: If patient indicates thoughts of self-harm, ensure safety plan is in place."
  },
  {
    code: "D0300",
    label: "PHQ-9 Total Severity Score",
    order: 14,
    fieldType: "CALCULATED_SCORE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      minScore: 0,
      maxScore: 27,
      scoring: {
        method: "SUM",
        sourceItems: ["D0150A2", "D0150B2", "D0200A2", "D0200B2", "D0200C2", "D0200D2", "D0200E2", "D0200F2", "D0200G2"]
      },
      thresholds: [
        { min: 0, max: 4, label: "None/Minimal", color: "green" },
        { min: 5, max: 9, label: "Mild", color: "yellow" },
        { min: 10, max: 14, label: "Moderate", color: "orange" },
        { min: 15, max: 19, label: "Moderately Severe", color: "red" },
        { min: 20, max: 27, label: "Severe", color: "darkred" }
      ],
      autoCalculate: true
    },
    skipLogic: [
      {
        id: "d0300-skip",
        conditions: [
          { itemCode: "D0160", operator: "lessThan", value: "3" }
        ],
        action: "hide",
        target: "D0300"
      }
    ],
    helpText: "PHQ-9 Total Score: 0-4 None/Minimal; 5-9 Mild; 10-14 Moderate; 15-19 Moderately Severe; 20-27 Severe"
  },
  {
    code: "D0600",
    label: "Total Severity Score",
    order: 15,
    fieldType: "CALCULATED_SCORE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      minScore: 0,
      maxScore: 27,
      scoring: {
        method: "CONDITIONAL",
        formula: "IF(D0100=0, STAFF_ASSESSMENT, IF(D0160<3, D0160, D0300))"
      },
      autoCalculate: true
    },
    helpText: "Final depression severity score based on patient interview or staff assessment."
  }
];
