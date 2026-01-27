import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionMSchema = z.object({
  unhealedPressureUlcer: z.string().optional(),
  currentNumberOfStageOne: z.string().optional(),
  stageOfMostProblematicUnhealedPressure: z.string().optional(),
  patientHaveStasisUlcer: z.string().optional(),
  currentNumberOfStasisUlcer: z.string().optional(),
  statusOfMostProblematicStasisUlcer: z.string().optional(),
  patientHaveSurgicalWound: z.string().optional(),
  statusOfMostProblematicSurgicalWound: z.string().optional(),
  stage2: z.string().optional(),
  stage3: z.string().optional(),
  stage4: z.string().optional(),
  nonremovableDressing: z.string().optional(),
  slough: z.string().optional(),
  deepTissueInjury: z.string().optional(),
});

export type SectionMForm = InferSchema<typeof sectionMSchema>;

export const sectionMDefaultValue: SectionMForm = {
  unhealedPressureUlcer: "",
  currentNumberOfStageOne: "",
  stageOfMostProblematicUnhealedPressure: "",
  patientHaveStasisUlcer: "",
  currentNumberOfStasisUlcer: "",
  statusOfMostProblematicStasisUlcer: "",
  patientHaveSurgicalWound: "",
  statusOfMostProblematicSurgicalWound: "",
  stage2: "",
  stage3: "",
  stage4: "",
  nonremovableDressing: "",
  slough: "",
  deepTissueInjury: "",
};
