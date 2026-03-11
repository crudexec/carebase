"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calculator, CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { CalculatedScoreConfig, CalculatedScore } from "@/lib/oasis/types";

interface CalculatedScoreFieldProps {
  value: CalculatedScore | null;
  onChange?: (value: CalculatedScore) => void;
  config: CalculatedScoreConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  onRecalculate?: () => void;
}

export function CalculatedScoreField({
  value,
  onChange: _onChange,
  config,
  disabled,
  error,
  id,
  onRecalculate,
}: CalculatedScoreFieldProps) {
  const {
    displayFormat = "score_only",
    showSourceItems = false,
    showThresholds = true,
    autoCalculate = true,
    thresholds = [],
  } = config;

  const score = value?.value;
  const isComplete = value?.isComplete ?? false;
  const level = value?.level;
  const label = value?.label;
  const description = value?.description;
  const missingItems = value?.missingItems || [];

  // Get level color
  const getLevelStyles = () => {
    switch (level) {
      case "normal":
        return {
          bg: "bg-success/10",
          text: "text-success",
          border: "border-success",
          icon: CheckCircle2,
        };
      case "mild":
        return {
          bg: "bg-warning/10",
          text: "text-warning",
          border: "border-warning",
          icon: Info,
        };
      case "moderate":
        return {
          bg: "bg-orange-100",
          text: "text-orange-600",
          border: "border-orange-400",
          icon: AlertCircle,
        };
      case "severe":
        return {
          bg: "bg-error/10",
          text: "text-error",
          border: "border-error",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-background-secondary",
          text: "text-foreground",
          border: "border-border",
          icon: Calculator,
        };
    }
  };

  const styles = getLevelStyles();
  const LevelIcon = styles.icon;

  return (
    <div id={id} className="space-y-3">
      {/* Main score display */}
      <div
        className={cn(
          "rounded-lg border-2 p-4",
          error ? "border-error" : styles.border,
          styles.bg
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LevelIcon className={cn("h-6 w-6", styles.text)} />
            <div>
              {score !== null && score !== undefined ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-bold", styles.text)}>
                      {score}
                    </span>
                    {config.maxValue !== undefined && (
                      <span className="text-sm text-foreground-tertiary">
                        / {config.maxValue}
                      </span>
                    )}
                  </div>
                  {(displayFormat === "score_with_label" ||
                    displayFormat === "full") &&
                    label && (
                      <p className={cn("text-sm font-medium mt-0.5", styles.text)}>
                        {label}
                      </p>
                    )}
                </>
              ) : (
                <p className="text-foreground-tertiary text-sm">
                  {missingItems.length > 0
                    ? "Incomplete - waiting for more responses"
                    : "Not yet calculated"}
                </p>
              )}
            </div>
          </div>

          {/* Manual recalculate button if not auto */}
          {!autoCalculate && onRecalculate && (
            <button
              type="button"
              onClick={onRecalculate}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
                "bg-background border border-border hover:bg-background-secondary",
                "transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Calculator className="h-4 w-4" />
              Recalculate
            </button>
          )}
        </div>

        {/* Description */}
        {displayFormat === "full" && description && (
          <p className="text-sm text-foreground-secondary mt-2">{description}</p>
        )}

        {/* Missing items warning */}
        {!isComplete && missingItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-foreground-tertiary">
              Missing responses: {missingItems.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Thresholds legend */}
      {showThresholds && thresholds.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground-secondary">
            Score Interpretation:
          </p>
          <div className="flex flex-wrap gap-2">
            {thresholds.map((threshold) => (
              <div
                key={`${threshold.min}-${threshold.max}`}
                className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  score !== null &&
                    score !== undefined &&
                    score >= threshold.min &&
                    score <= threshold.max
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "bg-background border-border text-foreground-tertiary"
                )}
              >
                {threshold.min}-{threshold.max}: {threshold.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source items (for debugging/transparency) */}
      {showSourceItems && config.sourceItems && config.sourceItems.length > 0 && (
        <details className="text-xs">
          <summary className="text-foreground-tertiary cursor-pointer hover:text-foreground-secondary">
            Source items ({config.sourceItems.length})
          </summary>
          <div className="mt-1 p-2 bg-background-secondary rounded text-foreground-tertiary">
            {config.sourceItems.join(", ")}
          </div>
        </details>
      )}
    </div>
  );
}
