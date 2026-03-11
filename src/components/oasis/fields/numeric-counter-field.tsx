"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import type { NumericCounterConfig } from "@/lib/oasis/types";

interface NumericCounterFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  config: NumericCounterConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function NumericCounterField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: NumericCounterFieldProps) {
  const {
    min = 0,
    max = 99,
    step = 1,
    showButtons = true,
    allowNA = false,
    naValue = "NA",
    naLabel = "Not Applicable",
    displayFormat = "number",
    unit,
  } = config;

  const [isNA, setIsNA] = React.useState(false);
  const currentValue = value ?? min;

  const handleIncrement = () => {
    if (disabled || isNA) return;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    if (disabled || isNA) return;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(null);
      return;
    }
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      onChange(clampedValue);
    }
  };

  const handleNAToggle = () => {
    if (isNA) {
      setIsNA(false);
      onChange(min);
    } else {
      setIsNA(true);
      onChange(null);
    }
  };

  const formatValue = (val: number): string => {
    if (displayFormat === "padded") {
      return String(val).padStart(2, "0");
    }
    return String(val);
  };

  return (
    <div id={id} className="space-y-3">
      {/* NA toggle if allowed */}
      {allowNA && (
        <button
          type="button"
          onClick={handleNAToggle}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            isNA
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {naLabel}
        </button>
      )}

      {/* Counter control */}
      <div
        className={cn(
          "flex items-center gap-1",
          isNA && "opacity-50 pointer-events-none"
        )}
      >
        {showButtons && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || currentValue <= min || isNA}
            className={cn(
              "p-2 rounded-md border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "hover:bg-background-secondary",
              error ? "border-error" : "border-border",
              (disabled || currentValue <= min) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Minus className="h-5 w-5" />
          </button>
        )}

        <div className="relative">
          <input
            type="number"
            value={isNA ? "" : (value ?? "")}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled || isNA}
            className={cn(
              "w-20 rounded-md border bg-background px-3 py-2 text-center text-lg font-semibold",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              error ? "border-error" : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            placeholder={isNA ? String(naValue) : "0"}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground-tertiary">
              {unit}
            </span>
          )}
        </div>

        {showButtons && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || currentValue >= max || isNA}
            className={cn(
              "p-2 rounded-md border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "hover:bg-background-secondary",
              error ? "border-error" : "border-border",
              (disabled || currentValue >= max) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Range indicator */}
      <p className="text-xs text-foreground-tertiary">
        Range: {min} - {max}
        {step !== 1 && ` (step: ${step})`}
      </p>

      {/* Quick select buttons for common values */}
      {max <= 10 && max - min <= 10 && (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              disabled={disabled || isNA}
              className={cn(
                "min-w-[36px] h-9 rounded-md border text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                value === num
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50",
                (disabled || isNA) && "opacity-50 cursor-not-allowed"
              )}
            >
              {formatValue(num)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
