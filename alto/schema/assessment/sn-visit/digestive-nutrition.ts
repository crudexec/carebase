import z from "zod";

import { InferSchema } from "@/types";

export const digestiveNutritionSchema = z.object({
  gastroIntestinal: z.array(z.string()).optional(),
  abdomen: z.array(z.string()).optional(),
  abdominalGrith: z.string().optional(),
  otherAbdomen: z.string().optional(),
  isBowelSound: z.boolean().optional(),
  bowelSound: z.string().optional(),
  abnormalStool: z.array(z.string()).optional(),
  lastBM: z.date().optional(),
  weightLoss: z.string().optional(),
  dietCompliance: z.string().optional(),
  dietType: z.string().optional(),
  dietInadequate: z.string().optional(),
  tubeFeeding: z.string().optional(),
  ostomy: z.array(z.string()).optional(),
  otherOstomy: z.string().optional(),
  stomaAppearance: z.string().optional(),
  stoolAppearance: z.string().optional(),
  surroundingSkin: z.string().optional(),
});

export type DigestiveNutritionForm = InferSchema<
  typeof digestiveNutritionSchema
>;

export const digestiveNutritionDefaultValue: DigestiveNutritionForm = {
  gastroIntestinal: [],
  abdomen: [],
  abdominalGrith: "",
  otherAbdomen: "",
  isBowelSound: false,
  bowelSound: "",
  abnormalStool: [],
  lastBM: undefined,
  weightLoss: "",
  dietCompliance: "",
  dietType: "",
  dietInadequate: "",
  tubeFeeding: "",
  ostomy: [],
  otherOstomy: "",
  stomaAppearance: "",
  stoolAppearance: "",
  surroundingSkin: "",
};
