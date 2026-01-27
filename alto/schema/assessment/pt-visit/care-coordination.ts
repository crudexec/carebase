import { z } from "zod";

import { InferSchema } from "@/types";

export const careCoordinationSchema = z.object({
  treatmentProvided: z.string().optional(),
  bloodPressure: z.string().optional(),
  vitalSignPulse: z.string().optional(),
  homeboundStatus: z.array(z.string()).optional(),
  otherHomeboundStatus: z.string().optional(),
  coordinationOfCare: z.array(z.string()).optional(),
  otherCoordinationOfCare: z.string().optional(),
  coordinationOfCareRegard: z.string().optional(),
  discussion: z.string().optional(),
  isLastPhysician: z.boolean().optional(),
  lastPhysicianVisit: z.date().optional(),
  careMeasure: z.array(z.string()).optional(),
  emergencyRoomVisit: z.date().optional(),
  influenzaVaccine: z.date().optional(),
  influenzaVaccineGivenBy: z.string().optional(),
  pneumococcalVaccine: z.date().optional(),
  pneumococcalVaccineGivenBy: z.string().optional(),
  isDischargeNotice: z.boolean().optional(),
  dischargePlanSupervisor: z.string().optional(),
  ptaSupervision: z.array(z.string()).optional(),
  employee: z.string().optional(),
  employeeTitle: z.array(z.string()).optional(),
  continueFrequency: z.string().optional(),
  comments: z.string().optional(),
});

export type CareCoordinationForm = InferSchema<typeof careCoordinationSchema>;

export const careCoordinationDefaultValue: CareCoordinationForm = {
  treatmentProvided: "",
  bloodPressure: "",
  vitalSignPulse: "",
  homeboundStatus: [],
  otherHomeboundStatus: "",
  coordinationOfCare: [],
  otherCoordinationOfCare: "",
  coordinationOfCareRegard: "",
  discussion: "",
  isLastPhysician: false,
  lastPhysicianVisit: undefined,
  careMeasure: [],
  emergencyRoomVisit: undefined,
  influenzaVaccine: undefined,
  influenzaVaccineGivenBy: "",
  pneumococcalVaccine: undefined,
  pneumococcalVaccineGivenBy: "",
  isDischargeNotice: false,
  dischargePlanSupervisor: "",
  ptaSupervision: [],
  employee: "",
  employeeTitle: [],
  continueFrequency: "",
  comments: "",
};
