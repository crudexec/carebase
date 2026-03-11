"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label, Input, Textarea, DateInput } from "@/components/ui";
import type {
  OasisItemData,
  OasisResponseValue,
  CodeEntryConfig,
  MatrixGridConfig,
  DatePartsConfig,
  HierarchicalCheckboxConfig,
  CalculatedScoreConfig,
  NumericCounterConfig,
  StructuredIdConfig,
  MultiDiagnosisConfig,
  CalculatedScore,
} from "@/lib/oasis/types";
import {
  CodeEntryField,
  MatrixGridField,
  DatePartsField,
  HierarchicalCheckboxField,
  CalculatedScoreField,
  NumericCounterField,
  StructuredIdField,
  MultiDiagnosisField,
} from "./fields";

interface OasisFieldRendererProps {
  item: OasisItemData;
  value: OasisResponseValue | null;
  onChange: (value: OasisResponseValue) => void;
  error?: string;
  disabled?: boolean;
  isHidden?: boolean;
  calculatedScore?: CalculatedScore | null;
  onRecalculate?: () => void;
}

export function OasisFieldRenderer({
  item,
  value,
  onChange,
  error,
  disabled,
  isHidden,
  calculatedScore,
  onRecalculate,
}: OasisFieldRendererProps) {
  if (isHidden) {
    return null;
  }

  const handleChange = (fieldValue: unknown) => {
    // Convert field value to OasisResponseValue format
    if (fieldValue === null || fieldValue === undefined) {
      onChange({});
      return;
    }

    if (typeof fieldValue === "string") {
      onChange({ text: fieldValue });
    } else if (typeof fieldValue === "number") {
      onChange({ number: fieldValue });
    } else if (typeof fieldValue === "boolean") {
      onChange({ boolean: fieldValue });
    } else if (fieldValue instanceof Date) {
      onChange({ date: fieldValue });
    } else {
      onChange({ json: fieldValue as Record<string, unknown> | unknown[] });
    }
  };

  return (
    <div
      className={cn(
        "space-y-2 p-4 rounded-lg border",
        error ? "border-error bg-error/5" : "border-border",
        disabled && "opacity-60"
      )}
    >
      {/* Item header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor={item.code} className="flex items-center gap-2">
            <span className="font-mono text-primary font-semibold">
              {item.code}
            </span>
            <span>{item.label}</span>
            {item.required && <span className="text-error ml-1">*</span>}
          </Label>
          {item.description && (
            <p className="text-xs text-foreground-tertiary mt-1">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Help text / instructions */}
      {item.helpText && (
        <div className="text-sm text-foreground-secondary bg-background-secondary p-2 rounded">
          {item.helpText}
        </div>
      )}

      {/* Field input */}
      <div className="mt-3">
        {renderFieldInput(
          item,
          value,
          handleChange,
          error,
          disabled,
          calculatedScore,
          onRecalculate
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  );
}

function renderFieldInput(
  item: OasisItemData,
  value: OasisResponseValue | null,
  onChange: (value: unknown) => void,
  error?: string,
  disabled?: boolean,
  calculatedScore?: CalculatedScore | null,
  onRecalculate?: () => void
) {
  const config = item.config;
  const fieldType = item.fieldType;

  switch (fieldType) {
    case "CODE_ENTRY":
      return (
        <CodeEntryField
          id={item.code}
          value={value?.text ?? value?.number ?? null}
          onChange={onChange}
          config={config as CodeEntryConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "MATRIX_GRID":
      return (
        <MatrixGridField
          id={item.code}
          value={(value?.json as Record<string, Record<string, string | number | null>>) ?? null}
          onChange={(v) => onChange(v)}
          config={config as MatrixGridConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "DATE_PARTS":
      return (
        <DatePartsField
          id={item.code}
          value={(value?.json as { month: number | null; day: number | null; year: number | null; isNA?: boolean; isUnknown?: boolean }) ?? null}
          onChange={(v) => onChange(v)}
          config={config as DatePartsConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "HIERARCHICAL_CHECKBOX":
      return (
        <HierarchicalCheckboxField
          id={item.code}
          value={(value?.json as string[]) ?? null}
          onChange={(v) => onChange(v)}
          config={config as HierarchicalCheckboxConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "CALCULATED_SCORE":
      return (
        <CalculatedScoreField
          id={item.code}
          value={calculatedScore ?? null}
          config={config as CalculatedScoreConfig}
          disabled={disabled}
          error={!!error}
          onRecalculate={onRecalculate}
        />
      );

    case "NUMERIC_COUNTER":
      return (
        <NumericCounterField
          id={item.code}
          value={value?.number ?? null}
          onChange={onChange}
          config={config as NumericCounterConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "STRUCTURED_ID":
      return (
        <StructuredIdField
          id={item.code}
          value={value?.text ?? null}
          onChange={onChange}
          config={config as StructuredIdConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    case "MULTI_DIAGNOSIS":
      return (
        <MultiDiagnosisField
          id={item.code}
          value={(value?.json as Array<{ code: string; description: string; isPrimary?: boolean; sequence?: number }>) ?? null}
          onChange={(v) => onChange(v)}
          config={config as MultiDiagnosisConfig}
          disabled={disabled}
          error={!!error}
        />
      );

    // Standard field types
    case "TEXT_SHORT":
      return (
        <Input
          id={item.code}
          value={value?.text ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "TEXT_LONG":
      return (
        <Textarea
          id={item.code}
          value={value?.text ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
          rows={4}
        />
      );

    case "NUMBER":
      return (
        <Input
          id={item.code}
          type="number"
          value={value?.number !== undefined ? String(value.number) : ""}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "YES_NO":
      return (
        <YesNoField
          value={value?.boolean ?? null}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "SINGLE_CHOICE": {
      const singleOptions = (config as { options?: Array<{ value: string; label: string }> })?.options ?? [];
      return (
        <SingleChoiceField
          options={singleOptions}
          value={value?.text ?? ""}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          error={!!error}
        />
      );
    }

    case "MULTIPLE_CHOICE": {
      const multiOptions = (config as { options?: Array<{ value: string; label: string }> })?.options ?? [];
      return (
        <MultipleChoiceField
          options={multiOptions}
          value={(value?.json as string[]) ?? []}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          error={!!error}
        />
      );
    }

    case "DATE": {
      const dateValue = value?.date;
      const dateString = dateValue instanceof Date
        ? dateValue.toISOString().split("T")[0]
        : typeof dateValue === 'string'
          ? dateValue.split("T")[0]
          : value?.text ?? "";
      return (
        <DateInput
          id={item.code}
          value={dateString}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );
    }

    case "TIME":
      return (
        <Input
          id={item.code}
          type="time"
          value={value?.text ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "DATETIME":
      return (
        <Input
          id={item.code}
          type="datetime-local"
          value={value?.text ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    default:
      return (
        <p className="text-foreground-tertiary text-sm">
          Unknown field type: {fieldType}
        </p>
      );
  }
}

// Helper components

function YesNoField({
  value,
  onChange,
  disabled,
  error,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2",
        error && "rounded-md ring-1 ring-error ring-offset-2"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        disabled={disabled}
        className={cn(
          "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
          value === true
            ? "border-success bg-success/10 text-success"
            : "border-border hover:border-success/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        disabled={disabled}
        className={cn(
          "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
          value === false
            ? "border-error bg-error/10 text-error"
            : "border-border hover:border-error/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        No
      </button>
    </div>
  );
}

function SingleChoiceField({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        error && "rounded-md ring-1 ring-error ring-offset-2 p-1"
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/50",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MultipleChoiceField({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        error && "rounded-md ring-1 ring-error ring-offset-2 p-1"
      )}
    >
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/50",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
