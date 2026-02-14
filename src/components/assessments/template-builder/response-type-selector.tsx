"use client";

import * as React from "react";
import { AssessmentResponseType } from "@prisma/client";
import { RESPONSE_TYPE_LABELS, RESPONSE_TYPE_DESCRIPTIONS } from "@/lib/assessments/types";
import { cn } from "@/lib/utils";
import {
  SlidersHorizontal,
  ToggleLeft,
  CircleDot,
  CheckSquare,
  AlignLeft,
  Calendar,
  Hash,
} from "lucide-react";

const RESPONSE_TYPE_ICONS: Record<AssessmentResponseType, React.ComponentType<{ className?: string }>> = {
  SCALE: SlidersHorizontal,
  YES_NO: ToggleLeft,
  SINGLE_CHOICE: CircleDot,
  MULTIPLE_CHOICE: CheckSquare,
  TEXT: AlignLeft,
  DATE: Calendar,
  NUMBER: Hash,
};

interface ResponseTypeSelectorProps {
  onSelect: (type: AssessmentResponseType) => void;
  className?: string;
}

export function ResponseTypeSelector({ onSelect, className }: ResponseTypeSelectorProps) {
  const responseTypes = Object.values(AssessmentResponseType) as AssessmentResponseType[];

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {responseTypes.map((type) => {
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
