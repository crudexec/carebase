/**
 * ICD-10 Diagnosis to ADL/IADL Task Mapping
 *
 * This module provides mapping between ICD-10 diagnosis codes and expected
 * care tasks (ADLs/IADLs) for visit note validation.
 *
 * Used to flag when documented tasks don't align with client's diagnoses.
 */

// ICD-10 code categories and their expected tasks
export interface DiagnosisCategory {
  name: string;
  description: string;
  icd10Patterns: string[]; // Regex patterns or exact codes
  expectedTasks: string[]; // Task keywords to look for
}

export const DIAGNOSIS_TASK_MAPPING: DiagnosisCategory[] = [
  // Mobility and Movement Disorders
  {
    name: "Mobility Impairment",
    description: "Conditions affecting ability to move independently",
    icd10Patterns: [
      "Z74.0", // Need for assistance with personal care
      "Z74.1", // Need for assistance with mobility
      "Z74.2", // Need for assistance at home
      "R26",   // Abnormalities of gait and mobility
      "M62.8", // Muscle weakness
      "G81",   // Hemiplegia
      "G82",   // Paraplegia and tetraplegia
      "G83",   // Other paralytic syndromes
    ],
    expectedTasks: [
      "transfer",
      "mobility",
      "walking",
      "wheelchair",
      "bed",
      "repositioning",
      "range of motion",
      "ambulation",
    ],
  },

  // Self-Care Deficits
  {
    name: "Self-Care Deficit",
    description: "Conditions affecting ability to perform personal care",
    icd10Patterns: [
      "Z74.0", // Need for assistance with personal care
      "R26.8", // Other abnormalities of gait and mobility
      "R53",   // Malaise and fatigue
      "F03",   // Dementia
      "G30",   // Alzheimer's disease
      "F01",   // Vascular dementia
    ],
    expectedTasks: [
      "bathing",
      "shower",
      "hygiene",
      "dressing",
      "grooming",
      "oral care",
      "toileting",
      "incontinence",
    ],
  },

  // Cognitive Impairment
  {
    name: "Cognitive Impairment",
    description: "Conditions affecting memory, thinking, or judgment",
    icd10Patterns: [
      "F03",   // Dementia unspecified
      "F01",   // Vascular dementia
      "F02",   // Dementia in other diseases
      "G30",   // Alzheimer's disease
      "G31",   // Other degenerative diseases
      "R41",   // Cognitive functions symptoms
      "F06.7", // Mild cognitive disorder
    ],
    expectedTasks: [
      "medication reminder",
      "supervision",
      "safety",
      "orientation",
      "cueing",
      "prompting",
      "redirection",
      "wandering",
    ],
  },

  // Feeding and Nutrition
  {
    name: "Feeding/Nutrition Issues",
    description: "Conditions affecting ability to eat or maintain nutrition",
    icd10Patterns: [
      "R63.0", // Anorexia
      "R63.3", // Feeding difficulties
      "R63.4", // Abnormal weight loss
      "R13",   // Dysphagia
      "E44",   // Protein-calorie malnutrition
      "E46",   // Unspecified protein-calorie malnutrition
    ],
    expectedTasks: [
      "feeding",
      "eating",
      "meal",
      "food",
      "nutrition",
      "fluid",
      "intake",
      "swallowing",
      "tube feeding",
    ],
  },

  // Mental Health Conditions
  {
    name: "Mental Health",
    description: "Psychiatric and behavioral health conditions",
    icd10Patterns: [
      "F32",   // Major depressive disorder, single episode
      "F33",   // Major depressive disorder, recurrent
      "F41",   // Anxiety disorders
      "F20",   // Schizophrenia
      "F31",   // Bipolar disorder
      "F43",   // Reaction to stress
    ],
    expectedTasks: [
      "mood",
      "mental",
      "emotional",
      "anxiety",
      "depression",
      "behavior",
      "coping",
      "social",
      "companion",
    ],
  },

  // Skin Integrity
  {
    name: "Skin Integrity Issues",
    description: "Conditions affecting skin health",
    icd10Patterns: [
      "L89",   // Pressure ulcer
      "L97",   // Non-pressure chronic ulcer
      "L98.4", // Non-pressure chronic ulcer of skin
      "Z87.2", // Personal history of skin diseases
    ],
    expectedTasks: [
      "skin",
      "wound",
      "pressure",
      "positioning",
      "turning",
      "lotion",
      "inspection",
    ],
  },

  // Incontinence
  {
    name: "Incontinence",
    description: "Bladder or bowel control issues",
    icd10Patterns: [
      "R32",   // Urinary incontinence
      "R15",   // Fecal incontinence
      "N39.4", // Urinary incontinence
      "R39.1", // Other difficulties with micturition
    ],
    expectedTasks: [
      "toileting",
      "incontinence",
      "catheter",
      "ostomy",
      "colostomy",
      "bedpan",
      "urinal",
      "brief",
      "diaper",
    ],
  },

  // Diabetes
  {
    name: "Diabetes Management",
    description: "Diabetes and related care needs",
    icd10Patterns: [
      "E11",   // Type 2 diabetes
      "E10",   // Type 1 diabetes
      "E13",   // Other specified diabetes
    ],
    expectedTasks: [
      "medication",
      "blood sugar",
      "glucose",
      "diet",
      "foot care",
      "nail care",
      "skin inspection",
    ],
  },

  // Cardiac Conditions
  {
    name: "Cardiac Conditions",
    description: "Heart and cardiovascular conditions",
    icd10Patterns: [
      "I50",   // Heart failure
      "I25",   // Chronic ischemic heart disease
      "I10",   // Essential hypertension
      "I48",   // Atrial fibrillation
    ],
    expectedTasks: [
      "medication",
      "vital signs",
      "blood pressure",
      "weight",
      "edema",
      "shortness of breath",
      "activity",
      "rest",
    ],
  },

  // Respiratory Conditions
  {
    name: "Respiratory Conditions",
    description: "Breathing and lung conditions",
    icd10Patterns: [
      "J44",   // COPD
      "J45",   // Asthma
      "J96",   // Respiratory failure
      "J18",   // Pneumonia
    ],
    expectedTasks: [
      "breathing",
      "oxygen",
      "inhaler",
      "nebulizer",
      "respiratory",
      "coughing",
      "positioning",
    ],
  },

  // General Home Care Needs
  {
    name: "General Home Care",
    description: "General conditions requiring home support",
    icd10Patterns: [
      "Z74.2", // Need for assistance at home
      "Z74.3", // Need for continuous supervision
      "Z74.8", // Other problems related to care provider dependency
      "Z74.9", // Problem related to care provider dependency, unspecified
    ],
    expectedTasks: [
      "homemaker",
      "housekeeping",
      "laundry",
      "meal prep",
      "shopping",
      "errands",
      "transportation",
    ],
  },
];

/**
 * Check if an ICD-10 code matches a pattern
 */
function matchesPattern(code: string, pattern: string): boolean {
  const normalizedCode = code.toUpperCase().replace(/\./g, "");
  const normalizedPattern = pattern.toUpperCase().replace(/\./g, "");

  // Check if code starts with the pattern (handles category matching like "F03" matching "F03.90")
  return normalizedCode.startsWith(normalizedPattern);
}

/**
 * Get diagnosis categories that match the given ICD-10 codes
 */
export function getDiagnosisCategories(icd10Codes: string[]): DiagnosisCategory[] {
  const matchedCategories: DiagnosisCategory[] = [];

  for (const category of DIAGNOSIS_TASK_MAPPING) {
    for (const code of icd10Codes) {
      const matches = category.icd10Patterns.some((pattern) =>
        matchesPattern(code, pattern)
      );

      if (matches && !matchedCategories.includes(category)) {
        matchedCategories.push(category);
      }
    }
  }

  return matchedCategories;
}

/**
 * Get expected tasks based on diagnosis codes
 */
export function getExpectedTasks(icd10Codes: string[]): string[] {
  const categories = getDiagnosisCategories(icd10Codes);
  const tasks = new Set<string>();

  for (const category of categories) {
    for (const task of category.expectedTasks) {
      tasks.add(task.toLowerCase());
    }
  }

  return Array.from(tasks);
}

/**
 * Validation result for task alignment
 */
export interface TaskAlignmentResult {
  isAligned: boolean;
  warnings: string[];
  suggestions: string[];
  matchedCategories: string[];
  expectedTasksFound: string[];
  missingExpectedTasks: string[];
}

/**
 * Validate that documented tasks align with client's diagnoses
 *
 * @param icd10Codes - Client's ICD-10 diagnosis codes
 * @param documentedTasks - Array of task strings documented in visit note
 * @returns Validation result with warnings and suggestions
 */
export function validateTaskAlignment(
  icd10Codes: string[],
  documentedTasks: string[]
): TaskAlignmentResult {
  const categories = getDiagnosisCategories(icd10Codes);
  const expectedTasks = getExpectedTasks(icd10Codes);

  // Normalize documented tasks for comparison
  const normalizedDocumented = documentedTasks.map((t) => t.toLowerCase());
  const documentedText = normalizedDocumented.join(" ");

  // Find which expected tasks were documented
  const expectedTasksFound: string[] = [];
  const missingExpectedTasks: string[] = [];

  for (const task of expectedTasks) {
    if (documentedText.includes(task)) {
      expectedTasksFound.push(task);
    } else {
      missingExpectedTasks.push(task);
    }
  }

  // Generate warnings and suggestions
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // If no expected tasks were found at all, that's a warning
  if (categories.length > 0 && expectedTasksFound.length === 0) {
    warnings.push(
      "No tasks documented that align with client's diagnoses. " +
      "Please document relevant care provided."
    );
  }

  // Suggest categories that might be missing documentation
  for (const category of categories) {
    const categoryTasksFound = category.expectedTasks.some((task) =>
      documentedText.includes(task.toLowerCase())
    );

    if (!categoryTasksFound) {
      suggestions.push(
        `Consider documenting ${category.name.toLowerCase()} tasks ` +
        `(client has related diagnosis)`
      );
    }
  }

  return {
    isAligned: warnings.length === 0,
    warnings,
    suggestions,
    matchedCategories: categories.map((c) => c.name),
    expectedTasksFound,
    missingExpectedTasks,
  };
}

/**
 * Format ICD-10 code for display with description
 */
export const ICD10_DESCRIPTIONS: Record<string, string> = {
  // Need for assistance codes
  "Z74.0": "Need for assistance with personal care",
  "Z74.1": "Need for assistance with mobility",
  "Z74.2": "Need for assistance at home",
  "Z74.3": "Need for continuous supervision",

  // Cognitive
  "F03": "Dementia, unspecified",
  "F01": "Vascular dementia",
  "G30": "Alzheimer's disease",
  "R41.0": "Disorientation",
  "R41.3": "Other amnesia",

  // Mobility
  "R26.0": "Ataxic gait",
  "R26.1": "Paralytic gait",
  "R26.2": "Difficulty in walking",
  "R26.8": "Other abnormalities of gait and mobility",
  "M62.81": "Muscle weakness (generalized)",

  // Self-care
  "R53.1": "Weakness",
  "R53.81": "Malaise",
  "R53.83": "Fatigue",

  // Incontinence
  "R32": "Urinary incontinence",
  "R15": "Fecal incontinence",
  "N39.41": "Urge incontinence",
  "N39.42": "Incontinence without sensory awareness",

  // Mental Health
  "F32.0": "Major depressive disorder, single episode, mild",
  "F32.1": "Major depressive disorder, single episode, moderate",
  "F32.9": "Major depressive disorder, single episode, unspecified",
  "F41.1": "Generalized anxiety disorder",
  "F41.9": "Anxiety disorder, unspecified",

  // Diabetes
  "E11.9": "Type 2 diabetes mellitus without complications",
  "E11.65": "Type 2 diabetes mellitus with hyperglycemia",

  // Cardiac
  "I10": "Essential (primary) hypertension",
  "I50.9": "Heart failure, unspecified",
  "I25.10": "Atherosclerotic heart disease",

  // Respiratory
  "J44.9": "Chronic obstructive pulmonary disease, unspecified",
  "J45.909": "Unspecified asthma, uncomplicated",
};

/**
 * Get description for an ICD-10 code
 */
export function getICD10Description(code: string): string | undefined {
  // Try exact match first
  if (ICD10_DESCRIPTIONS[code]) {
    return ICD10_DESCRIPTIONS[code];
  }

  // Try without decimal
  const normalized = code.replace(".", "");
  for (const [key, value] of Object.entries(ICD10_DESCRIPTIONS)) {
    if (key.replace(".", "") === normalized) {
      return value;
    }
  }

  // Try partial match (category)
  for (const [key, value] of Object.entries(ICD10_DESCRIPTIONS)) {
    if (code.startsWith(key.split(".")[0])) {
      return value;
    }
  }

  return undefined;
}
