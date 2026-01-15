"use client";

import * as React from "react";
import { FormFieldType } from "@prisma/client";
import { FormFieldData, FieldValue, FieldConfig } from "@/lib/visit-notes/types";
import {
  Input,
  Textarea,
  Label,
  Checkbox,
  RadioGroup,
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
      return (
        <Input
          id={field.id}
          type="number"
          value={value !== null && value !== undefined ? String(value) : ""}
          onChange={(e) =>
            onChange(e.target.value ? parseFloat(e.target.value) : null)
          }
          min={config?.min as number}
          max={config?.max as number}
          step={config?.step as number}
          placeholder={config?.placeholder as string}
          disabled={disabled}
          error={!!error}
        />
      );

    case "YES_NO":
      return (
        <YesNoField
          id={field.id}
          value={value as boolean | null}
          onChange={onChange}
          disabled={disabled}
          error={!!error}
        />
      );

    case "SINGLE_CHOICE":
      return (
        <RadioGroup
          name={field.id}
          value={(value as string) || ""}
          onChange={(v) => onChange(v)}
          options={((config?.options as string[]) || []).map((opt) => ({
            value: opt,
            label: opt,
          }))}
          disabled={disabled}
          error={!!error}
        />
      );

    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceField
          id={field.id}
          options={(config?.options as string[]) || []}
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
          id={field.id}
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
  id,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
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

// Multiple choice (checkboxes) component
function MultipleChoiceField({
  id,
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div
      className={cn(
        "space-y-2",
        error && "rounded-md ring-1 ring-error ring-offset-2 p-2"
      )}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={`${id}-${option}`}
            checked={value.includes(option)}
            onChange={() => handleToggle(option)}
            disabled={disabled}
          />
          <label
            htmlFor={`${id}-${option}`}
            className="text-sm cursor-pointer select-none"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}

// Photo upload field component with upload handling
function PhotoUploadField({
  id,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
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
