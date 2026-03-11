"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input, Textarea, Select, Label, DateInput } from "@/components/ui";
import { CascadingSelectField } from "./cascading-select-field";
import { FormFieldType as _FormFieldType } from "@prisma/client";
import {
  RepeatableGroupFieldConfig,
  RepeatableGroupChildField,
  RepeatableGroupItemValue,
  CascadingSelectValue,
} from "@/lib/care-plans/types";

type ChildFieldValue = string | number | boolean | string[] | CascadingSelectValue | null;

interface RepeatableGroupFieldProps {
  value: RepeatableGroupItemValue[] | null;
  onChange: (value: RepeatableGroupItemValue[]) => void;
  config: RepeatableGroupFieldConfig;
  disabled?: boolean;
}

export function RepeatableGroupField({
  value,
  onChange,
  config,
  disabled = false,
}: RepeatableGroupFieldProps) {
  const items = value || [];
  const {
    childFields,
    minItems = 0,
    maxItems,
    addButtonLabel = "Add Item",
    itemLabel = "Item",
    collapsible = false,
  } = config;

  const [collapsedItems, setCollapsedItems] = React.useState<Set<number>>(new Set());

  // Add a new empty item
  const handleAddItem = () => {
    if (maxItems && items.length >= maxItems) return;

    // Create empty values for each child field
    const newItem: RepeatableGroupItemValue = {};
    childFields.forEach((field) => {
      newItem[field.key] = null;
    });

    onChange([...items, newItem]);
  };

  // Remove an item
  const handleRemoveItem = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);

    // Update collapsed state
    const newCollapsed = new Set<number>();
    collapsedItems.forEach((i) => {
      if (i < index) newCollapsed.add(i);
      else if (i > index) newCollapsed.add(i - 1);
    });
    setCollapsedItems(newCollapsed);
  };

  // Update a field value within an item
  const handleFieldChange = (itemIndex: number, fieldKey: string, fieldValue: ChildFieldValue) => {
    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [fieldKey]: fieldValue,
    };
    onChange(newItems);
  };

  // Toggle collapse state
  const toggleCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedItems(newCollapsed);
  };

  // Render a child field based on its type
  const renderChildField = (
    field: RepeatableGroupChildField,
    itemIndex: number,
    fieldValue: ChildFieldValue
  ) => {
    const fieldConfig = field.config || {};

    switch (field.type) {
      case "TEXT_SHORT":
        return (
          <Input
            value={(fieldValue as string) || ""}
            onChange={(e) => handleFieldChange(itemIndex, field.key, e.target.value)}
            disabled={disabled}
            placeholder={(fieldConfig.placeholder as string) || ""}
            className="h-10"
          />
        );

      case "TEXT_LONG":
        return (
          <Textarea
            value={(fieldValue as string) || ""}
            onChange={(e) => handleFieldChange(itemIndex, field.key, e.target.value)}
            disabled={disabled}
            placeholder={(fieldConfig.placeholder as string) || ""}
            rows={3}
            className="resize-none"
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={fieldValue !== null && fieldValue !== undefined ? String(fieldValue) : ""}
            onChange={(e) =>
              handleFieldChange(
                itemIndex,
                field.key,
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            disabled={disabled}
            min={fieldConfig.min as number}
            max={fieldConfig.max as number}
            className="h-10 max-w-[150px]"
          />
        );

      case "DATE":
        return (
          <DateInput
            value={(fieldValue as string) || ""}
            onChange={(e) => handleFieldChange(itemIndex, field.key, e.target.value)}
            disabled={disabled}
            className="h-10 max-w-[200px]"
          />
        );

      case "SINGLE_CHOICE": {
        const options = (fieldConfig.options as string[]) || [];
        return (
          <Select
            value={(fieldValue as string) || ""}
            onChange={(e) => handleFieldChange(itemIndex, field.key, e.target.value)}
            disabled={disabled}
            className="h-10"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        );
      }

      case "CASCADING_SELECT":
        return (
          <CascadingSelectField
            value={(fieldValue as CascadingSelectValue) || null}
            onChange={(v) => handleFieldChange(itemIndex, field.key, v)}
            config={{
              hierarchyId: fieldConfig.hierarchyId as string | undefined,
              templateType: fieldConfig.templateType as string | undefined,
              allowMultipleSteps: fieldConfig.allowMultipleSteps as boolean | undefined,
              showSteps: fieldConfig.showSteps as boolean | undefined,
            }}
            disabled={disabled}
          />
        );

      default:
        return (
          <Input
            value={(fieldValue as string) || ""}
            onChange={(e) => handleFieldChange(itemIndex, field.key, e.target.value)}
            disabled={disabled}
            className="h-10"
          />
        );
    }
  };

  // Get a summary of the item for collapsed view
  const getItemSummary = (item: RepeatableGroupItemValue): string => {
    // Try to get a meaningful summary from cascading select or first text field
    for (const field of childFields) {
      const value = item[field.key];
      if (field.type === "CASCADING_SELECT" && value) {
        const cascading = value as CascadingSelectValue;
        if (cascading.goalAreaName) {
          return cascading.targetSkillName
            ? `${cascading.goalAreaName} - ${cascading.targetSkillName}`
            : cascading.goalAreaName;
        }
      }
      if ((field.type === "TEXT_SHORT" || field.type === "TEXT_LONG") && value) {
        const text = value as string;
        return text.length > 50 ? text.substring(0, 50) + "..." : text;
      }
    }
    return "No data entered";
  };

  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className="space-y-4">
      {/* Items list */}
      {items.map((item, itemIndex) => {
        const isCollapsed = collapsible && collapsedItems.has(itemIndex);
        const summary = getItemSummary(item);

        return (
          <div
            key={itemIndex}
            className={cn(
              "relative rounded-xl border bg-white transition-all duration-200",
              "border-border hover:border-primary/30"
            )}
          >
            {/* Item header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background-secondary/30 rounded-t-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {itemIndex + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">
                    {itemLabel} {itemIndex + 1}
                  </span>
                  {isCollapsed && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {summary}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {collapsible && (
                  <button
                    type="button"
                    onClick={() => toggleCollapse(itemIndex)}
                    className="p-1.5 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                )}
                {canRemove && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(itemIndex)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-colors"
                    title={`Remove ${itemLabel} ${itemIndex + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Item fields */}
            {!isCollapsed && (
              <div className="p-4 space-y-4">
                {childFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="ml-1 text-error">*</span>}
                    </Label>
                    {renderChildField(field, itemIndex, item[field.key] as ChildFieldValue)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add button */}
      {canAdd && !disabled && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddItem}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonLabel}
        </Button>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No {itemLabel.toLowerCase()}s added yet.</p>
          <p className="text-xs mt-1">Click the button above to add one.</p>
        </div>
      )}

      {/* Min/max info */}
      {(minItems > 0 || maxItems) && (
        <p className="text-xs text-muted-foreground text-center">
          {minItems > 0 && `Minimum: ${minItems}`}
          {minItems > 0 && maxItems && " • "}
          {maxItems && `Maximum: ${maxItems}`}
          {` • Current: ${items.length}`}
        </p>
      )}
    </div>
  );
}
