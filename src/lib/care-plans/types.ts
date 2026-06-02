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
  | CascadingSelectFieldConfig
  | RepeatableGroupFieldConfig
  | Record<string, unknown>;

// Cascading select field configuration
export interface CascadingSelectFieldConfig {
  hierarchyId?: string;
  templateType?: string;
  allowMultipleSteps?: boolean;
  showSteps?: boolean;
}

// Task analysis step with baseline
export interface TaskAnalysisStepValue {
  stepId: string;
  stepName: string;
  baseline: string;  // e.g., "Independent", "Verbal Prompt", etc.
}

// Baseline options for task analysis steps
export const TASK_ANALYSIS_BASELINE_OPTIONS = [
  "Not Assessed",
  "Independent",
  "Verbal Prompt",
  "Gestural Prompt",
  "Modeling",
  "Partial Physical Prompt",
  "Full Physical Prompt",
  "Hand Over Hand",
  "Not Applicable",
] as const;

export type TaskAnalysisBaseline = (typeof TASK_ANALYSIS_BASELINE_OPTIONS)[number];

// Cascading select field value
export interface CascadingSelectValue {
  hierarchyId?: string;
  hierarchyName?: string;
  goalAreaId?: string;
  goalAreaName?: string;
  targetSkillId?: string;
  targetSkillName?: string;
  objectiveId?: string;
  objectiveName?: string;
  selectedStepIds?: string[];
  selectedStepNames?: string[];
  // New: task analysis steps with individual baselines
  taskAnalysisSteps?: TaskAnalysisStepValue[];
}

// Repeatable group child field definition
export interface RepeatableGroupChildField {
  key: string;              // Unique key within the group (e.g., "goalSelection", "baseline")
  label: string;            // Display label
  type: FormFieldType;      // Field type (TEXT_SHORT, CASCADING_SELECT, etc.)
  required?: boolean;       // Whether this field is required within each group
  config?: Record<string, unknown>;  // Field-specific config (e.g., templateType for cascading select)
}

// Repeatable group field configuration
export interface RepeatableGroupFieldConfig {
  childFields: RepeatableGroupChildField[];  // Fields within each repeatable group
  minItems?: number;        // Minimum number of groups (default: 0)
  maxItems?: number;        // Maximum number of groups (default: unlimited)
  addButtonLabel?: string;  // Custom label for add button (default: "Add Item")
  itemLabel?: string;       // Label for each item (default: "Item")
  collapsible?: boolean;    // Whether groups can be collapsed (default: false)
}

// Single repeatable group instance value
export type RepeatableGroupItemValue = Record<string, FieldValue | CascadingSelectValue>;

// Repeatable group field value (array of group instances)
export type RepeatableGroupValue = RepeatableGroupItemValue[];

// Field value types
export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | CascadingSelectValue
  | RepeatableGroupItemValue[]  // For REPEATABLE_GROUP fields
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
  sections: CarePlanTemplateSectionData[];
}

// Form schema snapshot (stored with care plan for versioning)
export interface CarePlanFormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections: CarePlanTemplateSectionData[];
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
  TEXT_DISPLAY: "Text",
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
  TABLE: "Table",
  BODY_MAP: "Body Map",
  ICD10_DIAGNOSIS: "ICD-10 Diagnosis",
  CASCADING_SELECT: "Cascading Select",
  REPEATABLE_GROUP: "Repeatable Group",
  // OASIS-specific field types
  CODE_ENTRY: "Code Entry",
  MATRIX_GRID: "Matrix Grid",
  DATE_PARTS: "Date Parts",
  HIERARCHICAL_CHECKBOX: "Hierarchical Checkbox",
  CALCULATED_SCORE: "Calculated Score",
  NUMERIC_COUNTER: "Numeric Counter",
  STRUCTURED_ID: "Structured ID",
  MULTI_DIAGNOSIS: "Multi Diagnosis",
};

// Field type descriptions for UI
export const FIELD_TYPE_DESCRIPTIONS: Record<FormFieldType, string> = {
  TEXT_SHORT: "Single line text input",
  TEXT_LONG: "Multi-line text area",
  TEXT_DISPLAY: "Formatted text, instructions, or headings shown in the form",
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
  TABLE: "Fillable rows and columns",
  BODY_MAP: "Interactive body diagram for documenting pain and wounds",
  ICD10_DIAGNOSIS: "Search and select ICD-10 diagnosis codes",
  CASCADING_SELECT: "Linked dropdowns for hierarchical selections (Goal Area → Target Skill → Objective → Steps)",
  REPEATABLE_GROUP: "Dynamic group of fields that can be added/removed (e.g., treatment goals, medications)",
  // OASIS-specific field types
  CODE_ENTRY: "Single or multi-digit code selection with button group or dropdown",
  MATRIX_GRID: "Multi-row/column grid for complex functional assessments",
  DATE_PARTS: "Separate month, day, year inputs with NA/UK options",
  HIERARCHICAL_CHECKBOX: "Nested checkbox options with parent-child relationships",
  CALCULATED_SCORE: "Auto-calculated scores (e.g., BIMS, PHQ-9)",
  NUMERIC_COUNTER: "Counter with +/- buttons for counting items",
  STRUCTURED_ID: "Formatted ID input (NPI, Medicare, etc.)",
  MULTI_DIAGNOSIS: "Multiple ICD-10 diagnoses with primary designation",
};

// Default field configs by type
export const DEFAULT_FIELD_CONFIGS: Partial<Record<FormFieldType, FieldConfig>> = {
  TEXT_SHORT: { maxLength: 255 },
  TEXT_LONG: { maxLength: 5000 },
  TEXT_DISPLAY: { content: "<p>Add formatted text here.</p>" },
  NUMBER: { min: 0 },
  SINGLE_CHOICE: { options: [] },
  MULTIPLE_CHOICE: { options: [] },
  RATING_SCALE: { min: 1, max: 5 },
  TABLE: {
    columns: [
      { id: "column_1", label: "Column 1" },
      { id: "column_2", label: "Column 2" },
    ],
    minRows: 1,
  },
};
