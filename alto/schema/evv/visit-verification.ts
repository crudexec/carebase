import { z } from "zod";

import { InferSchema } from "@/types";

export const visitVerificationSchema = z.object({
  comment: z.string().optional(),
  temperature: z.string().optional(),
  temperatureType: z.string().optional(),
  pulse: z.string().optional(),
  pulseType: z.string().optional(),
  pulseTypeRegular: z.string().optional(),
  respiration: z.string().optional(),
  respirationType: z.string().optional(),
  notes: z.string().optional(),
  bloodPressureRight: z.string().optional(),
  bloodPressureLeft: z.string().optional(),
  bloodPressureWeight: z.string().optional(),
  bloodPressureType: z.string().optional(),
  painDenied: z.boolean().optional(),
  painLocation: z.string().optional(),
  painIntensity: z.string().optional(),
  painDuration: z.string().optional(),
  otherPain: z.string().optional(),
  painLevel: z.string().optional(),
  medicationTaken: z.string().optional(),
  painDescription: z.string().optional(),
  painManagement: z.string().optional(),
});

export type VisitVerificationForm = InferSchema<typeof visitVerificationSchema>;

export const visitVerificationDefaultValue: VisitVerificationForm = {
  comment: "",
  temperature: "",
  temperatureType: "",
  pulse: "",
  pulseType: "",
  pulseTypeRegular: "",
  respiration: "",
  respirationType: "",
  notes: "",
  bloodPressureRight: "",
  bloodPressureLeft: "",
  bloodPressureWeight: "",
  bloodPressureType: "",
  painDenied: false,
  painLocation: "",
  painIntensity: "",
  otherPain: "",
  painDuration: "",
  painDescription: "",
  painLevel: "",
  painManagement: "",
};
