import { z } from "zod";

import { InferSchema } from "@/types";

export const PolicyHolderSchema = z.object({
  id: z.string().optional(),
  policyPayer: z.string().optional(),
  payerId: z.string().optional(),
  policyHolder: z.string().optional(),
  insuredPolicyHolder: z.string().optional(),
  uniqueId: z.string().optional(),
  gender: z.string().optional(),
  dob: z.date().optional().nullable(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  employerOrSchool: z.string().optional(),
  groupName: z.string().optional(),
  groupNumber: z.string().optional(),
  isOtherBenefitPlan: z.boolean().optional(),
});
export type PolicyHolderForm = InferSchema<typeof PolicyHolderSchema>;

export const policyHolderDefaultValue: PolicyHolderForm = {
  id: "",
  policyPayer: "",
  payerId: "",
  policyHolder: "",
  insuredPolicyHolder: "",
  uniqueId: "",
  gender: "",
  dob: undefined,
  address: "",
  country: "",
  state: "",
  city: "",
  zipCode: "",
  phone: "",
  employerOrSchool: "",
  groupName: "",
  groupNumber: "",
  isOtherBenefitPlan: false,
};
