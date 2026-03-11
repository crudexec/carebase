/**
 * OASIS-E2 Section GG: Functional Abilities and Goals
 */

import type { OasisItemData } from "../../types";

const SELF_CARE_SCALE = [
  { value: "06", label: "Independent - Patient completes activity by themself with no assistance" },
  { value: "05", label: "Setup or clean-up assistance - Helper sets up or cleans up; patient completes activity" },
  { value: "04", label: "Supervision or touching assistance - Helper provides verbal cues and/or touching/steadying" },
  { value: "03", label: "Partial/moderate assistance - Helper does less than half the effort" },
  { value: "02", label: "Substantial/maximal assistance - Helper does more than half the effort" },
  { value: "01", label: "Dependent - Helper does all of the effort" },
  { value: "07", label: "Patient refused" },
  { value: "09", label: "Not applicable" },
  { value: "10", label: "Not attempted due to environmental limitations" },
  { value: "88", label: "Not attempted due to medical condition or safety concerns" }
];

const MOBILITY_SCALE = [
  { value: "06", label: "Independent - Patient completes activity by themself with no assistance" },
  { value: "05", label: "Setup or clean-up assistance - Helper sets up or cleans up; patient completes activity" },
  { value: "04", label: "Supervision or touching assistance - Helper provides verbal cues and/or touching/steadying" },
  { value: "03", label: "Partial/moderate assistance - Helper does less than half the effort" },
  { value: "02", label: "Substantial/maximal assistance - Helper does more than half the effort" },
  { value: "01", label: "Dependent - Helper does all of the effort" },
  { value: "07", label: "Patient refused" },
  { value: "09", label: "Not applicable" },
  { value: "10", label: "Not attempted due to environmental limitations" },
  { value: "88", label: "Not attempted due to medical condition or safety concerns" }
];

export const SECTION_GG_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  // Prior Functioning
  {
    code: "GG0100A",
    label: "Prior Functioning: Self-Care - Indicate the patient's usual ability prior to the current illness",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "3", label: "Independent - Patient completed activities by themself" },
        { value: "2", label: "Needed Some Help - Patient needed partial assistance" },
        { value: "1", label: "Dependent - A helper completed activities for patient" },
        { value: "8", label: "Unknown" },
        { value: "9", label: "Not Applicable" }
      ]
    },
    helpText: "Self-care includes dressing, bathing, grooming, and toileting."
  },
  {
    code: "GG0100B",
    label: "Prior Functioning: Indoor Mobility",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "3", label: "Independent - Patient completed activities by themself" },
        { value: "2", label: "Needed Some Help - Patient needed partial assistance" },
        { value: "1", label: "Dependent - A helper completed activities for patient" },
        { value: "8", label: "Unknown" },
        { value: "9", label: "Not Applicable" }
      ]
    },
    helpText: "Indoor mobility includes walking, wheelchair use, or other mobility within the home."
  },
  {
    code: "GG0100C",
    label: "Prior Functioning: Stairs",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "3", label: "Independent - Patient completed activities by themself" },
        { value: "2", label: "Needed Some Help - Patient needed partial assistance" },
        { value: "1", label: "Dependent - A helper completed activities for patient" },
        { value: "8", label: "Unknown" },
        { value: "9", label: "Not Applicable - No stairs in home" }
      ]
    }
  },
  {
    code: "GG0100D",
    label: "Prior Functioning: Functional Cognition",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 1,
      options: [
        { value: "3", label: "Independent - Patient completed activities by themself" },
        { value: "2", label: "Needed Some Help - Patient needed partial assistance" },
        { value: "1", label: "Dependent - A helper completed activities for patient" },
        { value: "8", label: "Unknown" },
        { value: "9", label: "Not Applicable" }
      ]
    },
    helpText: "Functional cognition includes planning and multi-tasking required for activities."
  },

  // Self-Care Activities
  {
    code: "GG0130A1",
    label: "Eating - SOC/ROC Performance",
    order: 5,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to use suitable utensils to bring food and/or liquid to the mouth and swallow food and/or liquid once the meal is placed before the patient.",
    helpText: "Code the patient's performance at SOC/ROC."
  },
  {
    code: "GG0130A2",
    label: "Eating - Discharge Goal",
    order: 6,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130A3",
    label: "Eating - Discharge Performance",
    order: 7,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130B1",
    label: "Oral Hygiene - SOC/ROC Performance",
    order: 8,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to use suitable items to clean teeth, including brushing, flossing, and rinsing."
  },
  {
    code: "GG0130B2",
    label: "Oral Hygiene - Discharge Goal",
    order: 9,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130B3",
    label: "Oral Hygiene - Discharge Performance",
    order: 10,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130C1",
    label: "Toileting Hygiene - SOC/ROC Performance",
    order: 11,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to maintain perineal hygiene, adjust clothes before and after voiding or having a bowel movement."
  },
  {
    code: "GG0130C2",
    label: "Toileting Hygiene - Discharge Goal",
    order: 12,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130C3",
    label: "Toileting Hygiene - Discharge Performance",
    order: 13,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130E1",
    label: "Shower/Bathe Self - SOC/ROC Performance",
    order: 14,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to bathe self, including washing, rinsing, and drying self (excludes washing of back and hair)."
  },
  {
    code: "GG0130E2",
    label: "Shower/Bathe Self - Discharge Goal",
    order: 15,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130E3",
    label: "Shower/Bathe Self - Discharge Performance",
    order: 16,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130F1",
    label: "Upper Body Dressing - SOC/ROC Performance",
    order: 17,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to dress and undress above the waist; including fasteners."
  },
  {
    code: "GG0130F2",
    label: "Upper Body Dressing - Discharge Goal",
    order: 18,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130F3",
    label: "Upper Body Dressing - Discharge Performance",
    order: 19,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130G1",
    label: "Lower Body Dressing - SOC/ROC Performance",
    order: 20,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to dress and undress below the waist; including fasteners and footwear."
  },
  {
    code: "GG0130G2",
    label: "Lower Body Dressing - Discharge Goal",
    order: 21,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130G3",
    label: "Lower Body Dressing - Discharge Performance",
    order: 22,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },
  {
    code: "GG0130H1",
    label: "Putting On/Taking Off Footwear - SOC/ROC Performance",
    order: 23,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    },
    description: "The ability to put on and take off socks and shoes or other footwear."
  },
  {
    code: "GG0130H2",
    label: "Putting On/Taking Off Footwear - Discharge Goal",
    order: 24,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0130H3",
    label: "Putting On/Taking Off Footwear - Discharge Performance",
    order: 25,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: SELF_CARE_SCALE
    }
  },

  // Mobility Activities
  {
    code: "GG0170A1",
    label: "Roll Left and Right - SOC/ROC Performance",
    order: 26,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to roll from lying on back to left and right side, and return to lying on back."
  },
  {
    code: "GG0170A2",
    label: "Roll Left and Right - Discharge Goal",
    order: 27,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170A3",
    label: "Roll Left and Right - Discharge Performance",
    order: 28,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170B1",
    label: "Sit to Lying - SOC/ROC Performance",
    order: 29,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to move from sitting on side of bed to lying flat on the bed."
  },
  {
    code: "GG0170B2",
    label: "Sit to Lying - Discharge Goal",
    order: 30,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170B3",
    label: "Sit to Lying - Discharge Performance",
    order: 31,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170C1",
    label: "Lying to Sitting on Side of Bed - SOC/ROC Performance",
    order: 32,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to move from lying on back to sitting on the side of the bed with no back support."
  },
  {
    code: "GG0170C2",
    label: "Lying to Sitting on Side of Bed - Discharge Goal",
    order: 33,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170C3",
    label: "Lying to Sitting on Side of Bed - Discharge Performance",
    order: 34,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170D1",
    label: "Sit to Stand - SOC/ROC Performance",
    order: 35,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to come to a standing position from sitting in a chair or on the side of the bed."
  },
  {
    code: "GG0170D2",
    label: "Sit to Stand - Discharge Goal",
    order: 36,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170D3",
    label: "Sit to Stand - Discharge Performance",
    order: 37,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170E1",
    label: "Chair/Bed-to-Chair Transfer - SOC/ROC Performance",
    order: 38,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to transfer to and from a bed to a chair (or wheelchair)."
  },
  {
    code: "GG0170E2",
    label: "Chair/Bed-to-Chair Transfer - Discharge Goal",
    order: 39,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170E3",
    label: "Chair/Bed-to-Chair Transfer - Discharge Performance",
    order: 40,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170F1",
    label: "Toilet Transfer - SOC/ROC Performance",
    order: 41,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to get on and off a toilet or commode."
  },
  {
    code: "GG0170F2",
    label: "Toilet Transfer - Discharge Goal",
    order: 42,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170F3",
    label: "Toilet Transfer - Discharge Performance",
    order: 43,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170I1",
    label: "Walk 10 Feet - SOC/ROC Performance",
    order: 44,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "Once standing, the ability to walk at least 10 feet in a room, corridor, or similar space."
  },
  {
    code: "GG0170I2",
    label: "Walk 10 Feet - Discharge Goal",
    order: 45,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170I3",
    label: "Walk 10 Feet - Discharge Performance",
    order: 46,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170J1",
    label: "Walk 50 Feet with Two Turns - SOC/ROC Performance",
    order: 47,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "Once standing, the ability to walk at least 50 feet and make two turns."
  },
  {
    code: "GG0170J2",
    label: "Walk 50 Feet with Two Turns - Discharge Goal",
    order: 48,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170J3",
    label: "Walk 50 Feet with Two Turns - Discharge Performance",
    order: 49,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170K1",
    label: "Walk 150 Feet - SOC/ROC Performance",
    order: 50,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "Once standing, the ability to walk at least 150 feet in a corridor or similar space."
  },
  {
    code: "GG0170K2",
    label: "Walk 150 Feet - Discharge Goal",
    order: 51,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170K3",
    label: "Walk 150 Feet - Discharge Performance",
    order: 52,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170L1",
    label: "Walking 10 Feet on Uneven Surfaces - SOC/ROC Performance",
    order: 53,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to walk at least 10 feet on uneven or sloping surfaces (grass, gravel)."
  },
  {
    code: "GG0170L2",
    label: "Walking 10 Feet on Uneven Surfaces - Discharge Goal",
    order: 54,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170L3",
    label: "Walking 10 Feet on Uneven Surfaces - Discharge Performance",
    order: 55,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170M1",
    label: "1 Step (Curb) - SOC/ROC Performance",
    order: 56,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to go up and down a curb and/or up and down one step."
  },
  {
    code: "GG0170M2",
    label: "1 Step (Curb) - Discharge Goal",
    order: 57,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170M3",
    label: "1 Step (Curb) - Discharge Performance",
    order: 58,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170N1",
    label: "4 Steps - SOC/ROC Performance",
    order: 59,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to go up and down four steps with or without a rail."
  },
  {
    code: "GG0170N2",
    label: "4 Steps - Discharge Goal",
    order: 60,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170N3",
    label: "4 Steps - Discharge Performance",
    order: 61,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170O1",
    label: "12 Steps - SOC/ROC Performance",
    order: 62,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to go up and down 12 steps with or without a rail."
  },
  {
    code: "GG0170O2",
    label: "12 Steps - Discharge Goal",
    order: 63,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170O3",
    label: "12 Steps - Discharge Performance",
    order: 64,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170P1",
    label: "Picking Up Object - SOC/ROC Performance",
    order: 65,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to bend/stoop to pick up a small object from the floor, such as a spoon."
  },
  {
    code: "GG0170P2",
    label: "Picking Up Object - Discharge Goal",
    order: 66,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170P3",
    label: "Picking Up Object - Discharge Performance",
    order: 67,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170R1",
    label: "Wheel 50 Feet with Two Turns - SOC/ROC Performance",
    order: 68,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to wheel at least 50 feet and make two turns in a wheelchair."
  },
  {
    code: "GG0170R2",
    label: "Wheel 50 Feet with Two Turns - Discharge Goal",
    order: 69,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170R3",
    label: "Wheel 50 Feet with Two Turns - Discharge Performance",
    order: 70,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  },
  {
    code: "GG0170S1",
    label: "Wheel 150 Feet - SOC/ROC Performance",
    order: 71,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    },
    description: "The ability to wheel at least 150 feet in a corridor or similar space."
  },
  {
    code: "GG0170S2",
    label: "Wheel 150 Feet - Discharge Goal",
    order: 72,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["SOC", "ROC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE.filter(o => !["07", "10", "88"].includes(o.value))
    }
  },
  {
    code: "GG0170S3",
    label: "Wheel 150 Feet - Discharge Performance",
    order: 73,
    fieldType: "CODE_ENTRY",
    required: false,
    visibleAt: ["DC"],
    config: {
      digits: 2,
      options: MOBILITY_SCALE
    }
  }
];
