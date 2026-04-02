"use client";

import * as React from "react";
import {
  FormTemplateData,
  FieldValue,
  VisitNoteData,
} from "@/lib/visit-notes/types";
// Note: FormSectionData, FormFieldData are available from types but not directly used here
import { validateFieldValue } from "@/lib/visit-notes/validation";
import { Button } from "@/components/ui";
import { SectionRenderer } from "./section-renderer";
import { Loader2 } from "lucide-react";

export interface FormRendererHandle {
  submit: () => void;
  validate: () => boolean;
  getValues: () => VisitNoteData;
}

interface FormRendererProps {
  template: FormTemplateData;
  initialValues?: VisitNoteData;
  onSubmit: (data: VisitNoteData) => Promise<void>;
  disabled?: boolean;
  submitLabel?: string;
  onDirtyChange?: (isDirty: boolean) => void;
  hideSubmitButton?: boolean;
  formRef?: React.RefObject<FormRendererHandle | null>;
}

export function FormRenderer({
  template,
  initialValues = {},
  onSubmit,
  disabled,
  submitLabel = "Submit",
  onDirtyChange,
  hideSubmitButton = false,
  formRef,
}: FormRendererProps) {
  const [values, setValues] = React.useState<VisitNoteData>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const initialValuesRef = React.useRef(initialValues);

  // Track dirty state
  React.useEffect(() => {
    const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    if (hasChanges !== isDirty) {
      setIsDirty(hasChanges);
      onDirtyChange?.(hasChanges);
    }
  }, [values, isDirty, onDirtyChange]);

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

  const submitForm = async () => {
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
      // Reset dirty state after successful submission
      initialValuesRef.current = values;
      setIsDirty(false);
      onDirtyChange?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  // Expose submit function via ref
  React.useImperativeHandle(formRef, () => ({
    submit: submitForm,
    validate: () => Object.keys(validateForm()).length === 0,
    getValues: () => values,
  }), [values]);

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

      {!hideSubmitButton && (
        <div className="flex justify-end">
          <Button type="submit" disabled={disabled || isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
