import { z } from "zod";
import { FormFieldType, FormTemplateStatus, FormTemplateType } from "@prisma/client";

// ============================================
// Field Config Schemas
// ============================================

export const textFieldConfigSchema = z.object({
  maxLength: z.number().positive().optional(),
  placeholder: z.string().optional(),
});

export const numberFieldConfigSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: z.string().optional(),
});

export const choiceFieldConfigSchema = z.object({
  options: z.array(z.string().min(1)).min(1, "At least one option is required"),
});

export const ratingFieldConfigSchema = z.object({
  min: z.number().int().min(0),
  max: z.number().int().max(10),
  labels: z.record(z.number(), z.string()).optional(),
});

// Union of all config types - use passthrough to allow additional properties
export const fieldConfigSchema = z.union([
  textFieldConfigSchema.passthrough(),
  numberFieldConfigSchema.passthrough(),
  choiceFieldConfigSchema.passthrough(),
  ratingFieldConfigSchema.passthrough(),
  z.object({}).passthrough(), // Allow any object config
  z.null(),
]);

// ============================================
// Form Field Schemas
// ============================================

export const formFieldTypeSchema = z.nativeEnum(FormFieldType);

export const formFieldSchema = z.object({
  id: z.string().min(1).optional(), // Optional for new fields, any string ID allowed
  label: z.string().min(1, "Label is required").max(200),
  description: z.string().max(500).optional().nullable(),
  type: formFieldTypeSchema,
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  config: fieldConfigSchema.nullable(),
});

export const createFormFieldSchema = formFieldSchema.omit({ id: true });

// ============================================
// Form Section Schemas
// ============================================

export const formSectionSchema = z.object({
  id: z.string().min(1).optional(), // Optional for new sections, any string ID allowed
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().min(0),
  fields: z.array(formFieldSchema),
});

export const createFormSectionSchema = formSectionSchema.omit({ id: true }).extend({
  fields: z.array(createFormFieldSchema),
});

// ============================================
// Form Template Schemas
// ============================================

export const formTemplateStatusSchema = z.nativeEnum(FormTemplateStatus);
export const formTemplateTypeSchema = z.nativeEnum(FormTemplateType);

export const createFormTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  type: formTemplateTypeSchema.default("VISIT_NOTE"),
  status: formTemplateStatusSchema.default("DRAFT"),
  isEnabled: z.boolean().default(false),
  sections: z.array(formSectionSchema), // Use formSectionSchema to allow IDs
});

export const updateFormTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: formTemplateStatusSchema.optional(),
  isEnabled: z.boolean().optional(),
  sections: z.array(formSectionSchema).optional(),
});

// ============================================
// Visit Note Submission Schemas
// ============================================

// File value for signatures and photos (uploaded files)
export const fileValueSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().positive().optional(),
});

// Base64 data for inline file uploads (from mobile apps)
export const base64FileSchema = z.string().regex(/^[A-Za-z0-9+/=]+$/, "Invalid base64 data");

// Field value can be various types
export const fieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  fileValueSchema,
  z.null(),
]);

// Visit note data is a record of field IDs to values
export const visitNoteDataSchema = z.record(z.string(), fieldValueSchema);

export const createVisitNoteSchema = z.object({
  templateId: z.string().min(1),
  shiftId: z.string().min(1),
  clientId: z.string().min(1),
  data: visitNoteDataSchema,
});

// ============================================
// Query Schemas
// ============================================

export const templateListQuerySchema = z.object({
  type: formTemplateTypeSchema.optional(),
  status: formTemplateStatusSchema.optional(),
  isEnabled: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const visitNoteListQuerySchema = z.object({
  shiftId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  carerId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// Type Exports
// ============================================

export type CreateFormTemplateInput = z.infer<typeof createFormTemplateSchema>;
export type UpdateFormTemplateInput = z.infer<typeof updateFormTemplateSchema>;
export type CreateVisitNoteInput = z.infer<typeof createVisitNoteSchema>;
export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
export type VisitNoteListQuery = z.infer<typeof visitNoteListQuerySchema>;

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates that config matches the field type
 */
export function validateFieldConfig(
  type: FormFieldType,
  config: unknown
): { valid: boolean; error?: string } {
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE": {
      const result = choiceFieldConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: false, error: "Choice fields require at least one option" };
      }
      return { valid: true };
    }
    case "RATING_SCALE": {
      const result = ratingFieldConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: false, error: "Rating scale requires min and max values" };
      }
      const data = result.data;
      if (data.min >= data.max) {
        return { valid: false, error: "Min must be less than max" };
      }
      return { valid: true };
    }
    case "NUMBER": {
      const result = numberFieldConfigSchema.safeParse(config);
      if (!result.success) {
        return { valid: true }; // Config is optional for numbers
      }
      const data = result.data;
      if (data.min !== undefined && data.max !== undefined && data.min >= data.max) {
        return { valid: false, error: "Min must be less than max" };
      }
      return { valid: true };
    }
    case "TEXT_SHORT":
    case "TEXT_LONG": {
      if (config === null) return { valid: true };
      const result = textFieldConfigSchema.safeParse(config);
      return result.success
        ? { valid: true }
        : { valid: false, error: "Invalid text field config" };
    }
    default:
      return { valid: true };
  }
}

/**
 * Validates a field value against its field type
 */
export function validateFieldValue(
  type: FormFieldType,
  value: unknown,
  required: boolean,
  config?: unknown
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
    case "TEXT_SHORT":
    case "TEXT_LONG": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be text" };
      }
      const textConfig = config as { maxLength?: number } | null;
      if (textConfig?.maxLength && value.length > textConfig.maxLength) {
        return { valid: false, error: `Maximum ${textConfig.maxLength} characters` };
      }
      return { valid: true };
    }

    case "NUMBER": {
      if (typeof value !== "number") {
        return { valid: false, error: "Must be a number" };
      }
      const numConfig = config as { min?: number; max?: number } | null;
      if (numConfig?.min !== undefined && value < numConfig.min) {
        return { valid: false, error: `Minimum value is ${numConfig.min}` };
      }
      if (numConfig?.max !== undefined && value > numConfig.max) {
        return { valid: false, error: `Maximum value is ${numConfig.max}` };
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
      const choiceConfig = config as { options: (string | { value: string; label: string })[] } | null;
      if (choiceConfig?.options) {
        // Handle both string options and {value, label} object options
        const validValues = choiceConfig.options.map((opt) =>
          typeof opt === "string" ? opt : opt.value
        );
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
      const multiConfig = config as { options: (string | { value: string; label: string })[] } | null;
      if (multiConfig?.options) {
        // Handle both string options and {value, label} object options
        const validValues = multiConfig.options.map((opt) =>
          typeof opt === "string" ? opt : opt.value
        );
        const invalidOptions = value.filter((v) => !validValues.includes(v));
        if (invalidOptions.length > 0) {
          return { valid: false, error: "Invalid options selected" };
        }
      }
      return { valid: true };
    }

    case "DATE": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a valid date" };
      }
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) && isNaN(Date.parse(value))) {
        return { valid: false, error: "Invalid date format" };
      }
      return { valid: true };
    }

    case "TIME": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a valid time" };
      }
      // Validate time format (HH:MM or HH:MM:SS)
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
        return { valid: false, error: "Invalid time format" };
      }
      return { valid: true };
    }

    case "DATETIME": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a valid date/time" };
      }
      // Basic ISO date validation
      if (isNaN(Date.parse(value))) {
        return { valid: false, error: "Invalid date/time format" };
      }
      return { valid: true };
    }

    case "RATING_SCALE": {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return { valid: false, error: "Must be a rating number" };
      }
      const ratingConfig = config as { min: number; max: number } | null;
      if (ratingConfig) {
        if (value < ratingConfig.min || value > ratingConfig.max) {
          return {
            valid: false,
            error: `Rating must be between ${ratingConfig.min} and ${ratingConfig.max}`,
          };
        }
      }
      return { valid: true };
    }

    case "SIGNATURE":
    case "PHOTO": {
      // Accept either file object or base64 string
      if (typeof value === "string") {
        // Base64 encoded data from mobile apps
        const base64Result = base64FileSchema.safeParse(value);
        if (base64Result.success) {
          return { valid: true };
        }
        // Also accept data URLs (data:image/png;base64,...)
        if (value.startsWith("data:")) {
          return { valid: true };
        }
        return { valid: false, error: "Invalid file data" };
      }
      // File object with URL
      const fileResult = fileValueSchema.safeParse(value);
      if (!fileResult.success) {
        return { valid: false, error: "Invalid file" };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}
