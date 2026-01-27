import { PlanOfCareSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const planOfCareSchema = PlanOfCareSchema.omit({
  id: true,
  providerId: true,
  caregiverId: true,
  patientId: true,
  createdAt: true,
  updatedAt: true,
  active: true,
  archivedOn: true,
}).refine(
  (data) => {
    if (data?.certStartDate && data?.certEndDate) {
      return data?.certStartDate < data.certEndDate;
    } else return true;
  },
  {
    message: "Certification end date must be greater than start date",
    path: ["certEndDate"],
  },
);

export type PlanOfCareForm = InferSchema<typeof planOfCareSchema>;

export const planOfCareDefaultValue: PlanOfCareForm = {
  certStartDate: undefined,
  certEndDate: undefined,
  signatureSentDate: undefined,
  signatureReceivedDate: undefined,
  mainInternalNote: "",
  dmeSupplies: "",
  safetyMeasures: "",
  nutritionalRequirement: "",
  qAstatus: "",
  allergies: "",
  functionalLimitations: [],
  otherFunctionalLimit: "",
  activitiesPermitted: [],
  otherActivitiesPermit: "",
  mentalStatus: [],
  otherMentalStatus: "",
  prognosis: "",
  cognitiveStatus: "",
  rehabPotential: "",
  dischargePlan: "",
  riskIntervention: "",
  informationRelatedTo: "",
  caregiverNeeds: "",
  homeboundStatus: "",
  clinicalSummary: "",
  physicianId: "",
  modifyPhysicianCert: false,
  caseManagerId: "",
  verbalSOC: undefined,
  isCert485: false,
};
