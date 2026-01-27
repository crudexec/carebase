import { z } from "zod";

import { InferSchema } from "@/types";

export const scheduleFormSchema = z
  .object({
    certStartDate: z.date().optional().nullable(),
    certEndDate: z.date().optional().nullable(),
    service: z.string().min(1, {
      message: "Service is required",
    }),
    clinicianId: z.string().min(1, {
      message: "Clinician is required",
    }),
    timeIn: z.string().min(1, {
      message: "Time In is required",
    }),
    timeOut: z.string().min(1, {
      message: "Time Out is required",
    }),
    dates: z.array(z.any()).nonempty({
      message: "One or more dates are required",
    }),
    comments: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.timeIn && data.timeOut) {
        const timeIn = new Date(`01/01/2024 ${data.timeIn}`);
        const timeOut = new Date(`01/01/2024 ${data.timeOut}`);
        return timeIn < timeOut;
      } else return true;
    },
    {
      message: "Time In must be less than Time Out",
      path: ["timeOut"],
    },
  )
  .refine(
    (data) => {
      if (data.certStartDate && data.certEndDate) {
        return data.certStartDate < data.certEndDate;
      } else return true;
    },
    {
      message: "Cert Start Date must be less than Cert End Date",
      path: ["certEndDate"],
    },
  );

export const scheduleDefaultValue = {
  certStartDate: undefined,
  certEndDate: undefined,
  service: "",
  clinicianId: "",
  timeIn: "",
  timeOut: "",
  dates: [],
  comments: "",
};

export type ScheduleForm = InferSchema<typeof scheduleFormSchema>;
