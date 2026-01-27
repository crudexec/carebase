import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionGSchema = z.object({
  grooming: z.string().optional(),
  currentAbilityToDressUpperBody: z.string().optional(),
  currentAbilityToDressLowerBody: z.string().optional(),
  bathing: z.string().optional(),
  toiletTransferring: z.string().optional(),
  toiletHygiene: z.string().optional(),
  transferring: z.string().optional(),
  locomotion: z.string().optional(),
});

export type SectionGForm = InferSchema<typeof sectionGSchema>;

export const sectionGDefaultValue: SectionGForm = {
  grooming: "",
  currentAbilityToDressUpperBody: "",
  currentAbilityToDressLowerBody: "",
  bathing: "",
  toiletTransferring: "",
  toiletHygiene: "",
  transferring: "",
  locomotion: "",
};
