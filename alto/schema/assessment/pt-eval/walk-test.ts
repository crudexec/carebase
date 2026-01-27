import { z } from "zod";

import { InferSchema } from "@/types";

export const walkTestSchema = z.object({
  walkTestType: z.string().nullable(),
  name: z.string().nullable(),
  assistiveDevice: z.string().nullable(),
  assistiveDeviceDate: z.date().nullable(),
  distance: z.array(
    z.object({
      id: z.string().optional(),
      distanceAmbulated: z.string().optional(),
      distanceAmbulatedDate: z.date().optional(),
    }),
  ),
});

export type WalkTestForm = InferSchema<typeof walkTestSchema>;

export const walkTestDefaultValue: WalkTestForm = {
  walkTestType: "",
  name: "",
  assistiveDevice: "",
  assistiveDeviceDate: null,
  distance: [{ distanceAmbulated: "", distanceAmbulatedDate: undefined }],
};
