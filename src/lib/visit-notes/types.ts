import { FormFieldType, FormTemplateStatus } from "@prisma/client";

// ============================================
// Field Configuration Types
// ============================================

export interface TextFieldConfig {
  maxLength?: number;
  placeholder?: string;
}

export interface NumberFieldConfig {
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
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

// Value types for different field types
export type FieldValue =
  | string // TEXT_SHORT, TEXT_LONG, DATE, TIME, DATETIME
  | number // NUMBER, RATING_SCALE
  | boolean // YES_NO
  | string[] // MULTIPLE_CHOICE
  | FileValue // SIGNATURE, PHOTO
  | null;

export interface FileValue {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
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
  submittedAt: string;
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  };
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
  submittedAt: string;
  updatedAt: string;
  templateId: string;
  templateVersion: number;
  qaStatus: string;
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
  };
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
};

export const FIELD_TYPE_DESCRIPTIONS: Record<FormFieldType, string> = {
  TEXT_SHORT: "Single line text input",
  TEXT_LONG: "Multi-line text area",
  NUMBER: "Numeric input with optional min/max",
  YES_NO: "Simple yes or no toggle",
  SINGLE_CHOICE: "Select one option from a list",
  MULTIPLE_CHOICE: "Select multiple options from a list",
  DATE: "Date picker",
  TIME: "Time picker",
  DATETIME: "Combined date and time picker",
  SIGNATURE: "Digital signature capture",
  PHOTO: "Photo upload",
  RATING_SCALE: "Star or number rating",
};

// Helper to check if field type requires config
export function fieldTypeRequiresConfig(type: FormFieldType): boolean {
  return ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING_SCALE"].includes(type);
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
      return { min: 0, max: 100 };
    default:
      return null;
  }
}
