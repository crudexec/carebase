import { z } from "zod";

import { InferSchema } from "@/types";

export const admissionSchema = z.object({
  status: z.string().optional(),
  admitDate: z.date().optional().nullable(),
  pan: z.string().optional(),
  providerId: z.string().optional(),
  caregiverId: z.string().optional(),
  physicianId: z.string().optional(),
  county: z.string().optional(),
  admissionSource: z.string().optional(),
  referralSource: z.string().optional(),
  transferredFrom: z.boolean().optional(),
  dnr: z.string().optional(),
  infectionControl: z.string().optional(),
  admitInfection: z.string().optional(),
  dischargeDate: z.date().optional().nullable(),
  reason: z.string().optional(),
  otherReason: z.string().optional(),
});

export type AdmissionForm = InferSchema<typeof admissionSchema>;

export const admissionDefaultValue: AdmissionForm = {
  status: "",
  admitDate: undefined,
  pan: "",
  providerId: "",
  caregiverId: "",
  physicianId: "",
  county: "",
  admissionSource: "",
  referralSource: "",
  transferredFrom: false,
  dnr: "",
  infectionControl: "",
  admitInfection: "",
  dischargeDate: undefined,
  reason: "",
  otherReason: "",
};
