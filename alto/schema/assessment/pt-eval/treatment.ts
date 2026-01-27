import { z } from "zod";

import { InferSchema } from "@/types";

export const treatmentSchema = z.object({
  subjectiveInformation: z.string().optional(),
  medicalHistory: z.string().optional(),
  treatmentPlan: z.array(z.string()).optional(),
  otherTreatmentPlan: z.string().optional(),
  clinicalNarrativeSummary: z.string().optional(),
  treatmentGoals: z.string().optional(),
  frequency: z.string().optional(),
  certificationFrom: z.date().optional(),
  certificationTo: z.date().optional(),
  recertificationFrom: z.date().optional(),
  recertificationTo: z.date().optional(),
  physicalTherapistSignature: z.string().optional(),
  physicalTherapistSignatureDate: z.date().optional(),
  coordinationOfCare: z.string().optional(),
  isLastPhysician: z.boolean().optional(),
  lastPhysicianVisit: z.date().optional(),
  discussion: z.string().optional(),
});

export type TreatmentForm = InferSchema<typeof treatmentSchema>;

export const treatmentDefaultValue: TreatmentForm = {
  subjectiveInformation: "",
  medicalHistory: "",
  treatmentPlan: [],
  otherTreatmentPlan: "",
  clinicalNarrativeSummary: "",
  treatmentGoals: "",
  frequency: "",
  certificationFrom: undefined,
  certificationTo: undefined,
  recertificationFrom: undefined,
  recertificationTo: undefined,
  physicalTherapistSignature: "",
  physicalTherapistSignatureDate: undefined,
  coordinationOfCare: "",
  isLastPhysician: false,
  lastPhysicianVisit: undefined,
  discussion: "",
};
