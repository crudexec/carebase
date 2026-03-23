"use client";

import * as React from "react";
import { FormSectionData, FormFieldData, FieldValue } from "@/lib/visit-notes/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { FieldRenderer } from "./field-renderer";

interface SectionRendererProps {
  section: FormSectionData;
  values: Record<string, FieldValue>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
}

// Group consecutive number fields together
type FieldGroup = {
  type: "number-row" | "single";
  fields: FormFieldData[];
};

function groupFields(fields: FormFieldData[]): FieldGroup[] {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const groups: FieldGroup[] = [];
  let currentNumberGroup: FormFieldData[] = [];

  for (const field of sortedFields) {
    if (field.type === "NUMBER") {
      currentNumberGroup.push(field);
    } else {
      // If we have accumulated number fields, add them as a group
      if (currentNumberGroup.length > 0) {
        groups.push({
          type: currentNumberGroup.length > 1 ? "number-row" : "single",
          fields: currentNumberGroup,
        });
        currentNumberGroup = [];
      }
      // Add non-number field as single
      groups.push({ type: "single", fields: [field] });
    }
  }

  // Don't forget remaining number fields
  if (currentNumberGroup.length > 0) {
    groups.push({
      type: currentNumberGroup.length > 1 ? "number-row" : "single",
      fields: currentNumberGroup,
    });
  }

  return groups;
}

export function SectionRenderer({
  section,
  values,
  errors,
  onChange,
  disabled,
}: SectionRendererProps) {
  const fieldGroups = groupFields(section.fields);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {fieldGroups.map((group, groupIndex) => {
          if (group.type === "number-row") {
            // Render multiple number fields in a row
            return (
              <div key={`group-${groupIndex}`} className="flex flex-wrap gap-6">
                {group.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id] ?? null}
                    onChange={(value) => onChange(field.id, value)}
                    error={errors[field.id]}
                    disabled={disabled}
                  />
                ))}
              </div>
            );
          }

          // Render single field normally
          const field = group.fields[0];
          return (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id] ?? null}
              onChange={(value) => onChange(field.id, value)}
              error={errors[field.id]}
              disabled={disabled}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
