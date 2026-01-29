"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AssessmentItem {
  id: string;
  code: string;
  question: string;  // Database field name
  label?: string;    // Legacy field name
  description: string | null;
  responseType: string;
  responseOptions: unknown;  // Database field name
  options?: unknown;         // Legacy field name
  minValue: number | null;
  maxValue: number | null;
  isRequired: boolean;
  displayOrder: number;
}

interface AssessmentSection {
  id: string;
  title: string;     // Database field name
  name?: string;     // Legacy field name
  description: string | null;
  sectionType: string;
  displayOrder: number;
  items: AssessmentItem[];
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
  code?: string;
  maxScore: number | null;
  sections: AssessmentSection[];
}

interface AssessmentResponse {
  itemId: string;
  numericValue: number | null;
  textValue: string | null;
  notes: string | null;
}

interface AssessmentRendererProps {
  template: AssessmentTemplate;
  responses: AssessmentResponse[];
  isReadOnly?: boolean;
  onResponseChange?: (itemId: string, value: string | number, notes?: string) => void;
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  isSaving?: boolean;
  isCompleting?: boolean;
}

export function AssessmentRenderer({
  template,
  responses,
  isReadOnly = false,
  onResponseChange,
  onSave,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: AssessmentRendererProps) {
  const [currentSection, setCurrentSection] = React.useState(0);

  // Safely get sections array (handle undefined/null)
  const sections = template.sections || [];

  // Get response value for an item
  const getResponseValue = (itemId: string): string | number => {
    const response = responses.find((r) => r.itemId === itemId);
    if (!response) return "";
    return response.numericValue ?? response.textValue ?? "";
  };

  // Check if section has all required responses
  const isSectionComplete = (section: AssessmentSection): boolean => {
    const items = section.items || [];
    const requiredItems = items.filter((i) => i.isRequired);
    return requiredItems.every((item) => {
      const value = getResponseValue(item.id);
      return value !== "" && value !== null && value !== undefined;
    });
  };

  // Calculate overall progress
  const totalRequired = sections.flatMap((s) =>
    (s.items || []).filter((i) => i.isRequired)
  ).length;
  const completedRequired = sections.flatMap((s) =>
    (s.items || []).filter((i) => i.isRequired && getResponseValue(i.id) !== "")
  ).length;
  const progressPercent = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  // Get display label for item (supports both question and legacy label field)
  const getItemLabel = (item: AssessmentItem): string => {
    return item.question || item.label || "";
  };

  // Get section name (supports both title and legacy name field)
  const getSectionName = (section: AssessmentSection): string => {
    return section.title || section.name || "";
  };

  // Render item based on response type
  const renderItem = (item: AssessmentItem) => {
    const value = getResponseValue(item.id);
    const options = (item.responseOptions || item.options) as { value: number | string; label: string }[] | null;

    switch (item.responseType) {
      case "SCALE":
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {options?.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    value === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <span className="font-medium">{opt.value}</span>
                  <span className="ml-2 text-xs opacity-80">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "YES_NO":
        return (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => onResponseChange?.(item.id, 1)}
              className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
                value === 1
                  ? "bg-success text-success-foreground border-success"
                  : "bg-background border-border hover:border-success/50"
              } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => onResponseChange?.(item.id, 0)}
              className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
                value === 0
                  ? "bg-error text-error-foreground border-error"
                  : "bg-background border-border hover:border-error/50"
              } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
            >
              No
            </button>
          </div>
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            min={item.minValue ?? undefined}
            max={item.maxValue ?? undefined}
            value={value}
            onChange={(e) => onResponseChange?.(item.id, parseFloat(e.target.value) || 0)}
            disabled={isReadOnly}
            className="max-w-[200px]"
          />
        );

      case "TEXT":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            rows={3}
            placeholder="Enter response..."
          />
        );

      case "MULTI_SELECT":
        return (
          <div className="flex flex-wrap gap-2">
            {options?.map((opt) => {
              const selected = typeof value === "string" && value.includes(String(opt.value));
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    const current = typeof value === "string" ? value.split(",").filter(Boolean) : [];
                    const newValue = selected
                      ? current.filter((v) => v !== String(opt.value))
                      : [...current, String(opt.value)];
                    onResponseChange?.(item.id, newValue.join(","));
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case "CLOCK_DRAWING":
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground-secondary">
              Instruct the patient to draw a clock showing 11:10. Score based on the criteria below.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 0, label: "Unable to draw or major errors" },
                { value: 1, label: "Minor errors" },
                { value: 2, label: "Perfect clock" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    value === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {opt.value} - {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
          />
        );
    }
  };

  const currentSectionData = sections[currentSection];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{template.name}</span>
          <span className="text-foreground-secondary">
            {completedRequired} / {totalRequired} required items completed
          </span>
        </div>
        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 flex-wrap">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setCurrentSection(index)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              currentSection === index
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary/50"
            }`}
          >
            {isSectionComplete(section) ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <span className="h-4 w-4 rounded-full border-2 border-current" />
            )}
            {getSectionName(section)}
          </button>
        ))}
      </div>

      {/* No sections message */}
      {sections.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-foreground-secondary">
              This assessment template has no sections configured.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      {currentSectionData && (
        <Card>
          <CardHeader>
            <CardTitle>{getSectionName(currentSectionData)}</CardTitle>
            {currentSectionData.description && (
              <CardDescription>{currentSectionData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {(currentSectionData.items || []).map((item) => (
              <div key={item.id} className="space-y-3 pb-6 border-b last:border-b-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <Label className="text-base font-medium">
                    {getItemLabel(item)}
                    {item.isRequired && <span className="text-error ml-1">*</span>}
                  </Label>
                </div>
                {item.description && (
                  <p className="text-sm text-foreground-secondary">{item.description}</p>
                )}
                {renderItem(item)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))}
            disabled={currentSection === sections.length - 1}
          >
            Next
          </Button>
        </div>

        {!isReadOnly && (
          <div className="flex gap-2">
            {onSave && (
              <Button variant="secondary" onClick={onSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Progress"
                )}
              </Button>
            )}
            {onComplete && (
              <Button
                onClick={onComplete}
                disabled={isCompleting || progressPercent < 100}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Completion Warning */}
      {!isReadOnly && progressPercent < 100 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>
            Please complete all required items before submitting the assessment.
          </span>
        </div>
      )}
    </div>
  );
}
