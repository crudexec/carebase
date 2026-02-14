"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AssessmentItemData, RESPONSE_TYPE_LABELS } from "@/lib/assessments/types";
import { cn } from "@/lib/utils";
import { GripVertical, Asterisk } from "lucide-react";
import { ResponseTypeIcon } from "./response-type-selector";

interface QuestionItemProps {
  item: AssessmentItemData;
  isSelected: boolean;
  onClick: () => void;
}

export function QuestionItem({ item, isSelected, onClick }: QuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-background p-3 transition-colors cursor-pointer",
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
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Response type icon */}
      <ResponseTypeIcon
        type={item.responseType}
        className="h-4 w-4 text-foreground-secondary shrink-0"
      />

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{item.questionText}</span>
          {item.required && (
            <Asterisk className="h-3 w-3 text-error shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
          <span className="font-mono">{item.code}</span>
          <span>•</span>
          <span>{RESPONSE_TYPE_LABELS[item.responseType]}</span>
        </div>
      </div>
    </div>
  );
}

// Overlay component for drag preview
export function QuestionItemOverlay({ item }: { item: AssessmentItemData }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-primary bg-background p-3 shadow-lg">
      <GripVertical className="h-4 w-4 text-foreground-tertiary" />
      <ResponseTypeIcon
        type={item.responseType}
        className="h-4 w-4 text-foreground-secondary shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{item.questionText}</span>
          {item.required && (
            <Asterisk className="h-3 w-3 text-error shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
          <span className="font-mono">{item.code}</span>
          <span>•</span>
          <span>{RESPONSE_TYPE_LABELS[item.responseType]}</span>
        </div>
      </div>
    </div>
  );
}
