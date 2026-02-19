"use client";

import * as React from "react";
import {
  AssessmentItemData,
  ResponseValue,
  ChoiceOption,
  ICD10DiagnosisValue,
  ListItemValue,
  RepeaterItemValue,
  ListResponseConfig,
  RepeaterResponseConfig,
} from "@/lib/assessments/types";
import { Input, DateInput, Textarea, Label, Button, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ICD10DiagnosisField } from "@/components/visit-notes/form-renderer/icd10-diagnosis-field";
import { Plus, Trash2 } from "lucide-react";

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
    case "RATING_SCALE":
      return (
        <ScaleInput
          value={value as number | null}
          onChange={onChange}
          minValue={item.minValue ?? 0}
          maxValue={item.maxValue ?? 5}
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
    case "TEXT_LONG":
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

    case "TEXT_SHORT":
      return (
        <Input
          id={item.id}
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your response..."
          disabled={disabled}
          error={!!error}
        />
      );

    case "DATE":
      return (
        <DateInput
          id={item.id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "TIME":
      return (
        <Input
          id={item.id}
          type="time"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "DATETIME":
      return (
        <Input
          id={item.id}
          type="datetime-local"
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

    case "ICD10_DIAGNOSIS":
      return (
        <ICD10DiagnosisField
          value={(value as ICD10DiagnosisValue[]) || []}
          onChange={(v) => onChange(v)}
          disabled={disabled}
        />
      );

    case "SIGNATURE":
      return (
        <div className="rounded-lg border border-border p-4 text-center text-sm text-foreground-tertiary">
          Signature capture will be available when filling out the assessment
        </div>
      );

    case "PHOTO":
      return (
        <div className="rounded-lg border border-border p-4 text-center text-sm text-foreground-tertiary">
          Photo upload will be available when filling out the assessment
        </div>
      );

    case "BODY_MAP":
      return (
        <div className="rounded-lg border border-border p-4 text-center text-sm text-foreground-tertiary">
          Body map will be available when filling out the assessment
        </div>
      );

    case "LIST":
      return (
        <ListInput
          config={item.listConfig}
          value={(value as ListItemValue[]) || []}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "REPEATER":
      return (
        <RepeaterInput
          config={item.repeaterConfig}
          value={(value as RepeaterItemValue[]) || []}
          onChange={onChange}
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

// List input component - for simple lists of single values
function ListInput({
  config,
  value,
  onChange,
  disabled,
  error,
}: {
  config?: ListResponseConfig;
  value: ListItemValue[];
  onChange: (value: ListItemValue[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const itemLabel = config?.itemLabel || "Item";
  const itemType = config?.itemType || "TEXT";
  const maxItems = config?.maxItems || 20;
  const placeholder = config?.placeholder || `Enter ${itemLabel.toLowerCase()}`;

  const addItem = () => {
    if (value.length < maxItems) {
      onChange([...value, ""]);
    }
  };

  const updateItem = (index: number, newValue: ListItemValue) => {
    const newItems = [...value];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const renderInput = (item: ListItemValue, index: number) => {
    switch (itemType) {
      case "NUMBER":
        return (
          <Input
            type="number"
            value={item as number || ""}
            onChange={(e) => updateItem(index, e.target.value ? parseFloat(e.target.value) : "")}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
        );
      case "DATE":
        return (
          <DateInput
            value={item as string || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
        );
      case "TIME":
        return (
          <Input
            type="time"
            value={item as string || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={item as string || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", error && "ring-1 ring-error ring-offset-2 rounded-md p-2")}>
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary w-8">{index + 1}.</span>
          {renderInput(item, index)}
          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={disabled}
            className="rounded p-1.5 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {value.length < maxItems && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addItem}
          disabled={disabled}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {itemLabel}
        </Button>
      )}

      {value.length === 0 && (
        <p className="text-sm text-foreground-tertiary">
          No items added yet. Click &quot;Add {itemLabel}&quot; to add one.
        </p>
      )}
    </div>
  );
}

// Repeater input component - for complex multi-field items
function RepeaterInput({
  config,
  value,
  onChange,
  disabled,
  error,
}: {
  config?: RepeaterResponseConfig;
  value: RepeaterItemValue[];
  onChange: (value: RepeaterItemValue[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const itemLabel = config?.itemLabel || "Item";
  const addButtonLabel = config?.addButtonLabel || `Add ${itemLabel}`;
  const maxItems = config?.maxItems || 20;
  const subFields = config?.subFields || [];

  const addItem = () => {
    if (value.length < maxItems) {
      const newItem: RepeaterItemValue = {};
      subFields.forEach((field) => {
        newItem[field.id] = field.type === "YES_NO" ? false : "";
      });
      onChange([...value, newItem]);
    }
  };

  const updateItem = (index: number, fieldId: string, fieldValue: string | number | boolean | null) => {
    const newItems = [...value];
    newItems[index] = { ...newItems[index], [fieldId]: fieldValue };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const renderSubField = (
    field: RepeaterResponseConfig["subFields"][0],
    item: RepeaterItemValue,
    itemIndex: number
  ) => {
    const fieldValue = item[field.id];

    switch (field.type) {
      case "NUMBER":
        return (
          <Input
            type="number"
            value={fieldValue as number || ""}
            onChange={(e) => updateItem(itemIndex, field.id, e.target.value ? parseFloat(e.target.value) : "")}
            placeholder={field.placeholder || field.label}
            disabled={disabled}
          />
        );
      case "DATE":
        return (
          <DateInput
            value={fieldValue as string || ""}
            onChange={(e) => updateItem(itemIndex, field.id, e.target.value)}
            disabled={disabled}
          />
        );
      case "TIME":
        return (
          <Input
            type="time"
            value={fieldValue as string || ""}
            onChange={(e) => updateItem(itemIndex, field.id, e.target.value)}
            disabled={disabled}
          />
        );
      case "SINGLE_CHOICE":
        return (
          <Select
            value={fieldValue as string || ""}
            onChange={(e) => updateItem(itemIndex, field.id, e.target.value)}
            disabled={disabled}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        );
      case "YES_NO":
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateItem(itemIndex, field.id, true)}
              disabled={disabled}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                fieldValue === true
                  ? "border-success bg-success/10 text-success"
                  : "border-border hover:border-success/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => updateItem(itemIndex, field.id, false)}
              disabled={disabled}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                fieldValue === false
                  ? "border-error bg-error/10 text-error"
                  : "border-border hover:border-error/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              No
            </button>
          </div>
        );
      default:
        return (
          <Input
            type="text"
            value={fieldValue as string || ""}
            onChange={(e) => updateItem(itemIndex, field.id, e.target.value)}
            placeholder={field.placeholder || field.label}
            disabled={disabled}
          />
        );
    }
  };

  const getFieldWidthClass = (width?: string) => {
    switch (width) {
      case "half":
        return "col-span-1";
      case "third":
        return "col-span-1";
      default:
        return "col-span-2";
    }
  };

  return (
    <div className={cn("space-y-3", error && "ring-1 ring-error ring-offset-2 rounded-md p-2")}>
      {value.map((item, index) => (
        <div key={index} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground-secondary">
              {itemLabel} {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {subFields.map((field) => (
              <div key={field.id} className={cn("space-y-1", getFieldWidthClass(field.width))}>
                <Label className="text-xs">
                  {field.label}
                  {field.required && <span className="text-error ml-0.5">*</span>}
                </Label>
                {renderSubField(field, item, index)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {value.length < maxItems && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addItem}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          {addButtonLabel}
        </Button>
      )}

      {value.length === 0 && (
        <p className="text-sm text-foreground-tertiary">
          No items added yet. Click &quot;{addButtonLabel}&quot; to add one.
        </p>
      )}
    </div>
  );
}
