import { z } from "zod";

import { InferSchema } from "@/types";

export const recurrenceSchema = z
  .object({
    pattern: z.string().min(1, {
      message: "pattern is required",
    }),
    dayFrequency: z.string().optional(),
    disciplineId: z.string().optional(),
    authCode: z.string().optional(),
    visitAuth: z.string().optional(),
    hoursAuth: z.string().optional(),
    units: z.string().optional(),
    notes: z.string().optional(),
    startDate: z.date().optional().nullable(),
    endAfter: z.boolean().optional(),
    occurence: z.string().optional(),
    endBy: z.boolean().optional(),
    endDate: z.date().optional().nullable(),
  })
  .refine((data) => data.occurence !== undefined || data.endDate !== null, {
    message: "one of end date or occurrence must be provided",
    path: ["occurence", "endDate"],
  });

export type RecurrenceForm = InferSchema<typeof recurrenceSchema>;

export const recurrenceDefaultValue: RecurrenceForm = {
  pattern: "",
  dayFrequency: "",
  disciplineId: "",
  authCode: "",
  visitAuth: "",
  hoursAuth: "",
  units: "",
  notes: "",
  startDate: undefined,
  endAfter: false,
  occurence: "",
  endBy: false,
  endDate: undefined,
};
