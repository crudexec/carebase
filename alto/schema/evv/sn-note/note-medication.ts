import { NoteMedicationSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const noteMedicationSchema = NoteMedicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NoteMedicationForm = InferSchema<typeof noteMedicationSchema>;

export const noteMedicationDefaultValue = {
  medicationChanged: "",
  medicationDose: "",
  medicationUpdated: [],
  allergyNote: "",
  administeredBy: "",
  otherAdministeredBy: "",
  missedDoses: false,
  missedDoseNote: "",
  medicationNote: "",
  therapyNA: false,
  therapyRoute: [],
  therapySite: "",
  dressingChange: "",
  otherDressingChange: "",
  lineFlush: "",
  otherLineFlush: "",
  lineFlushSaline: [],
  teachingProvidedTo: [],
  otherTeachingProvidedTo: "",
  teachingResponse: [],
  otherTeachingResponse: "",
  therapyNote: "",
};
