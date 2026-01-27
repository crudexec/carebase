import z from "zod";

import { InferSchema } from "@/types";

export const carePlanSchema = z.object({
  isPhysicianContact: z.boolean().optional(),
  physicianContactDiscussion: z.string().optional(),
  isClinicalFinding: z.boolean().optional(),
  additionalFindings: z.string().optional(),
  newGoals: z.string().optional(),
  dischargeNotice: z.array(z.string()).optional(),
  dischargePlan: z.string().optional(),
  progressTowardsGoal: z.string().optional(),
  plansForNextVisit: z.string().optional(),
  hhnSupervision: z.array(z.string()).optional(),
  continueFrequency: z.string().optional(),
  employee: z.string().optional(),
  title: z.array(z.string()).optional(),
  coordinationOfCare: z.array(z.string()).optional(),
  lastPhysicianVisit: z.date().optional(),
  discussion: z.string().optional(),
  careMeasuredIdentify: z.array(z.string()).optional(),
  emergencyRoom: z.string().optional(),
  influenzaVaccine: z.string().optional(),
  influenzaVaccineGivenBy: z.string().optional(),
  pneumococcalVaccine: z.string().optional(),
  pneumococcalVaccineGivenBy: z.string().optional(),
  otherMeasuredIdentify: z.string().optional(),
});

export type CarePlanForm = InferSchema<typeof carePlanSchema>;

export const carePlanDefaultValue: CarePlanForm = {
  isPhysicianContact: false,
  physicianContactDiscussion: "",
  isClinicalFinding: false,
  additionalFindings: "",
  newGoals: "",
  dischargeNotice: [],
  dischargePlan: "",
  progressTowardsGoal: "",
  plansForNextVisit: "",
  hhnSupervision: [],
  continueFrequency: "",
  employee: "",
  title: [],
  coordinationOfCare: [],
  lastPhysicianVisit: undefined,
  discussion: "",
  careMeasuredIdentify: [],
  emergencyRoom: "",
  influenzaVaccine: "",
  influenzaVaccineGivenBy: "",
  pneumococcalVaccine: "",
  pneumococcalVaccineGivenBy: "",
  otherMeasuredIdentify: "",
};
