/**
 * Utility functions for bulk shift scheduling
 */

export type UnitType = "HOURLY" | "QUARTER_HOURLY" | "DAILY";

/**
 * Generate list of dates for bulk scheduling based on weekly pattern
 * @param startDate - The first day to consider
 * @param numberOfWeeks - How many weeks to schedule
 * @param selectedDays - Array of day numbers (0 = Sunday, 6 = Saturday)
 * @param timezoneOffsetMinutes - Optional timezone offset to determine which day of week it is in user's timezone
 * @returns Array of dates that match the pattern (at noon UTC)
 */
export function generateBulkDates(
  startDate: Date | string,
  numberOfWeeks: number,
  selectedDays: number[],
  timezoneOffsetMinutes?: number
): Date[] {
  const dates: Date[] = [];

  // Parse the date as UTC to avoid server timezone issues
  let start: Date;
  if (typeof startDate === "string") {
    const [year, month, day] = startDate.split("-").map(Number);
    // Create at noon UTC to avoid DST issues
    start = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  } else {
    start = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      12, 0, 0, 0
    ));
  }

  // Calculate end date (start + numberOfWeeks * 7 days)
  const endDate = new Date(start);
  endDate.setUTCDate(endDate.getUTCDate() + numberOfWeeks * 7);

  // Iterate through each day in the range
  const current = new Date(start);
  while (current < endDate) {
    // Get day of week - if timezone offset provided, adjust to get correct day in user's timezone
    let dayOfWeek: number;
    if (timezoneOffsetMinutes !== undefined) {
      // Create a temporary date adjusted to user's timezone to get correct day
      const userLocalDate = new Date(current.getTime() - timezoneOffsetMinutes * 60 * 1000);
      dayOfWeek = userLocalDate.getUTCDay();
    } else {
      dayOfWeek = current.getUTCDay();
    }

    if (selectedDays.includes(dayOfWeek)) {
      // Create a clean date at noon UTC for the result
      const resultDate = new Date(current);
      dates.push(resultDate);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Combine a date with a time string to create a full DateTime
 * @param date - The date (time component will be replaced)
 * @param time - Time in HH:mm format
 * @param timezoneOffsetMinutes - Optional timezone offset in minutes (from client's getTimezoneOffset())
 *                                 Positive = behind UTC (e.g., +480 for UTC-8)
 *                                 Negative = ahead of UTC (e.g., -480 for UTC+8)
 * @returns Combined DateTime with the specified time in UTC
 */
export function combineDateTime(date: Date, time: string, timezoneOffsetMinutes?: number): Date {
  const [hours, minutes] = time.split(":").map(Number);

  // Get the date components in UTC to avoid server timezone issues
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create the date in UTC with the specified time
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));

  // If timezone offset is provided, adjust from user's local time to UTC
  // getTimezoneOffset() returns positive for behind UTC, so we ADD it to get UTC
  if (timezoneOffsetMinutes !== undefined) {
    utcDate.setUTCMinutes(utcDate.getUTCMinutes() + timezoneOffsetMinutes);
  }

  return utcDate;
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
