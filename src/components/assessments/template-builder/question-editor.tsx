"use client";

import * as React from "react";
import { AssessmentItemData, RESPONSE_TYPE_LABELS, ChoiceOption } from "@/lib/assessments/types";
import { Input, Label, Textarea, Checkbox, Button } from "@/components/ui";
import { X, Plus, Trash2 } from "lucide-react";
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
      return <ScaleConfigEditor item={item} onChange={onChange} />;

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return <ChoiceConfigEditor item={item} onChange={onChange} />;

    case "NUMBER":
      return <NumberConfigEditor item={item} onChange={onChange} />;

    case "TEXT":
      return (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium">Text Options</h4>
          <p className="text-sm text-foreground-tertiary">
            Free text response with no specific configuration.
          </p>
        </div>
      );

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
