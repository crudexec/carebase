import { z } from "zod";

export const eventFormSchema = z.object({
  client: z.string().min(1, "Client is required"),
  staff: z.string().min(1, "Staff is required"),
  dateOfEvent: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

export const employeeRescheduleFormSchema = z.object({
  dateOfEvent: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  reason: z.string().min(1, "Required"),
});
