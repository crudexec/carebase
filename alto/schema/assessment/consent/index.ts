import z from "zod";

import { InferSchema } from "@/types";

export const consentSchema = z.object({
  name: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  postalCode: z.string().nullish(),
  isOtherService: z.boolean(),
  otherService: z.string().nullish(),
  information2: z.string().array(),
  understandInformation: z.string().nullish(),
  evaluations: z.string().array(),
  otherEvaluation: z.string().nullish(),
  information3: z.string().array(),
  attorneyPower: z.string().nullish(),
  phone: z.string().nullish(),
  purpose: z.string().array(),
  otherPurpose: z.string().nullish(),
  continuityDate: z.date().nullish(),
  legalRepSignatureId: z.string().nullish(),
  legalRepSignatureDate: z.date().nullish(),
  legalRepName: z.string().nullish(),
  legalRepRelation: z.string().nullish(),
  witness: z.string().nullish(),
  witnessSignature: z.string().nullish(),
  witnessSignatureDate: z.date().nullish(),
  information1: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().optional(),
      checked: z.boolean().optional().nullable(),
      date: z.date().optional().nullable(),
    }),
  ),
});

export type ConsentForm = InferSchema<typeof consentSchema>;

export const consentDefaultValue: ConsentForm = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  isOtherService: false,
  otherService: "",
  information1: [
    {
      label: "Entire record — Date(s) of service:",
      checked: false,
      date: undefined,
    },
    {
      label: "Assessment/history and physical — Date(s) of service:",
      checked: false,
      date: undefined,
    },
    {
      label: "Discharge summary — Date(s) of service:",
      checked: false,
      date: undefined,
    },
    {
      label: "Lab tests — Date(s) of service:",
      checked: false,
      date: undefined,
    },
    {
      label: "Radiology reports — Date(s) of service:",
      checked: false,
      date: undefined,
    },
  ],
  information2: [],
  understandInformation: "",
  evaluations: [],
  otherEvaluation: "",
  information3: [],
  attorneyPower: "",
  phone: "",
  purpose: [],
  otherPurpose: "",
  continuityDate: undefined,
  legalRepSignatureId: "",
  legalRepSignatureDate: undefined,
  legalRepName: "",
  legalRepRelation: "",
  witness: "",
  witnessSignature: "",
  witnessSignatureDate: undefined,
};
