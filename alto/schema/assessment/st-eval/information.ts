import { z } from "zod";

import { InferSchema } from "@/types";

export const informationSchema = z
  .object({
    serviceProvided: z.string().optional(),
    patientName: z.string().optional(),
    dob: z.date().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    patientId: z.string().optional(),
    otherInsurance: z.string().optional(),
    insurance: z.array(z.string()).optional(),
    visitServiceProvided: z.string().optional(),
    bill: z.array(z.string()).optional(),
    visitDate: z.date().optional(),
    therapist: z.string().optional(),
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    socDate: z.date().optional(),
    onsetDate: z.date().optional(),
    temperature: z.string().optional(),
    pulse: z.string().optional(),
    resp: z.string().optional(),
    bloodPressure: z.string().optional(),
    usingO2At: z.string().optional(),
    lpmVia: z.string().optional(),
    criteriaOneA: z.string().optional(),
    criteriaOneB: z.string().optional(),
    criteriaTwoA: z.string().optional(),
    criteriaTwoB: z.string().optional(),
    medicalCare: z.string().optional(),
    hospitalRiskAssessment: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.arrivalTime && data.departureTime) {
        const timeIn = new Date(`01/01/2024 ${data.arrivalTime}`);
        const timeOut = new Date(`01/01/2024 ${data.departureTime}`);
        return timeIn < timeOut;
      } else return true;
    },
    {
      message: "Arrival time must be less than departure time",
      path: ["departureTime"],
    },
  );

export type InformationForm = InferSchema<typeof informationSchema>;

export const informationDefaultValue: InformationForm = {
  serviceProvided: "",
  patientName: "",
  dob: undefined,
  gender: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  patientId: "",
  otherInsurance: "",
  insurance: [],
  visitServiceProvided: "",
  bill: [],
  visitDate: undefined,
  therapist: "",
  arrivalTime: "",
  departureTime: "",
  socDate: undefined,
  onsetDate: undefined,
  temperature: "",
  pulse: "",
  resp: "",
  bloodPressure: "",
  usingO2At: "",
  lpmVia: "",
  criteriaOneA: "",
  criteriaOneB: "",
  criteriaTwoA: "",
  criteriaTwoB: "",
  medicalCare: "",
  hospitalRiskAssessment: "",
};
