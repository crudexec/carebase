import { CardioPulmonarySchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const cardioPulmSchema = CardioPulmonarySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CardioPulmForm = InferSchema<typeof cardioPulmSchema>;

export const cardioPulmDefaultValue = {
  cardiovascularNormal: false,
  heartSound: "",
  heartSoundNote: "",
  edema: [],
  edemaSeverity: "",
  edemaLocation: "",
  chestPain: false,
  chestPainLocation: [],
  otherChestPainLocation: "",
  painDuration: "",
  painIntensity: "",
  painType: [],
  relievingFactor: "",
  cardiovascularNote: "",
  pulmonaryNormal: false,
  lungSound: [],
  anterior: [],
  posterior: [],
  cough: [],
  coughNote: "",
  respiratoryStatus: [],
  oxygen: "",
  pulseOximetry: "",
  pulmonaryNote: "",
};
