import { z } from "zod";

import { InferSchema } from "@/types";

export const unscheduledVisitSchema = z.object({
  comments: z.string().optional(),
  miles: z.string().optional(),
  milesComments: z.string().optional(),
  snNoteType: z.string().optional(),
});

export type UnscheduledVisitForm = InferSchema<typeof unscheduledVisitSchema>;

export const unscheduledVisitDefaultValue: UnscheduledVisitForm = {
  comments: "",
  miles: "",
  milesComments: "",
  snNoteType: "",
};
