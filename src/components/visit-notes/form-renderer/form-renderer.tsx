"use client";

import * as React from "react";
import {
  FormTemplateData,
  FormSectionData,
  FormFieldData,
  FieldValue,
  VisitNoteData,
} from "@/lib/visit-notes/types";
import { validateFieldValue } from "@/lib/visit-notes/validation";
import { Button } from "@/components/ui";
import { SectionRenderer } from "./section-renderer";
import { Loader2 } from "lucide-react";

interface FormRendererProps {
  template: FormTemplateData;
  initialValues?: VisitNoteData;
  onSubmit: (data: VisitNoteData) => Promise<void>;
  disabled?: boolean;
  submitLabel?: string;
}

export function FormRenderer({
  template,
  initialValues = {},
  onSubmit,
  disabled,
  submitLabel = "Submit",
}: FormRendererProps) {
  const [values, setValues] = React.useState<VisitNoteData>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    for (const section of template.sections) {
      for (const field of section.fields) {
        const value = values[field.id];
        const validation = validateFieldValue(
          field.type,
          value,
          field.required,
          field.config
        );
        if (!validation.valid && validation.error) {
          newErrors[field.id] = validation.error;
        }
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    const errorKeys = Object.keys(validationErrors);

    if (errorKeys.length > 0) {
      // Scroll to first error
      const firstErrorFieldId = errorKeys[0];
      if (firstErrorFieldId) {
        const element = document.getElementById(firstErrorFieldId);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          disabled={disabled || isSubmitting}
        />
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
