"use client";

import * as React from "react";
import { FormSectionData, FieldValue } from "@/lib/visit-notes/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { FieldRenderer } from "./field-renderer";

interface SectionRendererProps {
  section: FormSectionData;
  values: Record<string, FieldValue>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
}

export function SectionRenderer({
  section,
  values,
  errors,
  onChange,
  disabled,
}: SectionRendererProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {section.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id] ?? null}
              onChange={(value) => onChange(field.id, value)}
              error={errors[field.id]}
              disabled={disabled}
            />
          ))}
      </CardContent>
    </Card>
  );
}
