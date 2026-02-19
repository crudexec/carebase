"use client";

import * as React from "react";
import { Clock, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

interface ShiftClient {
  id: string;
  firstName: string;
  lastName: string;
}

interface ShiftData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  client: ShiftClient;
  hasVisitNote?: boolean;
}

interface ShiftSelectionCardProps {
  shift: ShiftData;
  isSelected: boolean;
  onSelect: (shift: ShiftData) => void;
  disabled?: boolean;
}

export function ShiftSelectionCard({
  shift,
  isSelected,
  onSelect,
  disabled = false,
}: ShiftSelectionCardProps) {
  const hasNote = shift.hasVisitNote;
  const isDisabled = disabled || hasNote;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const clientInitials = `${shift.client.firstName[0]}${shift.client.lastName[0]}`;

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(shift)}
      disabled={isDisabled}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
        !isSelected && !isDisabled && "border-border hover:border-primary/50 bg-background",
        isDisabled && "opacity-50 cursor-not-allowed bg-background-secondary"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Client Avatar */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold flex-shrink-0",
            isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          {clientInitials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground truncate">
              {shift.client.firstName} {shift.client.lastName}
            </h3>
            {hasNote && (
              <Badge variant="success" className="flex-shrink-0 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Done
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-sm text-foreground-secondary">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
            </span>
          </div>

          {hasNote && (
            <p className="mt-2 text-xs text-foreground-tertiary flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Visit note already submitted
            </p>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && !isDisabled && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white flex-shrink-0">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    </button>
  );
}

// Group shifts by day helper
export function groupShiftsByDay(shifts: ShiftData[]): {
  today: ShiftData[];
  yesterday: ShiftData[];
  earlier: ShiftData[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped = {
    today: [] as ShiftData[],
    yesterday: [] as ShiftData[],
    earlier: [] as ShiftData[],
  };

  shifts.forEach((shift) => {
    const shiftDate = new Date(shift.scheduledStart);
    const shiftDay = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());

    if (shiftDay.getTime() === today.getTime()) {
      grouped.today.push(shift);
    } else if (shiftDay.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(shift);
    } else {
      grouped.earlier.push(shift);
    }
  });

  // Sort each group by time (most recent first)
  const sortByTime = (a: ShiftData, b: ShiftData) =>
    new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime();

  grouped.today.sort(sortByTime);
  grouped.yesterday.sort(sortByTime);
  grouped.earlier.sort(sortByTime);

  return grouped;
}
