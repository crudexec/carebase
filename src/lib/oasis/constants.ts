/**
 * OASIS-E2 Constants and Item Definitions
 * Based on CMS OASIS-E2 specification effective 04/01/2026
 */

import { FormFieldType } from '@prisma/client';
import type {
  OasisTimePoint,
  OasisSectionCode,
  OasisAssessorDiscipline,
  ResponseOption,
  ScoringThreshold,
} from './types';

// ============================================
// ASSESSMENT REASONS (M0100)
// ============================================

export const ASSESSMENT_REASONS: ResponseOption[] = [
  { value: '1', code: '1', label: 'Start of care — further visits planned' },
  { value: '3', code: '3', label: 'Resumption of Care (after inpatient stay)' },
  { value: '4', code: '4', label: 'Recertification (follow-up) reassessment' },
  { value: '5', code: '5', label: 'Other follow-up' },
  { value: '6', code: '6', label: 'Transferred to an inpatient facility — patient not discharged from agency' },
  { value: '7', code: '7', label: 'Transferred to an inpatient facility — patient discharged from agency' },
  { value: '8', code: '8', label: 'Death at home' },
  { value: '9', code: '9', label: 'Discharge from agency' },
];

// ============================================
// BIMS SCORING (C0200-C0500)
// ============================================

export const BIMS_THRESHOLDS: ScoringThreshold[] = [
  { min: 13, max: 15, label: 'Cognitively Intact', level: 'normal', description: 'No significant cognitive impairment' },
  { min: 8, max: 12, label: 'Moderate Impairment', level: 'moderate', description: 'Moderate cognitive impairment' },
  { min: 0, max: 7, label: 'Severe Impairment', level: 'severe', description: 'Severe cognitive impairment' },
];

export const BIMS_SOURCE_ITEMS = ['C0200', 'C0300A', 'C0300B', 'C0300C', 'C0400A', 'C0400B', 'C0400C'];

// ============================================
// PHQ-9 SCORING (D0150-D0160)
// ============================================

export const PHQ9_THRESHOLDS: ScoringThreshold[] = [
  { min: 0, max: 4, label: 'Minimal Depression', level: 'normal', description: 'Minimal or no depression symptoms' },
  { min: 5, max: 9, label: 'Mild Depression', level: 'mild', description: 'Mild depression symptoms' },
  { min: 10, max: 14, label: 'Moderate Depression', level: 'moderate', description: 'Moderate depression symptoms' },
  { min: 15, max: 19, label: 'Moderately Severe Depression', level: 'moderate', description: 'Moderately severe depression' },
  { min: 20, max: 27, label: 'Severe Depression', level: 'severe', description: 'Severe depression symptoms' },
];

export const PHQ9_SOURCE_ITEMS = ['D0150A', 'D0150B', 'D0150C', 'D0150D', 'D0150E', 'D0150F', 'D0150G', 'D0150H', 'D0150I'];

// ============================================
// GG FUNCTIONAL ABILITIES CODING
// ============================================

export const GG_PERFORMANCE_CODES: ResponseOption[] = [
  { value: '06', code: '06', label: 'Independent', score: 6, description: 'Patient completes the activity by themself with no assistance from a helper.' },
  { value: '05', code: '05', label: 'Setup or clean-up assistance', score: 5, description: 'Helper sets up or cleans up; patient completes activity.' },
  { value: '04', code: '04', label: 'Supervision or touching assistance', score: 4, description: 'Helper provides verbal cues and/or touching/steadying assistance.' },
  { value: '03', code: '03', label: 'Partial/moderate assistance', score: 3, description: 'Helper does LESS THAN HALF the effort.' },
  { value: '02', code: '02', label: 'Substantial/maximal assistance', score: 2, description: 'Helper does MORE THAN HALF the effort.' },
  { value: '01', code: '01', label: 'Dependent', score: 1, description: 'Helper does ALL of the effort.' },
  { value: '07', code: '07', label: 'Patient refused', score: 0, description: 'Activity was not attempted - patient refused.' },
  { value: '09', code: '09', label: 'Not applicable', score: 0, description: 'Not attempted and patient did not perform this activity prior to illness.' },
  { value: '10', code: '10', label: 'Not attempted due to environmental limitations', score: 0, description: 'Not attempted due to environmental limitations.' },
  { value: '88', code: '88', label: 'Not attempted due to medical condition', score: 0, description: 'Not attempted due to medical condition or safety concerns.' },
];

export const GG_PRIOR_FUNCTIONING_CODES: ResponseOption[] = [
  { value: '3', code: '3', label: 'Independent', description: 'Patient completed all activities by themself.' },
  { value: '2', code: '2', label: 'Needed Some Help', description: 'Patient needed partial assistance from another person.' },
  { value: '1', code: '1', label: 'Dependent', description: 'A helper completed all activities for the patient.' },
  { value: '8', code: '8', label: 'Unknown', description: 'Unknown prior functioning.' },
  { value: '9', code: '9', label: 'Not Applicable', description: 'Not applicable.' },
];

// ============================================
// PRESSURE ULCER STAGING
// ============================================

export const PRESSURE_ULCER_STAGES: ResponseOption[] = [
  { value: '1', code: '1', label: 'Stage 1', description: 'Intact skin with non-blanchable redness of a localized area.' },
  { value: '2', code: '2', label: 'Stage 2', description: 'Partial thickness loss of dermis presenting as a shallow open ulcer with a red or pink wound bed.' },
  { value: '3', code: '3', label: 'Stage 3', description: 'Full thickness tissue loss. Subcutaneous fat may be visible but bone, tendon, or muscle is not exposed.' },
  { value: '4', code: '4', label: 'Stage 4', description: 'Full thickness tissue loss with exposed bone, tendon, or muscle.' },
  { value: 'NA', code: 'NA', label: 'No pressure ulcers/injuries or no stageable pressure ulcers/injuries', description: 'Patient has no stageable pressure ulcers.' },
];

// ============================================
// STANDARD RESPONSE OPTIONS
// ============================================

export const YES_NO_OPTIONS: ResponseOption[] = [
  { value: '0', code: '0', label: 'No', score: 0 },
  { value: '1', code: '1', label: 'Yes', score: 1 },
];

export const YES_NO_UK_OPTIONS: ResponseOption[] = [
  { value: '0', code: '0', label: 'No', score: 0 },
  { value: '1', code: '1', label: 'Yes', score: 1 },
  { value: 'UK', code: 'UK', label: 'Unknown' },
];

export const YES_NO_NA_OPTIONS: ResponseOption[] = [
  { value: '0', code: '0', label: 'No', score: 0 },
  { value: '1', code: '1', label: 'Yes', score: 1 },
  { value: 'NA', code: 'NA', label: 'Not Applicable' },
];

export const FREQUENCY_OPTIONS: ResponseOption[] = [
  { value: '0', code: '0', label: 'Never or 1 day', score: 0 },
  { value: '1', code: '1', label: '2-6 days (several days)', score: 1 },
  { value: '2', code: '2', label: '7-11 days (half or more of the days)', score: 2 },
  { value: '3', code: '3', label: '12-14 days (nearly every day)', score: 3 },
];

// ============================================
// DISCIPLINE PERMISSIONS BY SECTION
// ============================================

/**
 * Defines which disciplines can complete which sections
 * Empty array means all disciplines can complete
 */
export const SECTION_DISCIPLINE_PERMISSIONS: Record<OasisSectionCode, OasisAssessorDiscipline[]> = {
  A: [], // All disciplines
  B: [], // All disciplines
  C: [], // All disciplines
  D: [], // All disciplines
  E: [], // All disciplines
  F: [], // All disciplines
  G: [], // All disciplines
  GG: [], // All disciplines - PT/OT often complete mobility
  H: [], // All disciplines
  I: [], // All disciplines
  J: [], // All disciplines
  K: [], // All disciplines - ST often completes swallowing
  M: ['RN'], // Primarily nursing
  N: ['RN'], // Primarily nursing
  O: [], // All disciplines
  Q: [], // All disciplines
};

// ============================================
// TIME POINT VISIBILITY BY SECTION
// ============================================

/**
 * Defines which sections appear at which time points
 */
export const SECTION_TIME_POINTS: Record<OasisSectionCode, OasisTimePoint[]> = {
  A: ['SOC', 'ROC', 'FU', 'TRN', 'DC', 'DAH'],
  B: ['SOC', 'ROC', 'DC'],
  C: ['SOC', 'ROC', 'FU', 'DC'],
  D: ['SOC', 'ROC', 'FU', 'DC'],
  E: ['SOC', 'ROC', 'FU', 'DC'],
  F: ['SOC', 'ROC', 'DC'],
  G: ['SOC', 'ROC', 'DC'],
  GG: ['SOC', 'ROC', 'FU', 'DC'],
  H: ['SOC', 'ROC', 'DC'],
  I: ['SOC', 'ROC', 'DC'],
  J: ['SOC', 'ROC', 'FU', 'DC', 'TRN', 'DAH'],
  K: ['SOC', 'ROC', 'DC'],
  M: ['SOC', 'ROC', 'DC'],
  N: ['SOC', 'ROC', 'DC'],
  O: ['SOC', 'ROC', 'DC'],
  Q: ['DC'],
};

// ============================================
// ITEM PATTERNS FOR SKIP LOGIC
// ============================================

/**
 * Common skip patterns in OASIS
 */
export const COMMON_SKIP_PATTERNS = {
  // If patient was not discharged from inpatient facility, skip inpatient questions
  NO_INPATIENT: {
    itemCode: 'M1000',
    operator: 'equals' as const,
    value: 'NA',
  },
  // If no pressure ulcers, skip pressure ulcer details
  NO_PRESSURE_ULCERS: {
    itemCode: 'M1306',
    operator: 'equals' as const,
    value: '0',
  },
  // If BIMS not conducted, skip BIMS items
  NO_BIMS: {
    itemCode: 'C0100',
    operator: 'equals' as const,
    value: '0',
  },
  // If no stasis ulcer, skip stasis ulcer details
  NO_STASIS_ULCER: {
    itemCode: 'M1330',
    operator: 'equals' as const,
    value: '0',
  },
  // If no surgical wound, skip surgical wound details
  NO_SURGICAL_WOUND: {
    itemCode: 'M1340',
    operator: 'equals' as const,
    value: '0',
  },
  // If patient doesn't use wheelchair, skip wheelchair items
  NO_WHEELCHAIR: {
    itemCode: 'GG0170Q',
    operator: 'equals' as const,
    value: '0',
  },
};

// ============================================
// VALIDATION PATTERNS
// ============================================

export const VALIDATION_PATTERNS = {
  NPI: /^\d{10}$/,
  SSN: /^\d{9}$/,
  MEDICARE: /^[A-Za-z0-9]{11}$/,
  MEDICAID: /^[A-Za-z0-9]+$/,
  PHONE: /^\d{10}$/,
  ZIP: /^\d{5}(-\d{4})?$/,
  ICD10: /^[A-TV-Z][0-9][0-9AB]\.?[0-9A-TV-Z]{0,4}$/i,
  DATE_MMDDYYYY: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
};

// ============================================
// SPECIAL VALUES
// ============================================

export const SPECIAL_VALUES = {
  UNKNOWN: 'UK',
  NOT_APPLICABLE: 'NA',
  UNABLE_TO_COMPLETE: '99',
  NO_RESPONSE: '9',
  PATIENT_DECLINED: '7',
  PATIENT_UNABLE: '8',
};

// ============================================
// FIELD TYPE MAPPINGS
// ============================================

/**
 * Maps OASIS item patterns to field types
 */
export const ITEM_CODE_TO_FIELD_TYPE: Record<string, FormFieldType> = {
  // Date fields
  M0030: 'DATE_PARTS' as FormFieldType,
  M0032: 'DATE_PARTS' as FormFieldType,
  M0066: 'DATE_PARTS' as FormFieldType,
  M0090: 'DATE_PARTS' as FormFieldType,
  M0102: 'DATE_PARTS' as FormFieldType,
  M0104: 'DATE_PARTS' as FormFieldType,
  M0906: 'DATE_PARTS' as FormFieldType,
  M1005: 'DATE_PARTS' as FormFieldType,

  // Structured IDs
  M0018: 'STRUCTURED_ID' as FormFieldType, // NPI
  M0010: 'STRUCTURED_ID' as FormFieldType, // CMS Certification
  M0064: 'STRUCTURED_ID' as FormFieldType, // SSN
  M0063: 'STRUCTURED_ID' as FormFieldType, // Medicare
  M0065: 'STRUCTURED_ID' as FormFieldType, // Medicaid

  // Code entry
  M0100: 'CODE_ENTRY' as FormFieldType,
  A0810: 'CODE_ENTRY' as FormFieldType,
  M0080: 'CODE_ENTRY' as FormFieldType,

  // Matrix grid
  M1100: 'MATRIX_GRID' as FormFieldType,

  // Calculated scores
  C0500: 'CALCULATED_SCORE' as FormFieldType, // BIMS
  D0160: 'CALCULATED_SCORE' as FormFieldType, // PHQ-9

  // Multi-diagnosis
  M1021: 'MULTI_DIAGNOSIS' as FormFieldType,
  M1023: 'MULTI_DIAGNOSIS' as FormFieldType,

  // Hierarchical checkboxes
  O0110: 'HIERARCHICAL_CHECKBOX' as FormFieldType,
  M0150: 'HIERARCHICAL_CHECKBOX' as FormFieldType,
  A1005: 'HIERARCHICAL_CHECKBOX' as FormFieldType,
  A1010: 'HIERARCHICAL_CHECKBOX' as FormFieldType,
  M1000: 'HIERARCHICAL_CHECKBOX' as FormFieldType,

  // Numeric counters
  'M1311A1': 'NUMERIC_COUNTER' as FormFieldType,
  'M1311B1': 'NUMERIC_COUNTER' as FormFieldType,
  'M1311C1': 'NUMERIC_COUNTER' as FormFieldType,
};

// ============================================
// DEFAULT FIELD CONFIGURATIONS
// ============================================

export const DEFAULT_CODE_ENTRY_CONFIG = {
  codeLength: 1,
  inputType: 'numeric' as const,
  showAsDropdown: true,
};

export const DEFAULT_DATE_PARTS_CONFIG = {
  allowNA: false,
  allowUnknown: false,
};

export const DEFAULT_NUMERIC_COUNTER_CONFIG = {
  min: 0,
  max: 99,
  step: 1,
  showButtons: true,
};

// ============================================
// EXPORT FORMAT OPTIONS
// ============================================

export const EXPORT_FORMATS = [
  { value: 'FLAT_FILE', label: 'OASIS Flat File', description: 'Standard CMS submission format' },
  { value: 'XML', label: 'XML', description: 'XML format for integration' },
  { value: 'JSON', label: 'JSON', description: 'JSON format for API integration' },
  { value: 'PDF', label: 'PDF Report', description: 'Printable PDF report' },
];
