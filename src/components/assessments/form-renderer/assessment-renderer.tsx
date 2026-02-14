"use client";

import * as React from "react";
import {
  AssessmentTemplateData,
  AssessmentData,
  ResponseValue,
} from "@/lib/assessments/types";
import { validateResponseValue } from "@/lib/assessments/validation";
import { Button, Card, CardContent } from "@/components/ui";
import { SectionRenderer } from "./section-renderer";
import { Loader2, Save, CheckCircle, ClipboardList } from "lucide-react";

interface AssessmentRendererProps {
  template: AssessmentTemplateData;
  initialValues?: AssessmentData;
  onSubmit: (data: AssessmentData) => Promise<void>;
  onSaveDraft?: (data: AssessmentData) => Promise<void>;
  disabled?: boolean;
  submitLabel?: string;
  showProgress?: boolean;
}

export function AssessmentRenderer({
  template,
  initialValues = {},
  onSubmit,
  onSaveDraft,
  disabled,
  submitLabel = "Complete Assessment",
  showProgress = true,
}: AssessmentRendererProps) {
  const [values, setValues] = React.useState<AssessmentData>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleFieldChange = (itemId: string, value: ResponseValue) => {
    setValues((prev) => ({ ...prev, [itemId]: value }));
    // Clear error when field is modified
    if (errors[itemId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    for (const section of template.sections) {
      for (const item of section.items) {
        const value = values[item.id];
        const validation = validateResponseValue(
          item.responseType,
          value,
          item.required,
          {
            minValue: item.minValue ?? undefined,
            maxValue: item.maxValue ?? undefined,
            options: item.responseOptions?.map((opt) => ({
              value: opt.value,
              label: opt.label,
            })),
          }
        );
        if (!validation.valid && validation.error) {
          newErrors[item.id] = validation.error;
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
      const firstErrorItemId = errorKeys[0];
      if (firstErrorItemId) {
        const element = document.getElementById(firstErrorItemId);
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

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft(values);
    } finally {
      setIsSaving(false);
    }
  };

  // Sort sections by order
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  // Calculate overall progress
  const totalItems = template.sections.reduce(
    (acc, section) => acc + section.items.length,
    0
  );
  const answeredItems = template.sections.reduce((acc, section) => {
    return (
      acc +
      section.items.filter((item) => {
        const value = values[item.id];
        return value !== null && value !== undefined && value !== "";
      }).length
    );
  }, 0);
  const progressPercent = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Progress indicator */}
      {showProgress && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-foreground-secondary" />
                <span className="text-sm font-medium">Assessment Progress</span>
              </div>
              <span className="text-sm text-foreground-secondary">
                {answeredItems} of {totalItems} questions answered ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          disabled={disabled || isSubmitting || isSaving}
        />
      ))}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={disabled || isSubmitting || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          type="submit"
          disabled={disabled || isSubmitting || isSaving}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
