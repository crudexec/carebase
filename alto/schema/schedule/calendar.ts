import { z } from "zod";

import { InferSchema } from "@/types";

export const printCalendarSchema = z.object({
  calendarBy: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  weekDay: z.date().optional().nullable(),
  certPeriod: z.array(z.date().optional()).optional(),
  dateRangeFrom: z.date().optional().nullable(),
  dateRangeThrough: z.date().optional().nullable(),
  printCalendarFor: z.string().optional(),
  patient: z.string().optional(),
  allPatient: z.boolean().optional(),
  caregiver: z.string().optional(),
  allCaregiver: z.boolean().optional(),
  office: z.string().optional(),
  allOffice: z.boolean().optional(),
  visitStatus: z.string().optional(),
});

export type PrintCalendarForm = InferSchema<typeof printCalendarSchema>;

export const printCalendarDefaultValue: PrintCalendarForm = {
  calendarBy: "",
  month: "",
  year: "",
  weekDay: undefined,
  certPeriod: [],
  dateRangeFrom: undefined,
  dateRangeThrough: undefined,
  printCalendarFor: "",
  patient: "",
  allPatient: false,
  caregiver: "",
  allCaregiver: false,
  office: "",
  allOffice: false,
  visitStatus: "",
};
