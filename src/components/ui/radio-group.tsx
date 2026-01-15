"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      error,
      disabled,
      className,
      orientation = "vertical",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          className
        )}
      >
        {options.map((option) => {
          const inputId = `${name}-${option.value}`;
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="radio"
                  id={inputId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={(e) => onChange?.(e.target.value)}
                  className={cn(
                    "peer h-4 w-4 shrink-0 appearance-none rounded-full border bg-white transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    error ? "border-error" : "border-border"
                  )}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute left-1 top-1 h-2 w-2 rounded-full bg-primary",
                    "opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
                  )}
                />
              </div>
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm text-foreground cursor-pointer select-none",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
