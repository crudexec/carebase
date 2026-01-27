import * as z from "zod";

export const medicalHistorySchema = z.object({
  isLivingWill: z.string().optional(),
  isCopyRequested: z.string().optional(),
  isDPOA: z.string().optional(),
  isMaterialProvided: z.string().optional(),
  isAgencyCopy: z.string().optional(),
  isDiagnosesUnderstood: z.string().optional(),
  significantMedicalHistory: z.string().optional(),
  homeboundReason: z
    .array(
      z.enum([
        "requires-assistance",
        "unsafe-to-leave",
        "patient-is-bedridden",
        "medical-restriction",
        "taxing-effort",
        "residual-weakness",
        "depended-upon-device",
        "sob-on-exertion",
        "other",
      ]),
    )
    .optional(),
  otherHomeBoundReason: z.string().optional(),
  nkda: z.boolean().optional(),
  drugAllergies: z.string().optional(),
  foodAllergies: z.string().optional(),
  noMedications: z.boolean().optional(),
  medications: z.string().optional(),
  isExperiencingPain: z.string().optional(),
  painLocation: z.string().optional(),
  painIntensity: z.number().min(0).max(10).optional(),
  painCharacteristics: z.string().optional(),
  temperature: z.number().optional(),
  pulse: z.number().optional(),
  respirations: z.number().optional(),
  bloodPressure: z.string().optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
});

export type MedicalHistoryForm = z.infer<typeof medicalHistorySchema>;

export const medicalHistoryDefaultValues: MedicalHistoryForm = {
  isLivingWill: "",
  isCopyRequested: "",
  isDPOA: "",
  isMaterialProvided: "",
  isAgencyCopy: "",
  isDiagnosesUnderstood: "",
  significantMedicalHistory: "",
  homeboundReason: [],
  otherHomeBoundReason: "",
  nkda: false,
  drugAllergies: "",
  foodAllergies: "",
  noMedications: false,
  medications: "",
  isExperiencingPain: "",
  painLocation: "",
  painIntensity: 0,
  painCharacteristics: "",
  temperature: undefined,
  pulse: undefined,
  respirations: undefined,
  bloodPressure: "",
  oxygenSaturation: undefined,
};
