"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type {
  OasisSectionData,
  OasisResponseValue,
  OasisTimePoint,
  CalculatedScore,
} from "@/lib/oasis/types";
import { OasisFieldRenderer } from "./oasis-field-renderer";
import { getVisibleItems } from "@/lib/oasis/skip-logic";

interface OasisSectionRendererProps {
  section: OasisSectionData;
  responses: Map<string, OasisResponseValue>;
  onResponseChange: (itemCode: string, value: OasisResponseValue) => void;
  currentTimePoint: OasisTimePoint;
  errors?: Map<string, string>;
  disabled?: boolean;
  calculatedScores?: Map<string, CalculatedScore>;
  onRecalculate?: (itemCode: string) => void;
  defaultExpanded?: boolean;
}

export function OasisSectionRenderer({
  section,
  responses,
  onResponseChange,
  currentTimePoint,
  errors,
  disabled,
  calculatedScores,
  onRecalculate,
  defaultExpanded = true,
}: OasisSectionRendererProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Get visible items for this section based on skip logic
  const visibleItems = React.useMemo(() => {
    return getVisibleItems(section.items, responses, currentTimePoint);
  }, [section.items, responses, currentTimePoint]);

  // Calculate section completion status
  const sectionStatus = React.useMemo(() => {
    const requiredItems = visibleItems.filter((item) => item.required);
    const completedRequired = requiredItems.filter((item) => {
      const response = responses.get(item.code);
      return response && hasValue(response);
    });

    const hasErrors = visibleItems.some((item) => errors?.has(item.code));
    const isComplete = completedRequired.length === requiredItems.length;

    return {
      total: visibleItems.length,
      completed: completedRequired.length,
      required: requiredItems.length,
      isComplete,
      hasErrors,
      progress: requiredItems.length > 0 ? (completedRequired.length / requiredItems.length) * 100 : 100,
    };
  }, [visibleItems, responses, errors]);

  // Determine status icon and color
  const getStatusIndicator = () => {
    if (sectionStatus.hasErrors) {
      return {
        icon: AlertCircle,
        color: "text-error",
        bgColor: "bg-error/10",
      };
    }
    if (sectionStatus.isComplete) {
      return {
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success/10",
      };
    }
    return {
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    };
  };

  const statusIndicator = getStatusIndicator();
  const StatusIcon = statusIndicator.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "bg-background-secondary hover:bg-background-tertiary transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50"
        )}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-foreground-tertiary" />
          ) : (
            <ChevronRight className="h-5 w-5 text-foreground-tertiary" />
          )}

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary">
                Section {section.code}
              </span>
              <span className="font-semibold">{section.label}</span>
            </div>
            {section.description && (
              <p className="text-sm text-foreground-tertiary mt-0.5">
                {section.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  sectionStatus.hasErrors
                    ? "bg-error"
                    : sectionStatus.isComplete
                    ? "bg-success"
                    : "bg-warning"
                )}
                style={{ width: `${sectionStatus.progress}%` }}
              />
            </div>
            <span className="text-xs text-foreground-tertiary whitespace-nowrap">
              {sectionStatus.completed}/{sectionStatus.required}
            </span>
          </div>

          {/* Status icon */}
          <div className={cn("p-1.5 rounded-full", statusIndicator.bgColor)}>
            <StatusIcon className={cn("h-4 w-4", statusIndicator.color)} />
          </div>
        </div>
      </button>

      {/* Section content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t">
          {visibleItems.length === 0 ? (
            <p className="text-center text-foreground-tertiary py-8">
              No items to display for this section at the current time point.
            </p>
          ) : (
            visibleItems.map((item) => (
              <OasisFieldRenderer
                key={item.code}
                item={item}
                value={responses.get(item.code) ?? null}
                onChange={(value) => onResponseChange(item.code, value)}
                error={errors?.get(item.code)}
                disabled={disabled}
                calculatedScore={calculatedScores?.get(item.code)}
                onRecalculate={onRecalculate ? () => onRecalculate(item.code) : undefined}
              />
            ))
          )}
        </div>
      )}
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
