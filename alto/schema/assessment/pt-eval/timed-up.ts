import { z } from "zod";

import { InferSchema } from "@/types";

export const timedUpSchema = z.object({
  name: z.string().nullable(),
  assistiveDevice: z.string().nullable(),
  assistiveDeviceDate: z.date().nullable(),
  tug: z.array(
    z.object({
      id: z.string().optional(),
      tugTime: z.string().optional(),
      tugDate: z.date().optional(),
    }),
  ),
});

export type TimedUpForm = InferSchema<typeof timedUpSchema>;

export const timedUpDefaultValue: TimedUpForm = {
  name: "",
  assistiveDevice: "",
  assistiveDeviceDate: null,
  tug: [{ tugTime: "", tugDate: undefined }],
};
