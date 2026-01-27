import { z } from "zod";

import { InferSchema } from "@/types";

export const insuranceSchema = z.object({
  payerId: z.string().optional(),
  payerResponsibility: z.string().optional(),
  memberId: z.string().optional(),
  groupName: z.string().optional(),
  groupNumber: z.string().optional(),
  insuranceCaseManagerId: z.string().optional(),
  billType: z.string().optional(),
  assignBenefits: z.string().optional(),
  providerAcceptAssignment: z.string().optional(),
  effectiveFrom: z.date().optional().nullable(),
  effectiveThrough: z.date().optional().nullable(),
  patientRelationship: z.string().optional(),
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  dob: z.date().optional().nullable(),
  sex: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  relatedCaregiver: z.array(
    z.object({
      id: z.string().optional(),
      caregiverId: z.string().optional().nullable(),
      relationShip: z.string().optional(),
    }),
  ),
  copayType: z.string().optional(),
  copayAmount: z.string().optional(),
  comment: z.string().optional(),
});

export type InsuranceForm = InferSchema<typeof insuranceSchema>;

export const insuranceDefaultValue: InsuranceForm = {
  payerId: "",
  payerResponsibility: "",
  memberId: "",
  groupName: "",
  groupNumber: "",
  insuranceCaseManagerId: "",
  billType: "",
  assignBenefits: "",
  providerAcceptAssignment: "",
  effectiveFrom: null,
  effectiveThrough: null,
  patientRelationship: "",
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  dob: null,
  sex: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  copayType: "",
  copayAmount: "",
  comment: "",
  relatedCaregiver: [
    {
      caregiverId: "",
      relationShip: "",
    },
  ],
};
