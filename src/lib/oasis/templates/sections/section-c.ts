/**
 * OASIS-E2 Section C: Cognitive Patterns
 */

import type { OasisItemData } from "../../types";

export const SECTION_C_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "M1700",
    label: "Cognitive Functioning",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Alert/oriented, able to focus and shift attention, comprehends and recalls task directions independently" },
        { value: "1", label: "Requires prompting (cuing, repetition, reminders) only under stressful or unfamiliar conditions" },
        { value: "2", label: "Requires assistance and some direction in specific situations or consistently requires low stimulus environment" },
        { value: "3", label: "Requires considerable assistance in routine situations. Not alert and oriented or unable to shift attention" },
        { value: "4", label: "Totally dependent due to disturbances such as constant disorientation, coma, vegetative state" }
      ]
    },
    helpText: "Patient's current level of cognitive functioning."
  },
  {
    code: "C0100",
    label: "Should Brief Interview for Mental Status (C0200-C0500) be Conducted?",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No (patient is rarely/never understood) - Skip to C0700" },
        { value: "1", label: "Yes - Continue to C0200" }
      ]
    },
    helpText: "Attempt to conduct interview with all patients who can communicate."
  },
  {
    code: "C0200",
    label: "Repetition of Three Words",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "None" },
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
        { value: "3", label: "Three" }
      ]
    },
    skipLogic: [
      {
        id: "c0200-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0200"
      }
    ],
    helpText: "Number of words repeated after first attempt (sock, blue, bed)."
  },
  {
    code: "C0300A",
    label: "Temporal Orientation - Able to report correct year",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Missed by > 5 years or no answer" },
        { value: "1", label: "Missed by 2-5 years" },
        { value: "2", label: "Missed by 1 year" },
        { value: "3", label: "Correct" }
      ]
    },
    skipLogic: [
      {
        id: "c0300a-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0300A"
      }
    ]
  },
  {
    code: "C0300B",
    label: "Temporal Orientation - Able to report correct month",
    order: 5,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Missed by > 1 month or no answer" },
        { value: "1", label: "Missed by 6 days to 1 month" },
        { value: "2", label: "Accurate within 5 days" }
      ]
    },
    skipLogic: [
      {
        id: "c0300b-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0300B"
      }
    ]
  },
  {
    code: "C0300C",
    label: "Temporal Orientation - Able to report correct day of the week",
    order: 6,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Incorrect or no answer" },
        { value: "1", label: "Correct" }
      ]
    },
    skipLogic: [
      {
        id: "c0300c-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0300C"
      }
    ]
  },
  {
    code: "C0400A",
    label: "Recall - Able to recall 'sock'",
    order: 7,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No - could not recall" },
        { value: "1", label: "Yes, after cueing" },
        { value: "2", label: "Yes, no cue required" }
      ]
    },
    skipLogic: [
      {
        id: "c0400a-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0400A"
      }
    ]
  },
  {
    code: "C0400B",
    label: "Recall - Able to recall 'blue'",
    order: 8,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No - could not recall" },
        { value: "1", label: "Yes, after cueing" },
        { value: "2", label: "Yes, no cue required" }
      ]
    },
    skipLogic: [
      {
        id: "c0400b-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0400B"
      }
    ]
  },
  {
    code: "C0400C",
    label: "Recall - Able to recall 'bed'",
    order: 9,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No - could not recall" },
        { value: "1", label: "Yes, after cueing" },
        { value: "2", label: "Yes, no cue required" }
      ]
    },
    skipLogic: [
      {
        id: "c0400c-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0400C"
      }
    ]
  },
  {
    code: "C0500",
    label: "BIMS Summary Score",
    order: 10,
    fieldType: "CALCULATED_SCORE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      minScore: 0,
      maxScore: 15,
      scoring: {
        method: "SUM",
        sourceItems: ["C0200", "C0300A", "C0300B", "C0300C", "C0400A", "C0400B", "C0400C"]
      },
      thresholds: [
        { min: 13, max: 15, label: "Cognitively Intact", color: "green" },
        { min: 8, max: 12, label: "Moderately Impaired", color: "yellow" },
        { min: 0, max: 7, label: "Severely Impaired", color: "red" }
      ],
      autoCalculate: true
    },
    skipLogic: [
      {
        id: "c0500-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "0" }
        ],
        action: "hide",
        target: "C0500"
      }
    ],
    helpText: "Sum of C0200-C0400 scores. 13-15 = Cognitively Intact; 8-12 = Moderate Impairment; 0-7 = Severe Impairment"
  },
  {
    code: "C0700",
    label: "Short-term Memory OK",
    order: 11,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Memory OK" },
        { value: "1", label: "Memory problem" }
      ]
    },
    skipLogic: [
      {
        id: "c0700-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "1" }
        ],
        action: "hide",
        target: "C0700"
      }
    ],
    helpText: "Staff assessment - seems/appears to recall after 5 minutes."
  },
  {
    code: "C0800",
    label: "Long-term Memory OK",
    order: 12,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Memory OK" },
        { value: "1", label: "Memory problem" }
      ]
    },
    skipLogic: [
      {
        id: "c0800-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "1" }
        ],
        action: "hide",
        target: "C0800"
      }
    ],
    helpText: "Staff assessment - seems/appears to recall long past."
  },
  {
    code: "C0900",
    label: "Memory/Recall Ability",
    order: 13,
    fieldType: "MULTIPLE_CHOICE",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      options: [
        { value: "A", label: "Current season" },
        { value: "B", label: "Location of own room" },
        { value: "C", label: "Staff names and faces" },
        { value: "D", label: "That he/she is in a home health agency" },
        { value: "Z", label: "None of the above" }
      ],
      layout: "vertical",
      allowMultiple: true,
      exclusiveOptions: ["Z"]
    },
    skipLogic: [
      {
        id: "c0900-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "1" }
        ],
        action: "hide",
        target: "C0900"
      }
    ],
    helpText: "Check all that the patient was able to recall."
  },
  {
    code: "C1000",
    label: "Cognitive Skills for Daily Decision Making",
    order: 14,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Independent - decisions consistent/reasonable" },
        { value: "1", label: "Modified Independence - some difficulty in new situations only" },
        { value: "2", label: "Moderately Impaired - decisions poor; cues/supervision required" },
        { value: "3", label: "Severely Impaired - never/rarely makes decisions" }
      ]
    },
    skipLogic: [
      {
        id: "c1000-skip",
        conditions: [
          { itemCode: "C0100", operator: "equals", value: "1" }
        ],
        action: "hide",
        target: "C1000"
      }
    ],
    helpText: "Staff assessment of patient's cognitive skills for daily decision making."
  }
];
