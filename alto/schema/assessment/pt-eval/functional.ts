import { z } from "zod";

import { InferSchema } from "@/types";

export const functionalSchema = z.object({
  neurological: z.array(z.string()).optional(),
  oriented: z.array(z.string()).optional(),
  otherOriented: z.string().optional(),
  grasps: z.string().optional(),
  otherGrasps: z.string().optional(),
  pupils: z.string().optional(),
  otherPupils: z.string().optional(),
  face: z.array(z.string()).optional(),
  blindOther: z.string().optional(),
  deafOther: z.string().optional(),
  homeboundStatus: z.string().optional(),
  criteriaOneA: z.string().optional(),
  criteriaOneB: z.string().optional(),
  criteriaTwoA: z.string().optional(),
  criteriaTwoB: z.string().optional(),
  medicalCare: z.string().optional(),
  otherPrecautions: z.string().optional(),
  ptObtainedFrom: z.string().optional(),
  results: z.string().optional(),
  hospitalRiskAssessment: z.string().optional(),
  hospitalRiskAssessmentType: z.array(z.string()).optional(),
  dischargePlanning: z.string().optional(),
});

export type FunctionalForm = InferSchema<typeof functionalSchema>;

export const functionalDefaultValue: FunctionalForm = {
  neurological: [],
  oriented: [],
  otherOriented: "",
  grasps: "",
  otherGrasps: "",
  pupils: "",
  otherPupils: "",
  face: [],
  blindOther: "",
  deafOther: "",
  homeboundStatus: "",
  criteriaOneA: "",
  criteriaOneB: "",
  criteriaTwoA: "",
  criteriaTwoB: "",
  medicalCare: "",
  otherPrecautions: "",
  ptObtainedFrom: "",
  results: "",
  hospitalRiskAssessment: "",
  hospitalRiskAssessmentType: [],
  dischargePlanning: "",
};
