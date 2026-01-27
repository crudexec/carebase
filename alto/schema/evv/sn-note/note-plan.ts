import { NotePlanSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const notePlanSchema = NotePlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotePlanForm = InferSchema<typeof notePlanSchema>;

export const notePlanDefaultValue: NotePlanForm = {
  carePlan: [],
  nurseVisit: "",
  physicianVisit: "",
  careCordinationWith: [],
  otherCareCordinationWith: "",
  providedBillableSupplies: false,
  planNote: "",
  aideName: "",
  aidePresent: "",
  aideFamilySatisfied: false,
  aideTaskObserved: "",
  aideVisitDate: undefined,
  lpnName: "",
  lpnPresent: "",
  lpnFamilySatisfied: false,
  lpnTaskObserved: "",
  lpnVisitDate: undefined,
  generalNotes: "",
};
