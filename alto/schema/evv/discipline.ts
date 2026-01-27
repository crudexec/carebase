import { z } from "zod";

import { InferSchema } from "@/types";

export const disciplineSchema = z.object({
  SN: z.boolean().optional(),
  SNDischargeDate: z.date().optional().nullable(),
  SNDischargeComment: z.string().optional(),
  PT: z.boolean().optional(),
  PTDischargeDate: z.date().optional().nullable(),
  PTDischargeComment: z.string().optional(),
  OT: z.boolean().optional(),
  OTDischargeDate: z.date().optional().nullable(),
  OTDischargeComment: z.string().optional(),
  ST: z.boolean().optional(),
  STDischargeDate: z.date().optional().nullable(),
  STDischargeComment: z.string().optional(),
  MSW: z.boolean().optional(),
  MSWDischargeDate: z.date().optional().nullable(),
  MSWDischargeComment: z.string().optional(),
  HHA: z.boolean().optional(),
  HHADischargeDate: z.date().optional().nullable(),
  HHADischargeComment: z.string().optional(),
  OTHER: z.boolean().optional(),
  OTHERDischargeDate: z.date().optional().nullable(),
  OTHERDischargeComment: z.string().optional(),
});

export type DisciplineForm = InferSchema<typeof disciplineSchema>;

export const disciplineDefaultValue: DisciplineForm = {
  SN: false,
  SNDischargeDate: undefined,
  SNDischargeComment: "",
  PT: false,
  PTDischargeDate: undefined,
  PTDischargeComment: "",
  OT: false,
  OTDischargeDate: undefined,
  OTDischargeComment: "",
  ST: false,
  STDischargeDate: undefined,
  STDischargeComment: "",
  MSW: false,
  MSWDischargeDate: undefined,
  MSWDischargeComment: "",
  HHA: false,
  HHADischargeDate: undefined,
  HHADischargeComment: "",
  OTHER: false,
  OTHERDischargeDate: undefined,
  OTHERDischargeComment: "",
};
