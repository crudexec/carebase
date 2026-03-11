"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";
import type { StructuredIdConfig } from "@/lib/oasis/types";

interface StructuredIdFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  config: StructuredIdConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function StructuredIdField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: StructuredIdFieldProps) {
  const {
    format,
    segments = [],
    separator = "",
    validation,
    placeholder,
    mask,
    allowNA = false,
    naLabel = "Not Applicable",
  } = config;

  const [isNA, setIsNA] = React.useState(false);
  const [segmentValues, setSegmentValues] = React.useState<string[]>(() => {
    if (!value) return segments.map(() => "");
    if (segments.length === 0) return [value];
    // Split the value by separator
    return value.split(separator);
  });
  const [validationStatus, setValidationStatus] = React.useState<
    "idle" | "valid" | "invalid"
  >("idle");

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Validate the combined value
  React.useEffect(() => {
    if (!value || isNA) {
      setValidationStatus("idle");
      return;
    }

    const validationPattern = typeof validation === 'string' ? validation : validation?.pattern;
    if (validationPattern) {
      try {
        const regex = new RegExp(validationPattern);
        setValidationStatus(regex.test(value) ? "valid" : "invalid");
      } catch {
        setValidationStatus("idle");
      }
    } else {
      setValidationStatus("idle");
    }
  }, [value, validation, isNA]);

  const handleSegmentChange = (index: number, segmentValue: string) => {
    const segment = segments[index];
    const newValues = [...segmentValues];

    // Apply segment-specific constraints
    if (segment) {
      // Filter by allowed characters
      if (segment.type === "numeric") {
        segmentValue = segmentValue.replace(/[^0-9]/g, "");
      } else if (segment.type === "alpha") {
        segmentValue = segmentValue.replace(/[^a-zA-Z]/g, "").toUpperCase();
      } else if (segment.type === "alphanumeric") {
        segmentValue = segmentValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      }

      // Limit length
      if (segment.length) {
        segmentValue = segmentValue.slice(0, segment.length);
      }

      // Auto-advance to next segment when filled
      if (segment.length && segmentValue.length === segment.length && index < segments.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    newValues[index] = segmentValue;
    setSegmentValues(newValues);

    // Combine and emit
    const combined = newValues.join(separator);
    onChange(combined || null);
  };

  const handleSingleInputChange = (inputValue: string) => {
    // Apply mask formatting if configured
    let formatted = inputValue;

    // Common formatting patterns
    if (format === "NPI" || (segments.length === 1 && segments[0]?.type === "numeric")) {
      formatted = inputValue.replace(/[^0-9]/g, "");
    } else if (format === "SSN") {
      formatted = inputValue.replace(/[^0-9]/g, "");
      if (formatted.length > 9) formatted = formatted.slice(0, 9);
    } else if (format === "MEDICARE") {
      formatted = inputValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (formatted.length > 11) formatted = formatted.slice(0, 11);
    }

    setSegmentValues([formatted]);
    onChange(formatted || null);
  };

  const handleNAToggle = () => {
    if (isNA) {
      setIsNA(false);
      onChange(null);
    } else {
      setIsNA(true);
      setSegmentValues(segments.map(() => ""));
      onChange(null);
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case "valid":
        return <Check className="h-4 w-4 text-success" />;
      case "invalid":
        return <X className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  // Render segmented input
  if (segments.length > 1) {
    return (
      <div id={id} className="space-y-3">
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

        <div
          className={cn(
            "flex items-center gap-1",
            isNA && "opacity-50 pointer-events-none"
          )}
        >
          {segments.map((segment, index) => (
            <React.Fragment key={index}>
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={segmentValues[index] || ""}
                onChange={(e) => handleSegmentChange(index, e.target.value)}
                placeholder={segment.placeholder || ""}
                maxLength={segment.length}
                disabled={disabled || isNA}
                className={cn(
                  "rounded-md border bg-background px-2 py-2 text-center font-mono text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  error ? "border-error" : "border-border",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ width: `${(segment.length || 4) * 12 + 16}px` }}
              />
              {index < segments.length - 1 && separator && (
                <span className="text-foreground-tertiary font-mono">
                  {separator}
                </span>
              )}
            </React.Fragment>
          ))}

          {getStatusIcon()}
        </div>

        {/* Format hint */}
        <p className="text-xs text-foreground-tertiary">
          Format: {segments.map((s) => s.placeholder || "X".repeat(s.length || 1)).join(separator)}
        </p>
      </div>
    );
  }

  // Render single input
  return (
    <div id={id} className="space-y-3">
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

      <div
        className={cn(
          "relative",
          isNA && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="text"
          value={isNA ? "" : (value || "")}
          onChange={(e) => handleSingleInputChange(e.target.value)}
          placeholder={isNA ? "N/A" : (placeholder || mask || "")}
          disabled={disabled || isNA}
          className={cn(
            "w-full rounded-md border bg-background px-3 py-2 font-mono text-sm pr-8",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            error ? "border-error" : "border-border",
            validationStatus === "valid" && "border-success",
            validationStatus === "invalid" && "border-error",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Validation feedback */}
      {validationStatus === "invalid" && (
        <div className="flex items-center gap-1 text-xs text-error">
          <AlertCircle className="h-3 w-3" />
          Invalid format
        </div>
      )}

      {/* Format hint */}
      {(format || placeholder || mask) && (
        <p className="text-xs text-foreground-tertiary">
          {format ? `Format: ${format}` : placeholder || mask}
        </p>
      )}
    </div>
  );
}
