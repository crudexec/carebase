import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionBSchema = z.object({
  hearing: z.string().optional(),
  vision: z.string().optional(),
  health: z.string().optional(),
});

export type SectionBForm = InferSchema<typeof sectionBSchema>;

export const sectionBDefaultValue: SectionBForm = {
  hearing: "",
  vision: "",
  health: "",
};
