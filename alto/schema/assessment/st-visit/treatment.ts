import { z } from "zod";

import { InferSchema } from "@/types";

export const treatmentSchema = z.object({
  dysphagiaOralPhase: z.string().optional(),
  dysphagiaPharyngealPhase: z.string().optional(),
  dietLevel: z.string().optional(),
  auditoryComprehension: z.string().optional(),
  verbalExpression: z.string().optional(),
  nonVerbalCommunication: z.string().optional(),
  other: z.string().optional(),
  caregiverTraining: z.string().optional(),
  progressNote: z.string().optional(),
  mdOrders: z.string().optional(),
  therapistSignature: z.string().optional(),
  therapistSignatureDate: z.date().optional(),
});

export type TreatmentForm = InferSchema<typeof treatmentSchema>;

export const treatmentDefaultValue: TreatmentForm = {
  dysphagiaOralPhase: "",
  dysphagiaPharyngealPhase: "",
  dietLevel: "",
  auditoryComprehension: "",
  verbalExpression: "",
  nonVerbalCommunication: "",
  other: "",
  caregiverTraining: "",
  progressNote: "",
  mdOrders: "",
  therapistSignature: "",
  therapistSignatureDate: undefined,
};
