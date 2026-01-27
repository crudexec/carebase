import { z } from "zod";

import { InferSchema } from "@/types";

export const bergBalanceSchema = z.object({
  sittingToStanding: z.string().optional(),
  standingUnsupported: z.string().optional(),
  sittingWithBackUnSupported: z.string().optional(),
  standingToSitting: z.string().optional(),
  transfers: z.string().optional(),
  standingUnsupportedWithEyeClosed: z.string().optional(),
  standingUnsupportedWithFeetTogether: z.string().optional(),
  reachingForwardWithOutstretchedArm: z.string().optional(),
  pickObjectFromTheFloor: z.string().optional(),
  turningToLookBehind: z.string().optional(),
  turn360Degree: z.string().optional(),
  placeAlternateStep: z.string().optional(),
  standingUnsupportedOneFoot: z.string().optional(),
  standingOnOneLeg: z.string().optional(),
});

export type BergBalanceForm = InferSchema<typeof bergBalanceSchema>;

export const bergBalanceDefaultValue: BergBalanceForm = {
  sittingToStanding: "",
  standingUnsupported: "",
  sittingWithBackUnSupported: "",
  standingToSitting: "",
  transfers: "",
  standingUnsupportedWithEyeClosed: "",
  standingUnsupportedWithFeetTogether: "",
  reachingForwardWithOutstretchedArm: "",
  pickObjectFromTheFloor: "",
  turningToLookBehind: "",
  turn360Degree: "",
  placeAlternateStep: "",
  standingUnsupportedOneFoot: "",
  standingOnOneLeg: "",
};
