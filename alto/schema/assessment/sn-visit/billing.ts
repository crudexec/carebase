import z from "zod";

import { InferSchema } from "@/types";

export const billingSchema = z
  .object({
    serviceProvided: z.string().optional(),
    qCode: z.string().optional(),
    visitType: z.string().optional(),
    billableOptions: z.array(z.string()).optional(),
    visitDate: z.date(),
    milesTravelled: z.string(),
    nurseSignature: z.string(),
    qAComment: z.string().optional(),
    arrivalTime: z.string(),
    departureTime: z.string(),
    qANurseResponse: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.arrivalTime && data.departureTime) {
        const arrivalTime = new Date(`01/01/2024 ${data.arrivalTime}`);
        const departureTime = new Date(`01/01/2024 ${data.departureTime}`);
        return arrivalTime < departureTime;
      } else return true;
    },
    {
      message: "Time In must be less than Time Out",
      path: ["departureTime"],
    },
  );

export type BillingForm = InferSchema<typeof billingSchema>;

export const billingDefaultValue: BillingForm = {
  serviceProvided: "",
  qCode: "",
  visitType: "",
  billableOptions: [],
  visitDate: new Date(),
  milesTravelled: "",
  nurseSignature: "",
  arrivalTime: "",
  departureTime: "",
  qAComment: "",
  qANurseResponse: "",
};
