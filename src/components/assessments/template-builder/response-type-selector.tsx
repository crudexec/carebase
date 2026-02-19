"use client";

import * as React from "react";
import { AssessmentResponseType } from "@prisma/client";
import { RESPONSE_TYPE_LABELS, RESPONSE_TYPE_DESCRIPTIONS, VISIBLE_RESPONSE_TYPES } from "@/lib/assessments/types";
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
  User,
  Stethoscope,
  SlidersHorizontal,
} from "lucide-react";

const RESPONSE_TYPE_ICONS: Record<AssessmentResponseType, React.ComponentType<{ className?: string }>> = {
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
  BODY_MAP: User,
  ICD10_DIAGNOSIS: Stethoscope,
  // Legacy types
  SCALE: SlidersHorizontal,
  TEXT: AlignLeft,
};

interface ResponseTypeSelectorProps {
  onSelect: (type: AssessmentResponseType) => void;
  className?: string;
}

export function ResponseTypeSelector({ onSelect, className }: ResponseTypeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {VISIBLE_RESPONSE_TYPES.map((type) => {
        const Icon = RESPONSE_TYPE_ICONS[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-background-secondary"
          >
            <Icon className="h-5 w-5 text-foreground-secondary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{RESPONSE_TYPE_LABELS[type]}</p>
              <p className="text-xs text-foreground-tertiary line-clamp-2">
                {RESPONSE_TYPE_DESCRIPTIONS[type]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ResponseTypeIcon({
  type,
  className,
}: {
  type: AssessmentResponseType;
  className?: string;
}) {
  const Icon = RESPONSE_TYPE_ICONS[type];
  return <Icon className={className} />;
}
