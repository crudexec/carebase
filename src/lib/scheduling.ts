import { ShiftStatus, UserRole } from "@prisma/client";

// Shift status configuration
export const SHIFT_STATUSES = [
  {
    id: "SCHEDULED" as ShiftStatus,
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
    dotColor: "bg-blue-500",
  },
  {
    id: "IN_PROGRESS" as ShiftStatus,
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    dotColor: "bg-yellow-500",
  },
  {
    id: "COMPLETED" as ShiftStatus,
    label: "Completed",
    color: "bg-green-100 text-green-800",
    dotColor: "bg-green-500",
  },
  {
    id: "CANCELLED" as ShiftStatus,
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800",
    dotColor: "bg-gray-500",
  },
  {
    id: "MISSED" as ShiftStatus,
    label: "Missed",
    color: "bg-orange-100 text-orange-800",
    dotColor: "bg-orange-500",
  },
];

export function getShiftStatusConfig(status: ShiftStatus) {
  return SHIFT_STATUSES.find((s) => s.id === status) || SHIFT_STATUSES[0];
}

// Permission helpers
export function canManageSchedule(role: UserRole): boolean {
  return ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"].includes(role);
}

export function canViewAllSchedules(role: UserRole): boolean {
  return ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"].includes(role);
}

// Date helpers
export function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    week.push(d);
  }
  return week;
}

export function getMonthDates(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const dates: Date[] = [];

  // Add days from previous month to fill the first week
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() - i - 1);
    dates.push(d);
  }

  // Add all days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  // Add days from next month to fill the last week
  const endPadding = 6 - lastDay.getDay();
  for (let i = 1; i <= endPadding; i++) {
    dates.push(new Date(year, month + 1, i));
  }

  return dates;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getShiftDuration(start: Date, end: Date): string {
  const hours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (hours === 1) return "1 hour";
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  return `${hours.toFixed(1)} hours`;
}

// Day names
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
