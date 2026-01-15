"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DAY_NAMES_FULL } from "@/lib/scheduling";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface AvailabilityEditorProps {
  initialSlots?: AvailabilitySlot[];
  onSave: (slots: AvailabilitySlot[]) => Promise<void>;
  isLoading?: boolean;
}

// Time slots for the grid (6 AM to 10 PM in 2-hour blocks)
const TIME_SLOTS = [
  { start: "06:00", end: "08:00", label: "6-8 AM" },
  { start: "08:00", end: "10:00", label: "8-10 AM" },
  { start: "10:00", end: "12:00", label: "10-12 PM" },
  { start: "12:00", end: "14:00", label: "12-2 PM" },
  { start: "14:00", end: "16:00", label: "2-4 PM" },
  { start: "16:00", end: "18:00", label: "4-6 PM" },
  { start: "18:00", end: "20:00", label: "6-8 PM" },
  { start: "20:00", end: "22:00", label: "8-10 PM" },
];

export function AvailabilityEditor({
  initialSlots = [],
  onSave,
  isLoading = false,
}: AvailabilityEditorProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize selected slots from initial data
  useEffect(() => {
    const slotKeys = new Set<string>();
    initialSlots.forEach((slot) => {
      const key = `${slot.dayOfWeek}-${slot.startTime}`;
      slotKeys.add(key);
    });
    setSelectedSlots(slotKeys);
  }, [initialSlots]);

  const toggleSlot = (dayOfWeek: number, timeSlot: typeof TIME_SLOTS[0]) => {
    const key = `${dayOfWeek}-${timeSlot.start}`;
    const newSelected = new Set(selectedSlots);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedSlots(newSelected);
    setHasChanges(true);
  };

  const selectAllForDay = (dayOfWeek: number) => {
    const newSelected = new Set(selectedSlots);
    TIME_SLOTS.forEach((slot) => {
      newSelected.add(`${dayOfWeek}-${slot.start}`);
    });
    setSelectedSlots(newSelected);
    setHasChanges(true);
  };

  const clearAllForDay = (dayOfWeek: number) => {
    const newSelected = new Set(selectedSlots);
    TIME_SLOTS.forEach((slot) => {
      newSelected.delete(`${dayOfWeek}-${slot.start}`);
    });
    setSelectedSlots(newSelected);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const slots: AvailabilitySlot[] = [];
      selectedSlots.forEach((key) => {
        const [dayStr, startTime] = key.split("-");
        const dayOfWeek = parseInt(dayStr);
        const timeSlot = TIME_SLOTS.find((t) => t.start === startTime);
        if (timeSlot) {
          slots.push({
            dayOfWeek,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            isRecurring: true,
          });
        }
      });
      await onSave(slots);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Availability</h3>
          <p className="text-sm text-foreground-secondary">
            Click on time slots to mark when you&apos;re available to work
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Save Availability
            </>
          )}
        </Button>
      </div>

      {/* Availability Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-foreground-secondary border-b">
                Time
              </th>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <th key={day} className="p-2 text-center border-b min-w-20">
                  <div className="text-sm font-medium text-foreground">
                    {DAY_NAMES_FULL[day]}
                  </div>
                  <div className="flex justify-center gap-1 mt-1">
                    <button
                      onClick={() => selectAllForDay(day)}
                      className="text-xs text-primary hover:underline"
                    >
                      All
                    </button>
                    <span className="text-foreground-tertiary">|</span>
                    <button
                      onClick={() => clearAllForDay(day)}
                      className="text-xs text-foreground-secondary hover:underline"
                    >
                      None
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot.start}>
                <td className="p-2 text-sm text-foreground-secondary border-r whitespace-nowrap">
                  {timeSlot.label}
                </td>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const key = `${day}-${timeSlot.start}`;
                  const isSelected = selectedSlots.has(key);
                  return (
                    <td key={day} className="p-1">
                      <button
                        onClick={() => toggleSlot(day, timeSlot)}
                        className={cn(
                          "w-full h-10 rounded transition-all",
                          "border-2 hover:border-primary/50",
                          isSelected
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-background-secondary border-transparent text-foreground-tertiary hover:bg-background-secondary/80"
                        )}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 mx-auto opacity-30" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 border-2 border-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
          <span className="text-foreground-secondary">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-background-secondary border-2 border-transparent flex items-center justify-center">
            <X className="w-3 h-3 text-foreground-tertiary opacity-30" />
          </div>
          <span className="text-foreground-secondary">Not Available</span>
        </div>
      </div>
    </div>
  );
}
