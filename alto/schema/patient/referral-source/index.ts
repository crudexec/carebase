import z from "zod";

import { InferSchema } from "@/types";

export const ReferralSourceSchema = z.object({
  referredBy: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  facility: z.string().optional().nullable(),
  referralDate: z.date().optional().nullable(),
  coordinator: z.string().optional().nullable(),
  salesRep: z.string().optional().nullable(),
  referralPhone: z.string().optional().nullable(),
  ext: z.string().optional().nullable(),
  disposition: z.string().optional().nullable(),
  followUp: z.string().optional().nullable(),
  otherHHA: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  mrNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  pharmacy: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      fax: z.string().optional().nullable(),
    }),
  ),
  diagnosis: z.string().optional().nullable(),
});

export type ReferralSourceForm = InferSchema<typeof ReferralSourceSchema>;

export const referralSourceDefaultValue: ReferralSourceForm = {
  referredBy: "",
  type: "",
  facility: "",
  referralDate: undefined,
  coordinator: "",
  salesRep: "",
  referralPhone: "",
  ext: "",
  disposition: "",
  followUp: "",
  otherHHA: "",
  phone: "",
  mrNumber: "",
  notes: "",
  pharmacy: [
    {
      name: "",
      phone: "",
      address: "",
      fax: "",
    },
  ],
  diagnosis: "",
};
