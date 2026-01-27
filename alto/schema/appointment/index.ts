import { z } from "zod";

import { addTimeToDate } from "@/lib";
import { InferSchema } from "@/types";

export const appointmentSchema = z
  .object({
    patientId: z.string().optional(),
    caregiverId: z.string().optional(),
    appointmentStartTime: z.date(),
    appointmentEndTime: z.date(),
    service: z.string().min(1, "Service is required"),
    visitStatus: z.string().optional(),
    travelTime: z.string().optional(),
    overTime: z.string().optional(),
    miles: z.string().optional(),
    expense: z.string().optional(),
    caregiverComments: z.string().optional(),
    validateForTimeConflict: z.boolean().optional(),
    monitoredForQA: z.boolean().optional(),
    administrativeComments: z.string().optional(),
    visitLocation: z.string().optional(),
    billable: z.boolean().optional(),
    billingCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data?.appointmentStartTime && data?.appointmentEndTime) {
        return data?.appointmentStartTime < data.appointmentEndTime;
      } else return true;
    },
    {
      message: "Appointment end time must be greater than start time",
      path: ["appointmentEndTime"],
    },
  )
  .refine(
    (data) => {
      if (data?.appointmentStartTime && data?.appointmentEndTime) {
        return (
          data?.appointmentStartTime < data.appointmentEndTime &&
          data.appointmentEndTime.getTime() -
            data.appointmentStartTime.getTime() <
            86400000
        );
      } else return true;
    },
    {
      message: "Appointment duration must not be greater than 24 hours",
      path: ["appointmentEndTime"],
    },
  );

export type AppointmentForm = InferSchema<typeof appointmentSchema>;

export const appointmentDefaultValue: AppointmentForm = {
  patientId: "",
  caregiverId: "",
  appointmentStartTime: addTimeToDate("08:00"),
  appointmentEndTime: addTimeToDate("09:00"),
  service: "",
  visitStatus: "",
  travelTime: "",
  overTime: "",
  miles: "",
  expense: "",
  caregiverComments: "",
  validateForTimeConflict: false,
  monitoredForQA: false,
  administrativeComments: "",
  visitLocation: "",
  billable: false,
  billingCode: "",
};
