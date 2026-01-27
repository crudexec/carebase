import { NoteInterventionSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const noteInterventionSchema = NoteInterventionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InterventionForm = InferSchema<typeof noteInterventionSchema>;

export const interventionDefaultValue = {
  bodySystem: "",
  effectiveDate: null,
  interventions: "",
  patientResponse: "",
  orders: "",
  goals: "",
  goalMet: "",
  goalMetDate: undefined,
};
