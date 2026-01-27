import { z } from "zod";

import { InferSchema } from "@/types";

export const sectionCSchema = z.object({
  interviewForMentalStatus: z.string().optional(),
  numberOfWordsRepeated: z.string().optional(),
  ableToReportCorrectYear: z.string().optional(),
  ableToReportCorrectMonth: z.string().optional(),
  ableToReportCorrectDay: z.string().optional(),
  ableToRecallSocks: z.string().optional(),
  ableToRecallBlue: z.string().optional(),
  ableToRecallBed: z.string().optional(),
  bimSummaryScore: z.string().optional(),
  acuteOnset: z.string().optional(),
  inattention: z.string().optional(),
  disorganisedThinking: z.string().optional(),
  alteredLevelOfConsicousness: z.string().optional(),
  cognitiveFunctioning: z.string().optional(),
  whenConfused: z.string().optional(),
  whenAnxious: z.string().optional(),
});

export type SectionCForm = InferSchema<typeof sectionCSchema>;

export const sectionCDefaultValue: SectionCForm = {
  interviewForMentalStatus: "",
  numberOfWordsRepeated: "",
  ableToReportCorrectYear: "",
  ableToReportCorrectMonth: "",
  ableToReportCorrectDay: "",
  ableToRecallSocks: "",
  ableToRecallBlue: "",
  ableToRecallBed: "",
  bimSummaryScore: "",
  acuteOnset: "",
  inattention: "",
  disorganisedThinking: "",
  alteredLevelOfConsicousness: "",
  cognitiveFunctioning: "",
  whenConfused: "",
  whenAnxious: "",
};
