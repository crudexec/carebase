import { z } from "zod";

import { InferSchema } from "@/types";

export const frequencySchema = z.object({
  disciplineId: z.string().optional(),
  visit: z.string().optional(),
  perDay: z.string().optional(),
  effectiveFrom: z.date().optional().nullable(),
  effectiveThrough: z.date().optional().nullable(),
  comment: z.string().optional(),
});

export type FrequencyForm = InferSchema<typeof frequencySchema>;

export const frequencyDefaultValue: FrequencyForm = {
  disciplineId: "",
  visit: "",
  perDay: "",
  effectiveFrom: null,
  effectiveThrough: null,
  comment: "",
};
