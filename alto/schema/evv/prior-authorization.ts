import {
  InsurancePriorAuthorization,
  InsurancePriorAuthorizationSchema,
} from "@/prisma/zod-schema";

export const priorAuthorizationSchema = InsurancePriorAuthorizationSchema.omit({
  id: true,
  active: true,
  providerId: true,
  archivedOn: true,
  createdAt: true,
  updatedAt: true,
});

export type PriorAuthorizationForm = Omit<
  InsurancePriorAuthorization,
  "id" | "createdAt" | "updatedAt" | "active" | "archivedOn"
>;

export const priorAuthorizationDefaultValue: PriorAuthorizationForm = {
  disciplineId: "",
  patientInsuranceId: "",
  dateRequestSent: undefined,
  dateAuthorizationReceived: undefined,
  authCode: "",
  effectiveThrough: undefined,
  effectiveFrom: undefined,
  visitAuth: "",
  hoursAuth: "",
  units: "",
  notes: "",
  providerId: "",
};
