"use client";

import * as React from "react";
import { Button, Input, Textarea, Select, Checkbox, Label } from "@/components/ui";
import { Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateItemData } from "./oasis-template-builder";
import type { OasisTimePoint, OasisAssessorDiscipline } from "@/lib/oasis/types";
import { FormFieldType } from "@prisma/client";
import { OasisFieldConfigEditor } from "./oasis-field-config-editor";

interface OasisItemEditorProps {
  item: TemplateItemData;
  sectionCode: string;
  onUpdate: (updates: Partial<TemplateItemData>) => void;
  onDelete: () => void;
}

const TIME_POINTS: { value: OasisTimePoint; label: string }[] = [
  { value: "SOC", label: "Start of Care" },
  { value: "ROC", label: "Resumption of Care" },
  { value: "FU", label: "Follow-up" },
  { value: "TRN", label: "Transfer" },
  { value: "DC", label: "Discharge" },
  { value: "DAH", label: "Death at Home" },
];

const _DISCIPLINES: { value: OasisAssessorDiscipline; label: string }[] = [
  { value: "RN", label: "Registered Nurse" },
  { value: "PT", label: "Physical Therapist" },
  { value: "OT", label: "Occupational Therapist" },
  { value: "ST", label: "Speech Therapist" },
];

const FIELD_TYPES: { value: FormFieldType; label: string; description: string }[] = [
  { value: "CODE_ENTRY", label: "Code Entry", description: "Single or multi-digit code selection" },
  { value: "TEXT_SHORT", label: "Short Text", description: "Single line text input" },
  { value: "TEXT_LONG", label: "Long Text", description: "Multi-line text area" },
  { value: "NUMBER", label: "Number", description: "Numeric input" },
  { value: "YES_NO", label: "Yes/No", description: "Boolean toggle" },
  { value: "SINGLE_CHOICE", label: "Single Choice", description: "Select one option" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", description: "Select multiple options" },
  { value: "DATE", label: "Date", description: "Date picker" },
  { value: "DATE_PARTS", label: "Date Parts", description: "Separate M/D/Y inputs with NA/UK" },
  { value: "MATRIX_GRID", label: "Matrix Grid", description: "Multi-row/column grid" },
  { value: "HIERARCHICAL_CHECKBOX", label: "Hierarchical Checkbox", description: "Nested checkbox options" },
  { value: "CALCULATED_SCORE", label: "Calculated Score", description: "Auto-calculated score" },
  { value: "NUMERIC_COUNTER", label: "Numeric Counter", description: "Counter with +/- buttons" },
  { value: "STRUCTURED_ID", label: "Structured ID", description: "Formatted ID input" },
  { value: "MULTI_DIAGNOSIS", label: "Multi Diagnosis", description: "Multiple ICD-10 codes" },
];

export function OasisItemEditor({
  item,
  sectionCode: _sectionCode,
  onUpdate,
  onDelete,
}: OasisItemEditorProps) {
  const [activeTab, setActiveTab] = React.useState<"general" | "config" | "logic">("general");

  const handleTimePointToggle = (timePoint: OasisTimePoint) => {
    const newVisibleAt = item.visibleAt.includes(timePoint)
      ? item.visibleAt.filter((tp) => tp !== timePoint)
      : [...item.visibleAt, timePoint];
    onUpdate({ visibleAt: newVisibleAt });
  };

  const handleSelectAllTimePoints = () => {
    onUpdate({ visibleAt: TIME_POINTS.map((tp) => tp.value) });
  };

  const handleClearAllTimePoints = () => {
    onUpdate({ visibleAt: [] });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Item header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={item.code}
                onChange={(e) => onUpdate({ code: e.target.value.toUpperCase() })}
                className="w-32 font-mono text-sm"
                placeholder="M0030"
              />
              <span className="text-foreground-tertiary">|</span>
              <span className="text-sm text-foreground-secondary">
                {FIELD_TYPES.find((ft) => ft.value === item.fieldType)?.label}
              </span>
            </div>
            <Input
              value={item.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="text-lg border-0 p-0 h-auto focus:ring-0"
              placeholder="Item label"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={onDelete} className="text-error">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b -mb-px">
          {[
            { id: "general", label: "General" },
            { id: "config", label: "Field Config" },
            { id: "logic", label: "Skip Logic" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Field Type */}
            <div>
              <Label>Field Type</Label>
              <Select
                value={item.fieldType}
                onChange={(e) => onUpdate({ fieldType: e.target.value as FormFieldType, config: {} })}
                className="mt-1"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label} - {ft.description}
                  </option>
                ))}
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Item description (shown below the label)"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Help Text */}
            <div>
              <Label>Help Text</Label>
              <Textarea
                value={item.helpText || ""}
                onChange={(e) => onUpdate({ helpText: e.target.value })}
                placeholder="Additional help text (shown in tooltip)"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="required"
                checked={item.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
              />
              <Label htmlFor="required" className="cursor-pointer">
                Required field
              </Label>
            </div>

            {/* Time Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Visible at Time Points</Label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllTimePoints}
                    className="text-xs text-primary hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAllTimePoints}
                    className="text-xs text-foreground-secondary hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_POINTS.map((tp) => (
                  <label
                    key={tp.value}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors",
                      item.visibleAt.includes(tp.value)
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-background-secondary"
                    )}
                  >
                    <Checkbox
                      checked={item.visibleAt.includes(tp.value)}
                      onChange={() => handleTimePointToggle(tp.value)}
                    />
                    <div>
                      <div className="font-medium text-sm">{tp.value}</div>
                      <div className="text-xs text-foreground-tertiary">{tp.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <OasisFieldConfigEditor
            fieldType={item.fieldType}
            config={item.config}
            onUpdate={(config) => onUpdate({ config })}
          />
        )}

        {activeTab === "logic" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground-secondary">
              Configure skip logic rules to control when this item is shown or hidden based on other responses.
            </p>

            {/* Skip logic rules would go here - simplified for now */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Skip Logic Rules</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const newRule = {
                      id: `rule-${Date.now()}`,
                      conditions: [],
                      action: "hide",
                      target: item.code,
                    };
                    onUpdate({
                      skipLogic: [...(item.skipLogic || []), newRule],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>

              {(!item.skipLogic || item.skipLogic.length === 0) ? (
                <p className="text-sm text-foreground-tertiary text-center py-4">
                  No skip logic rules configured
                </p>
              ) : (
                <div className="space-y-2">
                  {item.skipLogic.map((rule: unknown, index: number) => {
                    const r = rule as { id: string; action: string };
                    return (
                      <div
                        key={r.id || index}
                        className="flex items-center justify-between p-2 bg-background-secondary rounded"
                      >
                        <span className="text-sm">
                          Rule {index + 1}: {r.action || "hide"}
                        </span>
                        <button
                          onClick={() => {
                            onUpdate({
                              skipLogic: (item.skipLogic || []).filter((_, i) => i !== index),
                            });
                          }}
                          className="p-1 hover:bg-error/10 hover:text-error rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
