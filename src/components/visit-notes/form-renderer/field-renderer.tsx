"use client";

import * as React from "react";
import {
  FormFieldData,
  FieldValue,
  BodyMapMarker,
  ICD10DiagnosisValue,
  TableFieldConfig,
  TableFieldValue,
} from "@/lib/visit-notes/types";
import {
  Input,
  DateInput,
  Textarea,
  Label,
  FileUpload,
  SignaturePad,
  Rating,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { BodyMapField } from "./body-map-field";
import { ICD10DiagnosisField } from "./icd10-diagnosis-field";
import { Plus, Trash2 } from "lucide-react";

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

  if (field.type === "TEXT_DISPLAY") {
    return <TextDisplay content={(config?.content as string) || ""} />;
  }

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

function TextDisplay({ content }: { content: string }) {
  return (
    <div
      className="rounded-md border border-border bg-background-secondary px-4 py-3 text-sm leading-6 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:not(:last-child)]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: sanitizeTextDisplayHtml(content) }}
    />
  );
}

function sanitizeTextDisplayHtml(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "DIV",
    "EM",
    "I",
    "LI",
    "OL",
    "P",
    "STRONG",
    "U",
    "UL",
  ]);

  const cleanNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const href = element.tagName === "A" ? element.getAttribute("href") || "" : "";
        if (!allowedTags.has(element.tagName)) {
          element.replaceWith(...Array.from(element.childNodes));
          continue;
        }

        for (const attribute of Array.from(element.attributes)) {
          element.removeAttribute(attribute.name);
        }

        if (element.tagName === "A") {
          if (/^https?:\/\//i.test(href) || href.startsWith("mailto:")) {
            element.setAttribute("href", href);
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noreferrer");
          }
        }
      }

      cleanNode(child);
    }
  };

  cleanNode(template.content);
  return template.innerHTML;
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
          className="w-28 text-lg font-semibold text-center"
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
        <DateInput
          id={field.id}
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

    case "TABLE":
      return (
        <TableField
          value={(value as TableFieldValue) || []}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          error={!!error}
          config={config as TableFieldConfig | null}
        />
      );

    case "BODY_MAP":
      return (
        <BodyMapField
          value={(value as BodyMapMarker[]) || []}
          onChange={(v) => onChange(v)}
          disabled={disabled}
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

function TableField({
  value,
  onChange,
  disabled,
  error,
  config,
}: {
  value: TableFieldValue;
  onChange: (value: TableFieldValue) => void;
  disabled?: boolean;
  error?: boolean;
  config?: TableFieldConfig | null;
}) {
  const columns = config?.columns?.length
    ? config.columns
    : [
        { id: "column_1", label: "Column 1" },
        { id: "column_2", label: "Column 2" },
      ];
  const minRows = config?.minRows ?? 1;
  const maxRows = config?.maxRows;
  const visibleRows: TableFieldValue =
    value.length > 0 ? value : Array.from({ length: minRows }, () => ({}));
  const canAddRow = !disabled && (maxRows === undefined || visibleRows.length < maxRows);
  const canRemoveRow = !disabled && visibleRows.length > minRows;

  const updateCell = (rowIndex: number, columnId: string, cellValue: string) => {
    const nextRows = [...visibleRows].map((row) => ({ ...row }));
    nextRows[rowIndex] = { ...nextRows[rowIndex], [columnId]: cellValue };
    onChange(nextRows);
  };

  const addRow = () => {
    if (!canAddRow) return;
    onChange([...visibleRows, {}]);
  };

  const removeRow = (rowIndex: number) => {
    if (!canRemoveRow) return;
    onChange(visibleRows.filter((_, index) => index !== rowIndex));
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border",
        error && "ring-1 ring-error ring-offset-2"
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-background-secondary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="min-w-40 border-b border-border px-3 py-2 text-left font-medium text-foreground"
                >
                  {column.label}
                </th>
              ))}
              {!disabled && (
                <th scope="col" className="w-10 border-b border-border px-2 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                {columns.map((column) => (
                  <td key={column.id} className="p-2 align-top">
                    <Input
                      value={row[column.id] || ""}
                      onChange={(event) => updateCell(rowIndex, column.id, event.target.value)}
                      disabled={disabled}
                      aria-label={`${column.label}, row ${rowIndex + 1}`}
                    />
                  </td>
                ))}
                {!disabled && (
                  <td className="p-2 align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      disabled={!canRemoveRow}
                      className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-40"
                      aria-label={`Remove row ${rowIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!disabled && (
        <div className="border-t border-border bg-background-secondary px-3 py-2">
          <button
            type="button"
            onClick={addRow}
            disabled={!canAddRow}
            className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add row
          </button>
        </div>
      )}
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
