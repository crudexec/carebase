"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CodeEntryConfig, ResponseOption } from "@/lib/oasis/types";

interface CodeEntryFieldProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  config: CodeEntryConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function CodeEntryField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: CodeEntryFieldProps) {
  const {
    codeLength = 1,
    inputType = "numeric",
    showAsDropdown = true,
    options = [],
    allowNA = false,
    allowUK = false,
    naLabel = "NA",
    ukLabel = "UK",
  } = config;

  // Build complete options list including special values
  const allOptions: ResponseOption[] = [
    ...options,
    ...(allowNA ? [{ value: "NA", code: "NA", label: naLabel }] : []),
    ...(allowUK ? [{ value: "UK", code: "UK", label: ukLabel }] : []),
  ];

  // Render as dropdown if configured or has many options
  if (showAsDropdown && allOptions.length > 0) {
    return (
      <select
        id={id}
        value={value?.toString() ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onChange(null);
          } else if (inputType === "numeric" && !isNaN(Number(val))) {
            onChange(Number(val));
          } else {
            onChange(val);
          }
        }}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          error ? "border-error" : "border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <option value="">Select...</option>
        {allOptions.map((opt) => (
          <option key={opt.code} value={opt.value}>
            {opt.code} - {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // Render as button group for small option sets
  if (allOptions.length <= 7 && allOptions.length > 0) {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-2",
          error && "rounded-md ring-1 ring-error ring-offset-2 p-1"
        )}
      >
        {allOptions.map((opt) => {
          const isSelected = value?.toString() === opt.value;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                if (inputType === "numeric" && !isNaN(Number(opt.value))) {
                  onChange(Number(opt.value));
                } else {
                  onChange(opt.value);
                }
              }}
              disabled={disabled}
              className={cn(
                "min-w-[48px] rounded-md border px-3 py-2 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={opt.label}
            >
              {opt.code}
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback to input field
  return (
    <input
      id={id}
      type={inputType === "numeric" ? "number" : "text"}
      value={value?.toString() ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "") {
          onChange(null);
        } else if (inputType === "numeric" && !isNaN(Number(val))) {
          onChange(Number(val));
        } else {
          onChange(val);
        }
      }}
      maxLength={codeLength}
      disabled={disabled}
      className={cn(
        "w-20 rounded-md border bg-background px-3 py-2 text-sm text-center",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        error ? "border-error" : "border-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    />
  );
}
