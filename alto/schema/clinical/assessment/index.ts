import z from "zod";

import { AssessmentSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

import { hospProgramSchema } from "./non-oasis/hosp-prog";
import { medicalHistorySchema } from "./non-oasis/medical-history";

export * from "./oasis";

export const assessmentSchema = AssessmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AssessmentForm = InferSchema<typeof assessmentSchema>;

export const HistoryAndDiagnosisSchema = z.object({
  medHistoryData: medicalHistorySchema,
  hospData: hospProgramSchema,
});

export type HistoryAndDiagnosisForm = InferSchema<
  typeof HistoryAndDiagnosisSchema
>;
