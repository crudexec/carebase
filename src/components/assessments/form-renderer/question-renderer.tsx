"use client";

import * as React from "react";
import {
  AssessmentItemData,
  ResponseValue,
  ChoiceOption,
} from "@/lib/assessments/types";
import { Input, Textarea, Label } from "@/components/ui";
import { cn } from "@/lib/utils";

interface QuestionRendererProps {
  item: AssessmentItemData;
  value: ResponseValue;
  onChange: (value: ResponseValue) => void;
  error?: string;
  disabled?: boolean;
}

export function QuestionRenderer({
  item,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={item.id}>
        {item.questionText}
        {item.required && <span className="text-error ml-1">*</span>}
      </Label>
      {item.description && (
        <p className="text-xs text-foreground-tertiary">{item.description}</p>
      )}

      {renderQuestionInput(item, value, onChange, error, disabled)}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function renderQuestionInput(
  item: AssessmentItemData,
  value: ResponseValue,
  onChange: (value: ResponseValue) => void,
  error?: string,
  disabled?: boolean
) {
  switch (item.responseType) {
    case "SCALE":
      return (
        <ScaleInput
          value={value as number | null}
          onChange={onChange}
          minValue={item.minValue ?? 0}
          maxValue={item.maxValue ?? 3}
          scoreMapping={item.scoreMapping}
          disabled={disabled}
          error={!!error}
        />
      );

    case "YES_NO":
      return (
        <YesNoInput
          value={value as boolean | null}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "SINGLE_CHOICE":
      return (
        <SingleChoiceInput
          options={item.responseOptions || []}
          value={(value as string) || ""}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceInput
          options={item.responseOptions || []}
          value={(value as string[]) || []}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "TEXT":
      return (
        <Textarea
          id={item.id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your response..."
          disabled={disabled}
          error={!!error}
          rows={3}
        />
      );

    case "DATE":
      return (
        <Input
          id={item.id}
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "NUMBER":
      return (
        <Input
          id={item.id}
          type="number"
          value={value !== null && value !== undefined ? String(value) : ""}
          onChange={(e) =>
            onChange(e.target.value ? parseFloat(e.target.value) : null)
          }
          min={item.minValue}
          max={item.maxValue}
          disabled={disabled}
          error={!!error}
        />
      );

    default:
      return <p className="text-foreground-tertiary">Unknown response type</p>;
  }
}

// Scale input component with visual indicators
function ScaleInput({
  value,
  onChange,
  minValue,
  maxValue,
  scoreMapping,
  disabled,
  error,
}: {
  value: number | null;
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  scoreMapping?: Record<string, number> | null;
  disabled?: boolean;
  error?: boolean;
}) {
  const options = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        error && "rounded-md ring-1 ring-error ring-offset-2 p-1"
      )}
    >
      {options.map((option) => {
        const isSelected = value === option;
        const score = scoreMapping?.[String(option)];

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] px-4 py-3 rounded-lg text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/50",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-lg font-bold">{option}</span>
            {score !== undefined && score !== option && (
              <span className="text-xs opacity-70">({score} pts)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Yes/No toggle component
function YesNoInput({
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
          "flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors",
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
          "flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors",
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

// Single choice component
function SingleChoiceInput({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: ChoiceOption[];
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
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/50",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSelected && (
              <svg
                className="w-3.5 h-3.5 mr-1.5 -ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {option.label}
            {option.score !== undefined && (
              <span className="ml-1 text-xs opacity-70">({option.score})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Multiple choice component
function MultipleChoiceInput({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: ChoiceOption[];
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
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-primary/50",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSelected && (
              <svg
                className="w-3.5 h-3.5 mr-1.5 -ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
