/**
 * OASIS Library Entry Point
 * Exports all OASIS-related functionality
 */

// Types
export type {
  OasisTimePoint,
  OasisSectionCode,
  OasisAssessorDiscipline,
  OasisResponseValue,
  OasisItemData,
  OasisSectionData,
  OasisTemplateData,
  OasisAssessmentData,
  OasisResponseData,
  SkipCondition,
  SkipLogicRule,
  SkipLogicResult,
  ScoringConfig,
  CalculatedScore,
  ScoringThreshold,
  ResponseOption,
  FieldValidation,
  // Field config types (original names)
  CodeEntryFieldConfig,
  MatrixGridFieldConfig,
  DatePartsFieldConfig,
  HierarchicalCheckboxFieldConfig,
  CalculatedScoreFieldConfig,
  NumericCounterFieldConfig,
  StructuredIdFieldConfig,
  MultiDiagnosisFieldConfig,
  // Field config type aliases (simpler names)
  CodeEntryConfig,
  MatrixGridConfig,
  MatrixGridColumn,
  MatrixGridRow,
  DatePartsConfig,
  HierarchicalCheckboxConfig,
  HierarchicalOption,
  CalculatedScoreConfig,
  NumericCounterConfig,
  StructuredIdConfig,
  StructuredIdSegment,
  MultiDiagnosisConfig,
  OasisFieldConfig,
  AutoPopulateMapping,
  MatrixRow,
  MatrixColumn,
  HierarchicalItem,
} from './types';

// Constants
export {
  ASSESSMENT_REASONS,
  BIMS_THRESHOLDS,
  BIMS_SOURCE_ITEMS,
  PHQ9_THRESHOLDS,
  PHQ9_SOURCE_ITEMS,
  GG_PERFORMANCE_CODES,
  GG_PRIOR_FUNCTIONING_CODES,
  PRESSURE_ULCER_STAGES,
  YES_NO_OPTIONS,
  YES_NO_UK_OPTIONS,
  YES_NO_NA_OPTIONS,
  FREQUENCY_OPTIONS,
  SECTION_DISCIPLINE_PERMISSIONS,
  SECTION_TIME_POINTS,
  COMMON_SKIP_PATTERNS,
  VALIDATION_PATTERNS,
  SPECIAL_VALUES,
  ITEM_CODE_TO_FIELD_TYPE,
  DEFAULT_CODE_ENTRY_CONFIG,
  DEFAULT_DATE_PARTS_CONFIG,
  DEFAULT_NUMERIC_COUNTER_CONFIG,
  EXPORT_FORMATS,
} from './constants';

// Skip Logic
export {
  evaluateCondition,
  evaluateRule,
  evaluateSkipLogic,
  getNextItem,
  getPreviousItem,
  getVisibleItems,
  validateSkippedItems,
  clearSkippedResponses,
  parseSkipInstruction,
} from './skip-logic';

// Scoring
export {
  calculateScore,
  calculateBIMSScore,
  getBIMSComponentScores,
  calculatePHQ9Score,
  getPHQ9ItemScores,
  calculateGGFunctionalScore,
  calculatePressureUlcerSummary,
  validateCalculatedScores,
  getAutoCalculatedValues,
} from './scoring';
