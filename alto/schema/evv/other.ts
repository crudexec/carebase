import { z } from "zod";

import { InferSchema } from "@/types";

export const otherInfoSchema = z.object({
  comment: z.string().optional(),
  noPublicity: z.boolean().optional(),
  telephony: z.boolean().optional(),
  referralDate: z.date().optional().nullable(),
  region: z.string().optional(),
  sentDate: z.date().optional().nullable(),
  receivedDate: z.date().optional().nullable(),
  pharmacyName: z.string().optional(),
  pharmacyPhone: z.string().optional(),
  pharmacyFax: z.string().optional(),
  excludeCareConnect: z.boolean().optional(),
  evacuationLevel: z.string().optional(),
  physicianId: z.string().optional(),
  otherPhysician: z.array(
    z.object({
      id: z.string().optional(),
      comment: z.string().optional().nullable(),
      physicianId: z.string().optional().nullable(),
    }),
  ),
  releaseInformation: z.string().optional(),
  patientSignatureSourceCode: z.string().optional(),
  patientConditions: z
    .array(z.enum(["employment", "auto-accident", "other-accident"]))
    .optional()
    .refine((arr) => !arr || arr.length <= 2, {
      message: "Patient Conditions must contain one or two elements.",
    }),
  patientConditionState: z.string().optional(),
  patientConditionDate: z.date().optional().nullable(),
});

export type OtherInfoForm = InferSchema<typeof otherInfoSchema>;

export const otherInfoDefaultValue: OtherInfoForm = {
  comment: "",
  noPublicity: false,
  telephony: false,
  referralDate: undefined,
  region: "",
  sentDate: undefined,
  receivedDate: undefined,
  pharmacyName: "",
  pharmacyPhone: "",
  pharmacyFax: "",
  excludeCareConnect: false,
  evacuationLevel: "",
  physicianId: "",
  otherPhysician: [
    {
      comment: "",
      physicianId: "",
    },
  ],
  releaseInformation: "",
  patientSignatureSourceCode: "",
  patientConditions: [],
  patientConditionState: "",
  patientConditionDate: undefined,
};
