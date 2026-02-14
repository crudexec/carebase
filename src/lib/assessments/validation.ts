import { z } from "zod";
import { AssessmentSectionType, AssessmentResponseType, ScoringMethod, QAStatus } from "@prisma/client";

// ============================================
// Response Config Schemas
// ============================================

export const choiceOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  score: z.number().optional(),
});

export const scaleResponseConfigSchema = z.object({
  minValue: z.number().int(),
  maxValue: z.number().int(),
  labels: z.record(z.number(), z.string()).optional(),
});

export const choiceResponseConfigSchema = z.object({
  options: z.array(choiceOptionSchema).min(1, "At least one option is required"),
});

export const numberResponseConfigSchema = z.object({
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  unit: z.string().optional(),
});

export const textResponseConfigSchema = z.object({
  maxLength: z.number().positive().optional(),
  placeholder: z.string().optional(),
});

export const responseConfigSchema = z.union([
  scaleResponseConfigSchema.passthrough(),
  choiceResponseConfigSchema.passthrough(),
  numberResponseConfigSchema.passthrough(),
  textResponseConfigSchema.passthrough(),
  z.object({}).passthrough(),
  z.null(),
]);

// ============================================
// Scoring Configuration Schemas
// ============================================

export const scoringThresholdsSchema = z.object({
  low: z.number().optional(),
  medium: z.number().optional(),
  high: z.number().optional(),
  skilled: z.number().optional(),
});

export const scoringConfigSchema = z.object({
  method: z.nativeEnum(ScoringMethod),
  maxScore: z.number().optional(),
  passingScore: z.number().optional(),
  thresholds: scoringThresholdsSchema.optional(),
});

export const sectionScoringConfigSchema = z.object({
  method: z.nativeEnum(ScoringMethod).optional(),
  maxScore: z.number().optional(),
  weight: z.number().min(0).max(1).optional(),
});

// ============================================
// Conditional Logic Schema
// ============================================

export const conditionalLogicSchema = z.object({
  itemCode: z.string().min(1),
  operator: z.enum(["equals", "not_equals", "greater_than", "less_than"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// ============================================
// Assessment Item Schemas
// ============================================

export const assessmentResponseTypeSchema = z.nativeEnum(AssessmentResponseType);

export const assessmentItemSchema = z.object({
  id: z.string().min(1).optional(),
  code: z.string().min(1, "Code is required").max(50),
  questionText: z.string().min(1, "Question text is required").max(500),
  description: z.string().max(1000).optional().nullable(),
  responseType: assessmentResponseTypeSchema,
  required: z.boolean().default(true),
  order: z.number().int().min(0),
  responseOptions: z.array(choiceOptionSchema).optional().nullable(),
  minValue: z.number().int().optional().nullable(),
  maxValue: z.number().int().optional().nullable(),
  scoreMapping: z.record(z.string(), z.number()).optional().nullable(),
  showIf: conditionalLogicSchema.optional().nullable(),
});

export const createAssessmentItemSchema = assessmentItemSchema.omit({ id: true });

// ============================================
// Assessment Section Schemas
// ============================================

export const assessmentSectionTypeSchema = z.nativeEnum(AssessmentSectionType);

export const assessmentSectionSchema = z.object({
  id: z.string().min(1).optional(),
  sectionType: assessmentSectionTypeSchema,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional().nullable(),
  instructions: z.string().max(2000).optional().nullable(),
  order: z.number().int().min(0),
  items: z.array(assessmentItemSchema),
  scoringConfig: sectionScoringConfigSchema.optional().nullable(),
});

export const createAssessmentSectionSchema = assessmentSectionSchema.omit({ id: true }).extend({
  items: z.array(createAssessmentItemSchema),
});

// ============================================
// Assessment Template Schemas
// ============================================

export const assessmentTemplateStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const createAssessmentTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  isRequired: z.boolean().default(false),
  scoringConfig: scoringConfigSchema.default({ method: "SUM" }),
  sections: z.array(assessmentSectionSchema),
});

export const updateAssessmentTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  scoringConfig: scoringConfigSchema.optional(),
  sections: z.array(assessmentSectionSchema).optional(),
});

// ============================================
// Assessment Response Schemas
// ============================================

export const assessmentResponseValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const assessmentResponseSchema = z.object({
  itemId: z.string().min(1),
  value: assessmentResponseValueSchema,
  notes: z.string().max(1000).optional(),
});

export const assessmentDataSchema = z.record(z.string(), assessmentResponseValueSchema);

// ============================================
// Assessment Instance Schemas
// ============================================

export const assessmentStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const assessmentTypeSchema = z.enum(["INITIAL", "REASSESSMENT", "DISCHARGE"]);

export const createAssessmentSchema = z.object({
  templateId: z.string().min(1),
  clientId: z.string().min(1),
  assessmentType: assessmentTypeSchema.default("INITIAL"),
  notes: z.string().max(2000).optional(),
});

export const updateAssessmentSchema = z.object({
  responses: z.array(assessmentResponseSchema).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const completeAssessmentSchema = z.object({
  responses: z.array(assessmentResponseSchema),
  notes: z.string().max(2000).optional(),
});

// ============================================
// QA Review Schemas
// ============================================

export const qaStatusSchema = z.nativeEnum(QAStatus);

export const qaReviewSchema = z.object({
  status: qaStatusSchema,
  comment: z.string().max(2000).optional(),
});

// ============================================
// Query Schemas
// ============================================

export const templateListQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  isRequired: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const assessmentListQuerySchema = z.object({
  clientId: z.string().min(1).optional(),
  assessorId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  status: assessmentStatusSchema.optional(),
  assessmentType: assessmentTypeSchema.optional(),
  qaStatus: qaStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// Type Exports
// ============================================

export type CreateAssessmentTemplateInput = z.infer<typeof createAssessmentTemplateSchema>;
export type UpdateAssessmentTemplateInput = z.infer<typeof updateAssessmentTemplateSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type CompleteAssessmentInput = z.infer<typeof completeAssessmentSchema>;
export type QAReviewInput = z.infer<typeof qaReviewSchema>;
export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
export type AssessmentListQuery = z.infer<typeof assessmentListQuerySchema>;

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates that response config matches the response type
 */
export function validateResponseConfig(
  type: AssessmentResponseType,
  config: unknown
): { valid: boolean; error?: string } {
  switch (type) {
    case "SCALE": {
      const result = scaleResponseConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: false, error: "Scale requires minValue and maxValue" };
      }
      const data = result.data;
      if (data.minValue >= data.maxValue) {
        return { valid: false, error: "minValue must be less than maxValue" };
      }
      return { valid: true };
    }
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE": {
      const result = choiceResponseConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: false, error: "Choice fields require at least one option" };
      }
      return { valid: true };
    }
    case "NUMBER": {
      if (config === null || config === undefined) return { valid: true };
      const result = numberResponseConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: false, error: "Invalid number configuration" };
      }
      const data = result.data;
      if (data.minValue !== undefined && data.maxValue !== undefined && data.minValue >= data.maxValue) {
        return { valid: false, error: "minValue must be less than maxValue" };
      }
      return { valid: true };
    }
    case "TEXT": {
      if (config === null || config === undefined) return { valid: true };
      const result = textResponseConfigSchema.safeParse(config);
      return result.success
        ? { valid: true }
        : { valid: false, error: "Invalid text configuration" };
    }
    default:
      return { valid: true };
  }
}

/**
 * Validates a response value against its response type
 */
export function validateResponseValue(
  type: AssessmentResponseType,
  value: unknown,
  required: boolean,
  config?: {
    minValue?: number;
    maxValue?: number;
    options?: Array<{ value: string; label: string }>;
  }
): { valid: boolean; error?: string } {
  // Check required
  if (required && (value === null || value === undefined || value === "")) {
    return { valid: false, error: "This field is required" };
  }

  // Allow null/empty for optional fields
  if (value === null || value === undefined || value === "") {
    return { valid: true };
  }

  switch (type) {
    case "SCALE": {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return { valid: false, error: "Must be a whole number" };
      }
      if (config?.minValue !== undefined && value < config.minValue) {
        return { valid: false, error: `Value must be at least ${config.minValue}` };
      }
      if (config?.maxValue !== undefined && value > config.maxValue) {
        return { valid: false, error: `Value must be at most ${config.maxValue}` };
      }
      return { valid: true };
    }

    case "YES_NO": {
      if (typeof value !== "boolean") {
        return { valid: false, error: "Must be yes or no" };
      }
      return { valid: true };
    }

    case "SINGLE_CHOICE": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must select an option" };
      }
      if (config?.options) {
        const validValues = config.options.map((opt) => opt.value);
        if (!validValues.includes(value)) {
          return { valid: false, error: "Invalid option selected" };
        }
      }
      return { valid: true };
    }

    case "MULTIPLE_CHOICE": {
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        return { valid: false, error: "Must be an array of selections" };
      }
      if (config?.options) {
        const validValues = config.options.map((opt) => opt.value);
        const invalidOptions = value.filter((v) => !validValues.includes(v));
        if (invalidOptions.length > 0) {
          return { valid: false, error: "Invalid options selected" };
        }
      }
      return { valid: true };
    }

    case "TEXT": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be text" };
      }
      return { valid: true };
    }

    case "DATE": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a valid date" };
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) && isNaN(Date.parse(value))) {
        return { valid: false, error: "Invalid date format" };
      }
      return { valid: true };
    }

    case "NUMBER": {
      if (typeof value !== "number") {
        return { valid: false, error: "Must be a number" };
      }
      if (config?.minValue !== undefined && value < config.minValue) {
        return { valid: false, error: `Value must be at least ${config.minValue}` };
      }
      if (config?.maxValue !== undefined && value > config.maxValue) {
        return { valid: false, error: `Value must be at most ${config.maxValue}` };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

/**
 * Validates an entire assessment template
 */
export function validateAssessmentTemplate(
  template: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const result = createAssessmentTemplateSchema.safeParse(template);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    });
    return { valid: false, errors };
  }

  const data = result.data;

  // Validate sections have items
  data.sections.forEach((section, sIndex) => {
    if (section.items.length === 0) {
      errors.push(`Section ${sIndex + 1} (${section.title}): Must have at least one item`);
    }

    // Validate item codes are unique within section
    const codes = new Set<string>();
    section.items.forEach((item, iIndex) => {
      if (codes.has(item.code)) {
        errors.push(`Section ${sIndex + 1}, Item ${iIndex + 1}: Duplicate code "${item.code}"`);
      }
      codes.add(item.code);

      // Validate response config matches type
      if (item.responseType === "SCALE") {
        if (item.minValue === undefined || item.maxValue === undefined) {
          errors.push(`Section ${sIndex + 1}, Item ${iIndex + 1}: Scale requires minValue and maxValue`);
        }
      }

      if (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(item.responseType)) {
        if (!item.responseOptions || item.responseOptions.length === 0) {
          errors.push(`Section ${sIndex + 1}, Item ${iIndex + 1}: Choice fields require options`);
        }
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate score for an assessment based on responses and template
 */
export function calculateAssessmentScore(
  responses: Array<{ itemId: string; value: unknown }>,
  items: Array<{
    id: string;
    responseType: AssessmentResponseType;
    scoreMapping?: Record<string, number> | null;
    responseOptions?: Array<{ value: string; score?: number }> | null;
  }>,
  scoringMethod: ScoringMethod
): { totalScore: number; itemScores: Record<string, number> } {
  const itemScores: Record<string, number> = {};
  let totalScore = 0;
  let itemCount = 0;

  for (const response of responses) {
    const item = items.find((i) => i.id === response.itemId);
    if (!item || response.value === null || response.value === undefined) {
      continue;
    }

    let score = 0;

    // Calculate score based on response type
    if (item.scoreMapping && (typeof response.value === "string" || typeof response.value === "number")) {
      const mappedScore = item.scoreMapping[String(response.value)];
      if (mappedScore !== undefined) {
        score = mappedScore;
      }
    } else if (item.responseOptions && typeof response.value === "string") {
      const option = item.responseOptions.find((o) => o.value === response.value);
      if (option?.score !== undefined) {
        score = option.score;
      }
    } else if (typeof response.value === "number") {
      score = response.value;
    } else if (typeof response.value === "boolean") {
      score = response.value ? 1 : 0;
    }

    itemScores[response.itemId] = score;
    totalScore += score;
    itemCount++;
  }

  // Apply scoring method
  if (scoringMethod === "AVERAGE" && itemCount > 0) {
    totalScore = totalScore / itemCount;
  }

  return { totalScore, itemScores };
}
