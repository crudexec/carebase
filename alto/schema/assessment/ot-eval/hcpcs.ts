import z from "zod";

import { InferSchema } from "@/types";
export const hcpcsSchema = z
  .object({
    serviceProvided: z.string().optional(),
    qCode: z.string().optional(),
    visitEvaluation: z.array(z.string()).optional(),
    visitBillable: z.array(z.string()).optional(),
    visitDate: z.date().optional(),
    therapistSignature: z.string().optional(),
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    milesTravelled: z.string().optional(),
    patientName: z.string().optional(),
    patientPhone: z.string().optional(),
    patientAddress: z.string().optional(),
    patientCity: z.string().optional(),
    patientState: z.string().optional(),
    patientZip: z.string().optional(),
    patientOnset: z.string().optional(),
    patientDiagnosis: z.string().optional(),
    vitalSignsResp: z.string().optional(),
    bloodPressure: z.string().optional(),
    apicalPulse: z.string().optional(),
    lying: z.string().optional(),
    radialPulse: z.string().optional(),
    standing: z.string().optional(),
    weight: z.string().optional(),
    sitting: z.string().optional(),
    temperature: z.string().optional(),
    rehabPotential: z.array(z.string()).optional(),
    mentalStatus: z.array(z.string()).optional(),
    location: z.string().optional(),
    intensity: z.string().optional(),
    duration: z.string().optional(),
    medication: z.string().optional(),
    functionalImpairment: z.string().optional(),
    isDyspneaOnExertion: z.boolean().optional(),
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

export type HcpcsForm = InferSchema<typeof hcpcsSchema>;

export const hcpcsDefaultValue: HcpcsForm = {
  serviceProvided: "",
  qCode: "",
  visitEvaluation: [],
  visitBillable: [],
  visitDate: undefined,
  therapistSignature: "",
  arrivalTime: "",
  departureTime: "",
  milesTravelled: "",
  patientName: "",
  patientPhone: "",
  patientAddress: "",
  patientCity: "",
  patientState: "",
  patientZip: "",
  patientOnset: "",
  patientDiagnosis: "",
  vitalSignsResp: "",
  bloodPressure: "",
  apicalPulse: "",
  lying: "",
  radialPulse: "",
  standing: "",
  weight: "",
  sitting: "",
  temperature: "",
  rehabPotential: [],
  mentalStatus: [],
  location: "",
  intensity: "",
  duration: "",
  medication: "",
  functionalImpairment: "",
  isDyspneaOnExertion: false,
};
