"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, List, X, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShiftCard, ShiftData } from "./shift-card";
import {
  getWeekDates,
  getMonthDates,
  isSameDay,
  isToday,
  DAY_NAMES,
  MONTH_NAMES,
} from "@/lib/scheduling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ViewMode = "week" | "month";

interface CalendarViewProps {
  shifts: ShiftData[];
  onShiftClick?: (shift: ShiftData) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarView({
  shifts,
  onShiftClick,
  onDateClick,
  selectedDate,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null);
  const [dayDetailShifts, setDayDetailShifts] = useState<ShiftData[]>([]);

  const dates = useMemo(() => {
    return viewMode === "week" ? getWeekDates(currentDate) : getMonthDates(currentDate);
  }, [viewMode, currentDate]);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, ShiftData[]>();
    shifts.forEach((shift) => {
      const startDate = new Date(shift.scheduledStart);
      const endDate = new Date(shift.scheduledEnd);

      // Reset times to compare dates only
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      // Add shift to each day it spans
      const current = new Date(start);
      while (current <= end) {
        const dateKey = current.toDateString();
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(shift);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [shifts]);

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderText = () => {
    if (viewMode === "week") {
      const start = dates[0];
      const end = dates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground min-w-64 text-center">
            {getHeaderText()}
          </h2>
          <Button variant="ghost" size="sm" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1">
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            <List className="w-4 h-4 mr-1" />
            Week
          </Button>
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "week" ? (
        <WeekView
          dates={dates}
          shiftsByDate={shiftsByDate}
          onShiftClick={onShiftClick}
          onDateClick={onDateClick}
          selectedDate={selectedDate}
        />
      ) : (
        <MonthView
          dates={dates}
          currentMonth={currentDate.getMonth()}
          shiftsByDate={shiftsByDate}
          onShiftClick={onShiftClick}
          onDateClick={onDateClick}
          selectedDate={selectedDate}
          onShowDayDetail={(date, shifts) => {
            setDayDetailDate(date);
            setDayDetailShifts(shifts);
          }}
        />
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        date={dayDetailDate}
        shifts={dayDetailShifts}
        onClose={() => {
          setDayDetailDate(null);
          setDayDetailShifts([]);
        }}
        onShiftClick={(shift) => {
          setDayDetailDate(null);
          setDayDetailShifts([]);
          onShiftClick?.(shift);
        }}
      />
    </div>
  );
}

interface WeekViewProps {
  dates: Date[];
  shiftsByDate: Map<string, ShiftData[]>;
  onShiftClick?: (shift: ShiftData) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

function WeekView({ dates, shiftsByDate, onShiftClick, onDateClick, selectedDate }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-2 flex-1">
      {dates.map((date, index) => {
        const dateKey = date.toDateString();
        const dayShifts = shiftsByDate.get(dateKey) || [];
        const isSelected = selectedDate && isSameDay(date, selectedDate);

        return (
          <div
            key={index}
            className={cn(
              "flex flex-col rounded-lg border bg-background min-h-48 overflow-hidden",
              isToday(date) && "border-primary",
              isSelected && "ring-2 ring-primary"
            )}
          >
            {/* Day Header */}
            <button
              onClick={() => onDateClick?.(date)}
              className={cn(
                "p-2 border-b text-center transition-colors hover:bg-background-secondary",
                isToday(date) && "bg-primary/10"
              )}
            >
              <div className="text-xs text-foreground-secondary font-medium">
                {DAY_NAMES[date.getDay()]}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday(date) ? "text-primary" : "text-foreground"
                )}
              >
                {date.getDate()}
              </div>
            </button>

            {/* Shifts */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {dayShifts.length === 0 ? (
                <div className="text-xs text-foreground-tertiary text-center py-4">
                  No shifts
                </div>
              ) : (
                dayShifts
                  .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
                  .map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      compact
                      onClick={() => onShiftClick?.(shift)}
                    />
                  ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MonthViewProps {
  dates: Date[];
  currentMonth: number;
  shiftsByDate: Map<string, ShiftData[]>;
  onShiftClick?: (shift: ShiftData) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
  onShowDayDetail?: (date: Date, shifts: ShiftData[]) => void;
}

function MonthView({
  dates,
  currentMonth,
  shiftsByDate,
  onShiftClick,
  onDateClick,
  selectedDate,
  onShowDayDetail,
}: MonthViewProps) {
  return (
    <div className="flex flex-col flex-1">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-foreground-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {dates.map((date, index) => {
          const dateKey = date.toDateString();
          const dayShifts = shiftsByDate.get(dateKey) || [];
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <button
              key={index}
              onClick={() => onDateClick?.(date)}
              className={cn(
                "p-1 rounded border text-left transition-all min-h-24",
                "hover:border-primary/50 hover:bg-background-secondary",
                isCurrentMonth ? "bg-background" : "bg-background-secondary/50 opacity-50",
                isToday(date) && "border-primary",
                isSelected && "ring-2 ring-primary"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday(date) ? "text-primary" : "text-foreground-secondary"
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayShifts.slice(0, 2).map((shift) => (
                  <div
                    key={shift.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShiftClick?.(shift);
                    }}
                    className="text-[10px] p-0.5 rounded bg-primary/20 text-primary truncate cursor-pointer hover:bg-primary/30"
                  >
                    {shift.client.firstName} {shift.client.lastName[0]}.
                  </div>
                ))}
                {dayShifts.length > 2 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDayDetail?.(date, dayShifts);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        onShowDayDetail?.(date, dayShifts);
                      }
                    }}
                    className="text-[10px] text-primary font-medium hover:text-primary/80 hover:underline transition-colors w-full text-left cursor-pointer block"
                  >
                    +{dayShifts.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Day Detail Modal - shows all shifts for a specific day
interface DayDetailModalProps {
  date: Date | null;
  shifts: ShiftData[];
  onClose: () => void;
  onShiftClick?: (shift: ShiftData) => void;
}

function DayDetailModal({ date, shifts, onClose, onShiftClick }: DayDetailModalProps) {
  if (!date) return null;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateHeader = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {formatDateHeader(date)}
          </CardTitle>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-foreground-secondary">
              {shifts.length} shift{shifts.length !== 1 ? "s" : ""} scheduled
            </span>
            {isToday(date) && (
              <Badge variant="outline" className="text-primary border-primary">
                Today
              </Badge>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {sortedShifts.map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => onShiftClick?.(shift)}
                  className="w-full p-4 rounded-lg border bg-background hover:bg-background-secondary/50 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-foreground-secondary" />
                        <span className="font-medium text-foreground truncate">
                          {shift.client.firstName} {shift.client.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                        </span>
                      </div>

                      {shift.carer && (
                        <div className="mt-2 text-xs text-foreground-tertiary">
                          Carer: {shift.carer.firstName} {shift.carer.lastName}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(shift.status))}
                      >
                        {shift.status.replace("_", " ")}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-foreground-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
