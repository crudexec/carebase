"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormFieldData, FIELD_TYPE_LABELS } from "@/lib/visit-notes/types";
import { cn } from "@/lib/utils";
import { GripVertical, Asterisk } from "lucide-react";
import { FieldTypeIcon } from "./field-type-selector";

interface FieldItemProps {
  field: FormFieldData;
  isSelected: boolean;
  onClick: () => void;
}

export function FieldItem({ field, isSelected, onClick }: FieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-background p-3 transition-colors",
        isSelected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-primary/50",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Field type icon */}
      <FieldTypeIcon
        type={field.type}
        className="h-4 w-4 text-foreground-secondary shrink-0"
      />

      {/* Field info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{field.label}</span>
          {field.required && (
            <Asterisk className="h-3 w-3 text-error shrink-0" />
          )}
        </div>
        <span className="text-xs text-foreground-tertiary">
          {FIELD_TYPE_LABELS[field.type]}
        </span>
      </div>
    </div>
  );
}

// Overlay component for drag preview
export function FieldItemOverlay({ field }: { field: FormFieldData }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-primary bg-background p-3 shadow-lg">
      <GripVertical className="h-4 w-4 text-foreground-tertiary" />
      <FieldTypeIcon
        type={field.type}
        className="h-4 w-4 text-foreground-secondary shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{field.label}</span>
          {field.required && (
            <Asterisk className="h-3 w-3 text-error shrink-0" />
          )}
        </div>
        <span className="text-xs text-foreground-tertiary">
          {FIELD_TYPE_LABELS[field.type]}
        </span>
      </div>
    </div>
  );
}
