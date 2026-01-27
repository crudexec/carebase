import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionJSchema = z.object({
  riskForHospilatization: z.array(z.string()).optional(),
  painEffectOnSleep: z.string().optional(),
  painInterferenceWithTherapy: z.string().optional(),
  painInterferenceWithDay: z.string().optional(),
  patientDyspenic: z.string().optional(),
});

export type SectionJForm = InferSchema<typeof sectionJSchema>;

export const sectionJDefaultValue: SectionJForm = {
  riskForHospilatization: [],
  painEffectOnSleep: "",
  painInterferenceWithDay: "",
  painInterferenceWithTherapy: "",
  patientDyspenic: "",
};
