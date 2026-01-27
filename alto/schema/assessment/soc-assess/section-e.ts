import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionESchema = z.object({
  cognitive: z.array(z.string()).optional(),
  frequency: z.string().optional(),
});

export type SectionEForm = InferSchema<typeof sectionESchema>;

export const sectionEDefaultValue: SectionEForm = {
  cognitive: [],
  frequency: "",
};
