"use client";

import * as React from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormSectionData, FormFieldData } from "@/lib/visit-notes/types";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import { GripVertical, Plus, ChevronDown, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { FieldItem } from "./field-item";

interface SectionItemProps {
  section: FormSectionData;
  isExpanded: boolean;
  selectedFieldId: string | null;
  onToggleExpand: () => void;
  onUpdateSection: (updates: Partial<FormSectionData>) => void;
  onDeleteSection: () => void;
  onSelectField: (fieldId: string) => void;
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: Partial<FormFieldData>) => void;
  onDeleteField: (fieldId: string) => void;
}

export function SectionItem({
  section,
  isExpanded,
  selectedFieldId,
  onToggleExpand,
  onUpdateSection,
  onDeleteSection,
  onSelectField,
  onAddField,
  onUpdateField,
  onDeleteField,
}: SectionItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(section.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateSection({ title: editTitle.trim() });
    } else {
      setEditTitle(section.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-background-secondary",
        isDragging && "opacity-50"
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-foreground-tertiary hover:bg-background hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/collapse */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="rounded p-1 text-foreground-tertiary hover:bg-background hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setEditTitle(section.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="h-7"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{section.title}</h3>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded p-1 text-foreground-tertiary hover:bg-background hover:text-foreground opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          )}
          {section.description && !isEditing && (
            <p className="text-xs text-foreground-tertiary truncate">
              {section.description}
            </p>
          )}
        </div>

        {/* Field count */}
        <span className="text-xs text-foreground-tertiary">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>

        {/* Delete section */}
        <button
          type="button"
          onClick={onDeleteSection}
          className="rounded p-1 text-foreground-tertiary hover:bg-background hover:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Section content (fields) */}
      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2">
          {section.fields.length > 0 ? (
            <SortableContext
              items={section.fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.fields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onClick={() => onSelectField(field.id)}
                />
              ))}
            </SortableContext>
          ) : (
            <p className="text-sm text-foreground-tertiary text-center py-4">
              No fields yet. Add a field to get started.
            </p>
          )}

          {/* Add field button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddField}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        </div>
      )}
    </div>
  );
}

// Overlay for drag preview
export function SectionItemOverlay({ section }: { section: FormSectionData }) {
  return (
    <div className="rounded-lg border border-primary bg-background-secondary shadow-lg">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="h-4 w-4 text-foreground-tertiary" />
        <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{section.title}</h3>
        </div>
        <span className="text-xs text-foreground-tertiary">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
