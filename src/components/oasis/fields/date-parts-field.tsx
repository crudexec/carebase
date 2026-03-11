"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { DatePartsConfig } from "@/lib/oasis/types";

interface DatePartsValue {
  month: number | null;
  day: number | null;
  year: number | null;
  isNA?: boolean;
  isUnknown?: boolean;
}

interface DatePartsFieldProps {
  value: DatePartsValue | null;
  onChange: (value: DatePartsValue | null) => void;
  config: DatePartsConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function DatePartsField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: DatePartsFieldProps) {
  const {
    allowNA = false,
    allowUnknown = false,
    minYear,
    maxYear,
    naLabel = "Not Applicable",
    unknownLabel = "Unknown",
  } = config;

  const currentYear = new Date().getFullYear();
  const yearMin = minYear ?? currentYear - 120;
  const yearMax = maxYear ?? currentYear + 1;

  const handlePartChange = (
    part: "month" | "day" | "year",
    partValue: number | null
  ) => {
    const newValue: DatePartsValue = {
      month: value?.month ?? null,
      day: value?.day ?? null,
      year: value?.year ?? null,
      isNA: false,
      isUnknown: false,
    };
    newValue[part] = partValue;
    onChange(newValue);
  };

  const handleSpecialValue = (type: "na" | "unknown") => {
    if (type === "na") {
      onChange({
        month: null,
        day: null,
        year: null,
        isNA: true,
        isUnknown: false,
      });
    } else {
      onChange({
        month: null,
        day: null,
        year: null,
        isNA: false,
        isUnknown: true,
      });
    }
  };

  const clearSpecialValue = () => {
    onChange({
      month: null,
      day: null,
      year: null,
      isNA: false,
      isUnknown: false,
    });
  };

  const isNA = value?.isNA === true;
  const isUnknown = value?.isUnknown === true;
  const hasSpecialValue = isNA || isUnknown;

  // Generate month options
  const months = [
    { value: 1, label: "01 - January" },
    { value: 2, label: "02 - February" },
    { value: 3, label: "03 - March" },
    { value: 4, label: "04 - April" },
    { value: 5, label: "05 - May" },
    { value: 6, label: "06 - June" },
    { value: 7, label: "07 - July" },
    { value: 8, label: "08 - August" },
    { value: 9, label: "09 - September" },
    { value: 10, label: "10 - October" },
    { value: 11, label: "11 - November" },
    { value: 12, label: "12 - December" },
  ];

  // Generate day options
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, "0"),
  }));

  // Generate year options
  const years = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => ({
    value: yearMax - i,
    label: String(yearMax - i),
  }));

  return (
    <div id={id} className="space-y-3">
      {/* Special value buttons */}
      {(allowNA || allowUnknown) && (
        <div className="flex gap-2">
          {allowNA && (
            <button
              type="button"
              onClick={() => (isNA ? clearSpecialValue() : handleSpecialValue("na"))}
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
          {allowUnknown && (
            <button
              type="button"
              onClick={() =>
                isUnknown ? clearSpecialValue() : handleSpecialValue("unknown")
              }
              disabled={disabled}
              className={cn(
                "px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isUnknown
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {unknownLabel}
            </button>
          )}
        </div>
      )}

      {/* Date inputs */}
      <div
        className={cn(
          "flex gap-2 items-center",
          hasSpecialValue && "opacity-50 pointer-events-none"
        )}
      >
        {/* Month */}
        <div className="flex flex-col">
          <label className="text-xs text-foreground-tertiary mb-1">Month</label>
          <select
            value={value?.month?.toString() ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              handlePartChange("month", val === "" ? null : Number(val));
            }}
            disabled={disabled || hasSpecialValue}
            className={cn(
              "rounded-md border bg-background px-2 py-2 text-sm w-36",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              error ? "border-error" : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">MM</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-foreground-tertiary mt-5">/</span>

        {/* Day */}
        <div className="flex flex-col">
          <label className="text-xs text-foreground-tertiary mb-1">Day</label>
          <select
            value={value?.day?.toString() ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              handlePartChange("day", val === "" ? null : Number(val));
            }}
            disabled={disabled || hasSpecialValue}
            className={cn(
              "rounded-md border bg-background px-2 py-2 text-sm w-20",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              error ? "border-error" : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">DD</option>
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-foreground-tertiary mt-5">/</span>

        {/* Year */}
        <div className="flex flex-col">
          <label className="text-xs text-foreground-tertiary mb-1">Year</label>
          <select
            value={value?.year?.toString() ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              handlePartChange("year", val === "" ? null : Number(val));
            }}
            disabled={disabled || hasSpecialValue}
            className={cn(
              "rounded-md border bg-background px-2 py-2 text-sm w-24",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              error ? "border-error" : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">YYYY</option>
            {years.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display formatted date */}
      {value && !hasSpecialValue && value.month && value.day && value.year && (
        <p className="text-sm text-foreground-tertiary">
          Entered: {String(value.month).padStart(2, "0")}/
          {String(value.day).padStart(2, "0")}/{value.year}
        </p>
      )}
    </div>
  );
}
