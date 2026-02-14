import { AssessmentSectionType, AssessmentResponseType, ScoringMethod, QAStatus } from "@prisma/client";

// ============================================
// Response Configuration Types
// ============================================

export interface ScaleResponseConfig {
  minValue: number;
  maxValue: number;
  labels?: Record<number, string>; // e.g., { 0: "Independent", 3: "Dependent" }
}

export interface ChoiceOption {
  value: string;
  label: string;
  score?: number; // Score assigned when this option is selected
}

export interface ChoiceResponseConfig {
  options: ChoiceOption[];
}

export interface NumberResponseConfig {
  minValue?: number;
  maxValue?: number;
  unit?: string; // e.g., "lbs", "mmHg"
}

export interface TextResponseConfig {
  maxLength?: number;
  placeholder?: string;
}

export type ResponseConfig =
  | ScaleResponseConfig
  | ChoiceResponseConfig
  | NumberResponseConfig
  | TextResponseConfig
  | null;

// ============================================
// Scoring Configuration Types
// ============================================

export interface ScoringThresholds {
  low?: number;
  medium?: number;
  high?: number;
  skilled?: number;
}

export interface ScoringConfig {
  method: ScoringMethod;
  maxScore?: number;
  passingScore?: number;
  thresholds?: ScoringThresholds;
}

// ============================================
// Assessment Item Types
// ============================================

export interface AssessmentItemData {
  id: string;
  code: string;
  questionText: string;
  description?: string;
  responseType: AssessmentResponseType;
  required: boolean;
  order: number;
  responseOptions?: ChoiceOption[];
  minValue?: number;
  maxValue?: number;
  scoreMapping?: Record<string, number>; // Map response values to scores
  showIf?: ConditionalLogic;
}

export interface ConditionalLogic {
  itemCode: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than";
  value: string | number | boolean;
}

// ============================================
// Assessment Section Types
// ============================================

export interface AssessmentSectionData {
  id: string;
  sectionType: AssessmentSectionType;
  title: string;
  description?: string;
  instructions?: string;
  order: number;
  items: AssessmentItemData[];
  scoringConfig?: SectionScoringConfig;
}

export interface SectionScoringConfig {
  method?: ScoringMethod;
  maxScore?: number;
  weight?: number;
}

// ============================================
// Assessment Template Types
// ============================================

export type AssessmentTemplateStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface AssessmentTemplateData {
  id?: string;
  name: string;
  description?: string;
  status: AssessmentTemplateStatus;
  version: number;
  isRequired: boolean;
  scoringConfig: ScoringConfig;
  sections: AssessmentSectionData[];
}

// ============================================
// Assessment Template Schema Snapshot
// ============================================

export interface AssessmentTemplateSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  scoringConfig: ScoringConfig;
  sections: {
    id: string;
    sectionType: AssessmentSectionType;
    title: string;
    description?: string;
    instructions?: string;
    order: number;
    items: {
      id: string;
      code: string;
      questionText: string;
      description?: string;
      responseType: AssessmentResponseType;
      required: boolean;
      order: number;
      responseOptions?: ChoiceOption[];
      minValue?: number;
      maxValue?: number;
      scoreMapping?: Record<string, number>;
    }[];
  }[];
}

// ============================================
// Assessment Response Types
// ============================================

export type ResponseValue =
  | string // TEXT
  | number // NUMBER, SCALE
  | boolean // YES_NO
  | string[] // MULTIPLE_CHOICE
  | Date // DATE
  | null;

export interface AssessmentResponseData {
  itemId: string;
  value: ResponseValue;
  score?: number;
  notes?: string;
}

// Assessment data: { [itemId]: ResponseValue }
export type AssessmentData = Record<string, ResponseValue>;

// ============================================
// Assessment Instance Types
// ============================================

export type AssessmentStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type AssessmentType = "INITIAL" | "REASSESSMENT" | "DISCHARGE";

export interface AssessmentInstanceData {
  id: string;
  status: AssessmentStatus;
  assessmentType: AssessmentType;
  totalScore?: number;
  sectionScores?: Record<string, number>;
  careLevel?: "LOW" | "MEDIUM" | "HIGH" | "SKILLED";
  startedAt: string;
  completedAt?: string;
  notes?: string;
  qaStatus?: QAStatus;
  qaComment?: string;
}

// ============================================
// API Response Types
// ============================================

export interface AssessmentTemplateListItem {
  id: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  isRequired: boolean;
  sectionsCount: number;
  itemsCount: number;
  scoringMethod: ScoringMethod;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTemplateDetail extends AssessmentTemplateData {
  id: string;
  createdAt: string;
  updatedAt: string;
  stateConfigId?: string;
  companyId?: string;
}

export interface AssessmentListItem {
  id: string;
  templateName: string;
  templateVersion: number;
  status: AssessmentStatus;
  assessmentType: AssessmentType;
  totalScore?: number;
  careLevel?: string;
  startedAt: string;
  completedAt?: string;
  qaStatus?: QAStatus;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AssessmentDetail extends AssessmentInstanceData {
  template: {
    id: string;
    name: string;
    version: number;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  responses: AssessmentResponseData[];
  qaReviewedAt?: string;
  qaReviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ============================================
// Response Type Metadata
// ============================================

export const RESPONSE_TYPE_LABELS: Record<AssessmentResponseType, string> = {
  SCALE: "Scale",
  YES_NO: "Yes/No",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TEXT: "Free Text",
  DATE: "Date",
  NUMBER: "Number",
};

export const RESPONSE_TYPE_DESCRIPTIONS: Record<AssessmentResponseType, string> = {
  SCALE: "Numeric scale with defined min/max values (e.g., 0-3 for ADL scoring)",
  YES_NO: "Simple yes or no toggle",
  SINGLE_CHOICE: "Select one option from a list",
  MULTIPLE_CHOICE: "Select multiple options from a list",
  TEXT: "Free text response",
  DATE: "Date picker",
  NUMBER: "Numeric input",
};

// ============================================
// Section Type Metadata
// ============================================

export const SECTION_TYPE_LABELS: Record<AssessmentSectionType, string> = {
  KATZ_ADL: "Katz ADL (Activities of Daily Living)",
  LAWTON_IADL: "Lawton IADL (Instrumental ADLs)",
  PHQ9: "PHQ-9 Depression Screening",
  MINI_COG: "Mini-Cog Dementia Screening",
  FALL_RISK: "Fall Risk Assessment",
  SKIN_INTEGRITY: "Skin Integrity Assessment",
  NUTRITION: "Nutritional Assessment",
  MEDICATION: "Medication Review",
  PAIN: "Pain Assessment",
  CUSTOM: "Custom Section",
  PT_HISTORY: "PT - Medical History",
  PT_FUNCTIONAL_STATUS: "PT - Functional Status",
  PT_MOBILITY: "PT - Mobility Assessment",
  PT_BALANCE: "PT - Balance Assessment",
  PT_TREATMENT_PLAN: "PT - Treatment Plan",
  OT_HISTORY: "OT - Medical History",
  OT_ADL_STATUS: "OT - ADL Status",
  OT_IADL_STATUS: "OT - IADL Status",
  OT_HOME_SAFETY: "OT - Home Safety Assessment",
  OT_TREATMENT_PLAN: "OT - Treatment Plan",
  ST_HISTORY: "ST - Medical History",
  ST_COGNITION: "ST - Cognition Assessment",
  ST_SPEECH: "ST - Speech Assessment",
  ST_SWALLOWING: "ST - Swallowing Assessment",
  ST_LANGUAGE: "ST - Language Assessment",
  ST_TREATMENT_PLAN: "ST - Treatment Plan",
  NURSING_VITALS: "Nursing - Vital Signs",
  NURSING_CARDIOPULMONARY: "Nursing - Cardiopulmonary",
  NURSING_NEUROLOGICAL: "Nursing - Neurological",
  NURSING_SKIN: "Nursing - Skin Assessment",
  NURSING_ELIMINATION: "Nursing - Elimination",
  NURSING_TREATMENT_PLAN: "Nursing - Treatment Plan",
};

export const SECTION_TYPE_CATEGORIES: Record<string, AssessmentSectionType[]> = {
  "Core Assessments": [
    "KATZ_ADL",
    "LAWTON_IADL",
    "PHQ9",
    "MINI_COG",
    "FALL_RISK",
    "SKIN_INTEGRITY",
    "NUTRITION",
    "MEDICATION",
    "PAIN",
  ],
  "Physical Therapy": [
    "PT_HISTORY",
    "PT_FUNCTIONAL_STATUS",
    "PT_MOBILITY",
    "PT_BALANCE",
    "PT_TREATMENT_PLAN",
  ],
  "Occupational Therapy": [
    "OT_HISTORY",
    "OT_ADL_STATUS",
    "OT_IADL_STATUS",
    "OT_HOME_SAFETY",
    "OT_TREATMENT_PLAN",
  ],
  "Speech Therapy": [
    "ST_HISTORY",
    "ST_COGNITION",
    "ST_SPEECH",
    "ST_SWALLOWING",
    "ST_LANGUAGE",
    "ST_TREATMENT_PLAN",
  ],
  Nursing: [
    "NURSING_VITALS",
    "NURSING_CARDIOPULMONARY",
    "NURSING_NEUROLOGICAL",
    "NURSING_SKIN",
    "NURSING_ELIMINATION",
    "NURSING_TREATMENT_PLAN",
  ],
  Custom: ["CUSTOM"],
};

// ============================================
// Scoring Method Metadata
// ============================================

export const SCORING_METHOD_LABELS: Record<ScoringMethod, string> = {
  SUM: "Sum",
  AVERAGE: "Average",
  WEIGHTED_SUM: "Weighted Sum",
  THRESHOLD: "Pass/Fail Threshold",
  CUSTOM: "Custom Scoring",
};

export const SCORING_METHOD_DESCRIPTIONS: Record<ScoringMethod, string> = {
  SUM: "Add up all item scores to get total score",
  AVERAGE: "Calculate the average of all item scores",
  WEIGHTED_SUM: "Sum of scores multiplied by section weights",
  THRESHOLD: "Pass or fail based on meeting a threshold score",
  CUSTOM: "Custom scoring logic defined per assessment",
};

// ============================================
// Helper Functions
// ============================================

export function responseTypeRequiresConfig(type: AssessmentResponseType): boolean {
  return ["SCALE", "SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(type);
}

export function getDefaultResponseConfig(type: AssessmentResponseType): ResponseConfig {
  switch (type) {
    case "SCALE":
      return { minValue: 0, maxValue: 3 };
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return {
        options: [
          { value: "option1", label: "Option 1", score: 0 },
          { value: "option2", label: "Option 2", score: 1 },
        ],
      };
    case "NUMBER":
      return { minValue: 0, maxValue: 100 };
    case "TEXT":
      return { maxLength: 2000 };
    default:
      return null;
  }
}

export function generateItemCode(sectionType: AssessmentSectionType, index: number): string {
  const prefix = sectionType.replace(/_/g, "");
  return `${prefix}_Q${index + 1}`;
}
