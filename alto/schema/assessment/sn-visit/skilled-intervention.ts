import z from "zod";

import { InferSchema } from "@/types";

export const skilledInterventionSchema = z.object({
  careMonitoring: z.string().optional(),
  topic: z.string().optional(),
  disease: z.string().optional(),
  teachings: z.string().optional(),
  selectTopic: z.string().optional(),
  PatientResponse: z.array(z.string()).optional(),
});

export type SkilledInterventionForm = InferSchema<
  typeof skilledInterventionSchema
>;

export const skilledInterventionDefaultValue: SkilledInterventionForm = {
  careMonitoring: "",
  teachings: "",
  selectTopic: "",
  PatientResponse: [],
  topic: "",
  disease: "",
};
