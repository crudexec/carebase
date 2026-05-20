import type { FormTemplate, FormSection, FormField, Prisma } from "@prisma/client";
import type { ClientFormSchemaSnapshot, ClientFormTemplateSettings } from "@/lib/client-forms/types";
import { DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS } from "@/lib/client-forms/types";

type TemplateWithSections = FormTemplate & {
  sections: Array<FormSection & { fields: FormField[] }>;
};

export function getClientFormTemplateSettings(
  settings: Prisma.JsonValue | null | undefined
): ClientFormTemplateSettings {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS;
  }

  return {
    ...DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS,
    ...settings,
    access: {
      ...DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS.access,
      ...((settings as Record<string, unknown>).access as Record<string, unknown> | undefined),
    },
    display: {
      ...DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS.display,
      ...((settings as Record<string, unknown>).display as Record<string, unknown> | undefined),
    },
    collection: {
      ...DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS.collection,
      ...((settings as Record<string, unknown>).collection as Record<string, unknown> | undefined),
    },
  };
}

export function buildClientFormSnapshot(template: TemplateWithSections): ClientFormSchemaSnapshot {
  return {
    templateId: template.id,
    templateName: template.name,
    version: template.version,
    description: template.description,
    settings: getClientFormTemplateSettings(template.settings as Prisma.JsonValue | null),
    sections: template.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description || undefined,
      order: section.order,
      fields: section.fields.map((field) => ({
        id: field.id,
        label: field.label,
        description: field.description || undefined,
        type: field.type,
        required: field.required,
        order: field.order,
        config: (field.config as Record<string, unknown> | null) ?? null,
      })),
    })),
  };
}
