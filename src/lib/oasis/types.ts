/**
 * OASIS-E2 Assessment Type Definitions
 * Based on CMS OASIS-E2 specification effective 04/01/2026
 */

import { FormFieldType, QAStatus } from '@prisma/client';

// ============================================
// TIME POINTS
// ============================================

export type OasisTimePoint = 'SOC' | 'ROC' | 'FU' | 'TRN' | 'DC' | 'DAH';

export const OASIS_TIME_POINTS: Record<OasisTimePoint, { label: string; description: string }> = {
  SOC: { label: 'Start of Care', description: 'Initial assessment within 5 days of admission' },
  ROC: { label: 'Resumption of Care', description: 'After inpatient stay' },
  FU: { label: 'Follow-up', description: 'Recertification every 60 days' },
  TRN: { label: 'Transfer', description: 'Transfer to inpatient facility' },
  DC: { label: 'Discharge', description: 'Discharge from agency' },
  DAH: { label: 'Death at Home', description: 'Patient death at home' },
};

// ============================================
// SECTION CODES
// ============================================

export type OasisSectionCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'GG' | 'H' | 'I' | 'J' | 'K' | 'M' | 'N' | 'O' | 'Q';

export const OASIS_SECTIONS: Record<OasisSectionCode, { name: string; order: number }> = {
  A: { name: 'Administrative Information', order: 1 },
  B: { name: 'Hearing, Speech, and Vision', order: 2 },
  C: { name: 'Cognitive Patterns', order: 3 },
  D: { name: 'Mood', order: 4 },
  E: { name: 'Behavior', order: 5 },
  F: { name: 'Preferences for Customary Routine and Activities', order: 6 },
  G: { name: 'Functional Status', order: 7 },
  GG: { name: 'Functional Abilities', order: 8 },
  H: { name: 'Bladder and Bowel', order: 9 },
  I: { name: 'Active Diagnoses', order: 10 },
  J: { name: 'Health Conditions', order: 11 },
  K: { name: 'Swallowing/Nutritional Status', order: 12 },
  M: { name: 'Skin Conditions', order: 13 },
  N: { name: 'Medications', order: 14 },
  O: { name: 'Special Treatments, Procedures, and Programs', order: 15 },
  Q: { name: 'Participation in Assessment and Goal Setting', order: 16 },
};

// ============================================
// ASSESSOR DISCIPLINES
// ============================================

export type OasisAssessorDiscipline = 'RN' | 'PT' | 'OT' | 'ST';

export const ASSESSOR_DISCIPLINES: Record<OasisAssessorDiscipline, { label: string; fullName: string }> = {
  RN: { label: 'RN', fullName: 'Registered Nurse' },
  PT: { label: 'PT', fullName: 'Physical Therapist' },
  OT: { label: 'OT', fullName: 'Occupational Therapist' },
  ST: { label: 'ST', fullName: 'Speech-Language Pathologist' },
};

// ============================================
// SKIP LOGIC
// ============================================

export type SkipLogicOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'range'
  | 'is_null'
  | 'is_not_null'
  | 'contains'
  | 'not_contains';

export interface SkipCondition {
  /** Item code to check (e.g., "M1306") */
  itemCode: string;
  /** Comparison operator */
  operator: SkipLogicOperator;
  /** Value(s) to compare against */
  value?: string | number | boolean | (string | number)[];
  /** For range operator: [min, max] */
  range?: [number, number];
}

export type SkipAction = 'skip_to' | 'hide' | 'show' | 'disable' | 'enable';

export interface SkipLogicRule {
  /** Unique identifier for this rule */
  id: string;
  /** Conditions that must be met */
  conditions: SkipCondition[];
  /** How to combine conditions */
  conditionOperator: 'AND' | 'OR';
  /** Action to take when conditions are met */
  action: SkipAction;
  /** Target item or section code (for skip_to) */
  target?: string;
  /** Time points this rule applies to (empty = all) */
  timePoints?: OasisTimePoint[];
  /** Human-readable description of the rule */
  description?: string;
}

export interface SkipLogicResult {
  /** Items to hide */
  hiddenItems: Set<string>;
  /** Items to skip (for navigation) */
  skippedItems: Set<string>;
  /** Items to disable */
  disabledItems: Set<string>;
  /** Next item to navigate to (if any skip_to was triggered) */
  skipToItem?: string;
}

// ============================================
// SCORING
// ============================================

export type ScoringMethod = 'SUM' | 'AVERAGE' | 'WEIGHTED_SUM' | 'THRESHOLD' | 'CUSTOM';

export interface ScoreMapping {
  /** Response value */
  value: string | number;
  /** Score for this value */
  score: number;
  /** Optional weight for weighted scoring */
  weight?: number;
}

export interface ScoringConfig {
  /** Method to calculate score */
  method: ScoringMethod;
  /** Minimum possible score */
  minScore?: number;
  /** Maximum possible score */
  maxScore?: number;
  /** Minimum value for clamping */
  minValue?: number;
  /** Maximum value for clamping */
  maxValue?: number;
  /** For custom scoring: JavaScript expression */
  customFormula?: string;
  /** Custom formula (alias) */
  formula?: string;
  /** Score thresholds for interpretation */
  thresholds?: ScoringThreshold[];
  /** Source item codes for calculation */
  sourceItems?: string[];
  /** Weights for weighted scoring */
  weights?: Record<string, number>;
  /** Round to decimal places */
  roundTo?: number;
}

export interface ScoringThreshold {
  /** Minimum score for this threshold (inclusive) */
  min: number;
  /** Maximum score for this threshold (inclusive) */
  max: number;
  /** Label for this range */
  label: string;
  /** Description of what this score range means */
  description?: string;
  /** Severity/level indicator */
  level?: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface CalculatedScore {
  /** Calculated score value */
  value: number | null;
  /** Whether calculation is complete (all required items answered) */
  isComplete: boolean;
  /** Item codes that are missing responses */
  missingItems: string[];
  /** Display label for the score interpretation */
  label: string;
  /** Severity/level indicator */
  level?: 'normal' | 'mild' | 'moderate' | 'severe';
  /** Description of the score interpretation */
  description?: string;
  /** Threshold range [min, max] that this score falls into */
  thresholdRange?: [number, number];
}

// ============================================
// FIELD CONFIGURATIONS
// ============================================

/** Configuration for CODE_ENTRY field type */
export interface CodeEntryFieldConfig {
  /** Number of digits/characters expected */
  codeLength?: number;
  /** Type of input: numeric only, alphanumeric, etc. */
  inputType?: 'numeric' | 'alphanumeric' | 'alpha';
  /** Allowed values (if restricted) */
  allowedValues?: string[];
  /** Display prefix text */
  prefix?: string;
  /** Validation pattern (regex) */
  pattern?: string;
  /** Show as dropdown if few options */
  showAsDropdown?: boolean;
  /** Response options with codes and labels */
  options?: ResponseOption[];
  /** Allow "NA - Not Applicable" */
  allowNA?: boolean;
  /** Allow "UK - Unknown" */
  allowUK?: boolean;
  /** Label for NA option */
  naLabel?: string;
  /** Label for UK option */
  ukLabel?: string;
}

/** Configuration for MATRIX_GRID field type */
export interface MatrixGridFieldConfig {
  /** Row definitions */
  rows: MatrixRow[];
  /** Column definitions */
  columns: MatrixColumn[];
  /** Allow only one selection per row */
  singleSelectPerRow?: boolean;
  /** Allow multiple rows to be selected */
  multipleRowsAllowed?: boolean;
  /** Allow "NA - Not Applicable" */
  allowNA?: boolean;
  /** Value to use for NA */
  naValue?: string | number;
}

export interface MatrixRow {
  id: string;
  label: string;
  description?: string;
  code?: string;
  /** Columns to skip for this row */
  skipColumns?: string[];
}

export interface MatrixColumn {
  id: string;
  label: string;
  value: string | number;
  code?: string;
  description?: string;
  /** Sub-options for this column */
  options?: Array<{ value: string | number; label: string }>;
}

/** Configuration for DATE_PARTS field type */
export interface DatePartsFieldConfig {
  /** Allow "NA - Not Applicable" */
  allowNA?: boolean;
  /** Allow "UK - Unknown" */
  allowUnknown?: boolean;
  /** Minimum date allowed */
  minDate?: string;
  /** Maximum date allowed */
  maxDate?: string;
  /** Minimum year allowed */
  minYear?: number;
  /** Maximum year allowed */
  maxYear?: number;
  /** Reference to another date field for validation */
  relativeToField?: string;
  /** Relative validation rule */
  relativeRule?: 'before' | 'after' | 'same_or_before' | 'same_or_after';
  /** Label for NA option */
  naLabel?: string;
  /** Label for Unknown option */
  unknownLabel?: string;
}

/** Configuration for HIERARCHICAL_CHECKBOX field type */
export interface HierarchicalCheckboxFieldConfig {
  /** Hierarchical items structure */
  items?: HierarchicalItem[];
  /** Alias for items - used interchangeably */
  options?: HierarchicalItem[];
  /** Allow multiple selections */
  multiSelect?: boolean;
  /** Alias for multiSelect - used interchangeably */
  allowMultiple?: boolean;
  /** Maximum number of selections allowed */
  maxSelections?: number;
  /** "None of the above" option text or config */
  noneOption?: string | {
    id: string;
    label: string;
    /** If true, selecting this clears other selections */
    exclusive: boolean;
  };
  /** Value to use for "none" selection */
  noneValue?: string;
  /** Require at least one selection */
  requireSelection?: boolean;
}

export interface HierarchicalItem {
  id: string;
  label: string;
  code?: string;
  /** Value to store when selected */
  value?: string;
  description?: string;
  /** Nesting level (0 = top level) */
  indent?: number;
  /** Child items */
  children?: HierarchicalItem[];
  /** Parent item ID */
  parentId?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/** Configuration for CALCULATED_SCORE field type */
export interface CalculatedScoreFieldConfig {
  /** Item codes that contribute to this score */
  sourceItems?: string[];
  /** Scoring configuration */
  scoring?: ScoringConfig;
  /** Display format (e.g., "score_only", "score_with_label", "full") */
  displayFormat?: 'score_only' | 'score_with_label' | 'full' | string;
  /** Special values with meanings */
  specialValues?: { value: number; meaning: string }[];
  /** Show breakdown of individual scores */
  showBreakdown?: boolean;
  /** Label for the score */
  scoreLabel?: string;
  /** Show source items in UI */
  showSourceItems?: boolean;
  /** Show threshold legend */
  showThresholds?: boolean;
  /** Auto-calculate or require manual trigger */
  autoCalculate?: boolean;
  /** Score interpretation thresholds */
  thresholds?: ScoringThreshold[];
  /** Maximum possible score value for display */
  maxValue?: number;
}

/** Configuration for NUMERIC_COUNTER field type */
export interface NumericCounterFieldConfig {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Unit label (e.g., "ulcers") */
  unit?: string;
  /** Allow "4 or more" as max option */
  allowFourOrMore?: boolean;
  /** Show +/- buttons */
  showButtons?: boolean;
  /** Allow "NA - Not Applicable" */
  allowNA?: boolean;
  /** Value to use for NA */
  naValue?: string | number;
  /** Label for NA option */
  naLabel?: string;
  /** Display format (e.g., "count", "buttons") */
  displayFormat?: string;
}

/** Configuration for STRUCTURED_ID field type */
export interface StructuredIdFieldConfig {
  /** ID format type */
  format?: 'NPI' | 'SSN' | 'MEDICARE' | 'MEDICAID' | 'PHONE' | 'ZIP' | 'CUSTOM';
  /** Custom format pattern for display (e.g., "XXX-XX-XXXX") */
  displayPattern?: string;
  /** Custom validation regex */
  validationPattern?: string;
  /** Validation config */
  validation?: {
    pattern?: string;
    message?: string;
  };
  /** Allow "UK - Unknown" */
  allowUnknown?: boolean;
  /** Allow "NA - Not Applicable" */
  allowNA?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Input mask pattern */
  mask?: string;
  /** Label for NA option */
  naLabel?: string;
  /** Separator for segments */
  separator?: string;
  /** Segment definitions for custom formats */
  segments?: StructuredIdSegment[];
}

/** Configuration for MULTI_DIAGNOSIS field type */
export interface MultiDiagnosisFieldConfig {
  /** Maximum number of diagnoses */
  maxDiagnoses: number;
  /** Primary diagnosis is first */
  hasPrimary?: boolean;
  /** Require a primary diagnosis */
  requirePrimary?: boolean;
  /** Allow sequencing/reordering */
  allowSequencing?: boolean;
  /** Show payment code (PDC) */
  showPaymentCode?: boolean;
  /** Include symptom control rating (0-4) */
  includeSymptomRating?: boolean;
  /** Restrict to certain ICD-10 code patterns */
  codePattern?: string;
  /** Exclude V, W, X, Y codes for primary */
  excludeExternalCausesForPrimary?: boolean;
}

/** Union type for all field configurations */
export type OasisFieldConfig =
  | CodeEntryFieldConfig
  | MatrixGridFieldConfig
  | DatePartsFieldConfig
  | HierarchicalCheckboxFieldConfig
  | CalculatedScoreFieldConfig
  | NumericCounterFieldConfig
  | StructuredIdFieldConfig
  | MultiDiagnosisFieldConfig
  | Record<string, unknown>; // For standard field types

// ============================================
// RESPONSE OPTIONS
// ============================================

export interface ResponseOption {
  /** Value to store */
  value: string | number;
  /** Display label */
  label: string;
  /** Description/help text */
  description?: string;
  /** Score for this option (if scored) */
  score?: number;
  /** Code (e.g., "A", "1") */
  code?: string;
  /** Skip instruction text (e.g., "→ Skip to M1322") */
  skipInstruction?: string;
}

// ============================================
// ITEM DATA STRUCTURES
// ============================================

export interface OasisItemData {
  id: string;
  sectionId?: string;
  code: string;
  label: string;
  order: number;
  displayOrder?: number;
  description?: string | null;
  helpText?: string | null;
  fieldType: FormFieldType;
  config: OasisFieldConfig | Record<string, unknown>;
  required: boolean;
  visibleAt: OasisTimePoint[] | string[];
  requiredAt?: OasisTimePoint[];
  allowedDisciplines?: OasisAssessorDiscipline[];
  skipLogic?: SkipLogicRule[] | unknown[];
  scoreMapping?: ScoreMapping[];
  contributesToScore?: string;
  maxScore?: number;
  validationRules?: ValidationRule[];
  /** Alias for validation rules - simpler interface for components */
  validation?: FieldValidation | Record<string, unknown> | null;
  responseOptions?: ResponseOption[];
}

export interface OasisSectionData {
  id: string;
  templateId?: string;
  code: OasisSectionCode | string;
  name: string;
  /** Alias for name - used interchangeably */
  label?: string;
  description?: string | null;
  order: number;
  displayOrder?: number;
  instructions?: string;
  items: OasisItemData[];
}

export interface OasisTemplateData {
  id: string;
  version: string;
  name: string;
  description?: string;
  effectiveDate?: Date;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  isDefault?: boolean;
  sections: OasisSectionData[];
}

// ============================================
// VALIDATION
// ============================================

export type ValidationRuleType =
  | 'required'
  | 'pattern'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'dateRange'
  | 'dependsOn'
  | 'custom';

export interface ValidationRule {
  type: ValidationRuleType;
  value?: string | number | boolean;
  message: string;
  /** For dependsOn: the field this depends on */
  dependsOnField?: string;
  /** For dependsOn: required value of dependent field */
  dependsOnValue?: string | number | boolean;
  /** For custom: JavaScript expression */
  customExpression?: string;
}

export interface ValidationError {
  itemCode: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================
// ASSESSMENT DATA
// ============================================

export type OasisStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SUBMITTED_TO_QA'
  | 'QA_APPROVED'
  | 'QA_REJECTED'
  | 'EXPORTED'
  | 'CORRECTED';

export interface OasisResponseValue {
  /** Text value */
  text?: string;
  /** Numeric value */
  number?: number;
  /** Boolean value */
  boolean?: boolean;
  /** Date value */
  date?: Date | string;
  /** Complex JSON value (for matrix, multi-select, etc.) */
  json?: Record<string, unknown> | unknown[];
}

export interface OasisResponseData {
  id?: string;
  itemCode: string;
  value: OasisResponseValue;
  score?: number;
  skipped: boolean;
  skipReason?: string;
  isValid: boolean;
  validationErrors?: string[];
  lastModifiedAt?: Date;
  lastModifiedById?: string;
}

export interface OasisAssessmentData {
  id: string;
  assessmentNumber: string;
  templateId: string;
  clientId: string;
  timePoint: OasisTimePoint;
  assessorId: string;
  assessorDiscipline: OasisAssessorDiscipline;
  status: OasisStatus;

  // Key dates
  m0030SocDate?: Date;
  m0032RocDate?: Date;
  m0090AssessmentDate?: Date;
  m0906DischargeDate?: Date;
  assessmentReason?: string;

  // Progress
  startedAt: Date;
  completedAt?: Date;
  lockedAt?: Date;
  currentSection?: string;
  completedSections: string[];

  // QA
  qaStatus?: QAStatus;
  qaComment?: string;
  qaReviewedAt?: Date;
  qaReviewedById?: string;
  submittedForQaAt?: Date;

  // Export
  exportedAt?: Date;
  exportFormat?: string;
  exportFileUrl?: string;

  // Scores
  scores?: Record<string, CalculatedScore>;

  // Responses (keyed by item code)
  responses: Record<string, OasisResponseData>;

  // Linking
  priorAssessmentId?: string;
  companyId: string;
}

// ============================================
// AUTO-POPULATE MAPPING
// ============================================

export interface AutoPopulateMapping {
  /** OASIS item code */
  itemCode: string;
  /** Source field path from client data (e.g., "firstName", "medicaidId") */
  sourceField: string;
  /** Transform function name */
  transform?: 'date' | 'uppercase' | 'phone' | 'ssn';
}

export const CLIENT_AUTO_POPULATE_MAPPINGS: AutoPopulateMapping[] = [
  { itemCode: 'M0040', sourceField: 'firstName,lastName' }, // Patient Name
  { itemCode: 'M0066', sourceField: 'dateOfBirth', transform: 'date' }, // Birth Date
  { itemCode: 'M0050', sourceField: 'state', transform: 'uppercase' }, // State
  { itemCode: 'M0060', sourceField: 'zipCode' }, // ZIP Code
  { itemCode: 'M0064', sourceField: 'ssn', transform: 'ssn' }, // SSN
  { itemCode: 'M0063', sourceField: 'medicareNumber' }, // Medicare Number
  { itemCode: 'M0065', sourceField: 'medicaidId' }, // Medicaid Number
];

// ============================================
// EXPORT TYPES
// ============================================

export interface OasisExportOptions {
  format: 'FLAT_FILE' | 'XML' | 'JSON' | 'PDF';
  includeMetadata?: boolean;
  includeScores?: boolean;
}

export interface OasisExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  format: string;
  exportedAt: Date;
  errors?: string[];
}

// ============================================
// TYPE ALIASES (for simpler imports in components)
// ============================================

/** Alias for CodeEntryFieldConfig */
export type CodeEntryConfig = CodeEntryFieldConfig;

/** Alias for MatrixGridFieldConfig */
export type MatrixGridConfig = MatrixGridFieldConfig;

/** Alias for MatrixRow */
export type MatrixGridRow = MatrixRow;

/** Alias for MatrixColumn */
export type MatrixGridColumn = MatrixColumn;

/** Alias for DatePartsFieldConfig */
export type DatePartsConfig = DatePartsFieldConfig;

/** Alias for HierarchicalCheckboxFieldConfig */
export type HierarchicalCheckboxConfig = HierarchicalCheckboxFieldConfig;

/** Alias for HierarchicalItem */
export type HierarchicalOption = HierarchicalItem;

/** Alias for CalculatedScoreFieldConfig */
export type CalculatedScoreConfig = CalculatedScoreFieldConfig;

/** Alias for NumericCounterFieldConfig */
export type NumericCounterConfig = NumericCounterFieldConfig;

/** Alias for StructuredIdFieldConfig */
export type StructuredIdConfig = StructuredIdFieldConfig;

/** Structured ID segment type */
export interface StructuredIdSegment {
  length: number;
  type: 'numeric' | 'alpha' | 'alphanumeric';
  placeholder?: string;
}

/** Alias for MultiDiagnosisFieldConfig */
export type MultiDiagnosisConfig = MultiDiagnosisFieldConfig;

/** Field validation interface */
export interface FieldValidation {
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
  required?: boolean;
}
