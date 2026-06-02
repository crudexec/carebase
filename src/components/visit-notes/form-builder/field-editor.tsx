"use client";

import * as React from "react";
import { FormFieldData, FIELD_TYPE_LABELS, TableFieldConfig } from "@/lib/visit-notes/types";
import { Input, Label, Textarea, Checkbox, Button } from "@/components/ui";
import { Bold, Italic, List, ListOrdered, Plus, Quote, Trash2, Underline, X } from "lucide-react";
import { FieldTypeIcon } from "./field-type-selector";

interface FieldEditorProps {
  field: FormFieldData;
  onChange: (field: FormFieldData) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onChange, onClose, onDelete }: FieldEditorProps) {
  const updateField = (updates: Partial<FormFieldData>) => {
    onChange({ ...field, ...updates });
  };

  const updateConfig = (configUpdates: Record<string, unknown>) => {
    onChange({
      ...field,
      config: { ...((field.config as Record<string, unknown>) || {}), ...configUpdates },
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <FieldTypeIcon type={field.type} className="h-4 w-4 text-foreground-secondary" />
          <span className="font-medium">{FIELD_TYPE_LABELS[field.type]}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:bg-background-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {field.type !== "TEXT_DISPLAY" && (
          <>
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="field-label">Label</Label>
              <Input
                id="field-label"
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="field-description">Description (optional)</Label>
              <Textarea
                id="field-description"
                value={field.description || ""}
                onChange={(e) => updateField({ description: e.target.value || undefined })}
                placeholder="Help text for the field"
                rows={2}
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="field-required"
                checked={field.required}
                onChange={(e) => updateField({ required: e.target.checked })}
              />
              <Label htmlFor="field-required" className="cursor-pointer">
                Required field
              </Label>
            </div>
          </>
        )}

        {/* Type-specific config */}
        {renderConfigEditor(field, updateConfig)}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="w-full text-error hover:text-error hover:bg-error/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete field
        </Button>
      </div>
    </div>
  );
}

function renderConfigEditor(
  field: FormFieldData,
  updateConfig: (config: Record<string, unknown>) => void
) {
  switch (field.type) {
    case "TEXT_DISPLAY":
      return <RichTextConfigEditor field={field} updateConfig={updateConfig} />;

    case "TEXT_SHORT":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Text Options</h4>
          <div className="space-y-2">
            <Label htmlFor="max-length">Maximum length</Label>
            <Input
              id="max-length"
              type="number"
              value={(field.config as { maxLength?: number })?.maxLength || ""}
              onChange={(e) =>
                updateConfig({
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={(field.config as { placeholder?: string })?.placeholder || ""}
              onChange={(e) =>
                updateConfig({ placeholder: e.target.value || undefined })
              }
              placeholder="Enter placeholder text"
            />
          </div>
        </div>
      );

    case "TEXT_LONG":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Text Options</h4>
          <div className="space-y-2">
            <Label htmlFor="max-length">Maximum length</Label>
            <Input
              id="max-length"
              type="number"
              value={(field.config as { maxLength?: number })?.maxLength || ""}
              onChange={(e) =>
                updateConfig({
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="2000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={(field.config as { placeholder?: string })?.placeholder || ""}
              onChange={(e) =>
                updateConfig({ placeholder: e.target.value || undefined })
              }
              placeholder="Enter placeholder text"
            />
          </div>
        </div>
      );

    case "NUMBER":
      return <NumberConfigEditor field={field} updateConfig={updateConfig} />;

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return <ChoiceConfigEditor field={field} updateConfig={updateConfig} />;

    case "RATING_SCALE":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Rating Options</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating-min">Minimum</Label>
              <Input
                id="rating-min"
                type="number"
                value={(field.config as { min: number })?.min ?? 1}
                onChange={(e) =>
                  updateConfig({ min: parseInt(e.target.value) || 1 })
                }
                min={0}
                max={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating-max">Maximum</Label>
              <Input
                id="rating-max"
                type="number"
                value={(field.config as { max: number })?.max ?? 5}
                onChange={(e) =>
                  updateConfig({ max: parseInt(e.target.value) || 5 })
                }
                min={1}
                max={10}
              />
            </div>
          </div>
        </div>
      );

    case "TABLE":
      return <TableConfigEditor field={field} updateConfig={updateConfig} />;

    default:
      return null;
  }
}

function RichTextConfigEditor({
  field,
  updateConfig,
}: {
  field: FormFieldData;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const content = (field.config as { content?: string } | null)?.content || "";

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateConfig({ content: editorRef.current?.innerHTML || "" });
  };

  const handleInput = () => {
    updateConfig({ content: editorRef.current?.innerHTML || "" });
  };

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Text Content</h4>
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-background-secondary p-1">
        <RichTextButton label="Bold" onClick={() => runCommand("bold")}>
          <Bold className="h-4 w-4" />
        </RichTextButton>
        <RichTextButton label="Italic" onClick={() => runCommand("italic")}>
          <Italic className="h-4 w-4" />
        </RichTextButton>
        <RichTextButton label="Underline" onClick={() => runCommand("underline")}>
          <Underline className="h-4 w-4" />
        </RichTextButton>
        <RichTextButton label="Bulleted list" onClick={() => runCommand("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </RichTextButton>
        <RichTextButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </RichTextButton>
        <RichTextButton label="Quote" onClick={() => runCommand("formatBlock", "blockquote")}>
          <Quote className="h-4 w-4" />
        </RichTextButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label="Text content"
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-48 rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-primary focus:ring-1 focus:ring-primary [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        suppressContentEditableWarning
      />
    </div>
  );
}

function RichTextButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="rounded p-1.5 text-foreground-secondary hover:bg-background hover:text-foreground"
    >
      {children}
    </button>
  );
}

interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  thresholdEnabled?: boolean;
  customMessage?: string;
}

function NumberConfigEditor({
  field,
  updateConfig,
}: {
  field: FormFieldData;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  const config = (field.config as NumberConfig) || {};
  // Default thresholdEnabled to true if min or max is set
  const thresholdEnabled = config.thresholdEnabled ?? (config.min !== undefined || config.max !== undefined);

  const handleThresholdToggle = (enabled: boolean) => {
    if (enabled) {
      // When enabling, set default values if not already set
      updateConfig({
        thresholdEnabled: true,
        min: config.min ?? 0,
        max: config.max ?? 100,
      });
    } else {
      updateConfig({
        thresholdEnabled: false,
      });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Number Options</h4>

      {/* Step */}
      <div className="space-y-2">
        <Label htmlFor="step">Step increment</Label>
        <Input
          id="step"
          type="number"
          value={config.step ?? ""}
          onChange={(e) =>
            updateConfig({
              step: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          placeholder="1"
        />
      </div>

      {/* Threshold Alerts Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Checkbox
            id="threshold-enabled"
            checked={thresholdEnabled}
            onChange={(e) => handleThresholdToggle(e.target.checked)}
          />
          <Label htmlFor="threshold-enabled" className="cursor-pointer">
            Enable threshold alerts
          </Label>
        </div>

        {thresholdEnabled && (
          <>
            <p className="text-sm text-foreground-secondary">
              When the entered value is outside these thresholds, notifications will be sent to administrators.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-threshold">Min threshold *</Label>
                <Input
                  id="min-threshold"
                  type="number"
                  value={config.min ?? ""}
                  onChange={(e) =>
                    updateConfig({
                      min: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-threshold">Max threshold *</Label>
                <Input
                  id="max-threshold"
                  type="number"
                  value={config.max ?? ""}
                  onChange={(e) =>
                    updateConfig({
                      max: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom alert message (optional)</Label>
              <Textarea
                id="custom-message"
                value={config.customMessage || ""}
                onChange={(e) =>
                  updateConfig({ customMessage: e.target.value || undefined })
                }
                placeholder="e.g., Blood pressure is outside normal range. Please contact supervisor immediately."
                rows={2}
              />
              <p className="text-xs text-foreground-tertiary">
                This message will be included in the alert notification when the threshold is breached.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChoiceConfigEditor({
  field,
  updateConfig,
}: {
  field: FormFieldData;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  const options = (field.config as { options: string[] })?.options || [];

  const addOption = () => {
    updateConfig({ options: [...options, `Option ${options.length + 1}`] });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateConfig({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateConfig({ options: newOptions });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">
        {field.type === "SINGLE_CHOICE" ? "Choices" : "Options"}
      </h4>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 1}
              className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={addOption}>
        <Plus className="mr-2 h-4 w-4" />
        Add option
      </Button>
    </div>
  );
}

function TableConfigEditor({
  field,
  updateConfig,
}: {
  field: FormFieldData;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  const config = (field.config as TableFieldConfig | null) || { columns: [] };
  const columns = config.columns?.length
    ? config.columns
    : [
        { id: "column_1", label: "Column 1" },
        { id: "column_2", label: "Column 2" },
      ];

  const updateColumns = (nextColumns: TableFieldConfig["columns"]) => {
    updateConfig({ columns: nextColumns });
  };

  const addColumn = () => {
    const nextIndex = columns.length + 1;
    updateColumns([
      ...columns,
      { id: `column_${Date.now()}`, label: `Column ${nextIndex}` },
    ]);
  };

  const updateColumn = (columnId: string, label: string) => {
    updateColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, label } : column
      )
    );
  };

  const removeColumn = (columnId: string) => {
    updateColumns(columns.filter((column) => column.id !== columnId));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Table Options</h4>

      <div className="space-y-2">
        <Label>Columns</Label>
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-2">
              <Input
                value={column.label}
                onChange={(event) => updateColumn(column.id, event.target.value)}
                placeholder={`Column ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeColumn(column.id)}
                disabled={columns.length <= 1}
                className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-50"
                aria-label={`Remove ${column.label || `Column ${index + 1}`}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={addColumn}>
          <Plus className="mr-2 h-4 w-4" />
          Add column
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="table-min-rows">Minimum rows</Label>
          <Input
            id="table-min-rows"
            type="number"
            min={0}
            value={config.minRows ?? ""}
            onChange={(event) =>
              updateConfig({
                minRows: event.target.value ? parseInt(event.target.value, 10) : undefined,
              })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="table-max-rows">Maximum rows</Label>
          <Input
            id="table-max-rows"
            type="number"
            min={1}
            value={config.maxRows ?? ""}
            onChange={(event) =>
              updateConfig({
                maxRows: event.target.value ? parseInt(event.target.value, 10) : undefined,
              })
            }
            placeholder="No limit"
          />
        </div>
      </div>
    </div>
  );
}
