import { z } from "zod";

import { InferSchema } from "@/types";

export const missedVisitNoteSchema = z.object({
  caregiver: z.string().optional(),
  scheduledVisit: z.date().optional().nullable(),
  startTime: z.date().optional().nullable(),
  endTime: z.date().optional().nullable(),
  visitType: z.string().optional(),
  otherVisitType: z.string().optional(),
  reasonType: z.string().optional(),
  reasonTypeComment: z.string().optional(),
  physicianNotified: z.string().optional(),
  physicianNotifiedDate: z.date().optional().nullable(),
  caseManagerNotified: z.string().optional(),
  caseManagerNotifiedDate: z.date().optional().nullable(),
  additionalComments: z.string().optional(),
});

export type MissedVisitNoteForm = InferSchema<typeof missedVisitNoteSchema>;

export const missedVisitNoteDefaultValue: MissedVisitNoteForm = {
  caregiver: "",
  scheduledVisit: undefined,
  startTime: undefined,
  endTime: undefined,
  visitType: "",
  otherVisitType: "",
  reasonType: "",
  reasonTypeComment: "",
  physicianNotified: "",
  physicianNotifiedDate: undefined,
  caseManagerNotified: "",
  caseManagerNotifiedDate: undefined,
  additionalComments: "",
};
