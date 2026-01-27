import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionFSchema = z.object({
  livingSituation: z.string().optional(),
  careManagement: z.string().optional(),
});

export type SectionFForm = InferSchema<typeof sectionFSchema>;

export const sectionFDefaultValue: SectionFForm = {
  livingSituation: "",
  careManagement: "",
};
