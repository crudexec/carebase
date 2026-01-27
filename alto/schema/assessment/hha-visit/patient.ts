import { z } from "zod";

import { InferSchema } from "@/types";

export const patientSchema = z.object({
  patientName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  caseManager: z.string().optional(),
  frequency: z.string().optional(),
  diagnosis: z.string().optional(),
  goalForCare: z.array(z.string()).optional(),
  otherGoalForCare: z.string().optional(),
  safetyInformation: z.array(z.string()).optional(),
  visionHearingDental: z.array(z.string()).optional(),
  oxygenAt: z.string().optional(),
  oxygenType: z.array(z.string()).optional(),
  other: z.string().optional(),
  otherType: z.array(z.string()).optional(),
  amputee: z.string().optional(),
  artificialLimb: z.string().optional(),
  environment: z.array(z.string()).optional(),
  foodAllergies: z.string().optional(),
  otherEnvironment: z.string().optional(),
  supplies: z.string().optional(),
});

export type PatientForm = InferSchema<typeof patientSchema>;

export const patientDefaultValue: PatientForm = {
  patientName: "",
  address: "",
  phone: "",
  caseManager: "",
  frequency: "",
  diagnosis: "",
  goalForCare: [],
  otherGoalForCare: "",
  safetyInformation: [],
  visionHearingDental: [],
  oxygenAt: "",
  oxygenType: [],
  other: "",
  otherType: [],
  amputee: "",
  artificialLimb: "",
  environment: [],
  foodAllergies: "",
  otherEnvironment: "",
  supplies: "",
};
