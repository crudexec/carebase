"use client";

import * as React from "react";
import {
  AssessmentItemData,
  RESPONSE_TYPE_LABELS,
  ChoiceOption,
  ListResponseConfig,
  RepeaterResponseConfig,
  RepeaterSubField,
} from "@/lib/assessments/types";
import { Input, Label, Textarea, Checkbox, Button, Select } from "@/components/ui";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { ResponseTypeIcon } from "./response-type-selector";

interface QuestionEditorProps {
  item: AssessmentItemData;
  onChange: (item: Partial<AssessmentItemData>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function QuestionEditor({ item, onChange, onClose, onDelete }: QuestionEditorProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ResponseTypeIcon type={item.responseType} className="h-4 w-4 text-foreground-secondary" />
          <span className="font-medium">{RESPONSE_TYPE_LABELS[item.responseType]}</span>
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
        {/* Question Text - Primary field */}
        <div className="space-y-2">
          <Label htmlFor="item-question">Question</Label>
          <Textarea
            id="item-question"
            value={item.questionText}
            onChange={(e) => onChange({ questionText: e.target.value })}
            placeholder="Enter the question to be asked"
            rows={3}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="item-description">Help Text (optional)</Label>
          <Textarea
            id="item-description"
            value={item.description || ""}
            onChange={(e) => onChange({ description: e.target.value || undefined })}
            placeholder="Additional context or instructions for the assessor"
            rows={2}
          />
        </div>

        {/* Required */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="item-required"
            checked={item.required}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          <Label htmlFor="item-required" className="cursor-pointer">
            Required question
          </Label>
        </div>

        {/* Type-specific config */}
        {renderConfigEditor(item, onChange)}
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
          Delete question
        </Button>
      </div>
    </div>
  );
}

function renderConfigEditor(
  item: AssessmentItemData,
  onChange: (updates: Partial<AssessmentItemData>) => void
) {
  switch (item.responseType) {
    case "SCALE":
    case "RATING_SCALE":
      return <ScaleConfigEditor item={item} onChange={onChange} />;

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return <ChoiceConfigEditor item={item} onChange={onChange} />;

    case "NUMBER":
      return <NumberConfigEditor item={item} onChange={onChange} />;

    case "TEXT":
    case "TEXT_SHORT":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Short Text Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Single line text input with no specific configuration.
          </p>
        </div>
      );

    case "TEXT_LONG":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Long Text Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Multi-line text area for longer responses.
          </p>
        </div>
      );

    case "YES_NO":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Yes/No Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Simple toggle between yes and no. Yes = 1 point, No = 0 points by default.
          </p>
        </div>
      );

    case "DATE":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Date Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Date picker for selecting a specific date.
          </p>
        </div>
      );

    case "TIME":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Time Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Time picker for selecting a specific time.
          </p>
        </div>
      );

    case "DATETIME":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Date & Time Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Combined date and time picker.
          </p>
        </div>
      );

    case "SIGNATURE":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Signature Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Digital signature capture field.
          </p>
        </div>
      );

    case "PHOTO":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Photo Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Photo upload field for capturing images.
          </p>
        </div>
      );

    case "BODY_MAP":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Body Map Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Interactive body diagram for documenting pain, wounds, or other body-related observations.
          </p>
        </div>
      );

    case "ICD10_DIAGNOSIS":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">ICD-10 Diagnosis Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Searchable ICD-10 diagnosis code selector.
          </p>
        </div>
      );

    case "LIST":
      return <ListConfigEditor item={item} onChange={onChange} />;

    case "REPEATER":
      return <RepeaterConfigEditor item={item} onChange={onChange} />;

    default:
      return null;
  }
}

function ScaleConfigEditor({
  item,
  onChange,
}: {
  item: AssessmentItemData;
  onChange: (updates: Partial<AssessmentItemData>) => void;
}) {
  const minValue = item.minValue ?? 0;
  const maxValue = item.maxValue ?? 3;
  const scoreMapping = item.scoreMapping || {};

  const handleMinChange = (value: number) => {
    onChange({ minValue: value });
    // Regenerate score mapping when range changes
    regenerateScoreMapping(value, maxValue);
  };

  const handleMaxChange = (value: number) => {
    onChange({ maxValue: value });
    regenerateScoreMapping(minValue, value);
  };

  const regenerateScoreMapping = (min: number, max: number) => {
    const newMapping: Record<string, number> = {};
    for (let i = min; i <= max; i++) {
      newMapping[String(i)] = scoreMapping[String(i)] ?? i;
    }
    onChange({ scoreMapping: newMapping });
  };

  const updateScoreMapping = (key: string, score: number) => {
    onChange({
      scoreMapping: { ...scoreMapping, [key]: score },
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Scale Options</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scale-min">Minimum Value</Label>
          <Input
            id="scale-min"
            type="number"
            value={minValue}
            onChange={(e) => handleMinChange(parseInt(e.target.value) || 0)}
            min={0}
            max={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale-max">Maximum Value</Label>
          <Input
            id="scale-max"
            type="number"
            value={maxValue}
            onChange={(e) => handleMaxChange(parseInt(e.target.value) || 3)}
            min={1}
            max={10}
          />
        </div>
      </div>

      {/* Score Mapping */}
      <div className="space-y-2">
        <Label>Score Mapping</Label>
        <p className="text-xs text-foreground-tertiary">
          Define what score each response value contributes to the total
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i).map((value) => (
            <div key={value} className="flex items-center gap-2">
              <span className="w-12 text-sm text-foreground-secondary">Value {value}:</span>
              <Input
                type="number"
                value={scoreMapping[String(value)] ?? value}
                onChange={(e) => updateScoreMapping(String(value), parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-xs text-foreground-tertiary">points</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoiceConfigEditor({
  item,
  onChange,
}: {
  item: AssessmentItemData;
  onChange: (updates: Partial<AssessmentItemData>) => void;
}) {
  const options: ChoiceOption[] = item.responseOptions || [];

  const addOption = () => {
    const newOption: ChoiceOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
      score: 0,
    };
    onChange({ responseOptions: [...options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<ChoiceOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange({ responseOptions: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange({ responseOptions: newOptions });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">
        {item.responseType === "SINGLE_CHOICE" ? "Choices" : "Options"}
      </h4>
      <p className="text-xs text-foreground-tertiary">
        Define the available choices and their score values
      </p>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
                placeholder="Option label"
                className="flex-1"
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
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Value:</Label>
              <Input
                value={option.value}
                onChange={(e) => updateOption(index, { value: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                placeholder="option_value"
                className="flex-1 font-mono text-sm"
              />
              <Label className="text-xs shrink-0">Score:</Label>
              <Input
                type="number"
                value={option.score ?? 0}
                onChange={(e) => updateOption(index, { score: parseInt(e.target.value) || 0 })}
                className="w-16"
              />
            </div>
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

function NumberConfigEditor({
  item,
  onChange,
}: {
  item: AssessmentItemData;
  onChange: (updates: Partial<AssessmentItemData>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Number Options</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="num-min">Minimum Value</Label>
          <Input
            id="num-min"
            type="number"
            value={item.minValue ?? ""}
            onChange={(e) => onChange({ minValue: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="No minimum"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="num-max">Maximum Value</Label>
          <Input
            id="num-max"
            type="number"
            value={item.maxValue ?? ""}
            onChange={(e) => onChange({ maxValue: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="No maximum"
          />
        </div>
      </div>

      <p className="text-sm text-foreground-tertiary">
        For number fields, the entered value is typically used directly as the score.
      </p>
    </div>
  );
}

function ListConfigEditor({
  item,
  onChange,
}: {
  item: AssessmentItemData;
  onChange: (updates: Partial<AssessmentItemData>) => void;
}) {
  const config: ListResponseConfig = item.listConfig || {
    itemType: "TEXT",
    itemLabel: "Item",
    minItems: 0,
    maxItems: 20,
  };

  const updateConfig = (updates: Partial<ListResponseConfig>) => {
    onChange({ listConfig: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">List Options</h4>
      <p className="text-xs text-foreground-tertiary">
        Allow users to add multiple items of the same type
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="list-item-label">Item Label</Label>
          <Input
            id="list-item-label"
            value={config.itemLabel || ""}
            onChange={(e) => updateConfig({ itemLabel: e.target.value })}
            placeholder="e.g., Medication, Allergy, Responsibility"
          />
          <p className="text-xs text-foreground-tertiary">
            This appears on the &quot;Add&quot; button (e.g., &quot;Add Medication&quot;)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="list-item-type">Item Type</Label>
          <Select
            id="list-item-type"
            value={config.itemType}
            onChange={(e) => updateConfig({ itemType: e.target.value as ListResponseConfig["itemType"] })}
          >
            <option value="TEXT">Text</option>
            <option value="NUMBER">Number</option>
            <option value="DATE">Date</option>
            <option value="TIME">Time</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="list-min">Minimum Items</Label>
            <Input
              id="list-min"
              type="number"
              min={0}
              value={config.minItems ?? 0}
              onChange={(e) => updateConfig({ minItems: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-max">Maximum Items</Label>
            <Input
              id="list-max"
              type="number"
              min={1}
              value={config.maxItems ?? 20}
              onChange={(e) => updateConfig({ maxItems: parseInt(e.target.value) || 20 })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="list-placeholder">Placeholder Text</Label>
          <Input
            id="list-placeholder"
            value={config.placeholder || ""}
            onChange={(e) => updateConfig({ placeholder: e.target.value })}
            placeholder="e.g., Enter medication name"
          />
        </div>
      </div>
    </div>
  );
}

function RepeaterConfigEditor({
  item,
  onChange,
}: {
  item: AssessmentItemData;
  onChange: (updates: Partial<AssessmentItemData>) => void;
}) {
  const config: RepeaterResponseConfig = item.repeaterConfig || {
    itemLabel: "Item",
    addButtonLabel: "Add Item",
    minItems: 0,
    maxItems: 20,
    subFields: [
      { id: "field1", label: "Field 1", type: "TEXT", required: true, width: "full" },
    ],
  };

  const updateConfig = (updates: Partial<RepeaterResponseConfig>) => {
    onChange({ repeaterConfig: { ...config, ...updates } });
  };

  const addSubField = () => {
    const newField: RepeaterSubField = {
      id: `field_${Date.now()}`,
      label: `Field ${config.subFields.length + 1}`,
      type: "TEXT",
      required: false,
      width: "full",
    };
    updateConfig({ subFields: [...config.subFields, newField] });
  };

  const updateSubField = (index: number, updates: Partial<RepeaterSubField>) => {
    const newFields = [...config.subFields];
    newFields[index] = { ...newFields[index], ...updates };
    updateConfig({ subFields: newFields });
  };

  const removeSubField = (index: number) => {
    const newFields = config.subFields.filter((_, i) => i !== index);
    updateConfig({ subFields: newFields });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h4 className="text-sm font-medium">Repeater Options</h4>
      <p className="text-xs text-foreground-tertiary">
        Allow users to add multiple items, each with multiple fields
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repeater-item-label">Item Label</Label>
            <Input
              id="repeater-item-label"
              value={config.itemLabel || ""}
              onChange={(e) => updateConfig({ itemLabel: e.target.value })}
              placeholder="e.g., Medication"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeater-button-label">Add Button Label</Label>
            <Input
              id="repeater-button-label"
              value={config.addButtonLabel || ""}
              onChange={(e) => updateConfig({ addButtonLabel: e.target.value })}
              placeholder="e.g., Add Medication"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repeater-min">Minimum Items</Label>
            <Input
              id="repeater-min"
              type="number"
              min={0}
              value={config.minItems ?? 0}
              onChange={(e) => updateConfig({ minItems: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeater-max">Maximum Items</Label>
            <Input
              id="repeater-max"
              type="number"
              min={1}
              value={config.maxItems ?? 20}
              onChange={(e) => updateConfig({ maxItems: parseInt(e.target.value) || 20 })}
            />
          </div>
        </div>

        {/* Sub-fields */}
        <div className="space-y-2">
          <Label>Sub-fields</Label>
          <p className="text-xs text-foreground-tertiary">
            Define the fields for each item
          </p>
        </div>

        <div className="space-y-3">
          {config.subFields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-foreground-tertiary cursor-move" />
                <Input
                  value={field.label}
                  onChange={(e) => updateSubField(index, { label: e.target.value })}
                  placeholder="Field label"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSubField(index)}
                  disabled={config.subFields.length <= 1}
                  className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={field.type}
                    onChange={(e) => updateSubField(index, { type: e.target.value as RepeaterSubField["type"] })}
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="TIME">Time</option>
                    <option value="SINGLE_CHOICE">Dropdown</option>
                    <option value="YES_NO">Yes/No</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Select
                    value={field.width || "full"}
                    onChange={(e) => updateSubField(index, { width: e.target.value as RepeaterSubField["width"] })}
                  >
                    <option value="full">Full</option>
                    <option value="half">Half</option>
                    <option value="third">Third</option>
                  </Select>
                </div>
                <div className="space-y-1 flex items-end">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={field.required || false}
                      onChange={(e) => updateSubField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              </div>

              {field.type === "SINGLE_CHOICE" && (
                <div className="space-y-1">
                  <Label className="text-xs">Options (comma-separated)</Label>
                  <Input
                    value={field.options?.join(", ") || ""}
                    onChange={(e) => updateSubField(index, {
                      options: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={addSubField}>
          <Plus className="mr-2 h-4 w-4" />
          Add sub-field
        </Button>
      </div>
    </div>
  );
}
