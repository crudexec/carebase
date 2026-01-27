import z from "zod";

import { InferSchema } from "@/types";

export const CommercialSchema = z.object({
  insuranceInformation: z.array(z.string()).optional(),
  payId: z.string().optional(),
  policyHolder: z.string().optional(),
  insuredHolder: z.string().optional(),
  uniqueId: z.string().optional(),
  gender: z.string().optional(),
  dob: z.date().optional().nullable(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  employer: z.string().optional(),
  groupName: z.string().optional(),
  groupNumber: z.string().optional(),
  isOtherBenefitPlan: z.boolean().optional(),
  otherInsured: z.string().optional(),
  otherBenefitPlanEmployer: z.string().optional(),
  otherBenefitPlanGender: z.string().optional(),
  otherBenefitPlanDob: z.date().optional().nullable(),
  otherBenefitPlanGroupName: z.string().optional(),
  otherBenefitPlanGroupNumber: z.string().optional(),
});
export type CommercialForm = InferSchema<typeof CommercialSchema>;

export const CommercialDefaultValue: CommercialForm = {
  insuranceInformation: [],
  payId: "",
  policyHolder: "",
  insuredHolder: "",
  uniqueId: "",
  gender: "",
  dob: undefined,
  address: "",

  country: "",
  state: "",
  city: "",
  zip: "",
  phone: "",
  employer: "",
  groupName: "",
  groupNumber: "",
  isOtherBenefitPlan: false,
  otherInsured: "",
  otherBenefitPlanEmployer: "",
  otherBenefitPlanGender: "",
  otherBenefitPlanDob: undefined,
  otherBenefitPlanGroupName: "",
  otherBenefitPlanGroupNumber: "",
};
