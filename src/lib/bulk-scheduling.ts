/**
 * Utility functions for bulk shift scheduling
 */

export type UnitType = "HOURLY" | "QUARTER_HOURLY" | "DAILY";

/**
 * Generate list of dates for bulk scheduling based on weekly pattern
 * @param startDate - The first day to consider
 * @param numberOfWeeks - How many weeks to schedule
 * @param selectedDays - Array of day numbers (0 = Sunday, 6 = Saturday)
 * @returns Array of dates that match the pattern
 */
export function generateBulkDates(
  startDate: Date,
  numberOfWeeks: number,
  selectedDays: number[]
): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);

  // Normalize to start of day
  start.setHours(0, 0, 0, 0);

  // Calculate end date (start + numberOfWeeks * 7 days)
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + numberOfWeeks * 7);

  // Iterate through each day in the range
  const current = new Date(start);
  while (current < endDate) {
    if (selectedDays.includes(current.getDay())) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Combine a date with a time string to create a full DateTime
 * @param date - The date
 * @param time - Time in HH:mm format
 * @returns Combined DateTime
 */
export function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Calculate hours between two times
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Number of hours
 */
export function calculateHoursBetween(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return (endTotalMinutes - startTotalMinutes) / 60;
}

/**
 * Calculate units that will be consumed for a single shift
 * @param hoursWorked - Duration of shift in hours
 * @param unitType - Type of authorization units
 * @returns Number of units
 */
export function calculateUnitsForShift(hoursWorked: number, unitType: UnitType): number {
  switch (unitType) {
    case "QUARTER_HOURLY":
      // 1 unit = 15 minutes, so hours * 4 units per hour
      return Math.ceil(hoursWorked * 4);
    case "DAILY":
      // Any work counts as 1 unit
      return hoursWorked > 0 ? 1 : 0;
    case "HOURLY":
    default:
      // Round to nearest 0.25 hour
      return Math.ceil(hoursWorked * 4) / 4;
  }
}

/**
 * Calculate total units for bulk shift creation
 * @param hoursPerShift - Duration of each shift in hours
 * @param numberOfShifts - Number of shifts to create
 * @param unitType - Type of authorization units
 * @returns Total units that will be consumed
 */
export function calculateBulkUnits(
  hoursPerShift: number,
  numberOfShifts: number,
  unitType: UnitType
): number {
  const unitsPerShift = calculateUnitsForShift(hoursPerShift, unitType);
  return unitsPerShift * numberOfShifts;
}

/**
 * Format unit type for display
 */
export function formatUnitType(unitType: UnitType): string {
  switch (unitType) {
    case "QUARTER_HOURLY":
      return "15-min units";
    case "DAILY":
      return "days";
    case "HOURLY":
    default:
      return "hours";
  }
}

/**
 * Day names for display
 */
export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Format time for display (12-hour format)
 */
export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Format date for display
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date for display (long format)
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
