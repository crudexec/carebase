import z from "zod";

import { InferSchema } from "@/types";

export const oasisAssessmentSchema = z
  .object({
    assessmentId: z.string().nullish(),
    timeIn: z.date().nullish(),
    timeOut: z.date().nullish(),
    nurseId: z.string().nullish(),
    referralDate: z.date().nullish(),
    startOfCareDate: z.date().nullish(),
    dischargeTransferOrDeathDate: z.date().nullish(),
    noSOCDate: z.boolean(),
    episodeTiming: z.string().nullish(),
    isComprehensive: z.boolean(),
    reasons: z.array(z.string()).nonempty({
      message: "One or more reasons are required",
    }),
    discipline: z.string().min(1, "Discipline is required field"),
  })
  .refine(
    (data) => {
      if (data?.timeIn && data?.timeOut) {
        return data?.timeIn < data.timeOut;
      } else return true;
    },
    {
      message: "Time out must be greater than time in",
      path: ["timeOut"],
    },
  );

export type OasisAssessmentForm = InferSchema<typeof oasisAssessmentSchema>;

export const oasisAssesmentDefaultValue = {
  timeIn: undefined,
  timeOut: undefined,
  discipline: "",
  reasons: [],
  nurseId: "",
  referralDate: undefined,
  startOfCareDate: undefined,
  noSOCDate: false,
  episodeTiming: "",
  isComprehensive: false,
};
