import { TreatmentPlanType } from "./TreatmentPlanWrapper";

export const getTreatmentPlanFormSidebar = (formType: TreatmentPlanType) => {
  switch (formType) {
    case "ti":
      return [
        {
          id: 1,
          name: "Introduction",
        },
        {
          id: 2,
          name: "Goals",
        },
        {
          id: 3,
          name: "Schedule",
        },
        {
          id: 4,
          name: "Signature",
        },
      ];

    case "alp":
      return [
        {
          id: 1,
          name: "Basic Information",
        },
        {
          id: 2,
          name: "Skills",
        },
        {
          id: 3,
          name: "Additional Information",
        },
        {
          id: 4,
          name: "Schedule",
        },
        {
          id: 5,
          name: "Signature",
        },
      ];

    default:
      return [
        {
          id: 1,
          name: "Basic Information",
        },
        {
          id: 2,
          name: "Goals",
        },
        {
          id: 3,
          name: "Schedule",
        },
        {
          id: 4,
          name: "Signature",
        },
      ];
  }
};

export const goalStatusOptions = [
  { label: "Primary goal", value: "Primary goal" },
  { label: "Secondary goal", value: "Secondary goal" },
  { label: "Mastered goal", value: "Mastered goal" },
  { label: "Goal on hold", value: "Goal on hold" },
  { label: "Discontinued goal", value: "Discontinued goal" },
  { label: "Remove from PDF", value: "Remove from PDF" },
];

export const goalSettingOptions = [
  { label: "Home only", value: "Home only" },
  { label: "Community only", value: "Community only" },
  { label: "Home & Community", value: "Home & Community" },
  { label: "TI Center", value: "TI Center" },
  { label: "TI Center & Community", value: "TI Center & Community" },
];

export const goalNumberOfTrialsOptions = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

export const goalFrequencyOptions = [
  { label: "1 time per day", value: "1 time per day" },
  { label: "1 time per week", value: "1 time per week" },
  { label: "2 times per week", value: "2 times per week" },
  { label: "3 times per week ", value: "3 times per week " },
  { label: "4 times per week", value: "4 times per week" },
  { label: "5 times per week", value: "5 times per week" },
  {
    label: "3 consecutive opportunities ",
    value: "3 consecutive opportunities ",
  },
  {
    label: "3 consecutive days/sessions",
    value: "3 consecutive days/sessions",
  },
  {
    label: "5 consecutive days/sessions/opportunities ",
    value: "5 consecutive days/sessions/opportunities ",
  },
  { label: "30-day period", value: "30-day period" },
  { label: "90-day period", value: "90-day period" },
  { label: "Bi-monthly", value: "Bi-monthly" },
];

export const goalCurrentSkillLevelOptions = [
  { label: "Hand over Hand", value: "Hand over Hand" },
  { label: "Physical Prompts", value: "Physical Prompts" },
  { label: "Model Prompts", value: "Model Prompts" },
  { label: "Gesture Prompts", value: "Gesture Prompts" },
  { label: "Visual Cue", value: "Visual Cue" },
  { label: "Verbal Prompts", value: "Verbal Prompts" },
  {
    label: "Intermittent Verbal Prompts",
    value: "Intermittent Verbal Prompts",
  },
  { label: "Independence", value: "Independence" },
  { label: "Refused", value: "Refused" },
  { label: "Unable", value: "Unable" },
];

export const goalTargetPerformanceOptions = [
  { label: "Hand over Hand", value: "Hand over Hand" },
  { label: "Physical Prompts", value: "Physical Prompts" },
  { label: "Model Prompts", value: "Model Prompts" },
  { label: "Gesture Prompts", value: "Gesture Prompts" },
  { label: "Visual Cue", value: "Visual Cue" },
  { label: "Verbal Prompts", value: "Verbal Prompts" },
  {
    label: "Intermittent Verbal Prompts",
    value: "Intermittent Verbal Prompts",
  },
  { label: "Independence", value: "Independence" },
  { label: "Refused", value: "Refused" },
  { label: "Unable", value: "Unable" },
];

export const goalBaselineOptions = [
  "Hand over Hand",
  "Physical Prompts",
  "Model Prompts",
  "Gesture Prompts",
  "Visual Cue",
  "Verbal Prompts",
  "Intermittent Verbal Prompts",
  "Independence",
  "Refused",
  "Unable",
  "Tear off 3-5 squares of paper",
  "Fold paper to create thicker surface",
  "Turn on water",
  "Wet hands and apply soap",
  "Scrub for 20 seconds",
  "Rinse and dry hands with towel",
];

export const goalConsequencesOption = [
  {
    label:
      "If [client] resists, give [client] a 5-minute break before proceeding to the planned activity. When [client] complies, [client] will be rewarded with a verbal praise",
    value: "break_and_praise",
  },
  {
    label:
      "If [client] resists, the technician will follow the Behavior Management Protocol. Technician will record on ABC Data collection sheet on target behaviors",
    value: "behavior_protocol",
  },
  {
    label: "Other",
    value: "other",
  },
];
