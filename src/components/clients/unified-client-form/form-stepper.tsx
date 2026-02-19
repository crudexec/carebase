"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
  expandedMode?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export function FormStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  expandedMode = false,
  onToggleExpand,
  className,
}: FormStepperProps) {
  const baseSteps = steps.slice(0, 3);
  const expandedSteps = steps.slice(3);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Steps */}
      <div className="flex items-center justify-between">
        {baseSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || step.id <= Math.max(...completedSteps, currentStep));

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 transition-colors",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-background-secondary text-foreground-secondary"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-foreground" : "text-foreground-secondary"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-foreground-tertiary hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {index < baseSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    completedSteps.includes(baseSteps[index + 1].id) || currentStep > step.id
                      ? "bg-success"
                      : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Expand/Collapse for Step 4 */}
      {expandedSteps.length > 0 && onToggleExpand && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={onToggleExpand}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors",
                expandedMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-foreground-secondary hover:bg-background-secondary"
              )}
            >
              {expandedMode ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Full Profile
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Add Full Profile Details
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Steps */}
      {expandedMode && expandedSteps.length > 0 && (
        <div className="flex items-center justify-center pt-2">
          {expandedSteps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = onStepClick && (isCompleted || step.id <= Math.max(...completedSteps, currentStep));

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 transition-colors",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-background-secondary text-foreground-secondary"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-foreground" : "text-foreground-secondary"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-foreground-tertiary hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact horizontal stepper for mobile
export function CompactStepper({
  steps,
  currentStep,
  completedSteps,
}: {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                isCompleted
                  ? "bg-success"
                  : isCurrent
                  ? "bg-primary w-6"
                  : "bg-border"
              )}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
