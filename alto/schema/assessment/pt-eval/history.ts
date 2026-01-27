import { z } from "zod";

import { InferSchema } from "@/types";

export const historySchema = z.object({
  physicalTheoryDiagnosis: z.string().optional(),
  priorLevel: z.string().optional(),
  isHomeEvaluationAlone: z.boolean().optional(),
  liveSpouse: z.string().optional(),
  otherLiveSpouse: z.string().optional(),
  homeEvaluation: z.array(z.string()).optional(),
  homeEvaluationType: z.array(z.string()).optional(),
  safetyMeasures: z.array(z.string()).optional(),
  architecturalBarrier: z.array(z.string()).optional(),
  treatmentTheVisit: z.array(z.string()).optional(),
  otherTreatmentTheVisit: z.string().optional(),
  otherStatus: z.array(z.string()).optional(),
  ptaSupervision: z.array(z.string()).optional(),
  employee: z.string().optional(),
  employeeTitle: z.string().optional(),
  continueFrequency: z.string().optional(),
});

export type HistoryForm = InferSchema<typeof historySchema>;

export const historyDefaultValue: HistoryForm = {
  physicalTheoryDiagnosis: "",
  priorLevel: "",
  isHomeEvaluationAlone: false,
  liveSpouse: "",
  otherLiveSpouse: "",
  homeEvaluation: [],
  homeEvaluationType: [],
  safetyMeasures: [],
  architecturalBarrier: [],
  treatmentTheVisit: [],
  otherTreatmentTheVisit: "",
  otherStatus: [],
  ptaSupervision: [],
  employee: "",
  employeeTitle: "",
  continueFrequency: "",
};
