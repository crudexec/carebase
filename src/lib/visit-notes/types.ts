import { FormFieldType, FormTemplateStatus } from "@prisma/client";
import type {
  CodeEntryFieldConfig,
  MatrixGridFieldConfig,
  DatePartsFieldConfig,
  HierarchicalCheckboxFieldConfig,
  CalculatedScoreFieldConfig,
  NumericCounterFieldConfig,
  StructuredIdFieldConfig,
  MultiDiagnosisFieldConfig,
} from "@/lib/oasis/types";

// ============================================
// Field Configuration Types
// ============================================

export interface TextFieldConfig {
  maxLength?: number;
  placeholder?: string;
}

export interface NumberFieldConfig {
  min?: number; // Min threshold - alerts if value is below this
  max?: number; // Max threshold - alerts if value is above this
  step?: number;
  placeholder?: string;
  thresholdEnabled?: boolean; // Enable threshold alerts (defaults to true if min or max is set)
  customMessage?: string; // Custom alert message for threshold breaches
}

export interface ChoiceFieldConfig {
  options: string[];
}

export interface RatingFieldConfig {
  min: number;
  max: number;
  labels?: Record<number, string>;
}

export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | ChoiceFieldConfig
  | RatingFieldConfig
  // OASIS field configs
  | CodeEntryFieldConfig
  | MatrixGridFieldConfig
  | DatePartsFieldConfig
  | HierarchicalCheckboxFieldConfig
  | CalculatedScoreFieldConfig
  | NumericCounterFieldConfig
  | StructuredIdFieldConfig
  | MultiDiagnosisFieldConfig
  | null;

// ============================================
// Form Builder Types (for UI state)
// ============================================

export interface FormFieldData {
  id: string;
  label: string;
  description?: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: FieldConfig;
}

export interface FormSectionData {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormFieldData[];
}

export interface FormTemplateData {
  id?: string;
  name: string;
  description?: string;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  sections: FormSectionData[];
}

// ============================================
// Form Schema Snapshot (stored with submissions)
// ============================================

export interface FormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections: {
    id: string;
    title: string;
    description?: string;
    order: number;
    fields: {
      id: string;
      label: string;
      description?: string;
      type: FormFieldType;
      required: boolean;
      order: number;
      config: FieldConfig;
    }[];
  }[];
}

// ============================================
// Form Submission Types
// ============================================

// ICD-10 diagnosis value
export interface ICD10DiagnosisValue {
  code: string;
  description: string;
  type?: "PRIMARY" | "SECONDARY" | "ADMITTING" | "PRINCIPAL";
}

// Value types for different field types
export type FieldValue =
  | string // TEXT_SHORT, TEXT_LONG, DATE, TIME, DATETIME
  | number // NUMBER, RATING_SCALE
  | boolean // YES_NO
  | string[] // MULTIPLE_CHOICE
  | FileValue // SIGNATURE, PHOTO
  | BodyMapMarker[] // BODY_MAP
  | ICD10DiagnosisValue[] // ICD10_DIAGNOSIS
  | null;

export interface FileValue {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Body map marker for wound care and pain documentation
export interface BodyMapMarker {
  id: string;
  regionId: string;
  regionLabel: string;
  type: "pain" | "wound" | "bruise" | "rash" | "swelling" | "other";
  severity: "mild" | "moderate" | "severe";
  woundType?: string;
  size?: string;
  notes?: string;
  photo?: FileValue;
}

// Submission data structure: { [fieldId]: FieldValue }
export type VisitNoteData = Record<string, FieldValue>;

// ============================================
// API Response Types
// ============================================

export interface FormTemplateListItem {
  id: string;
  name: string;
  description?: string;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  sectionsCount: number;
  fieldsCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export interface FormTemplateDetail extends FormTemplateData {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface VisitNoteListItem {
  id: string;
  templateName: string;
  templateVersion: number;
  visitDate: string;
  submittedAt: string;
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  } | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface VisitNoteDetail {
  id: string;
  formSchemaSnapshot: FormSchemaSnapshot;
  data: VisitNoteData;
  visitDate: string;
  submittedAt: string;
  updatedAt: string;
  templateId: string;
  templateVersion: number;
  qaStatus: string;
  qaComment?: string | null;
  qaReviewedAt?: string | null;
  qaReviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  } | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  submittedOnBehalf: boolean;
  files: {
    id: string;
    fieldId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
}

// ============================================
// Threshold Breach Types
// ============================================

export type ThresholdBreachType = "BELOW_MIN" | "ABOVE_MAX";

export interface ThresholdBreachData {
  id: string;
  fieldId: string;
  fieldLabel: string;
  value: number;
  minThreshold?: number;
  maxThreshold?: number;
  breachType: ThresholdBreachType;
  customMessage?: string;
  createdAt: string;
}

export interface VisitNoteDetailWithBreaches extends VisitNoteDetail {
  thresholdBreaches: ThresholdBreachData[];
}

// ============================================
// Field Type Metadata
// ============================================

export const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  TEXT_SHORT: "Short Text",
  TEXT_LONG: "Long Text",
  NUMBER: "Number",
  YES_NO: "Yes/No",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  DATE: "Date",
  TIME: "Time",
  DATETIME: "Date & Time",
  SIGNATURE: "Signature",
  PHOTO: "Photo",
  RATING_SCALE: "Rating Scale",
  BODY_MAP: "Body Map",
  ICD10_DIAGNOSIS: "ICD-10 Diagnosis",
  CASCADING_SELECT: "Cascading Select",
  // OASIS-specific field types
  CODE_ENTRY: "Code Entry",
  MATRIX_GRID: "Matrix Grid",
  DATE_PARTS: "Date Parts",
  HIERARCHICAL_CHECKBOX: "Hierarchical Checkbox",
  CALCULATED_SCORE: "Calculated Score",
  NUMERIC_COUNTER: "Numeric Counter",
  STRUCTURED_ID: "Structured ID",
  MULTI_DIAGNOSIS: "Multi-Diagnosis",
};

export const FIELD_TYPE_DESCRIPTIONS: Record<FormFieldType, string> = {
  TEXT_SHORT: "Single line text input",
  TEXT_LONG: "Multi-line text area",
  NUMBER: "Numeric input with optional threshold alerts",
  YES_NO: "Simple yes or no toggle",
  SINGLE_CHOICE: "Select one option from a list",
  MULTIPLE_CHOICE: "Select multiple options from a list",
  DATE: "Date picker",
  TIME: "Time picker",
  DATETIME: "Combined date and time picker",
  SIGNATURE: "Digital signature capture",
  PHOTO: "Photo upload",
  RATING_SCALE: "Star or number rating",
  BODY_MAP: "Interactive body diagram for documenting pain and wounds",
  ICD10_DIAGNOSIS: "Search and select ICD-10 diagnosis codes",
  CASCADING_SELECT: "Linked dropdowns for hierarchical selections (Goal Area → Target Skill → Objective → Steps)",
  // OASIS-specific field types
  CODE_ENTRY: "Single or multi-digit code selection (e.g., 0-6 scale)",
  MATRIX_GRID: "Multi-row/column grid for complex assessments",
  DATE_PARTS: "Separate month, day, year inputs with NA/UK options",
  HIERARCHICAL_CHECKBOX: "Nested checkbox options with parent-child relationships",
  CALCULATED_SCORE: "Auto-calculated score from source items (e.g., BIMS, PHQ-9)",
  NUMERIC_COUNTER: "Stepper input for counting items (e.g., pressure ulcers)",
  STRUCTURED_ID: "Formatted ID input (e.g., NPI, Medicare number)",
  MULTI_DIAGNOSIS: "Multiple ICD-10 diagnoses with primary/secondary designation",
};

// Helper to check if field type requires config
export function fieldTypeRequiresConfig(type: FormFieldType): boolean {
  return [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "RATING_SCALE",
    // OASIS field types that require config
    "CODE_ENTRY",
    "MATRIX_GRID",
    "DATE_PARTS",
    "HIERARCHICAL_CHECKBOX",
    "CALCULATED_SCORE",
    "NUMERIC_COUNTER",
    "STRUCTURED_ID",
    "MULTI_DIAGNOSIS",
  ].includes(type);
}

// Helper to get default config for field type
export function getDefaultFieldConfig(type: FormFieldType): FieldConfig {
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return { options: ["Option 1", "Option 2"] };
    case "RATING_SCALE":
      return { min: 1, max: 5 };
    case "TEXT_SHORT":
      return { maxLength: 100 };
    case "TEXT_LONG":
      return { maxLength: 2000 };
    case "NUMBER":
      return { min: 0, max: 100, thresholdEnabled: true };
    // OASIS field type defaults
    case "CODE_ENTRY":
      return {
        codeLength: 1,
        inputType: "numeric",
        showAsDropdown: true,
        options: [],
      };
    case "MATRIX_GRID":
      return {
        columns: [],
        rows: [],
        allowNA: false,
      };
    case "DATE_PARTS":
      return {
        allowNA: false,
        allowUnknown: false,
      };
    case "HIERARCHICAL_CHECKBOX":
      return {
        options: [],
        allowMultiple: false,
        maxSelections: 1,
      };
    case "CALCULATED_SCORE":
      return {
        sourceItems: [],
        autoCalculate: true,
        displayFormat: "score_with_label",
      };
    case "NUMERIC_COUNTER":
      return {
        min: 0,
        max: 99,
        step: 1,
        showButtons: true,
      };
    case "STRUCTURED_ID":
      return {
        format: "CUSTOM",
        segments: [],
        separator: "",
      };
    case "MULTI_DIAGNOSIS":
      return {
        maxDiagnoses: 6,
        requirePrimary: true,
        allowSequencing: true,
      };
    default:
      return null;
  }
}
