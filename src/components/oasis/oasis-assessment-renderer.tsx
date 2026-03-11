"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  OasisTemplateData,
  OasisSectionData,
  OasisResponseValue,
  OasisTimePoint,
  OasisAssessorDiscipline,
  CalculatedScore,
} from "@/lib/oasis/types";
import { OasisSectionRenderer } from "./oasis-section-renderer";
import {
  getVisibleItems,
  clearSkippedResponses,
} from "@/lib/oasis/skip-logic";
import {
  calculateBIMSScore,
  calculatePHQ9Score,
} from "@/lib/oasis/scoring";
import { SECTION_TIME_POINTS } from "@/lib/oasis/constants";

interface OasisAssessmentRendererProps {
  template: OasisTemplateData;
  initialResponses?: Map<string, OasisResponseValue>;
  currentTimePoint: OasisTimePoint;
  assessorDiscipline: OasisAssessorDiscipline;
  mode?: "wizard" | "all-sections";
  onSave?: (responses: Map<string, OasisResponseValue>, isDraft: boolean) => Promise<void>;
  onSubmit?: (responses: Map<string, OasisResponseValue>) => Promise<void>;
  disabled?: boolean;
  showProgress?: boolean;
}

export function OasisAssessmentRenderer({
  template,
  initialResponses,
  currentTimePoint,
  assessorDiscipline: _assessorDiscipline,
  mode = "wizard",
  onSave,
  onSubmit,
  disabled,
  showProgress = true,
}: OasisAssessmentRendererProps) {
  const [responses, setResponses] = React.useState<Map<string, OasisResponseValue>>(
    () => new Map(initialResponses || [])
  );
  const [errors, setErrors] = React.useState<Map<string, string>>(new Map());
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [calculatedScores, setCalculatedScores] = React.useState<Map<string, CalculatedScore>>(
    new Map()
  );

  // Filter sections visible at current time point
  const visibleSections = React.useMemo(() => {
    return template.sections.filter((section) => {
      const sectionTimePoints = SECTION_TIME_POINTS[section.code as keyof typeof SECTION_TIME_POINTS];
      return sectionTimePoints?.includes(currentTimePoint);
    });
  }, [template.sections, currentTimePoint]);

  const currentSection = visibleSections[currentSectionIndex];

  // Calculate scores when responses change
  React.useEffect(() => {
    const scores = new Map<string, CalculatedScore>();

    // BIMS Score (C0500)
    const bimsScore = calculateBIMSScore(responses);
    if (bimsScore.value !== null) {
      scores.set("C0500", bimsScore);
    }

    // PHQ-9 Score (D0160)
    const phq9Score = calculatePHQ9Score(responses);
    if (phq9Score.value !== null) {
      scores.set("D0160", phq9Score);
    }

    setCalculatedScores(scores);
  }, [responses]);

  // Handle response change
  const handleResponseChange = React.useCallback(
    (itemCode: string, value: OasisResponseValue) => {
      setResponses((prev) => {
        const next = new Map(prev);
        next.set(itemCode, value);

        // Clear skipped responses when a controlling field changes
        const allItems = template.sections.flatMap((s) => s.items);
        const cleanedResponses = clearSkippedResponses(allItems, next, currentTimePoint);

        return cleanedResponses;
      });

      // Clear error for this field
      setErrors((prev) => {
        const next = new Map(prev);
        next.delete(itemCode);
        return next;
      });
    },
    [template.sections, currentTimePoint]
  );

  // Validate current section
  const validateSection = React.useCallback(
    (section: OasisSectionData): Map<string, string> => {
      const sectionErrors = new Map<string, string>();
      const visibleItems = getVisibleItems(section.items, responses, currentTimePoint);

      for (const item of visibleItems) {
        if (item.required) {
          const response = responses.get(item.code);
          if (!response || !hasValue(response)) {
            sectionErrors.set(item.code, "This field is required");
          }
        }

        // Additional validations can be added here
        if (item.validation && typeof item.validation === 'object') {
          const validation = item.validation as { pattern?: string; message?: string };
          const response = responses.get(item.code);
          if (response && validation.pattern) {
            const value = response.text ?? "";
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              sectionErrors.set(
                item.code,
                validation.message || "Invalid format"
              );
            }
          }
        }
      }

      return sectionErrors;
    },
    [responses, currentTimePoint]
  );

  // Validate all sections
  const validateAll = React.useCallback((): Map<string, string> => {
    const allErrors = new Map<string, string>();

    for (const section of visibleSections) {
      const sectionErrors = validateSection(section);
      sectionErrors.forEach((value, key) => {
        allErrors.set(key, value);
      });
    }

    return allErrors;
  }, [visibleSections, validateSection]);

  // Navigation
  const goToNextSection = () => {
    if (currentSectionIndex < visibleSections.length - 1) {
      // Validate current section before moving
      const sectionErrors = validateSection(currentSection);
      if (sectionErrors.size > 0) {
        setErrors((prev) => {
          const next = new Map(prev);
          sectionErrors.forEach((value, key) => {
            next.set(key, value);
          });
          return next;
        });
        return;
      }

      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToSection = (index: number) => {
    if (index >= 0 && index < visibleSections.length) {
      setCurrentSectionIndex(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(responses, true);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!onSubmit) return;

    // Validate all sections
    const allErrors = validateAll();
    if (allErrors.size > 0) {
      setErrors(allErrors);
      // Find first section with error
      for (let i = 0; i < visibleSections.length; i++) {
        const section = visibleSections[i];
        const hasError = section.items.some((item) => allErrors.has(item.code));
        if (hasError) {
          setCurrentSectionIndex(i);
          break;
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(responses);
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    let totalRequired = 0;
    let completedRequired = 0;

    for (const section of visibleSections) {
      const visibleItems = getVisibleItems(section.items, responses, currentTimePoint);
      for (const item of visibleItems) {
        if (item.required) {
          totalRequired++;
          const response = responses.get(item.code);
          if (response && hasValue(response)) {
            completedRequired++;
          }
        }
      }
    }

    return totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
  }, [visibleSections, responses, currentTimePoint]);

  if (mode === "all-sections") {
    return (
      <div className="space-y-6">
        {/* Progress header */}
        {showProgress && (
          <div className="sticky top-0 z-10 bg-background border-b p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">
                {template.name} - {currentTimePoint}
              </h2>
              <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                {lastSaved && (
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
            </div>
          </div>
        )}

        {/* All sections */}
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <OasisSectionRenderer
              key={section.code}
              section={section}
              responses={responses}
              onResponseChange={handleResponseChange}
              currentTimePoint={currentTimePoint}
              errors={errors}
              disabled={disabled}
              calculatedScores={calculatedScores}
              defaultExpanded={false}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={disabled || isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={disabled || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit for Review
          </Button>
        </div>
      </div>
    );
  }

  // Wizard mode
  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      {showProgress && (
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">
              {template.name} - {currentTimePoint}
            </h2>
            <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          {/* Section pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {visibleSections.map((section, index) => {
              const isActive = index === currentSectionIndex;
              const isCompleted = index < currentSectionIndex;

              return (
                <button
                  key={section.code}
                  onClick={() => goToSection(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
                    "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-success/10 text-success"
                      : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
                  )}
                >
                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                  <span className="font-medium">{section.code}</span>
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground-secondary">
              {Math.round(overallProgress)}%
            </span>
          </div>
        </div>
      )}

      {/* Current section */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentSection && (
          <OasisSectionRenderer
            section={currentSection}
            responses={responses}
            onResponseChange={handleResponseChange}
            currentTimePoint={currentTimePoint}
            errors={errors}
            disabled={disabled}
            calculatedScores={calculatedScores}
            defaultExpanded={true}
          />
        )}
      </div>

      {/* Navigation footer */}
      <div className="border-t p-4 flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={goToPreviousSection}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={disabled || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>

          {currentSectionIndex === visibleSections.length - 1 ? (
            <Button onClick={handleSubmit} disabled={disabled || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
          ) : (
            <Button onClick={goToNextSection}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to check if a response has a value
function hasValue(response: OasisResponseValue): boolean {
  if (response.text !== undefined && response.text !== "") return true;
  if (response.number !== undefined) return true;
  if (response.boolean !== undefined) return true;
  if (response.date !== undefined) return true;
  if (response.json !== undefined && response.json !== null) {
    if (Array.isArray(response.json)) return response.json.length > 0;
    if (typeof response.json === "object") return Object.keys(response.json).length > 0;
    return true;
  }
  return false;
}
