import { z } from "zod";

export const familySupportiveSchema = z.object({
  familySupportive: z.string().optional(),
  caregiverName: z.string().optional(),
  relationship: z.string().optional(),
  ableToProvide: z.string().optional(),
  ableToReceiveInstruction: z.string().optional(),
  assistWithADL: z.string().optional(),
  assistWithlivingFacility: z.string().optional(),
  facilityName: z.string().optional(),
  facilityPhone: z.string().optional(),
  comments: z.string().optional(),
  hazardReasons: z.array(z.string()).optional(),
  otherHazardReasons: z.string().optional(),
  usingOxygen: z.array(z.string()).optional(),
});

export type FamilySupportiveForm = z.infer<typeof familySupportiveSchema>;

export const familySupportiveDefaultValues: FamilySupportiveForm = {
  familySupportive: "",
  caregiverName: "",
  relationship: "",
  ableToProvide: "",
  ableToReceiveInstruction: "",
  assistWithADL: "",
  assistWithlivingFacility: "",
  facilityName: "",
  facilityPhone: "",
  comments: "",
  hazardReasons: [],
  otherHazardReasons: "",
  usingOxygen: [],
};
