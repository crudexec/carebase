"use client";

import * as React from "react";
import { CarePlanTemplateFieldData, FIELD_TYPE_LABELS, ChoiceOption } from "@/lib/care-plans/types";
import { Input, Label, Textarea, Checkbox, Button } from "@/components/ui";
import { X, Plus, Trash2 } from "lucide-react";
import { FieldTypeIcon } from "./field-type-selector";

interface FieldEditorProps {
  field: CarePlanTemplateFieldData;
  onChange: (field: CarePlanTemplateFieldData) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onChange, onClose, onDelete }: FieldEditorProps) {
  const updateField = (updates: Partial<CarePlanTemplateFieldData>) => {
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
            value={(field.config as { description?: string })?.description || ""}
            onChange={(e) => updateConfig({ description: e.target.value || undefined })}
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
  field: CarePlanTemplateFieldData,
  updateConfig: (config: Record<string, unknown>) => void
) {
  const config = field.config as Record<string, unknown>;

  switch (field.type) {
    case "TEXT_SHORT":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Text Options</h4>
          <div className="space-y-2">
            <Label htmlFor="max-length">Maximum length</Label>
            <Input
              id="max-length"
              type="number"
              value={(config.maxLength as number) || ""}
              onChange={(e) =>
                updateConfig({
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="255"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={(config.placeholder as string) || ""}
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
              value={(config.maxLength as number) || ""}
              onChange={(e) =>
                updateConfig({
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="5000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={(config.placeholder as string) || ""}
              onChange={(e) =>
                updateConfig({ placeholder: e.target.value || undefined })
              }
              placeholder="Enter placeholder text"
            />
          </div>
        </div>
      );

    case "NUMBER":
      return <NumberConfigEditor config={config} updateConfig={updateConfig} />;

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return <ChoiceConfigEditor config={config} updateConfig={updateConfig} />;

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
                value={(config.min as number) ?? 1}
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
                value={(config.max as number) ?? 5}
                onChange={(e) =>
                  updateConfig({ max: parseInt(e.target.value) || 5 })
                }
                min={1}
                max={10}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-label">Min label (optional)</Label>
              <Input
                id="min-label"
                value={(config.minLabel as string) || ""}
                onChange={(e) =>
                  updateConfig({ minLabel: e.target.value || undefined })
                }
                placeholder="e.g., Poor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-label">Max label (optional)</Label>
              <Input
                id="max-label"
                value={(config.maxLabel as string) || ""}
                onChange={(e) =>
                  updateConfig({ maxLabel: e.target.value || undefined })
                }
                placeholder="e.g., Excellent"
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function NumberConfigEditor({
  config,
  updateConfig,
}: {
  config: Record<string, unknown>;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Number Options</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="num-min">Minimum</Label>
          <Input
            id="num-min"
            type="number"
            value={(config.min as number) ?? ""}
            onChange={(e) =>
              updateConfig({
                min: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="num-max">Maximum</Label>
          <Input
            id="num-max"
            type="number"
            value={(config.max as number) ?? ""}
            onChange={(e) =>
              updateConfig({
                max: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="100"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="step">Step</Label>
          <Input
            id="step"
            type="number"
            value={(config.step as number) ?? ""}
            onChange={(e) =>
              updateConfig({
                step: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit (optional)</Label>
          <Input
            id="unit"
            value={(config.unit as string) || ""}
            onChange={(e) =>
              updateConfig({ unit: e.target.value || undefined })
            }
            placeholder="e.g., hours"
          />
        </div>
      </div>
    </div>
  );
}

function ChoiceConfigEditor({
  config,
  updateConfig,
}: {
  config: Record<string, unknown>;
  updateConfig: (config: Record<string, unknown>) => void;
}) {
  const options = (config.options as ChoiceOption[]) || [];

  const addOption = () => {
    const newOption: ChoiceOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
    };
    updateConfig({ options: [...options, newOption] });
  };

  const updateOption = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      label,
      value: label.toLowerCase().replace(/\s+/g, "_"),
    };
    updateConfig({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateConfig({ options: newOptions });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Choices</h4>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option.label}
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
