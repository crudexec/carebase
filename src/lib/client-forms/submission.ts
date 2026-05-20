import { validateFieldValue } from "@/lib/visit-notes/validation";
import type { ClientFormSchemaSnapshot } from "@/lib/client-forms/types";

export function validateClientFormSubmissionData(
  snapshot: ClientFormSchemaSnapshot,
  data: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const section of snapshot.sections) {
    for (const field of section.fields) {
      const validation = validateFieldValue(
        field.type,
        data[field.id],
        field.required,
        field.config
      );

      if (!validation.valid && validation.error) {
        errors[field.id] = validation.error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
