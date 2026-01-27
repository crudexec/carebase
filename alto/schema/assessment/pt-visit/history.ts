import { z } from "zod";

import { InferSchema } from "@/types";

export const historySchema = z
  .object({
    serviceProvided: z.string().optional(),
    qCode: z.string().optional(),
    visitBillable: z.array(z.string()).optional(),
    visitDate: z.date().optional(),
    therapistSignature: z.string().optional(),
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    milesTravelled: z.string().optional(),
    vitalSignsResp: z.string().optional(),
    bloodPressure: z.string().optional(),
    apicalPulse: z.string().optional(),
    lying: z.string().optional(),
    radialPulse: z.string().optional(),
    standing: z.string().optional(),
    weight: z.string().optional(),
    sitting: z.string().optional(),
    temperature: z.string().optional(),
    professionalService: z.array(z.string()).optional(),
    weightBearing: z.string().optional(),
    pattern: z.string().optional(),
    assistiveDevice: z.string().optional(),
    otherProfessionalServices: z.string().optional(),
    functionalImpairment: z.string().optional(),
    isDyspneaOnExertion: z.boolean().optional(),
    location: z.string().optional(),
    intensity: z.string().optional(),
    duration: z.string().optional(),
    medication: z.string().optional(),
    subjectiveFindings: z.string().optional(),
    qaComments: z.string().optional(),
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
      message: "Arrival time must be less than departure time",
      path: ["departureTime"],
    },
  );

export type HistoryForm = InferSchema<typeof historySchema>;

export const historyDefaultValue: HistoryForm = {
  serviceProvided: "",
  qCode: "",
  visitBillable: [],
  visitDate: undefined,
  therapistSignature: "",
  arrivalTime: "",
  departureTime: "",
  milesTravelled: "",
  vitalSignsResp: "",
  bloodPressure: "",
  apicalPulse: "",
  lying: "",
  radialPulse: "",
  standing: "",
  weight: "",
  sitting: "",
  temperature: "",
  professionalService: [],
  weightBearing: "",
  pattern: "",
  assistiveDevice: "",
  otherProfessionalServices: "",
  functionalImpairment: "",
  isDyspneaOnExertion: false,
  location: "",
  intensity: "",
  duration: "",
  medication: "",
  subjectiveFindings: "",
  qaComments: "",
};
