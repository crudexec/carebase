"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Square, CheckSquare } from "lucide-react";
import type { HierarchicalCheckboxConfig, HierarchicalOption } from "@/lib/oasis/types";

interface HierarchicalCheckboxFieldProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
  config: HierarchicalCheckboxConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function HierarchicalCheckboxField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: HierarchicalCheckboxFieldProps) {
  const {
    options: configOptions,
    items: configItems,
    allowMultiple: configAllowMultiple,
    multiSelect,
    maxSelections,
    noneOption,
    noneValue = "NONE",
  } = config;

  // Use options or items (items is alias)
  const options = configOptions || configItems || [];
  // Use allowMultiple or multiSelect (multiSelect is alias)
  const allowMultiple = configAllowMultiple ?? multiSelect ?? false;

  const selectedValues = value || [];
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (optionValue: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(optionValue)) {
      newExpanded.delete(optionValue);
    } else {
      newExpanded.add(optionValue);
    }
    setExpandedItems(newExpanded);
  };

  const handleSelect = (optionValue: string) => {
    // Handle "none" option
    if (noneOption && optionValue === noneValue) {
      if (selectedValues.includes(noneValue)) {
        onChange([]);
      } else {
        onChange([noneValue]);
      }
      return;
    }

    // Remove "none" if selecting other options
    let newValues = selectedValues.filter((v) => v !== noneValue);

    if (allowMultiple) {
      if (newValues.includes(optionValue)) {
        newValues = newValues.filter((v) => v !== optionValue);
      } else {
        if (maxSelections && newValues.length >= maxSelections) {
          return;
        }
        newValues.push(optionValue);
      }
    } else {
      newValues = [optionValue];
    }

    onChange(newValues);
  };

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

  const renderOption = (option: HierarchicalOption, depth: number = 0) => {
    const optionValue = option.value ?? option.id;
    const hasChildren = option.children && option.children.length > 0;
    const isExpanded = expandedItems.has(optionValue);
    const selected = isSelected(optionValue);

    return (
      <div key={optionValue} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
            "hover:bg-background-secondary cursor-pointer",
            selected && "bg-primary/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {/* Expand/collapse button for items with children */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(optionValue);
              }}
              disabled={disabled}
              className="p-0.5 hover:bg-background-tertiary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-foreground-tertiary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => handleSelect(optionValue)}
            disabled={disabled || option.disabled}
            className={cn(
              "flex items-center gap-2 flex-1 text-left",
              option.disabled && "opacity-50"
            )}
          >
            {allowMultiple ? (
              selected ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-foreground-tertiary shrink-0" />
              )
            ) : (
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                  selected
                    ? "border-primary bg-primary"
                    : "border-foreground-tertiary"
                )}
              >
                {selected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            )}

            <span className="text-sm">
              <span className="font-medium text-foreground-secondary mr-1">
                {option.code}
              </span>
              {option.label}
            </span>
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {option.children!.map((child) => renderOption(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id={id}
      className={cn(
        "border rounded-lg p-2 max-h-80 overflow-y-auto",
        error ? "border-error" : "border-border"
      )}
    >
      {/* None option at top if configured */}
      {noneOption && (
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors mb-2 border-b border-border pb-2",
            "hover:bg-background-secondary cursor-pointer",
            isSelected(noneValue) && "bg-primary/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="w-5" />
          <button
            type="button"
            onClick={() => handleSelect(noneValue)}
            disabled={disabled}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {allowMultiple ? (
              isSelected(noneValue) ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-foreground-tertiary shrink-0" />
              )
            ) : (
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                  isSelected(noneValue)
                    ? "border-primary bg-primary"
                    : "border-foreground-tertiary"
                )}
              >
                {isSelected(noneValue) && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            )}
            <span className="text-sm font-medium">
              {typeof noneOption === 'string' ? noneOption : noneOption?.label}
            </span>
          </button>
        </div>
      )}

      {/* Options */}
      {options.map((option) => renderOption(option))}

      {/* Selection count */}
      {allowMultiple && maxSelections && (
        <p className="text-xs text-foreground-tertiary mt-2 px-2">
          {selectedValues.filter((v) => v !== noneValue).length} of {maxSelections} selected
        </p>
      )}
    </div>
  );
}
