import { z } from "zod";

import { InferSchema } from "@/types";

export const tinettiSchema = z.object({
  name: z.string().optional(),
  date: z.date().optional(),
  sittingBalance: z.string().optional(),
  risesFromChair: z.string().optional(),
  attemptsToRise: z.string().optional(),
  immediateStandingBalance: z.string().optional(),
  standingBalance: z.string().optional(),
  nudged: z.string().optional(),
  eyesClosed: z.string().optional(),
  turning360Degree: z.string().optional(),
  turning360DegreeSteadiness: z.string().optional(),
  sittingDown: z.string().optional(),
  indicationOfGait: z.string().optional(),
  stepLength: z.string().optional(),
  footClearance: z.string().optional(),
  stepSymmetry: z.string().optional(),
  stepContinuity: z.string().optional(),
  path: z.string().optional(),
  trunk: z.string().optional(),
  walkingTime: z.string().optional(),
});

export type TinettiForm = InferSchema<typeof tinettiSchema>;

export const tinettiDefaultValue: TinettiForm = {
  name: "",
  date: undefined,
  sittingBalance: "",
  risesFromChair: "",
  attemptsToRise: "",
  immediateStandingBalance: "",
  standingBalance: "",
  nudged: "",
  eyesClosed: "",
  turning360Degree: "",
  turning360DegreeSteadiness: "",
  sittingDown: "",
  indicationOfGait: "",
  stepLength: "",
  footClearance: "",
  stepSymmetry: "",
  stepContinuity: "",
  path: "",
  trunk: "",
  walkingTime: "",
};
