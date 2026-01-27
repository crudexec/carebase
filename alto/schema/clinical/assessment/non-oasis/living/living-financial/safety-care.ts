import { z } from "zod";

export const safetyCareSchema = z.object({
  skilledNursing: z.array(z.string()).optional(),
  instructions: z.array(z.string()).optional(),
  patientSafe: z.boolean().optional(),
  patientVerbalize: z.boolean().optional(),
  patientVerbalizeValue: z.string().optional(),
  patientDemonstrate: z.boolean().optional(),
  patientDemonstrateValue: z.string().optional(),
  patientKnowledgeable: z.boolean().optional(),
  patientKnowledgeableValue: z.string().optional(),
  other: z.boolean().optional(),
  otherValue: z.string().optional(),
  safeMeasures: z.array(z.string()).optional(),
  safetyMeasureHours: z.string().optional(),
  otherSafeMeasures: z.string().optional(),
  comments: z.string().optional(),
});

export type SafetyCareForm = z.infer<typeof safetyCareSchema>;

export const safetyCareDefaultValues: SafetyCareForm = {
  skilledNursing: [],
  instructions: [],
  patientSafe: false,
  patientVerbalize: false,
  patientVerbalizeValue: "",
  patientDemonstrate: false,
  patientDemonstrateValue: "",
  patientKnowledgeable: false,
  patientKnowledgeableValue: "",
  other: false,
  otherValue: "",
  safeMeasures: [],
  safetyMeasureHours: "",
  otherSafeMeasures: "",
  comments: "",
};
