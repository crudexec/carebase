import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionHSchema = z.object({
  patientTreatedForUrinaryInfection: z.string().optional(),
  urinaryIncontinence: z.string().optional(),
  bowelIncontinenceFrequency: z.string().optional(),
  ostomyForBowelElimination: z.string().optional(),
});

export type SectionHForm = InferSchema<typeof sectionHSchema>;

export const sectionHDefaultValue: SectionHForm = {
  patientTreatedForUrinaryInfection: "",
  urinaryIncontinence: "",
  bowelIncontinenceFrequency: "",
  ostomyForBowelElimination: "",
};
