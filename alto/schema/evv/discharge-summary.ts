import { z } from "zod";

import { InferSchema } from "@/types";

export const dischargeSummarySchema = z.object({
  dischargeReason: z.string().optional(),
  otherReason: z.string().optional(),
  careSummary: z.string().optional(),
  summaryDateSent: z.date().optional().nullable(),
  sentVia: z.string().optional(),
  signatureType: z.string().optional(),
  digitalSignatureChecked: z.boolean().optional(),
});

export type DischargeSummaryForm = InferSchema<typeof dischargeSummarySchema>;

export const dischargeSummaryDefaultValue: DischargeSummaryForm = {
  dischargeReason: "",
  otherReason: "",
  careSummary: "",
  summaryDateSent: undefined,
  sentVia: "",
  signatureType: "",
  digitalSignatureChecked: false,
};
