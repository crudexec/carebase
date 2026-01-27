import { RRule, WeekdayStr } from "rrule";

import {
  getDailyAndWeeklyDates,
  getMonthlyDates,
  getYearlyDates,
  Pattern,
} from "@/lib";
import { ScheduleRecurrenceForm } from "@/schema";

export const getRecurringDates = (data: ScheduleRecurrenceForm): Date[] => {
  let dates: Date[] = [];
  if (data?.pattern === "DAILY") {
    dates = getDailyAndWeeklyDates({
      pattern: Pattern.DAILY,
      start: data?.startDate as Date,
      end: data?.endDate as Date,
      frequency: data?.isEveryWeekday
        ? 0
        : data?.isEveryday && data?.dayFrequency
          ? Number(data?.dayFrequency)
          : 1,
      occurrence: Number(data?.occurence),
    });
  } else if (data?.pattern === "WEEKLY") {
    dates = getDailyAndWeeklyDates({
      pattern: Pattern.WEEKLY,
      start: data?.startDate as Date,
      end: data?.endDate as Date,
      frequency: Number(data?.weekFrequency),
      occurrence: Number(data?.occurence),
      days: data?.recurringDays as WeekdayStr[],
    });
  } else if (data?.pattern === "MONTHLY") {
    const monthlyData = {
      pattern: Pattern.MONTHLY,
      start: data?.startDate as Date,
      end: data?.endDate as Date,
      frequency: Number(data?.monthFrequency),
      occurrence: Number(data?.occurence),
    };
    if (data?.isMonth) {
      if (data?.monthDay === "DAY") {
        dates = getMonthlyDates({
          ...monthlyData,
          monthdays: data?.monthPosition ? [Number(data?.monthPosition)] : [],
        });
      } else if (data?.monthDay === "WEEKDAY") {
        dates = getMonthlyDates({
          ...monthlyData,
          days: ["MO", "TU", "WE", "TH", "FR"],
          nth: Number(data?.monthPosition),
          bysetpos: -1,
        });
      } else if (data?.monthDay === "WEEKEND") {
        dates = getMonthlyDates({
          ...monthlyData,
          days: ["SA", "SU"],
          nth: Number(data?.monthPosition),
        });
      } else {
        dates = getMonthlyDates({
          ...monthlyData,
          days: data?.monthDay ? [data?.monthDay as WeekdayStr] : [],
          nth: Number(data?.monthPosition),
        });
      }
    } else {
      dates = getMonthlyDates({
        ...monthlyData,
        monthdays:
          data?.dayMonth && data?.isDayMonth ? [Number(data?.dayMonth)] : [],
        frequency: Number(data?.dayMonthFrequency),
      });
    }
  } else if (data?.pattern === "YEARLY") {
    const yearlyData = {
      pattern: Pattern.YEARLY,
      start: data?.startDate as Date,
      end: data?.endDate as Date,
      occurrence: Number(data?.occurence),
      months: data?.yearMonth ? [Number(data?.yearMonth)] : [],
      frequency: Number(data?.yearFrequency),
    };
    if (data?.isYear) {
      if (data?.yearDay === "DAY") {
        dates = getYearlyDates({
          ...yearlyData,
          monthdays: data?.yearPosition ? [Number(data?.yearPosition)] : [],
        });
      } else if (data?.yearDay === "WEEKDAY") {
        dates = getYearlyDates({
          ...yearlyData,
          days: ["MO", "TU", "WE", "TH", "FR"],
          bysetpos: Number(data?.yearPosition),
        });
      } else if (data?.yearDay === "WEEKEND") {
        dates = getYearlyDates({
          ...yearlyData,
          days: [
            RRule.SU.nth(Number(data?.yearPosition)),
            RRule.SA.nth(Number(data?.yearPosition)),
          ],
        });
      } else {
        dates = getYearlyDates({
          ...yearlyData,
          days: data?.yearDay ? [data?.yearDay as WeekdayStr] : [],
          bysetpos: Number(data?.yearPosition),
        });
      }
    } else {
      dates = getYearlyDates({
        ...yearlyData,
        monthdays:
          data?.dayMonth && data?.isEveryYear
            ? [Number(data?.everyYearDay)]
            : [],
        months:
          data?.dayMonth && data?.isEveryYear
            ? [Number(data?.everyYearMonth)]
            : [],
      });
    }
  }
  return dates;
};
