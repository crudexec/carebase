import { z } from "zod";

export const financialSchema = z.object({
  personalFinance: z.array(z.string()).optional(),
  medicalExpenses: z.boolean().optional(),
  inadequateIncome: z.boolean().optional(),
  inappropriateUseIncome: z.boolean().optional(),
  comments: z.string().optional(),
  communityResource: z.string().optional(),
  suspectedNeglect: z.string().optional(),
  alteredAffect: z.string().optional(),
  leftUnattended: z.string().optional(),
  suicidalIdeation: z.string().optional(),
  inadequateMethod: z.string().optional(),
  suspectedPhysicalAbuse: z.string().optional(),
  insect: z.string().optional(),
  suspectedFinancialAbuse: z.string().optional(),
  mswReferral: z.string().optional(),
  agencyComments: z.string().optional(),
});

export type FinancialForm = z.infer<typeof financialSchema>;

export const financialDefaultValues: FinancialForm = {
  personalFinance: [],
  medicalExpenses: false,
  inadequateIncome: false,
  inappropriateUseIncome: false,
  comments: "",
  communityResource: "",
  suspectedNeglect: "",
  alteredAffect: "",
  leftUnattended: "",
  suicidalIdeation: "",
  inadequateMethod: "",
  suspectedPhysicalAbuse: "",
  insect: "",
  suspectedFinancialAbuse: "",
  mswReferral: "",
  agencyComments: "",
};
