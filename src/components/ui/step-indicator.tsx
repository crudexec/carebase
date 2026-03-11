"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  /** Use compact inline variant */
  variant?: "default" | "inline";
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  className,
  variant = "default",
}: StepIndicatorProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isCompleted && "bg-success/10 text-success hover:bg-success/15",
                  isCurrent && "bg-primary text-white shadow-sm",
                  !isCompleted && !isCurrent && "text-foreground-tertiary",
                  isClickable && !isCurrent && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                    isCompleted && "bg-success text-white",
                    isCurrent && "bg-white/20",
                    !isCompleted && !isCurrent && "bg-foreground-tertiary/20"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-6 h-px transition-colors",
                    index < currentStep ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted && "border-success bg-success text-white",
                    isCurrent && "border-primary bg-primary text-white",
                    !isCompleted && !isCurrent && "border-border bg-background text-foreground-tertiary",
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-default"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent && "text-primary",
                    isCompleted && "text-success",
                    !isCompleted && !isCurrent && "text-foreground-tertiary"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors",
                      index < currentStep ? "bg-success" : "bg-border"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
