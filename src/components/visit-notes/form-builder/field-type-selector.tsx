"use client";

import * as React from "react";
import { FormFieldType } from "@prisma/client";
import { FIELD_TYPE_LABELS, FIELD_TYPE_DESCRIPTIONS } from "@/lib/visit-notes/types";
import { cn } from "@/lib/utils";
import {
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  CircleDot,
  CheckSquare,
  Calendar,
  Clock,
  CalendarClock,
  PenTool,
  Camera,
  Star,
} from "lucide-react";

const FIELD_TYPE_ICONS: Record<FormFieldType, React.ComponentType<{ className?: string }>> = {
  TEXT_SHORT: Type,
  TEXT_LONG: AlignLeft,
  NUMBER: Hash,
  YES_NO: ToggleLeft,
  SINGLE_CHOICE: CircleDot,
  MULTIPLE_CHOICE: CheckSquare,
  DATE: Calendar,
  TIME: Clock,
  DATETIME: CalendarClock,
  SIGNATURE: PenTool,
  PHOTO: Camera,
  RATING_SCALE: Star,
};

interface FieldTypeSelectorProps {
  onSelect: (type: FormFieldType) => void;
  className?: string;
}

export function FieldTypeSelector({ onSelect, className }: FieldTypeSelectorProps) {
  const fieldTypes = Object.values(FormFieldType) as FormFieldType[];

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {fieldTypes.map((type) => {
        const Icon = FIELD_TYPE_ICONS[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-background-secondary"
          >
            <Icon className="h-5 w-5 text-foreground-secondary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{FIELD_TYPE_LABELS[type]}</p>
              <p className="text-xs text-foreground-tertiary line-clamp-2">
                {FIELD_TYPE_DESCRIPTIONS[type]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function FieldTypeIcon({
  type,
  className,
}: {
  type: FormFieldType;
  className?: string;
}) {
  const Icon = FIELD_TYPE_ICONS[type];
  return <Icon className={className} />;
}
