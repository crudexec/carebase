import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionKSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  eating: z.string().optional(),
  nutritionalApproaches: z.array(z.string()).optional(),
});

export type SectionKForm = InferSchema<typeof sectionKSchema>;

export const sectionKDefaultValue: SectionKForm = {
  height: "",
  weight: "",
  eating: "",
  nutritionalApproaches: [],
};
