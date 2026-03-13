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
    <div className="flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrevious}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900 min-w-48 text-center">
            {getHeaderText()}
          </h2>
          <button
            onClick={navigateNext}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-200 rounded p-0.5">
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
              viewMode === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <List className="w-3 h-3" />
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
              viewMode === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Calendar className="w-3 h-3" />
            Month
          </button>
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
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {dates.map((date, index) => {
        const dateKey = date.toDateString();
        const dayShifts = shiftsByDate.get(dateKey) || [];
        const isSelected = selectedDate && isSameDay(date, selectedDate);

        return (
          <div
            key={index}
            className={cn(
              "flex flex-col bg-white min-h-28 overflow-hidden",
              isSelected && "ring-2 ring-inset ring-blue-500"
            )}
          >
            {/* Day Header */}
            <button
              onClick={() => onDateClick?.(date)}
              className={cn(
                "px-1.5 py-1 border-b border-gray-100 text-center transition-colors hover:bg-gray-50",
                isToday(date) && "bg-blue-50"
              )}
            >
              <div className="text-[9px] text-gray-500 font-medium uppercase">
                {DAY_NAMES[date.getDay()]}
              </div>
              <div
                className={cn(
                  "text-sm font-semibold",
                  isToday(date) ? "text-blue-600" : "text-gray-900"
                )}
              >
                {date.getDate()}
              </div>
            </button>

            {/* Shifts */}
            <div className="flex-1 p-0.5 space-y-0.5 overflow-y-auto">
              {dayShifts.length === 0 ? (
                <div className="text-[9px] text-gray-400 text-center py-1">
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
    <div className="flex flex-col">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-gray-500 uppercase py-1.5 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
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
                "p-1 text-left transition-all min-h-20 bg-white",
                "hover:bg-blue-50/50",
                !isCurrentMonth && "bg-gray-50/50 opacity-50",
                isToday(date) && "bg-blue-50",
                isSelected && "ring-2 ring-inset ring-blue-500"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium",
                  isToday(date) ? "text-blue-600" : "text-gray-600"
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {dayShifts.slice(0, 2).map((shift) => (
                  <div
                    key={shift.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShiftClick?.(shift);
                    }}
                    className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 truncate cursor-pointer hover:bg-blue-200"
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
                    className="text-[9px] text-blue-600 font-medium hover:underline cursor-pointer block"
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
      month: "short",
      day: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">{formatDateHeader(date)}</span>
            {isToday(date) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Today</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-600">
            {shifts.length} shift{shifts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {sortedShifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => onShiftClick?.(shift)}
                className="w-full px-4 py-2.5 hover:bg-blue-50/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {shift.client.firstName} {shift.client.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-600">
                        {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                      </span>
                    </div>
                    {shift.carer && (
                      <div className="text-[10px] text-gray-500 mt-1">
                        {shift.carer.firstName} {shift.carer.lastName}
                      </div>
                    )}
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", getStatusColor(shift.status))}>
                    {shift.status.replace("_", " ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
