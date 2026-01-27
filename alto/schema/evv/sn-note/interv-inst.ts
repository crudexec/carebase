import { NoteIntervInstSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const noteIntervInstSchema = NoteIntervInstSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IntervInstForm = InferSchema<typeof noteIntervInstSchema>;

export const intervInstDefaultValue = {
  interventions: [],
  interventionNote: "",
  cardiacFluid: false,
  cardiacExacerbation: false,
  cardiacExacerbationNote: "",
  cardiacDietTeaching: false,
  cardiacDietTeachingNote: "",
  respiratory: [],
  gigu: [],
  endocrine: [],
  endocrineDietTeaching: "",
  integumentary: [],
  pain: [],
  safety: [],
  safetyDiseaseManagement: "",
  interactionResponse: "",
  instructionsNote: "",
  goals: "",
};
