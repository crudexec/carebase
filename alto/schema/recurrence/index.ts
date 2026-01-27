import { z } from "zod";

import { InferSchema } from "@/types";

export const scheduleRecurrenceSchema = z
  .object({
    isRecurringEvent: z.boolean().optional(),
    pattern: z.string().optional(),
    startDate: z.date().optional().nullable(),
    endAfter: z.boolean().optional(),
    occurence: z.string().optional(),
    endBy: z.boolean().optional(),
    endDate: z.date().optional().nullable(),
    isEveryday: z.boolean().optional(),
    isEveryWeekday: z.boolean().optional(),
    recurringDays: z
      .array(z.enum(["SU", "MO", "TU", "WE", "TH", "FR", "SA"]))
      .optional(),
    dayFrequency: z.string().optional(),
    weekFrequency: z.string().optional(),
    yearFrequency: z.string().optional(),
    isDayMonth: z.boolean().optional(),
    dayMonth: z.string().optional(),
    dayMonthFrequency: z.string().optional(),
    isMonth: z.boolean().optional(),
    monthPosition: z.string().optional(),
    monthDay: z.string().optional(),
    monthFrequency: z.string().optional(),
    isEveryYear: z.boolean().optional(),
    everyYearMonth: z.string().optional(),
    everyYearDay: z.string().optional(),
    isYear: z.boolean().optional(),
    yearPosition: z.string().optional(),
    yearDay: z.string().optional(),
    yearMonth: z.string().optional(),
  })
  .refine(
    (value) => {
      return value.isRecurringEvent ? Boolean(value.pattern) : true;
    },
    { message: "Pattern is required", path: ["pattern"] },
  );

export type ScheduleRecurrenceForm = InferSchema<
  typeof scheduleRecurrenceSchema
>;

export const scheduleRecurrenceDefaultValue: ScheduleRecurrenceForm = {
  isRecurringEvent: false,
  pattern: "",
  startDate: new Date(),
  endAfter: false,
  occurence: "",
  endBy: false,
  endDate: undefined,
  isEveryday: false,
  isEveryWeekday: false,
  dayFrequency: "",
  weekFrequency: "",
  yearFrequency: "",
  isDayMonth: false,
  dayMonth: "",
  dayMonthFrequency: "",
  isMonth: false,
  monthPosition: "",
  monthDay: "",
  monthFrequency: "",
  isEveryYear: false,
  everyYearMonth: "",
  everyYearDay: "",
  isYear: false,
  yearPosition: "",
  yearDay: "",
  yearMonth: "",
  recurringDays: [],
};
