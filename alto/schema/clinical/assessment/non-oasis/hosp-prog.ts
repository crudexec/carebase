import * as z from "zod";

export const hospProgramSchema = z.object({
  recentVisit: z.string().optional(),
  visitReason: z.string().optional(),
  prognosis: z.string().optional(),
  tetanus: z.string().optional(),
  tetanusDate: z.date().nullable(),
  pneumonia: z.string().optional(),
  pneumoniaDate: z.date().nullable(),
  hepatitis: z.string().optional(),
  hepatitisDate: z.date().nullable(),
  influenza: z.string().optional(),
  influenzaDate: z.date().nullable(),
  h1n1: z.string().optional(),
  h1n1Date: z.date().nullable(),
  covid19: z.string().optional(),
  covid19Date: z.date().nullable(),
  needs: z.string().optional(),
  comment: z.string().optional(),
});

export type HospProgForm = z.infer<typeof hospProgramSchema>;

export const hospProgDefaultValues: HospProgForm = {
  recentVisit: "",
  visitReason: "",
  prognosis: "",
  tetanus: "",
  tetanusDate: null,
  pneumonia: "",
  pneumoniaDate: null,
  hepatitis: "",
  hepatitisDate: null,
  influenza: "",
  influenzaDate: null,
  h1n1: "",
  h1n1Date: null,
  covid19: "",
  covid19Date: null,
  needs: "",
  comment: "",
};
