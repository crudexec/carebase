import z from "zod";

import { InferSchema } from "@/types";

export const EmergencyContactSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  dayPhone: z.string().optional().nullable(),
  eveningPhone: z.string().optional().nullable(),
  relation: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  nextOfKinName: z.string().optional().nullable(),
  nextOfKinRelation: z.string().optional().nullable(),
  nextOfKinPhone: z.string().optional().nullable(),
  nextOfKinExt: z.string().optional().nullable(),
  nextOfKinAddress: z.string().optional().nullable(),
  livesWith: z.string().optional().nullable(),
  homePet: z.string().optional().nullable(),
  smokesInHome: z.string().optional().nullable(),
  isAdvancedDirective: z.boolean().optional(),
  location: z.string().optional().nullable(),
  legalPaperOption: z.array(z.string()).optional().nullable(),
  attorneyPower: z.string().optional().nullable(),
  poaPhone: z.string().optional().nullable(),
});

export type EmergencyContactForm = InferSchema<typeof EmergencyContactSchema>;

export const EmergencyContactDefaultValue: EmergencyContactForm = {
  firstName: "",
  lastName: "",
  dayPhone: "",
  eveningPhone: "",
  relation: "",
  address: "",
  type: "",
  nextOfKinName: "",
  nextOfKinRelation: "",
  nextOfKinPhone: "",
  nextOfKinExt: "",
  nextOfKinAddress: "",
  livesWith: "",
  homePet: "",
  smokesInHome: "",
  isAdvancedDirective: false,
  location: "",
  legalPaperOption: [],
  attorneyPower: "",
  poaPhone: "",
};
