"use client";

import * as React from "react";
import { Button, Input, Textarea, Select, Checkbox, Label } from "@/components/ui";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { FormFieldType } from "@prisma/client";

interface OptionsEditorProps {
  options: Array<{ value: string; label: string }>;
  onAddOption: () => void;
  onUpdateOption: (index: number, field: string, value: string) => void;
  onRemoveOption: (index: number) => void;
}

function OptionsEditor({
  options,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: OptionsEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Options</Label>
        <Button variant="secondary" size="sm" onClick={onAddOption}>
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-foreground-tertiary" />
            <Input
              value={option.value}
              onChange={(e) => onUpdateOption(index, "value", e.target.value)}
              placeholder="Value"
              className="w-20"
            />
            <Input
              value={option.label}
              onChange={(e) => onUpdateOption(index, "label", e.target.value)}
              placeholder="Label"
              className="flex-1"
            />
            <button
              onClick={() => onRemoveOption(index)}
              className="p-2 hover:bg-error/10 hover:text-error rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-foreground-tertiary text-center py-4">
            No options configured
          </p>
        )}
      </div>
    </div>
  );
}

interface OasisFieldConfigEditorProps {
  fieldType: FormFieldType;
  config: Record<string, unknown>;
  onUpdate: (config: Record<string, unknown>) => void;
}

export function OasisFieldConfigEditor({
  fieldType,
  config,
  onUpdate,
}: OasisFieldConfigEditorProps) {
  const handleChange = (key: string, value: unknown) => {
    onUpdate({ ...config, [key]: value });
  };

  const options = (config.options as Array<{ value: string; label: string }>) || [];

  const handleAddOption = () => {
    onUpdate({
      ...config,
      options: [...options, { value: String(options.length), label: `Option ${options.length + 1}` }],
    });
  };

  const handleUpdateOption = (index: number, field: string, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    onUpdate({ ...config, options: updatedOptions });
  };

  const handleRemoveOption = (index: number) => {
    onUpdate({
      ...config,
      options: options.filter((_, i) => i !== index),
    });
  };

  switch (fieldType) {
    case "CODE_ENTRY":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code Length</Label>
              <Input
                type="number"
                value={(config.codeLength as number) || 1}
                onChange={(e) => handleChange("codeLength", parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Input Type</Label>
              <Select
                value={(config.inputType as string) || "numeric"}
                onChange={(e) => handleChange("inputType", e.target.value)}
                className="mt-1"
              >
                <option value="numeric">Numeric Only</option>
                <option value="alpha">Letters Only</option>
                <option value="alphanumeric">Alphanumeric</option>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowNA as boolean) || false}
                onChange={(e) => handleChange("allowNA", e.target.checked)}
              />
              <span className="text-sm">Allow NA</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowUK as boolean) || false}
                onChange={(e) => handleChange("allowUK", e.target.checked)}
              />
              <span className="text-sm">Allow UK (Unknown)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.showAsDropdown as boolean) || false}
                onChange={(e) => handleChange("showAsDropdown", e.target.checked)}
              />
              <span className="text-sm">Show as Dropdown</span>
            </label>
          </div>
          <OptionsEditor
            options={options}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onRemoveOption={handleRemoveOption}
          />
        </div>
      );

    case "TEXT_SHORT":
    case "TEXT_LONG":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Length</Label>
              <Input
                type="number"
                value={(config.maxLength as number) || (fieldType === "TEXT_SHORT" ? 255 : 5000)}
                onChange={(e) => handleChange("maxLength", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Placeholder</Label>
              <Input
                value={(config.placeholder as string) || ""}
                onChange={(e) => handleChange("placeholder", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      );

    case "NUMBER":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min Value</Label>
              <Input
                type="number"
                value={(config.min as number) ?? ""}
                onChange={(e) => handleChange("min", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type="number"
                value={(config.max as number) ?? ""}
                onChange={(e) => handleChange("max", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Step</Label>
              <Input
                type="number"
                value={(config.step as number) || 1}
                onChange={(e) => handleChange("step", parseFloat(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      );

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-4">
          <OptionsEditor
            options={options}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onRemoveOption={handleRemoveOption}
          />
          {fieldType === "MULTIPLE_CHOICE" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Selections</Label>
                <Input
                  type="number"
                  value={(config.minSelections as number) ?? ""}
                  onChange={(e) => handleChange("minSelections", e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Selections</Label>
                <Input
                  type="number"
                  value={(config.maxSelections as number) ?? ""}
                  onChange={(e) => handleChange("maxSelections", e.target.value ? parseInt(e.target.value) : undefined)}
                  min={1}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      );

    case "DATE_PARTS":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Year</Label>
              <Input
                type="number"
                value={(config.minYear as number) || 1900}
                onChange={(e) => handleChange("minYear", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max Year</Label>
              <Input
                type="number"
                value={(config.maxYear as number) || new Date().getFullYear() + 10}
                onChange={(e) => handleChange("maxYear", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowNA as boolean) || false}
                onChange={(e) => handleChange("allowNA", e.target.checked)}
              />
              <span className="text-sm">Allow NA</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowUnknown as boolean) || false}
                onChange={(e) => handleChange("allowUnknown", e.target.checked)}
              />
              <span className="text-sm">Allow Unknown</span>
            </label>
          </div>
        </div>
      );

    case "MATRIX_GRID":
      return (
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Configure the rows and columns for the matrix grid.
          </p>
          <div>
            <Label>Columns (one per line: value|label)</Label>
            <Textarea
              value={((config.columns as Array<{ value: string; label: string }>) || [])
                .map((c) => `${c.value}|${c.label}`)
                .join("\n")}
              onChange={(e) => {
                const columns = e.target.value
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line) => {
                    const [value, label] = line.split("|");
                    return { value: value?.trim() || "", label: label?.trim() || value?.trim() || "" };
                  });
                handleChange("columns", columns);
              }}
              placeholder="0|Independent&#10;1|Setup&#10;2|Supervision"
              rows={4}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label>Rows (one per line: id|label)</Label>
            <Textarea
              value={((config.rows as Array<{ id: string; label: string }>) || [])
                .map((r) => `${r.id}|${r.label}`)
                .join("\n")}
              onChange={(e) => {
                const rows = e.target.value
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line) => {
                    const [id, label] = line.split("|");
                    return { id: id?.trim() || "", label: label?.trim() || "" };
                  });
                handleChange("rows", rows);
              }}
              placeholder="A|Eating&#10;B|Oral Hygiene&#10;C|Toileting"
              rows={4}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={(config.allowNA as boolean) || false}
              onChange={(e) => handleChange("allowNA", e.target.checked)}
            />
            <span className="text-sm">Allow NA for cells</span>
          </label>
        </div>
      );

    case "HIERARCHICAL_CHECKBOX":
      return (
        <div className="space-y-4">
          <div>
            <Label>Options (JSON format)</Label>
            <Textarea
              value={JSON.stringify(config.options || [], null, 2)}
              onChange={(e) => {
                try {
                  handleChange("options", JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder={`[\n  { "id": "1", "label": "Option 1", "children": [] }\n]`}
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowMultiple as boolean) || false}
                onChange={(e) => handleChange("allowMultiple", e.target.checked)}
              />
              <span className="text-sm">Allow Multiple Selections</span>
            </label>
          </div>
          <div>
            <Label>None Option Text</Label>
            <Input
              value={(config.noneOption as string) || ""}
              onChange={(e) => handleChange("noneOption", e.target.value)}
              placeholder="None of the above"
              className="mt-1"
            />
          </div>
        </div>
      );

    case "CALCULATED_SCORE":
      return (
        <div className="space-y-4">
          <div>
            <Label>Source Items (comma-separated codes)</Label>
            <Input
              value={((config.sourceItems as string[]) || []).join(", ")}
              onChange={(e) => handleChange("sourceItems", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="C0200, C0300A, C0300B, C0300C"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display Format</Label>
              <Select
                value={(config.displayFormat as string) || "score_with_label"}
                onChange={(e) => handleChange("displayFormat", e.target.value)}
                className="mt-1"
              >
                <option value="score_only">Score Only</option>
                <option value="score_with_label">Score with Label</option>
                <option value="full">Full (with breakdown)</option>
              </Select>
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type="number"
                value={(config.maxValue as number) ?? ""}
                onChange={(e) => handleChange("maxValue", e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.autoCalculate as boolean) ?? true}
                onChange={(e) => handleChange("autoCalculate", e.target.checked)}
              />
              <span className="text-sm">Auto Calculate</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.showSourceItems as boolean) || false}
                onChange={(e) => handleChange("showSourceItems", e.target.checked)}
              />
              <span className="text-sm">Show Source Items</span>
            </label>
          </div>
        </div>
      );

    case "NUMERIC_COUNTER":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min</Label>
              <Input
                type="number"
                value={(config.min as number) ?? 0}
                onChange={(e) => handleChange("min", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max</Label>
              <Input
                type="number"
                value={(config.max as number) ?? 99}
                onChange={(e) => handleChange("max", parseInt(e.target.value) || 99)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Step</Label>
              <Input
                type="number"
                value={(config.step as number) || 1}
                onChange={(e) => handleChange("step", parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Unit Label</Label>
            <Input
              value={(config.unit as string) || ""}
              onChange={(e) => handleChange("unit", e.target.value)}
              placeholder="e.g., ulcers, days"
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.showButtons as boolean) ?? true}
                onChange={(e) => handleChange("showButtons", e.target.checked)}
              />
              <span className="text-sm">Show +/- Buttons</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowNA as boolean) || false}
                onChange={(e) => handleChange("allowNA", e.target.checked)}
              />
              <span className="text-sm">Allow NA</span>
            </label>
          </div>
        </div>
      );

    case "STRUCTURED_ID":
      return (
        <div className="space-y-4">
          <div>
            <Label>ID Format</Label>
            <Select
              value={(config.format as string) || "CUSTOM"}
              onChange={(e) => handleChange("format", e.target.value)}
              className="mt-1"
            >
              <option value="NPI">NPI (10 digits)</option>
              <option value="SSN">SSN (XXX-XX-XXXX)</option>
              <option value="MEDICARE">Medicare Number</option>
              <option value="MEDICAID">Medicaid ID</option>
              <option value="PHONE">Phone Number</option>
              <option value="ZIP">ZIP Code</option>
              <option value="CUSTOM">Custom Format</option>
            </Select>
          </div>
          {(config.format === "CUSTOM" || !config.format) && (
            <>
              <div>
                <Label>Input Mask</Label>
                <Input
                  value={(config.mask as string) || ""}
                  onChange={(e) => handleChange("mask", e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Separator</Label>
                <Input
                  value={(config.separator as string) || ""}
                  onChange={(e) => handleChange("separator", e.target.value)}
                  placeholder="-"
                  className="mt-1 w-20"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowNA as boolean) || false}
                onChange={(e) => handleChange("allowNA", e.target.checked)}
              />
              <span className="text-sm">Allow NA</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowUnknown as boolean) || false}
                onChange={(e) => handleChange("allowUnknown", e.target.checked)}
              />
              <span className="text-sm">Allow Unknown</span>
            </label>
          </div>
        </div>
      );

    case "MULTI_DIAGNOSIS":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Diagnoses</Label>
              <Input
                type="number"
                value={(config.maxDiagnoses as number) || 6}
                onChange={(e) => handleChange("maxDiagnoses", parseInt(e.target.value) || 6)}
                min={1}
                max={25}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.requirePrimary as boolean) ?? true}
                onChange={(e) => handleChange("requirePrimary", e.target.checked)}
              />
              <span className="text-sm">Require Primary Diagnosis</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={(config.allowSequencing as boolean) ?? true}
                onChange={(e) => handleChange("allowSequencing", e.target.checked)}
              />
              <span className="text-sm">Allow Reordering</span>
            </label>
          </div>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={(config.includeSymptomRating as boolean) || false}
              onChange={(e) => handleChange("includeSymptomRating", e.target.checked)}
            />
            <span className="text-sm">Include Symptom Control Rating</span>
          </label>
        </div>
      );

    default:
      return (
        <div className="text-center py-8 text-foreground-tertiary">
          <p>No additional configuration needed for this field type.</p>
        </div>
      );
  }
}
