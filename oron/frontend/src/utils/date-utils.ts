import moment, { Moment } from "moment-timezone";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const convertDateToMoment = (date: Date | Moment): Moment => {
  return moment.isMoment(date) ? date : moment(date);
};

export const convertMomentToDate = (date: Moment | Date): Date => {
  return moment.isMoment(date) ? date.toDate() : date;
};

export const normalizeTimeFormat = (time: string): string => {
  // Trim any leading/trailing spaces and convert to lowercase
  const formattedTime = time.trim().toLowerCase();

  // Check for 'am' or 'pm' and remove any space between time and AM/PM
  return formattedTime.replace(/\s*(am|pm)/, "$1");
};

export const formatDateToUTCString = (date: Date | string) => {
  const originalDate = moment(date);

  const adjustedDate = moment
    .utc(originalDate.format("YYYY-MM-DD"))
    .endOf("day")
    .subtract(1, "hour");
  return adjustedDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
};

// Format time from one format to another
export const formatTimeString = (
  time: string,
  inputFormat: string = "h:mma",
  outputFormat: string = "h:mm A"
): string => {
  const formattedTime = moment(time, inputFormat);
  return formattedTime.isValid() ? formattedTime.format(outputFormat) : time;
};

// Convert time format using moment.js
export const convertTimeFormat = (time: string): string => {
  const parsedTime = moment(time, "h:mm a");
  return parsedTime.isValid() ? parsedTime.format("h:mma").toLowerCase() : time;
};

// Parse time and return hours and minutes using moment.js
export const parseTime = (time: string) => {
  const formattedTime = moment(
    time.replace(/\s+/g, ""),
    ["h:mma", "h:mm a"],
    true
  );

  if (!formattedTime.isValid()) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return {
    hours: formattedTime.hours(),
    minutes: formattedTime.minutes(),
  };
};

// Parse time from string and return hours and minutes
export const parseFilteringEventTime = (time: string) => {
  const parsedTime = moment(time, "h:mm a");
  return {
    hours: parsedTime.hours(),
    minutes: parsedTime.minutes(),
  };
};

// Get index of the day of the week
export const getDayOfWeekIndex = (day: string): number => {
  return daysOfWeek.indexOf(day);
};

// Get the first occurrence of a specific day of the week within a range
export const getFirstDayOfWeekInRange = (
  startDate: Date | Moment,
  endDate: Date | Moment,
  dayOfWeek: number
): Moment | null => {
  const startMoment = convertDateToMoment(startDate);
  const endMoment = convertDateToMoment(endDate);

  const startDay = startMoment.day();
  const offset = (dayOfWeek + 7 - startDay) % 7;
  const firstDay = startMoment.clone().add(offset, "days");

  return firstDay.isBefore(endMoment) ? firstDay : null;
};

// Format date to a specific format using moment.js
export const formatDate = (
  date: Date | string,
  formatString: string = "YYYY-MM-DD"
): string => {
  return moment(date).format(formatString);
};

// Add days to a date using moment.js
export const addDaysToDate = (date: Date | string, days: number): string => {
  return moment(date).add(days, "days").format("YYYY-MM-DD");
};

export const filterEndTimeOptions = (
  startTime: string,
  timeOptions: {
    label: string;
    value: string;
  }[]
) => {
  if (!startTime) return timeOptions;
  const startMoment = moment(startTime, "h:mm a");

  return timeOptions.filter(({ value }) => {
    const endMoment = moment(value, "h:mm a");
    return endMoment.isAfter(startMoment);
  });
};

export const generateTimeSlots = () => {
  const timeSlots = [];
  const padZero = (num: number) => (num < 10 ? "0" + num : num);

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour < 12 ? "am" : "pm";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = padZero(minute);
      const timeLabel = `${displayHour}:${displayMinute}${period}`;
      timeSlots.push({ label: timeLabel, value: timeLabel });
    }
  }
  return timeSlots;
};
