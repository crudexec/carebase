import { FormFieldType, FormTemplateStatus } from "@prisma/client";

// Field configuration types
export interface TextFieldConfig {
  maxLength?: number;
  placeholder?: string;
}

export interface NumberFieldConfig {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface ChoiceFieldConfig {
  options: ChoiceOption[];
}

export interface RatingFieldConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface DateFieldConfig {
  minDate?: string;
  maxDate?: string;
}

export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | ChoiceFieldConfig
  | RatingFieldConfig
  | DateFieldConfig
  | Record<string, unknown>;

// Field value types
export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | Date
  | null
  | undefined;

// Template field data
export interface CarePlanTemplateFieldData {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: FieldConfig;
}

// Template section data
export interface CarePlanTemplateSectionData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: CarePlanTemplateFieldData[];
}

// Full template data
export interface CarePlanTemplateData {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  includesDiagnoses: boolean;
  includesGoals: boolean;
  includesInterventions: boolean;
  includesMedications: boolean;
  includesOrders: boolean;
  sections: CarePlanTemplateSectionData[];
}

// Form schema snapshot (stored with care plan for versioning)
export interface CarePlanFormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections: CarePlanTemplateSectionData[];
  includesDiagnoses: boolean;
  includesGoals: boolean;
  includesInterventions: boolean;
  includesMedications: boolean;
  includesOrders: boolean;
}

// Care plan form data (field values)
export type CarePlanFormData = Record<string, FieldValue>;

// Template list item (for listing)
export interface CarePlanTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  sectionCount: number;
  carePlanCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Field type labels for UI
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

// Field type descriptions for UI
export const FIELD_TYPE_DESCRIPTIONS: Record<FormFieldType, string> = {
  TEXT_SHORT: "Single line text input",
  TEXT_LONG: "Multi-line text area",
  NUMBER: "Numeric input with optional min/max",
  YES_NO: "Boolean yes/no toggle",
  SINGLE_CHOICE: "Select one option from a list",
  MULTIPLE_CHOICE: "Select multiple options",
  DATE: "Date picker",
  TIME: "Time picker",
  DATETIME: "Date and time picker",
  SIGNATURE: "Signature capture",
  PHOTO: "Photo upload",
  RATING_SCALE: "Numeric scale (e.g., 1-5)",
};

// Default field configs by type
export const DEFAULT_FIELD_CONFIGS: Partial<Record<FormFieldType, FieldConfig>> = {
  TEXT_SHORT: { maxLength: 255 },
  TEXT_LONG: { maxLength: 5000 },
  NUMBER: { min: 0 },
  SINGLE_CHOICE: { options: [] },
  MULTIPLE_CHOICE: { options: [] },
  RATING_SCALE: { min: 1, max: 5 },
};
