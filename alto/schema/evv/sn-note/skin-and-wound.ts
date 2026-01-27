import z from "zod";

import { SkinAndWoundSchema, WoundSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";
const ImageMarkerSchema = z.object({
  top: z.number(),
  left: z.number(),
});

export const woundSchema = WoundSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  woundLocation: z.array(ImageMarkerSchema),
});

export const skinAndWoundSchema = SkinAndWoundSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  woundcare: z.array(woundSchema),
});

export type SkinAndWoundForm = InferSchema<typeof skinAndWoundSchema>;
export type WoundForm = InferSchema<typeof woundSchema>;
export type ImageMarkerType = InferSchema<typeof ImageMarkerSchema>;

export const skinAndWoundDefaultValue: SkinAndWoundForm = {
  normalSkin: false,
  signAndSymptoms: "",
  symptomsExplanation: "",
  skinColor: "",
  skinTugor: "",
  skinNote: "",
  temperature: "",
  skinCondition: "",
  doctorNotified: false,
  woundcare: [] as WoundForm[],
  responseToTeaching: [],
  teachingProvidedTo: [],
  otherResponseToTeaching: "",
  otherTeachingProvidedTo: "",
  procedureDifficultyExplain: "",
};

export const defaultWoundValue: WoundForm = {
  woundType: "",
  woundLocation: [] as ImageMarkerType[],
  skinAndWoundId: "",
  length: "",
  depth: "",
  width: "",
  location: "",
  tissueThickness: "",
  drainageType: "",
  drainageAmount: "",
  undermining: "",
  bedColor: "",
  tunnellingLocation: "",
  odor: "",
  edema: "",
  woundEdge: "",
  bedTissue: [],
  surroundingTissue: [],
  notes: "",
  NPWT: false,
};
