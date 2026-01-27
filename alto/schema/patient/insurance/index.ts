import z from "zod";

import { InferSchema } from "@/types";

export const patientInsuranceSchema = z.object({
  MEDICARE: z.object({
    id: z.string().optional().nullable(),
    status: z.boolean().optional(),
    daysPerEpisode: z.string().optional().nullable(),
    serviceRequired: z.array(z.string()).optional(),
  }),
  NON_MEDICARE: z.object({
    id: z.string().optional().nullable(),
    status: z.boolean().optional(),
    daysPerEpisode: z.string().optional().nullable(),
    noOfVisitAuthorized: z.string().optional().nullable(),
    serviceRequired: z.array(z.string()).optional(),
    company: z.string().optional().nullable(),
    payerId: z.string().optional().nullable(),
    insuredId: z.string().optional().nullable(),
    clearingClaims: z.string().optional().nullable(),
  }),
  MANAGED_CARE: z.object({
    id: z.string().optional().nullable(),
    status: z.boolean().optional(),
    daysPerEpisode: z.string().optional().nullable(),
    noOfVisitAuthorized: z.string().optional().nullable(),
    serviceRequired: z.array(z.string()).optional(),
    company: z.string().optional().nullable(),
    payerId: z.string().optional().nullable(),
    insuredId: z.string().optional().nullable(),
    clearingClaims: z.string().optional().nullable(),
  }),
  CMS: z.object({
    id: z.string().optional().nullable(),
    status: z.boolean().optional(),
    daysPerEpisode: z.string().optional().nullable(),
    serviceRequired: z.array(z.string()).optional(),
    company: z.string().optional().nullable(),
    payerId: z.string().optional().nullable(),
    clearingClaims: z.string().optional().nullable(),
  }),
  HOSPICE: z.object({
    id: z.string().optional().nullable(),
    status: z.boolean().optional(),
    daysPerEpisode: z.string().optional().nullable(),
    serviceRequired: z.array(z.string()).optional(),
  }),
});
export type PatientInsuranceForm = InferSchema<typeof patientInsuranceSchema>;
export const patientInsuranceDefaultValue = {
  MEDICARE: {
    status: false,
    daysPerEpisode: "",
    serviceRequired: [],
  },
  NON_MEDICARE: {
    status: false,
    daysPerEpisode: "",
    noOfVisitAuthorized: "",
    serviceRequired: [],
    company: "",
    payerId: "",
    insuredId: "",
    clearingClaims: "",
  },
  MANAGED_CARE: {
    status: false,
    daysPerEpisode: "",
    noOfVisitAuthorized: "",
    serviceRequired: [],
    company: "",
    payerId: "",
    insuredId: "",
    clearingClaims: "",
  },
  CMS: {
    status: false,
    daysPerEpisode: "",
    serviceRequired: [],
    company: "",
    payerId: "",
    clearingClaims: "",
  },
  HOSPICE: {
    status: false,
    daysPerEpisode: "",
    serviceRequired: [],
  },
};
