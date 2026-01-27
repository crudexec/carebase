import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionNSchema = z.object({
  antipsychotics: z.array(z.string()).optional(),
  anticoagulant: z.array(z.string()).optional(),
  antibiotic: z.array(z.string()).optional(),
  opioid: z.array(z.string()).optional(),
  antiplatelet: z.array(z.string()).optional(),
  hypoglycemic: z.array(z.string()).optional(),
  none: z.array(z.string()).optional(),
  drugRegimenReview: z.string().optional(),
  medicationFollowUp: z.string().optional(),
  riskDrugEducation: z.string().optional(),
  educationProvided: z.string().optional(),
  managementOfOralMedications: z.string().optional(),
  managementOfInjectableMedications: z.string().optional(),
});

export type SectionNForm = InferSchema<typeof sectionNSchema>;

export const sectionNDefaultValue: SectionNForm = {
  antipsychotics: [],
  anticoagulant: [],
  antibiotic: [],
  opioid: [],
  antiplatelet: [],
  hypoglycemic: [],
  none: [],
  drugRegimenReview: "",
  medicationFollowUp: "",
  riskDrugEducation: "",
  educationProvided: "",
  managementOfOralMedications: "",
  managementOfInjectableMedications: "",
};
