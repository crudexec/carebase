import { GenitoEndoSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const genitoEndoSchema = GenitoEndoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GenitoEndoForm = InferSchema<typeof genitoEndoSchema>;

export const genitoEndoDefaultValue = {
  genitourinaryNormal: false,
  urineFrequency: "",
  urineColor: "",
  urineOdor: "",
  symptoms: [],
  urinaryCathetherType: "",
  urinaryCathetherSize: "",
  urinaryCathetherLastChanged: undefined,
  urinaryCathetherIrrigation: "",
  urinaryCathetherBulbInflated: "",
  genitourinaryNote: "",
  endocrineNormal: false,
  bloodSugar: "",
  glucometerReading: "",
  bloodSugarFasting: "",
  testingFrequency: "",
  diabetesControlledWith: [],
  administeredBy: [],
  otherAdministeredBy: "",
  hypoFrequency: "",
  patientAware: "",
  endocrineNote: "",
};
