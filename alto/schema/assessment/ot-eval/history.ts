import { z } from "zod";

import { InferSchema } from "@/types";

export const historySchema = z.object({
  isHomeEvaluationAlone: z.boolean().optional(),
  liveSpouse: z.string().optional(),
  otherLiveSpouse: z.string().optional(),
  homeEvaluation: z.array(z.string()).optional(),
  homeEvaluationType: z.array(z.string()).optional(),
  safetyMeasures: z.array(z.string()).optional(),
  architecturalBarrier: z.array(z.string()).optional(),
  sanitationHazard: z.array(z.string()).optional(),
  dmeAvailable: z.array(z.string()).optional(),
  treatmentThisVisit: z.array(z.string()).optional(),
  otherTreatmentThisVisit: z.string().optional(),
  treatmentPlan: z.array(z.string()).optional(),
  otherTreatmentPlan: z.string().optional(),
});

export type HistoryForm = InferSchema<typeof historySchema>;

export const historyDefaultValue: HistoryForm = {
  isHomeEvaluationAlone: false,
  liveSpouse: "",
  otherLiveSpouse: "",
  homeEvaluation: [],
  homeEvaluationType: [],
  safetyMeasures: [],
  architecturalBarrier: [],
  sanitationHazard: [],
  dmeAvailable: [],
  treatmentThisVisit: [],
  otherTreatmentThisVisit: "",
  treatmentPlan: [],
  otherTreatmentPlan: "",
};
