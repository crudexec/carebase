import { z } from "zod";

import { InferSchema } from "@/types";

export const historySchema = z
  .object({
    patientName: z.string().optional(),
    dob: z.date().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    serviceProvided: z.string().optional(),
    qCode: z.string().optional(),
    visitBillable: z.array(z.string()).optional(),
    visitDate: z.date().optional(),
    therapistSignature: z.string().optional(),
    arrivalTime: z.string().optional(),
    departureTime: z.string().optional(),
    vitalSignsResp: z.string().optional(),
    bloodPressure: z.string().optional(),
    apicalPulse: z.string().optional(),
    lying: z.string().optional(),
    radialPulse: z.string().optional(),
    standing: z.string().optional(),
    weight: z.string().optional(),
    sitting: z.string().optional(),
    temperature: z.string().optional(),
    admissionDate: z.date().optional(),
    socDate: z.date().optional(),
    onsetDate: z.date().optional(),
    treatmentDiagnosis: z.string().optional(),
    dischargeOutcome: z.string().optional(),
    frequency: z.string().optional(),
    goals: z.string().optional(),
    precautions: z.string().optional(),
    barriers: z.string().optional(),
    functionalImpairment: z.string().optional(),
    isDyspneaOnExertion: z.boolean().optional(),
    location: z.string().optional(),
    intensity: z.string().optional(),
    duration: z.string().optional(),
    medication: z.string().optional(),
    subjectiveFindings: z.string().optional(),
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

export type HistoryForm = InferSchema<typeof historySchema>;

export const historyDefaultValue: HistoryForm = {
  patientName: "",
  dob: undefined,
  gender: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  serviceProvided: "",
  qCode: "",
  visitBillable: [],
  visitDate: undefined,
  therapistSignature: "",
  arrivalTime: "",
  departureTime: "",
  vitalSignsResp: "",
  bloodPressure: "",
  apicalPulse: "",
  lying: "",
  radialPulse: "",
  standing: "",
  weight: "",
  sitting: "",
  temperature: "",
  admissionDate: undefined,
  socDate: undefined,
  onsetDate: undefined,
  treatmentDiagnosis: "",
  dischargeOutcome: "",
  frequency: "",
  goals: "",
  precautions: "",
  barriers: "",
  functionalImpairment: "",
  isDyspneaOnExertion: false,
  location: "",
  intensity: "",
  duration: "",
  medication: "",
  subjectiveFindings: "",
};
