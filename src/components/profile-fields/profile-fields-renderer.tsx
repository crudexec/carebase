"use client";

import * as React from "react";
import { FormFieldData, FormSectionData, FieldValue } from "@/lib/visit-notes/types";
import { FieldRenderer } from "@/components/visit-notes/form-renderer/field-renderer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Loader2 } from "lucide-react";

type ProfileTemplateType = "STAFF_PROFILE" | "CLIENT_PROFILE";

interface ProfileTemplate {
  id: string;
  name: string;
  sections: FormSectionData[];
}

interface ProfileFieldsRendererProps {
  type: ProfileTemplateType;
  data: Record<string, FieldValue>;
  onChange: (data: Record<string, FieldValue>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function ProfileFieldsRenderer({
  type,
  data,
  onChange,
  errors = {},
  disabled = false,
}: ProfileFieldsRendererProps) {
  const [template, setTemplate] = React.useState<ProfileTemplate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTemplate();
  }, [type]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      // Fetch the enabled profile template for this type
      const response = await fetch(
        `/api/visit-notes/templates?type=${type}&isEnabled=true&status=ACTIVE&limit=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }

      const result = await response.json();

      if (result.templates.length > 0) {
        // Fetch the full template with sections
        const templateResponse = await fetch(
          `/api/visit-notes/templates/${result.templates[0].id}`
        );

        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setTemplate({
            id: templateData.template.id,
            name: templateData.template.name,
            sections: templateData.template.sections,
          });
        }
      } else {
        setTemplate(null);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load profile fields");
      setTemplate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    onChange({
      ...data,
      [fieldId]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-error py-4">
        {error}
      </div>
    );
  }

  if (!template || template.sections.length === 0) {
    return null; // No custom fields configured
  }

  return (
    <div className="space-y-6">
      {template.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {template.sections.length > 1 && (
            <div className="border-t border-border pt-4">
              <h3 className="font-medium text-foreground">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-foreground-secondary mt-1">
                  {section.description}
                </p>
              )}
            </div>
          )}
          <div className="space-y-4">
            {section.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={data[field.id] ?? null}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  disabled={disabled}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook to validate profile fields
export function useProfileFieldsValidation(
  type: ProfileTemplateType,
  data: Record<string, FieldValue>
): { isValid: boolean; errors: Record<string, string> } {
  const [template, setTemplate] = React.useState<ProfileTemplate | null>(null);

  React.useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(
          `/api/visit-notes/templates?type=${type}&isEnabled=true&status=ACTIVE&limit=1`
        );
        if (response.ok) {
          const result = await response.json();
          if (result.templates.length > 0) {
            const templateResponse = await fetch(
              `/api/visit-notes/templates/${result.templates[0].id}`
            );
            if (templateResponse.ok) {
              const templateData = await templateResponse.json();
              setTemplate({
                id: templateData.template.id,
                name: templateData.template.name,
                sections: templateData.template.sections,
              });
            }
          }
        }
      } catch {
        // Ignore errors
      }
    };
    fetchTemplate();
  }, [type]);

  const errors: Record<string, string> = {};

  if (template) {
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.required) {
          const value = data[field.id];
          if (value === null || value === undefined || value === "") {
            errors[field.id] = `${field.label} is required`;
          } else if (Array.isArray(value) && value.length === 0) {
            errors[field.id] = `${field.label} is required`;
          }
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
