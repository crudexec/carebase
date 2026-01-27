import z from "zod";

import { VitalSignsSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const vitalSignsSchema = VitalSignsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  nurse: z.string().optional(),
});

export type VitalSignsFormType = InferSchema<typeof vitalSignsSchema>;

export const vitalSignsDefaultValue: VitalSignsFormType = {
  nurse: "",
  scheduledVisitId: "",
  startTime: undefined,
  endTime: undefined,
  visitType: "",
  shiftNote: [],
  homeboundReason: [],
  homeboundComment: "",
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
  medicationTaken: "",
  painDescription: "",
  painLevel: "",
  painManagement: "",
};
