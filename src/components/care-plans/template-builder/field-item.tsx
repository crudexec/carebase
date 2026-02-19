"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CarePlanTemplateFieldData, FIELD_TYPE_LABELS } from "@/lib/care-plans/types";
import { cn } from "@/lib/utils";
import { GripVertical, Asterisk } from "lucide-react";
import { FieldTypeIcon } from "./field-type-selector";

interface FieldItemProps {
  field: CarePlanTemplateFieldData;
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
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        isDragging && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-foreground-tertiary hover:bg-background hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Field type icon */}
      <FieldTypeIcon type={field.type} className="h-4 w-4 text-foreground-secondary shrink-0" />

      {/* Field label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm truncate">{field.label}</span>
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

// Overlay for drag preview
export function FieldItemOverlay({ field }: { field: CarePlanTemplateFieldData }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary bg-background p-2 shadow-lg">
      <GripVertical className="h-4 w-4 text-foreground-tertiary" />
      <FieldTypeIcon type={field.type} className="h-4 w-4 text-foreground-secondary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm truncate">{field.label}</span>
          {field.required && <Asterisk className="h-3 w-3 text-error" />}
        </div>
      </div>
    </div>
  );
}
