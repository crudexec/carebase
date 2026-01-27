import { z } from "zod";

import { InferSchema } from "@/types";

export const treatmentSchema = z.object({
  orderSummary: z.string().optional(),
  subjectiveFinding: z.string().optional(),
  goals: z.string().optional(),
  criteriaOneA: z.string().optional(),
  criteriaOneB: z.string().optional(),
  criteriaTwoA: z.string().optional(),
  criteriaTwoB: z.string().optional(),
  medicalCare: z.string().optional(),
  hospitalRiskAssessment: z.string().optional(),
  frequency: z.string().optional(),
  certificationFrom: z.date().optional(),
  certificationTo: z.date().optional(),
  recertificationFrom: z.date().optional(),
  recertificationTo: z.date().optional(),
  occupationalTherapistSignature: z.string().optional(),
  coordinationOfCare: z.array(z.string()).optional(),
  isLastPhysician: z.boolean().optional(),
  lastPhysicianVisit: z.date().optional(),
  discussion: z.string().optional(),
});

export type TreatmentForm = InferSchema<typeof treatmentSchema>;

export const treatmentDefaultValue: TreatmentForm = {
  orderSummary: "",
  subjectiveFinding: "",
  goals: "",
  criteriaOneA: "",
  criteriaOneB: "",
  criteriaTwoA: "",
  criteriaTwoB: "",
  medicalCare: "",
  hospitalRiskAssessment: "",
  frequency: "",
  certificationFrom: undefined,
  certificationTo: undefined,
  recertificationFrom: undefined,
  recertificationTo: undefined,
  occupationalTherapistSignature: "",
  coordinationOfCare: [],
  isLastPhysician: false,
  lastPhysicianVisit: undefined,
  discussion: "",
};
