import { NeuroGastroSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const neuroGastroSchema = NeuroGastroSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NeuroGastroForm = InferSchema<typeof neuroGastroSchema>;

export const neuroGastroDefaultValue = {
  neuromuscularNormal: false,
  mentalStatus: [],
  mentalStatusOrientedTo: [],
  headache: false,
  impairment: [],
  markApplicableNeuro: [],
  gripStrength: "",
  gripLeft: "",
  gripRight: "",
  pupils: "",
  otherPupils: "",
  falls: "",
  neuromuscularNote: "",
  gastrointestinalNormal: false,
  bowelSounds: [],
  bowelSoundsNote: "",
  abdominalPainNone: false,
  abdominalPain: [],
  abdominalPainNote: "",
  apetite: "",
  nutritionalRequirement: "",
  tubeFeeding: "",
  tubeFeedingContinuous: "",
  npo: false,
  bowelMovementNormal: false,
  bowelMovement: [],
  lastBM: "",
  enema: "",
  markApplicableGastro: [],
  gastrointestinalNote: "",
};
