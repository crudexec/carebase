import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionOSchema = z.object({
  isChemotherapy: z.boolean().optional(),
  chemotherapyType: z.array(z.string()).optional(),
  isRadiation: z.boolean().optional(),
  isOxygenTherapy: z.boolean().optional(),
  oxygenTherapyType: z.array(z.string()).optional(),
  isSuctioning: z.boolean().optional(),
  suctioningType: z.array(z.string()).optional(),
  isTracheostomyCare: z.boolean().optional(),
  isInvasiveMechanicalVentilator: z.boolean().optional(),
  isNonInvasiveMechanicalVentilator: z.boolean().optional(),
  nonInvasiveMechanicalVentilatorType: z.array(z.string()).optional(),
  isIVMedications: z.boolean().optional(),
  ivMedicationsType: z.array(z.string()).optional(),
  isTransfusions: z.boolean().optional(),
  isDialysis: z.boolean().optional(),
  dialysisType: z.array(z.string()).optional(),
  isIVAccess: z.boolean().optional(),
  ivAccessType: z.array(z.string()).optional(),
  isNone: z.boolean().optional(),
  numberOfTherapyVisits: z.string().optional(),
  isNotApplicable: z.boolean().optional(),
});

export type SectionOForm = InferSchema<typeof sectionOSchema>;

export const sectionODefaultValue: SectionOForm = {
  isChemotherapy: false,
  chemotherapyType: [],
  isRadiation: false,
  isOxygenTherapy: false,
  oxygenTherapyType: [],
  isSuctioning: false,
  suctioningType: [],
  isTracheostomyCare: false,
  isInvasiveMechanicalVentilator: false,
  isNonInvasiveMechanicalVentilator: false,
  nonInvasiveMechanicalVentilatorType: [],
  isIVMedications: false,
  ivMedicationsType: [],
  isTransfusions: false,
  isDialysis: false,
  dialysisType: [],
  isIVAccess: false,
  ivAccessType: [],
  isNone: false,
  numberOfTherapyVisits: "",
  isNotApplicable: false,
};
