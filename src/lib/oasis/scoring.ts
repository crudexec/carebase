/**
 * OASIS Scoring Engine
 * Calculates BIMS, PHQ-9, and other composite scores
 */

import type {
  OasisResponseValue,
  ScoringConfig,
  CalculatedScore,
  ScoringThreshold,
} from './types';
import {
  BIMS_THRESHOLDS,
  BIMS_SOURCE_ITEMS,
  PHQ9_THRESHOLDS,
  PHQ9_SOURCE_ITEMS,
} from './constants';

/**
 * Calculates a score based on configuration
 */
export function calculateScore(
  config: ScoringConfig,
  responses: Map<string, OasisResponseValue>
): CalculatedScore {
  const sourceValues: number[] = [];
  const missingItems: string[] = [];

  // Gather values from source items
  for (const itemCode of config.sourceItems || []) {
    const response = responses.get(itemCode);
    const value = extractNumericValue(response);

    if (value !== null) {
      sourceValues.push(value);
    } else {
      missingItems.push(itemCode);
    }
  }

  // Check if we have enough values to calculate
  if (sourceValues.length === 0) {
    return {
      value: null,
      isComplete: false,
      missingItems,
      label: 'Unable to Calculate',
      description: 'No values available for calculation',
    };
  }

  // Calculate based on formula
  let calculatedValue: number;

  switch (config.formula) {
    case 'sum':
      calculatedValue = sourceValues.reduce((a, b) => a + b, 0);
      break;

    case 'average':
      calculatedValue = sourceValues.reduce((a, b) => a + b, 0) / sourceValues.length;
      break;

    case 'max':
      calculatedValue = Math.max(...sourceValues);
      break;

    case 'min':
      calculatedValue = Math.min(...sourceValues);
      break;

    case 'count':
      calculatedValue = sourceValues.length;
      break;

    case 'weighted_sum':
      if (config.weights) {
        calculatedValue = sourceValues.reduce((sum, val, index) => {
          const weight = config.weights?.[index] ?? 1;
          return sum + (val * weight);
        }, 0);
      } else {
        calculatedValue = sourceValues.reduce((a, b) => a + b, 0);
      }
      break;

    case 'custom':
      // For custom formulas, we'll need to implement specific logic
      calculatedValue = sourceValues.reduce((a, b) => a + b, 0);
      break;

    default:
      calculatedValue = sourceValues.reduce((a, b) => a + b, 0);
  }

  // Round if configured
  if (config.roundTo !== undefined) {
    const multiplier = Math.pow(10, config.roundTo);
    calculatedValue = Math.round(calculatedValue * multiplier) / multiplier;
  }

  // Apply min/max bounds
  if (config.minValue !== undefined && calculatedValue < config.minValue) {
    calculatedValue = config.minValue;
  }
  if (config.maxValue !== undefined && calculatedValue > config.maxValue) {
    calculatedValue = config.maxValue;
  }

  // Get threshold info
  const threshold = getThresholdForValue(calculatedValue, config.thresholds);

  return {
    value: calculatedValue,
    isComplete: missingItems.length === 0,
    missingItems,
    label: threshold?.label ?? `Score: ${calculatedValue}`,
    level: threshold?.level,
    description: threshold?.description,
    thresholdRange: threshold ? [threshold.min, threshold.max] : undefined,
  };
}

/**
 * Extracts numeric value from an OASIS response
 */
function extractNumericValue(response: OasisResponseValue | undefined): number | null {
  if (!response) return null;

  // Direct number value
  if (response.number !== undefined) {
    return response.number;
  }

  // Text value that might be numeric
  if (response.text !== undefined) {
    const parsed = parseFloat(response.text);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  // JSON value with score property
  if (response.json !== undefined && typeof response.json === 'object' && response.json !== null) {
    const obj = response.json as Record<string, unknown>;
    if ('score' in obj && typeof obj.score === 'number') {
      return obj.score;
    }
    if ('value' in obj && typeof obj.value === 'number') {
      return obj.value;
    }
  }

  return null;
}

/**
 * Gets the threshold that contains the given value
 */
function getThresholdForValue(
  value: number,
  thresholds: ScoringThreshold[] | undefined
): ScoringThreshold | undefined {
  if (!thresholds) return undefined;

  return thresholds.find(t => value >= t.min && value <= t.max);
}

// ============================================
// BIMS SCORING (Brief Interview for Mental Status)
// ============================================

/**
 * Calculates BIMS score (C0200-C0500)
 * Score range: 0-15
 * - 13-15: Cognitively intact
 * - 8-12: Moderate impairment
 * - 0-7: Severe impairment
 */
export function calculateBIMSScore(
  responses: Map<string, OasisResponseValue>
): CalculatedScore {
  const config: ScoringConfig = {
    method: 'SUM',
    sourceItems: BIMS_SOURCE_ITEMS,
    formula: 'sum',
    minValue: 0,
    maxValue: 15,
    thresholds: BIMS_THRESHOLDS,
  };

  return calculateScore(config, responses);
}

/**
 * Get individual BIMS component scores
 */
export function getBIMSComponentScores(
  responses: Map<string, OasisResponseValue>
): {
  repetition: number | null;  // C0200 (0-2)
  year: number | null;        // C0300A (0-1)
  month: number | null;       // C0300B (0-1)
  day: number | null;         // C0300C (0-1)
  recall1: number | null;     // C0400A (0-2)
  recall2: number | null;     // C0400B (0-2)
  recall3: number | null;     // C0400C (0-2)
} {
  return {
    repetition: extractNumericValue(responses.get('C0200')),
    year: extractNumericValue(responses.get('C0300A')),
    month: extractNumericValue(responses.get('C0300B')),
    day: extractNumericValue(responses.get('C0300C')),
    recall1: extractNumericValue(responses.get('C0400A')),
    recall2: extractNumericValue(responses.get('C0400B')),
    recall3: extractNumericValue(responses.get('C0400C')),
  };
}

// ============================================
// PHQ-9 SCORING (Patient Health Questionnaire)
// ============================================

/**
 * Calculates PHQ-9 score (D0150-D0160)
 * Score range: 0-27
 * - 0-4: Minimal depression
 * - 5-9: Mild depression
 * - 10-14: Moderate depression
 * - 15-19: Moderately severe depression
 * - 20-27: Severe depression
 */
export function calculatePHQ9Score(
  responses: Map<string, OasisResponseValue>
): CalculatedScore {
  const config: ScoringConfig = {
    method: 'SUM',
    sourceItems: PHQ9_SOURCE_ITEMS,
    formula: 'sum',
    minValue: 0,
    maxValue: 27,
    thresholds: PHQ9_THRESHOLDS,
  };

  return calculateScore(config, responses);
}

/**
 * Get individual PHQ-9 item scores with labels
 */
export function getPHQ9ItemScores(
  responses: Map<string, OasisResponseValue>
): Array<{ itemCode: string; label: string; score: number | null }> {
  const items = [
    { code: 'D0150A', label: 'Little interest or pleasure in doing things' },
    { code: 'D0150B', label: 'Feeling down, depressed, or hopeless' },
    { code: 'D0150C', label: 'Trouble falling or staying asleep, or sleeping too much' },
    { code: 'D0150D', label: 'Feeling tired or having little energy' },
    { code: 'D0150E', label: 'Poor appetite or overeating' },
    { code: 'D0150F', label: 'Feeling bad about yourself' },
    { code: 'D0150G', label: 'Trouble concentrating' },
    { code: 'D0150H', label: 'Moving or speaking slowly/being fidgety or restless' },
    { code: 'D0150I', label: 'Thoughts of self-harm' },
  ];

  return items.map(item => ({
    itemCode: item.code,
    label: item.label,
    score: extractNumericValue(responses.get(item.code)),
  }));
}

// ============================================
// GG FUNCTIONAL SCORING
// ============================================

/**
 * Calculates GG section functional score
 * Self-Care: GG0130A - GG0130J
 * Mobility: GG0170A - GG0170SS
 */
export function calculateGGFunctionalScore(
  responses: Map<string, OasisResponseValue>,
  subsection: 'self_care' | 'mobility'
): CalculatedScore {
  const selfCareItems = [
    'GG0130A', 'GG0130B', 'GG0130C', 'GG0130D', 'GG0130E',
    'GG0130F', 'GG0130G', 'GG0130H', 'GG0130I', 'GG0130J'
  ];

  const mobilityItems = [
    'GG0170A', 'GG0170B', 'GG0170C', 'GG0170D', 'GG0170E', 'GG0170F',
    'GG0170G', 'GG0170H', 'GG0170I', 'GG0170J', 'GG0170K', 'GG0170L',
    'GG0170M', 'GG0170N', 'GG0170O', 'GG0170P', 'GG0170Q', 'GG0170R',
    'GG0170RR', 'GG0170S', 'GG0170SS'
  ];

  const sourceItems = subsection === 'self_care' ? selfCareItems : mobilityItems;
  const values: number[] = [];
  const missingItems: string[] = [];

  for (const itemCode of sourceItems) {
    const response = responses.get(itemCode);
    const value = extractNumericValue(response);

    // Only count valid performance scores (01-06)
    // Skip special values: 07 (refused), 09 (N/A), 10 (environmental), 88 (medical)
    if (value !== null && value >= 1 && value <= 6) {
      values.push(value);
    } else if (value === null) {
      missingItems.push(itemCode);
    }
  }

  if (values.length === 0) {
    return {
      value: null,
      isComplete: false,
      missingItems,
      label: 'Unable to Calculate',
      description: 'No valid performance scores available',
    };
  }

  // Calculate average functional score
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const roundedAverage = Math.round(average * 10) / 10;

  let label: string;
  let level: 'normal' | 'mild' | 'moderate' | 'severe';

  if (roundedAverage >= 5) {
    label = 'High Independence';
    level = 'normal';
  } else if (roundedAverage >= 4) {
    label = 'Moderate Independence';
    level = 'mild';
  } else if (roundedAverage >= 3) {
    label = 'Moderate Assistance Needed';
    level = 'moderate';
  } else {
    label = 'Significant Assistance Needed';
    level = 'severe';
  }

  return {
    value: roundedAverage,
    isComplete: missingItems.length === 0,
    missingItems,
    label,
    level,
    description: `Average ${subsection === 'self_care' ? 'self-care' : 'mobility'} score based on ${values.length} items`,
  };
}

// ============================================
// PRESSURE ULCER SUMMARY
// ============================================

/**
 * Calculates total pressure ulcer count and staging summary
 */
export function calculatePressureUlcerSummary(
  responses: Map<string, OasisResponseValue>
): {
  totalCount: number;
  byStage: Record<string, number>;
  hasUnstageable: boolean;
  hasDeepTissue: boolean;
} {
  const ulcerItems = [
    { code: 'M1311A1', stage: '1' },
    { code: 'M1311B1', stage: '2' },
    { code: 'M1311C1', stage: '3' },
    { code: 'M1311D1', stage: '4' },
    { code: 'M1311E1', stage: 'unstageable' },
    { code: 'M1311F1', stage: 'deep_tissue' },
  ];

  const byStage: Record<string, number> = {};
  let totalCount = 0;
  let hasUnstageable = false;
  let hasDeepTissue = false;

  for (const item of ulcerItems) {
    const value = extractNumericValue(responses.get(item.code)) ?? 0;
    byStage[item.stage] = value;
    totalCount += value;

    if (item.stage === 'unstageable' && value > 0) {
      hasUnstageable = true;
    }
    if (item.stage === 'deep_tissue' && value > 0) {
      hasDeepTissue = true;
    }
  }

  return {
    totalCount,
    byStage,
    hasUnstageable,
    hasDeepTissue,
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates that calculated scores are consistent with source items
 */
export function validateCalculatedScores(
  responses: Map<string, OasisResponseValue>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate BIMS
  const bimsScore = calculateBIMSScore(responses);
  const reportedBims = extractNumericValue(responses.get('C0500'));

  if (bimsScore.value !== null && reportedBims !== null && bimsScore.value !== reportedBims) {
    errors.push(`BIMS score mismatch: calculated ${bimsScore.value}, reported ${reportedBims}`);
  }

  // Validate PHQ-9
  const phq9Score = calculatePHQ9Score(responses);
  const reportedPhq9 = extractNumericValue(responses.get('D0160'));

  if (phq9Score.value !== null && reportedPhq9 !== null && phq9Score.value !== reportedPhq9) {
    errors.push(`PHQ-9 score mismatch: calculated ${phq9Score.value}, reported ${reportedPhq9}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Auto-calculates and returns all calculated field values
 */
export function getAutoCalculatedValues(
  responses: Map<string, OasisResponseValue>
): Map<string, OasisResponseValue> {
  const calculated = new Map<string, OasisResponseValue>();

  // BIMS Summary Score (C0500)
  const bimsScore = calculateBIMSScore(responses);
  if (bimsScore.value !== null) {
    calculated.set('C0500', {
      number: bimsScore.value,
      json: {
        label: bimsScore.label,
        level: bimsScore.level,
        isComplete: bimsScore.isComplete,
      },
    });
  }

  // PHQ-9 Total Score (D0160)
  const phq9Score = calculatePHQ9Score(responses);
  if (phq9Score.value !== null) {
    calculated.set('D0160', {
      number: phq9Score.value,
      json: {
        label: phq9Score.label,
        level: phq9Score.level,
        isComplete: phq9Score.isComplete,
      },
    });
  }

  return calculated;
}
