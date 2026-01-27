import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionISchema = z.object({
  activeDiagnoses: z.array(z.string()).optional(),
  diagnosis: z.array(
    z.object({
      id: z.string().optional(),
      group: z.string().optional(),
      status: z.string().optional(),
      icdCode: z.string().optional(),
      date: z.date().optional(),
      name: z.string().optional(),
      controlRating: z.string().optional(),
    }),
  ),
});

export type SectionIForm = InferSchema<typeof sectionISchema>;

export const sectionIDefaultValue: SectionIForm = {
  activeDiagnoses: [],
  diagnosis: [
    {
      id: "",
      group: "",
      status: "",
      icdCode: "",
      date: undefined,
      name: "",
      controlRating: "",
    },
  ],
};
