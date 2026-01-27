import { z } from "zod";

import { InferSchema } from "@/types";

export const orderSchema = z.object({
  restorePatientLos: z.string().nullable(),
  restorePatientFrequency: z.string().nullable(),
  restorePatientDuration: z.string().nullable(),
  performMaintenanceLos: z.string().nullable(),
  performMaintenanceFrequency: z.string().nullable(),
  performMaintenanceDuration: z.string().nullable(),
  therapeuticExerciseLos: z.string().nullable(),
  therapeuticExerciseFrequency: z.string().nullable(),
  therapeuticExerciseDuration: z.string().nullable(),
  balanceTrainingLos: z.string().nullable(),
  balanceTrainingFrequency: z.string().nullable(),
  balanceTrainingDuration: z.string().nullable(),
  adlTrainingLos: z.string().nullable(),
  adlTrainingFrequency: z.string().nullable(),
  adlTrainingDuration: z.string().nullable(),
  otherPhysicalTherapy: z.string().nullable(),
  goalIntervention: z.array(
    z.object({
      id: z.string().optional(),
      goalInterventionType: z.string().optional(),
      goalInterventionMsg: z.string().optional(),
      goalInterventionTerm: z.string().optional(),
      targetDate: z.date().optional(),
    }),
  ),
});

export type OrderForm = InferSchema<typeof orderSchema>;

export const orderDefaultValue: OrderForm = {
  restorePatientLos: "",
  restorePatientFrequency: "",
  restorePatientDuration: "",
  performMaintenanceLos: "",
  performMaintenanceFrequency: "",
  performMaintenanceDuration: "",
  therapeuticExerciseLos: "",
  therapeuticExerciseFrequency: "",
  therapeuticExerciseDuration: "",
  balanceTrainingLos: "",
  balanceTrainingFrequency: "",
  balanceTrainingDuration: "",
  adlTrainingLos: "",
  adlTrainingFrequency: "",
  adlTrainingDuration: "",
  otherPhysicalTherapy: "",
  goalIntervention: [
    {
      goalInterventionType: "",
      goalInterventionMsg: "",
      goalInterventionTerm: "",
      targetDate: undefined,
    },
  ],
};
