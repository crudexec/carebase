import z from "zod";

import { MAX_FILE_SIZE } from "@/constants";
import { InferSchema } from "@/types";

export const UserHistorySchema = z.object({
  socialSecurity: z.string().optional().nullable(),
  dob: z.date().optional().nullable(),
  driversLicense: z.object({
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    expires: z.date().optional().nullable(),
  }),
  professionalLicense: z.object({
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    expires: z.date().optional().nullable(),
  }),
  hireDate: z.date().optional().nullable(),
  lastDate: z.date().optional().nullable(),
  evaluationDueDate: z.date().optional().nullable(),
  oigMonthlyUpdate: z.string().optional().nullable(),
  yearlyEvaluationDueDate: z.date().optional().nullable(),
  caregiverCertifications: z.array(
    z.object({
      id: z.string().optional(),
      certification: z.string().optional().nullable(),
      expires: z.date().optional().nullable(),
    }),
  ),
  media: z.array(z.any()).refine((value) => {
    const totalSize = value.reduce((acc, file) => {
      return acc + file.size;
    }, 0);
    return totalSize <= MAX_FILE_SIZE;
  }, "Total allocated Storage: 25GB"),
  criminalCheckDueDate: z.date().optional().nullable(),
  screeningDueDate: z.date().optional().nullable(),
  lastCPRTraining: z.date().optional().nullable(),
  CPRExpiration: z.date().optional().nullable(),
  insuranceExpiration: z.date().optional().nullable(),
  lastAidRegistry: z.date().optional().nullable(),
  lastMisconductRegistry: z.date().optional().nullable(),
  greenCardExpiration: z.date().optional().nullable(),
});

export const userHistoryDefaultValues = {
  id: "",
  socialSecurity: "",
  dob: undefined,
  driversLicense: {
    name: "",
    expires: undefined,
  },
  professionalLicense: {
    name: "",
    expires: undefined,
  },
  hireDate: undefined,
  lastDate: undefined,
  evaluationDueDate: undefined,
  oigMonthlyUpdate: undefined,
  yearlyEvaluationDueDate: undefined,
  caregiverCertifications: [
    {
      certification: "",
      expires: undefined,
    },
  ],
  media: [],
  criminalCheckDueDate: undefined,
  screeningDueDate: undefined,
  lastCPRTraining: undefined,
  CPRExpiration: undefined,
  insuranceExpiration: undefined,
  lastAidRegistry: undefined,
  lastMisconductRegistry: undefined,
  greenCardExpiration: undefined,
};

export type UserHistoryForm = InferSchema<typeof UserHistorySchema>;
