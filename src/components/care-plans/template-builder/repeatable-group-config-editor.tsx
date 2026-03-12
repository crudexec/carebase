"use client";

import * as React from "react";
import { FormFieldType } from "@prisma/client";
import {
  RepeatableGroupFieldConfig,
  RepeatableGroupChildField,
  FIELD_TYPE_LABELS,
} from "@/lib/care-plans/types";
import { Input, Label, Select, Checkbox, Button } from "@/components/ui";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings2,
  Layers,
  GitBranch,
} from "lucide-react";
import { FieldTypeIcon } from "./field-type-selector";
import { cn } from "@/lib/utils";

interface GoalHierarchy {
  id: string;
  name: string;
  templateTypes: string[];
}

interface RepeatableGroupConfigEditorProps {
  config: RepeatableGroupFieldConfig;
  updateConfig: (config: Record<string, unknown>) => void;
}

// Allowed child field types for repeatable groups
const ALLOWED_CHILD_FIELD_TYPES: FormFieldType[] = [
  "TEXT_SHORT",
  "TEXT_LONG",
  "NUMBER",
  "YES_NO",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DATE",
  "CASCADING_SELECT",
];

// Generate a unique key from label
function generateKey(label: string, existingKeys: string[]): string {
  const baseKey = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "field";

  let key = baseKey;
  let counter = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${counter}`;
    counter++;
  }
  return key;
}

export function RepeatableGroupConfigEditor({
  config,
  updateConfig,
}: RepeatableGroupConfigEditorProps) {
  const [expandedField, setExpandedField] = React.useState<string | null>(null);
  const [hierarchies, setHierarchies] = React.useState<GoalHierarchy[]>([]);
  const [loadingHierarchies, setLoadingHierarchies] = React.useState(false);

  const childFields = config.childFields || [];

  // Fetch goal hierarchies for CASCADING_SELECT template type selection
  React.useEffect(() => {
    async function fetchHierarchies() {
      setLoadingHierarchies(true);
      try {
        const response = await fetch("/api/goal-hierarchies");
        if (response.ok) {
          const data = await response.json();
          setHierarchies(data.hierarchies || []);
        }
      } catch (error) {
        console.error("Failed to fetch hierarchies:", error);
      } finally {
        setLoadingHierarchies(false);
      }
    }
    fetchHierarchies();
  }, []);

  // Get unique template types from hierarchies
  const availableTemplateTypes = React.useMemo(() => {
    const types = new Set<string>();
    hierarchies.forEach((h) => {
      h.templateTypes.forEach((t) => types.add(t));
    });
    return Array.from(types).sort();
  }, [hierarchies]);

  const addChildField = () => {
    const existingKeys = childFields.map((f) => f.key);
    const newField: RepeatableGroupChildField = {
      key: generateKey("New Field", existingKeys),
      label: "New Field",
      type: "TEXT_SHORT",
      required: false,
    };
    updateConfig({ childFields: [...childFields, newField] });
    setExpandedField(newField.key);
  };

  const updateChildField = (index: number, updates: Partial<RepeatableGroupChildField>) => {
    const newFields = [...childFields];
    newFields[index] = { ...newFields[index], ...updates };

    // Auto-update key when label changes
    if (updates.label && !updates.key) {
      const otherKeys = childFields.filter((_, i) => i !== index).map((f) => f.key);
      newFields[index].key = generateKey(updates.label, otherKeys);
    }

    updateConfig({ childFields: newFields });
  };

  const removeChildField = (index: number) => {
    const newFields = childFields.filter((_, i) => i !== index);
    updateConfig({ childFields: newFields });
    setExpandedField(null);
  };

  const moveChildField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= childFields.length) return;

    const newFields = [...childFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    updateConfig({ childFields: newFields });
  };

  const renderChildFieldConfig = (field: RepeatableGroupChildField, index: number) => {
    switch (field.type) {
      case "CASCADING_SELECT":
        return (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-xs text-foreground-secondary">
              <GitBranch className="w-3 h-3" />
              <span>Goal Hierarchy Settings</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Template Type</Label>
              <Select
                value={(field.config?.templateType as string) || ""}
                onChange={(e) => {
                  updateChildField(index, {
                    config: {
                      ...field.config,
                      templateType: e.target.value || undefined,
                    },
                  });
                }}
                className="text-xs"
              >
                <option value="">Select template type...</option>
                {availableTemplateTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              {loadingHierarchies && (
                <p className="text-[10px] text-foreground-tertiary">Loading...</p>
              )}
              {!loadingHierarchies && availableTemplateTypes.length === 0 && (
                <p className="text-[10px] text-warning">
                  No goal hierarchies found. Create one first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Checkbox
                id={`show-steps-${index}`}
                checked={(field.config?.showSteps as boolean) ?? true}
                onChange={(e) => {
                  updateChildField(index, {
                    config: {
                      ...field.config,
                      showSteps: e.target.checked,
                    },
                  });
                }}
                label="Show task analysis steps"
              />
            </div>
            <div className="space-y-2">
              <Checkbox
                id={`multiple-steps-${index}`}
                checked={(field.config?.allowMultipleSteps as boolean) ?? true}
                onChange={(e) => {
                  updateChildField(index, {
                    config: {
                      ...field.config,
                      allowMultipleSteps: e.target.checked,
                    },
                  });
                }}
                label="Allow multiple steps selection"
              />
            </div>
          </div>
        );

      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE": {
        const options = (field.config?.options as Array<{ value: string; label: string }>) || [];
        return (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <Label className="text-xs">Options</Label>
            {options.map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-1">
                <Input
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[optIndex] = {
                      label: e.target.value,
                      value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    };
                    updateChildField(index, {
                      config: { ...field.config, options: newOptions },
                    });
                  }}
                  placeholder={`Option ${optIndex + 1}`}
                  className="text-xs h-7"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = options.filter((_, i) => i !== optIndex);
                    updateChildField(index, {
                      config: { ...field.config, options: newOptions },
                    });
                  }}
                  disabled={options.length <= 1}
                  className="p-1 text-foreground-tertiary hover:text-error disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const newOptions = [
                  ...options,
                  { value: `option_${options.length + 1}`, label: `Option ${options.length + 1}` },
                ];
                updateChildField(index, {
                  config: { ...field.config, options: newOptions },
                });
              }}
              className="text-xs h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add option
            </Button>
          </div>
        );
      }

      case "NUMBER":
        return (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={(field.config?.min as number) ?? ""}
                  onChange={(e) => {
                    updateChildField(index, {
                      config: {
                        ...field.config,
                        min: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    });
                  }}
                  placeholder="0"
                  className="text-xs h-7"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={(field.config?.max as number) ?? ""}
                  onChange={(e) => {
                    updateChildField(index, {
                      config: {
                        ...field.config,
                        max: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    });
                  }}
                  placeholder="100"
                  className="text-xs h-7"
                />
              </div>
            </div>
          </div>
        );

      case "TEXT_LONG":
        return (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Max length</Label>
              <Input
                type="number"
                value={(field.config?.maxLength as number) ?? ""}
                onChange={(e) => {
                  updateChildField(index, {
                    config: {
                      ...field.config,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  });
                }}
                placeholder="5000"
                className="text-xs h-7"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Child Fields Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-foreground-secondary" />
            Child Fields
          </h4>
          <span className="text-xs text-foreground-tertiary">
            {childFields.length} field{childFields.length !== 1 ? "s" : ""}
          </span>
        </div>

        {childFields.length === 0 ? (
          <div className="text-center py-4 text-foreground-tertiary border border-dashed border-border rounded-lg">
            <p className="text-xs">No fields defined yet</p>
            <p className="text-[10px] mt-1">Add fields that will appear in each group</p>
          </div>
        ) : (
          <div className="space-y-2">
            {childFields.map((field, index) => {
              const isExpanded = expandedField === field.key;
              return (
                <div
                  key={field.key}
                  className={cn(
                    "border border-border rounded-lg overflow-hidden transition-all",
                    isExpanded && "ring-1 ring-primary"
                  )}
                >
                  {/* Field Header */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-background-secondary",
                      isExpanded && "bg-background-secondary"
                    )}
                    onClick={() => setExpandedField(isExpanded ? null : field.key)}
                  >
                    <GripVertical className="w-3 h-3 text-foreground-tertiary cursor-grab" />
                    <FieldTypeIcon type={field.type} className="w-3.5 h-3.5 text-foreground-secondary" />
                    <span className="flex-1 text-xs font-medium truncate">{field.label}</span>
                    {field.required && (
                      <span className="text-[10px] text-warning">Required</span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-foreground-tertiary" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-foreground-tertiary" />
                    )}
                  </div>

                  {/* Field Editor (Expanded) */}
                  {isExpanded && (
                    <div className="px-3 py-3 border-t border-border bg-background space-y-3">
                      {/* Label */}
                      <div className="space-y-1">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateChildField(index, { label: e.target.value })}
                          placeholder="Field label"
                          className="text-xs h-8"
                        />
                      </div>

                      {/* Type */}
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value as FormFieldType;
                            // Reset config when type changes
                            let newConfig: Record<string, unknown> = {};
                            if (newType === "SINGLE_CHOICE" || newType === "MULTIPLE_CHOICE") {
                              newConfig = { options: [{ value: "option_1", label: "Option 1" }] };
                            } else if (newType === "CASCADING_SELECT") {
                              newConfig = { showSteps: true, allowMultipleSteps: true };
                            }
                            updateChildField(index, { type: newType, config: newConfig });
                          }}
                          className="text-xs"
                        >
                          {ALLOWED_CHILD_FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {FIELD_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Required */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={field.required || false}
                          onChange={(e) => updateChildField(index, { required: e.target.checked })}
                        />
                        <Label htmlFor={`required-${index}`} className="text-xs cursor-pointer">
                          Required
                        </Label>
                      </div>

                      {/* Type-specific config */}
                      {renderChildFieldConfig(field, index)}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveChildField(index, "up")}
                            disabled={index === 0}
                            className="h-7 px-2 text-xs"
                          >
                            Move up
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveChildField(index, "down")}
                            disabled={index === childFields.length - 1}
                            className="h-7 px-2 text-xs"
                          >
                            Move down
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChildField(index)}
                          className="h-7 px-2 text-xs text-error hover:text-error hover:bg-error/10"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addChildField}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add child field
        </Button>
      </div>

      {/* Group Options Section */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-foreground-secondary" />
          Group Options
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Min items</Label>
            <Input
              type="number"
              min={0}
              value={config.minItems ?? ""}
              onChange={(e) =>
                updateConfig({
                  minItems: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max items</Label>
            <Input
              type="number"
              min={1}
              value={config.maxItems ?? ""}
              onChange={(e) =>
                updateConfig({
                  maxItems: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="No limit"
              className="text-xs h-8"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Item label</Label>
          <Input
            value={config.itemLabel || ""}
            onChange={(e) =>
              updateConfig({ itemLabel: e.target.value || undefined })
            }
            placeholder="Item (e.g., Goal, Medication)"
            className="text-xs h-8"
          />
          <p className="text-[10px] text-foreground-tertiary">
            Shown as &quot;{config.itemLabel || "Item"} 1&quot;, &quot;{config.itemLabel || "Item"} 2&quot;, etc.
          </p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Add button label</Label>
          <Input
            value={config.addButtonLabel || ""}
            onChange={(e) =>
              updateConfig({ addButtonLabel: e.target.value || undefined })
            }
            placeholder="Add Item"
            className="text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="collapsible"
            checked={config.collapsible || false}
            onChange={(e) => updateConfig({ collapsible: e.target.checked })}
          />
          <Label htmlFor="collapsible" className="text-xs cursor-pointer">
            Collapsible groups
          </Label>
        </div>
      </div>

      {/* Preview */}
      {childFields.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <h4 className="text-xs font-medium text-foreground-secondary">Preview Structure</h4>
          <div className="rounded-lg border border-dashed border-border p-3 bg-background-secondary">
            <div className="text-[10px] text-foreground-tertiary mb-2">
              {config.itemLabel || "Item"} 1
            </div>
            {childFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 py-1">
                <FieldTypeIcon type={field.type} className="w-3 h-3 text-foreground-tertiary" />
                <span className="text-xs text-foreground-secondary">
                  {field.label}
                  {field.required && <span className="text-error ml-0.5">*</span>}
                </span>
                {field.type === "CASCADING_SELECT" && typeof field.config?.templateType === "string" && (
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {field.config.templateType}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
