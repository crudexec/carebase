"use client";

import * as React from "react";
import {
  AssessmentSectionData,
  ResponseValue,
  AssessmentData,
  SECTION_TYPE_LABELS,
} from "@/lib/assessments/types";
import { QuestionRenderer } from "./question-renderer";
import { Badge } from "@/components/ui";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";

interface SectionRendererProps {
  section: AssessmentSectionData;
  values: AssessmentData;
  errors: Record<string, string>;
  onChange: (itemId: string, value: ResponseValue) => void;
  disabled?: boolean;
  collapsible?: boolean;
}

export function SectionRenderer({
  section,
  values,
  errors,
  onChange,
  disabled,
  collapsible = false,
}: SectionRendererProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Sort items by order
  const sortedItems = [...section.items].sort((a, b) => a.order - b.order);

  // Calculate section progress
  const answeredCount = sortedItems.filter((item) => {
    const value = values[item.id];
    return value !== null && value !== undefined && value !== "";
  }).length;
  const requiredCount = sortedItems.filter((item) => item.required).length;
  const answeredRequired = sortedItems.filter((item) => {
    if (!item.required) return true;
    const value = values[item.id];
    return value !== null && value !== undefined && value !== "";
  }).length;

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Section header */}
      <div
        className={`px-4 py-3 bg-background-secondary border-b border-border ${
          collapsible ? "cursor-pointer" : ""
        }`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {collapsible && (
              <button type="button" className="text-foreground-secondary">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{section.title}</h3>
                <Badge variant="default" className="text-xs">
                  {SECTION_TYPE_LABELS[section.sectionType]}
                </Badge>
              </div>
              {section.description && (
                <p className="text-sm text-foreground-secondary mt-0.5">
                  {section.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-sm text-foreground-tertiary">
            {answeredCount}/{sortedItems.length} answered
            {requiredCount > 0 && answeredRequired < requiredCount && (
              <span className="text-warning ml-2">
                ({requiredCount - answeredRequired} required left)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section instructions */}
      {section.instructions && !isCollapsed && (
        <div className="px-4 py-3 bg-info/5 border-b border-info/20">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <p className="text-sm text-info">{section.instructions}</p>
          </div>
        </div>
      )}

      {/* Section items */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {sortedItems.map((item) => (
            <QuestionRenderer
              key={item.id}
              item={item}
              value={values[item.id] ?? null}
              onChange={(value) => onChange(item.id, value)}
              error={errors[item.id]}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
