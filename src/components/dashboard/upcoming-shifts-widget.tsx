"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Loader2, Clock, User, MapPin } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string;
  };
  carer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-primary/10 text-primary",
  IN_PROGRESS: "bg-warning/10 text-warning",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-foreground-tertiary/10 text-foreground-tertiary",
  NO_SHOW: "bg-error/10 text-error",
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

function formatShiftDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

function formatShiftTime(start: string, end: string): string {
  const startFormatted = format(new Date(start), "h:mm a");
  const endFormatted = format(new Date(end), "h:mm a");
  return startFormatted + " - " + endFormatted;
}

export function UpcomingShiftsWidget() {
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch("/api/shifts?filter=upcoming&limit=5");
        if (response.ok) {
          const data = await response.json();
          setShifts(data.shifts || []);
        }
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Group shifts by date
  const groupedShifts = shifts.reduce((acc, shift) => {
    const dateKey = formatShiftDate(shift.scheduledStart);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  return (
    <div className="rounded-lg border border-border-light bg-background-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Upcoming Shifts</h3>
          {shifts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {shifts.length}
            </span>
          )}
        </div>
        <Link
          href="/scheduling"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming shifts</p>
            <Link href="/scheduling" className="text-xs text-primary hover:underline mt-1 inline-block">
              View schedule
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedShifts).map(([dateLabel, dateShifts]) => (
              <div key={dateLabel}>
                <p className="text-xs font-medium text-foreground-secondary px-2 mb-1">
                  {dateLabel}
                </p>
                <ul className="space-y-1">
                  {dateShifts.map((shift) => (
                    <li key={shift.id}>
                      <Link
                        href={"/scheduling?shiftId=" + shift.id}
                        className="block px-3 py-2 rounded-md transition-colors hover:bg-background-secondary"
                      >
                        <div className="flex items-start gap-3">
                          {/* Time indicator */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {shift.client.firstName} {shift.client.lastName}
                              </p>
                              <span
                                className={"px-1.5 py-0.5 text-[10px] font-medium rounded " + (STATUS_COLORS[shift.status] || STATUS_COLORS.SCHEDULED)}
                              >
                                {STATUS_LABELS[shift.status] || shift.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}</span>
                            </div>
                            {shift.carer && (
                              <div className="flex items-center gap-2 text-xs text-foreground-tertiary mt-0.5">
                                <User className="w-3 h-3" />
                                <span>{shift.carer.firstName} {shift.carer.lastName}</span>
                              </div>
                            )}
                            {shift.client.address && (
                              <div className="flex items-center gap-2 text-[10px] text-foreground-tertiary mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{shift.client.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {shifts.length > 0 && (
        <div className="px-4 py-3 border-t border-border-light">
          <Link
            href="/scheduling"
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Full Schedule
          </Link>
        </div>
      )}
    </div>
  );
}
