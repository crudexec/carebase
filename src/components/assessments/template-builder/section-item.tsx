"use client";

import * as React from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AssessmentSectionData, AssessmentItemData, SECTION_TYPE_LABELS } from "@/lib/assessments/types";
import { cn } from "@/lib/utils";
import { Button, Input, Textarea } from "@/components/ui";
import { GripVertical, Plus, ChevronDown, ChevronRight, Trash2, Edit2, FileText } from "lucide-react";
import { QuestionItem } from "./question-item";

interface SectionItemProps {
  section: AssessmentSectionData;
  isExpanded: boolean;
  selectedItemId: string | null;
  onToggleExpand: () => void;
  onUpdateSection: (updates: Partial<AssessmentSectionData>) => void;
  onDeleteSection: () => void;
  onSelectItem: (itemId: string) => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<AssessmentItemData>) => void;
  onDeleteItem: (itemId: string) => void;
}

export function SectionItem({
  section,
  isExpanded,
  selectedItemId,
  onToggleExpand,
  onUpdateSection,
  onDeleteSection,
  onSelectItem,
  onAddItem,
}: SectionItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(section.title);
  const [editDescription, setEditDescription] = React.useState(section.description || "");

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

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateSection({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
    } else {
      setEditTitle(section.title);
      setEditDescription(section.description || "");
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

        {/* Section type badge */}
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary shrink-0">
          {SECTION_TYPE_LABELS[section.sectionType]}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setEditTitle(section.title);
                    setEditDescription(section.description || "");
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="h-7"
                placeholder="Section title"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Section description (optional)"
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditTitle(section.title);
                    setEditDescription(section.description || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
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

        {/* Item count */}
        <span className="text-xs text-foreground-tertiary shrink-0">
          {section.items.length} question{section.items.length !== 1 ? "s" : ""}
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

      {/* Section content (items) */}
      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2">
          {/* Instructions */}
          {section.instructions && (
            <div className="mb-3 p-2 rounded bg-info/10 border border-info/20">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-info shrink-0 mt-0.5" />
                <p className="text-sm text-info">{section.instructions}</p>
              </div>
            </div>
          )}

          {section.items.length > 0 ? (
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <QuestionItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onClick={() => onSelectItem(item.id)}
                />
              ))}
            </SortableContext>
          ) : (
            <p className="text-sm text-foreground-tertiary text-center py-4">
              No questions yet. Add a question to get started.
            </p>
          )}

          {/* Add item button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add question
          </Button>
        </div>
      )}
    </div>
  );
}

// Overlay for drag preview
export function SectionItemOverlay({ section }: { section: AssessmentSectionData }) {
  return (
    <div className="rounded-lg border border-primary bg-background-secondary shadow-lg">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="h-4 w-4 text-foreground-tertiary" />
        <ChevronRight className="h-4 w-4 text-foreground-tertiary" />
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {SECTION_TYPE_LABELS[section.sectionType]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{section.title}</h3>
        </div>
        <span className="text-xs text-foreground-tertiary">
          {section.items.length} question{section.items.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
