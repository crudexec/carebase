"use client";

import * as React from "react";
import { FormFieldData, FieldValue } from "@/lib/visit-notes/types";
import {
  Input,
  Textarea,
  Label,
  FileUpload,
  SignaturePad,
  Rating,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface FieldRendererProps {
  field: FormFieldData;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRendererProps) {
  const config = field.config as Record<string, unknown> | null;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-error ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-foreground-tertiary">{field.description}</p>
      )}

      {renderFieldInput(field, value, onChange, error, disabled, config)}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function renderFieldInput(
  field: FormFieldData,
  value: FieldValue,
  onChange: (value: FieldValue) => void,
  error?: string,
  disabled?: boolean,
  config?: Record<string, unknown> | null
) {
  switch (field.type) {
    case "TEXT_SHORT":
      return (
        <Input
          id={field.id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config?.placeholder as string}
          maxLength={config?.maxLength as number}
          disabled={disabled}
          error={!!error}
        />
      );

    case "TEXT_LONG":
      return (
        <Textarea
          id={field.id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config?.placeholder as string}
          maxLength={config?.maxLength as number}
          disabled={disabled}
          error={!!error}
          rows={4}
        />
      );

    case "NUMBER":
      // Note: min/max are now thresholds for alerts, not input blockers
      // Users can enter any numeric value
      return (
        <Input
          id={field.id}
          type="number"
          value={value !== null && value !== undefined ? String(value) : ""}
          onChange={(e) =>
            onChange(e.target.value ? parseFloat(e.target.value) : null)
          }
          step={config?.step as number}
          placeholder={config?.placeholder as string}
          disabled={disabled}
          error={!!error}
        />
      );

    case "YES_NO":
      return (
        <YesNoField
          value={value as boolean | null}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "SINGLE_CHOICE":
      return (
        <SingleChoiceChips
          options={(config?.options as OptionItem[]) || []}
          value={(value as string) || ""}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceChips
          options={(config?.options as OptionItem[]) || []}
          value={(value as string[]) || []}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "DATE":
      return (
        <Input
          id={field.id}
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "TIME":
      return (
        <Input
          id={field.id}
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
          id={field.id}
          type="datetime-local"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "SIGNATURE":
      return (
        <SignaturePad
          value={(value as string) || undefined}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          error={!!error}
        />
      );

    case "PHOTO":
      return (
        <PhotoUploadField
          value={value as { fileUrl: string } | null}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "RATING_SCALE":
      return (
        <Rating
          value={(value as number) || 0}
          onChange={(v) => onChange(v)}
          min={(config?.min as number) || 1}
          max={(config?.max as number) || 5}
          labels={config?.labels as Record<number, string>}
          disabled={disabled}
          error={!!error}
        />
      );

    default:
      return <p className="text-foreground-tertiary">Unknown field type</p>;
  }
}

// Yes/No toggle component
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

// Option type that supports both simple strings and value/label objects
type OptionItem = string | { value: string; label: string };

// Helper to normalize options to value/label format
function normalizeOption(option: OptionItem): { value: string; label: string } {
  if (typeof option === "string") {
    return { value: option, label: option };
  }
  return option;
}

// Single choice chips component
function SingleChoiceChips({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: OptionItem[];
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
        const { value: optionValue, label } = normalizeOption(option);
        const isSelected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
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
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Multiple choice chips component
function MultipleChoiceChips({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: OptionItem[];
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
        const { value: optionValue, label } = normalizeOption(option);
        const isSelected = value.includes(optionValue);
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => handleToggle(optionValue)}
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
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Photo upload field component with upload handling
function PhotoUploadField({
  value,
  onChange,
  disabled,
  error,
}: {
  value: { fileUrl: string } | null;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleFileSelect = async (file: File | File[] | null) => {
    if (!file || Array.isArray(file)) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "photo");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload");
      }

      onChange({
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  if (value?.fileUrl) {
    return (
      <div className="space-y-2">
        <img
          src={value.fileUrl}
          alt="Uploaded photo"
          className="max-w-xs rounded-lg border border-border"
        />
        {!disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-error hover:underline"
          >
            Remove photo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FileUpload
        accept="image/*"
        value={null}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        error={!!error || !!uploadError}
        placeholder={isUploading ? "Uploading..." : "Click or drag to upload a photo"}
      />
      {uploadError && <p className="text-xs text-error">{uploadError}</p>}
    </div>
  );
}
