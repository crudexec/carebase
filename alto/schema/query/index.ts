import * as z from "zod";

export const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  tab: z.string().optional(),
});

export const patientSearchParamsSchema = searchParamsSchema.extend({
  payer: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type SearchParamsType = z.infer<typeof patientSearchParamsSchema> & {
  action?: string;
  caregiver?: string;
  patient?: string;
  create?: string;
  type?: string;
};
