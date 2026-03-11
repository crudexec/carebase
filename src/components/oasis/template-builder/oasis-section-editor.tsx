"use client";

import * as React from "react";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { Plus, Trash2, GripVertical, ChevronDown, Copy, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OasisItemEditor } from "./oasis-item-editor";
import type { TemplateSectionData, TemplateItemData } from "./oasis-template-builder";
import type { OasisTimePoint } from "@/lib/oasis/types";
import { FormFieldType } from "@prisma/client";

interface OasisSectionEditorProps {
  section: TemplateSectionData;
  onUpdate: (updates: Partial<TemplateSectionData>) => void;
  onDelete: () => void;
}

const TIME_POINTS: OasisTimePoint[] = ["SOC", "ROC", "FU", "TRN", "DC", "DAH"];

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "CODE_ENTRY", label: "Code Entry" },
  { value: "TEXT_SHORT", label: "Short Text" },
  { value: "TEXT_LONG", label: "Long Text" },
  { value: "NUMBER", label: "Number" },
  { value: "YES_NO", label: "Yes/No" },
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "DATE", label: "Date" },
  { value: "DATE_PARTS", label: "Date Parts (M/D/Y)" },
  { value: "MATRIX_GRID", label: "Matrix Grid" },
  { value: "HIERARCHICAL_CHECKBOX", label: "Hierarchical Checkbox" },
  { value: "CALCULATED_SCORE", label: "Calculated Score" },
  { value: "NUMERIC_COUNTER", label: "Numeric Counter" },
  { value: "STRUCTURED_ID", label: "Structured ID" },
  { value: "MULTI_DIAGNOSIS", label: "Multi Diagnosis" },
];

export function OasisSectionEditor({
  section,
  onUpdate,
  onDelete,
}: OasisSectionEditorProps) {
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [bulkAddMode, setBulkAddMode] = React.useState(false);
  const [bulkAddText, setBulkAddText] = React.useState("");

  const handleAddItem = (fieldType: FormFieldType = "CODE_ENTRY") => {
    const itemNumber = section.items.length + 1;
    const newItem: TemplateItemData = {
      id: `item-${Date.now()}`,
      code: `${section.code}${String(itemNumber).padStart(4, "0")}`,
      label: "",
      description: "",
      fieldType,
      required: false,
      order: section.items.length,
      visibleAt: ["SOC", "ROC", "FU", "TRN", "DC", "DAH"],
      config: {},
    };

    onUpdate({
      items: [...section.items, newItem],
    });
    setActiveItemId(newItem.id);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<TemplateItemData>) => {
    onUpdate({
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      items: section.items
        .filter((item) => item.id !== itemId)
        .map((item, i) => ({ ...item, order: i })),
    });
    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
  };

  const handleDuplicateItem = (itemId: string) => {
    const item = section.items.find((i) => i.id === itemId);
    if (!item) return;

    const newItem: TemplateItemData = {
      ...item,
      id: `item-${Date.now()}`,
      code: `${item.code}_copy`,
      label: `${item.label} (Copy)`,
      order: section.items.length,
    };

    onUpdate({
      items: [...section.items, newItem],
    });
    setActiveItemId(newItem.id);
  };

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    const index = section.items.findIndex((i) => i.id === itemId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.items.length) return;

    const newItems = [...section.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    onUpdate({
      items: newItems.map((item, i) => ({ ...item, order: i })),
    });
  };

  const handleBulkAdd = () => {
    // Parse bulk text - format: CODE|Label|FieldType (one per line)
    const lines = bulkAddText.split("\n").filter((line) => line.trim());
    const newItems: TemplateItemData[] = [];

    for (const line of lines) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 2) {
        const [code, label, fieldTypeStr] = parts;
        const fieldType = (fieldTypeStr?.toUpperCase() as FormFieldType) || "CODE_ENTRY";

        newItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          code,
          label,
          description: "",
          fieldType: FIELD_TYPES.some((ft) => ft.value === fieldType) ? fieldType : "CODE_ENTRY",
          required: false,
          order: section.items.length + newItems.length,
          visibleAt: TIME_POINTS,
          config: {},
        });
      }
    }

    if (newItems.length > 0) {
      onUpdate({
        items: [...section.items, ...newItems],
      });
      setBulkAddText("");
      setBulkAddMode(false);
    }
  };

  const activeItem = activeItemId
    ? section.items.find((i) => i.id === activeItemId)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Section header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-sm font-medium">
                Section {section.code}
              </span>
            </div>
            <Input
              value={section.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="text-lg font-semibold border-0 p-0 h-auto focus:ring-0"
              placeholder="Section name"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={onDelete} className="text-error">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          value={section.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Section description (optional)"
          className="resize-none"
          rows={2}
        />
      </div>

      {/* Items area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Items list */}
        <div className="w-96 border-r overflow-y-auto">
          <div className="p-3 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Items ({section.items.length})</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBulkAddMode(!bulkAddMode)}
                >
                  {bulkAddMode ? "Cancel" : "Bulk Add"}
                </Button>
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value as FormFieldType);
                      e.target.value = "";
                    }
                  }}
                  className="w-auto"
                >
                  <option value="">+ Add Item</option>
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft.value} value={ft.value}>
                      {ft.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {bulkAddMode && (
              <div className="mt-3 p-3 bg-background-secondary rounded-lg">
                <p className="text-xs text-foreground-secondary mb-2">
                  Enter items (one per line): CODE|Label|FieldType
                </p>
                <Textarea
                  value={bulkAddText}
                  onChange={(e) => setBulkAddText(e.target.value)}
                  placeholder="M0030|Start of Care Date|DATE_PARTS&#10;M0040|Patient Last Name|TEXT_SHORT"
                  rows={5}
                  className="text-xs font-mono"
                />
                <Button size="sm" onClick={handleBulkAdd} className="mt-2">
                  Add Items
                </Button>
              </div>
            )}
          </div>

          <div className="p-2 space-y-1">
            {section.items.length === 0 ? (
              <div className="text-center py-8 text-foreground-tertiary">
                <p className="text-sm">No items in this section</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddItem()}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Item
                </Button>
              </div>
            ) : (
              section.items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      activeItemId === item.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-background-secondary border border-transparent"
                    )}
                    onClick={() => setActiveItemId(item.id)}
                  >
                    <GripVertical className="h-4 w-4 text-foreground-tertiary opacity-0 group-hover:opacity-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground-secondary">
                          {item.code}
                        </span>
                        {item.required && (
                          <span className="text-error text-xs">*</span>
                        )}
                      </div>
                      <div className="text-sm truncate">
                        {item.label || "(No label)"}
                      </div>
                      <div className="text-xs text-foreground-tertiary">
                        {FIELD_TYPES.find((ft) => ft.value === item.fieldType)?.label || item.fieldType}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveItem(item.id, "up");
                        }}
                        disabled={index === 0}
                        className="p-1 hover:bg-background-tertiary rounded disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveItem(item.id, "down");
                        }}
                        disabled={index === section.items.length - 1}
                        className="p-1 hover:bg-background-tertiary rounded disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateItem(item.id);
                        }}
                        className="p-1 hover:bg-background-tertiary rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="p-1 hover:bg-error/10 hover:text-error rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Item editor */}
        <div className="flex-1 overflow-y-auto">
          {activeItem ? (
            <OasisItemEditor
              item={activeItem}
              sectionCode={section.code}
              onUpdate={(updates) => handleUpdateItem(activeItem.id, updates)}
              onDelete={() => handleDeleteItem(activeItem.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-foreground-tertiary">
              <div className="text-center">
                <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an item to edit</p>
                <p className="text-sm mt-1">or add a new item</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
