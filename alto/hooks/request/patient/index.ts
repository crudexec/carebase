import { PatientStatus } from "@prisma/client";
import useSWR from "swr";

import { createRequest, deleteRequest, updateRequest } from "@/lib";
import {
  AuthorizationForm,
  CommercialForm,
  EmergencyContactForm,
  PatientForm,
  PatientInsuranceForm,
  ReferralSourceForm,
} from "@/schema";
import { ApiResponse, DeletePayload, PatientResponse } from "@/types";

export const useGetPatients = ({ status }: { status?: PatientStatus } = {}) => {
  return useSWR<
    ApiResponse<{ patients: PatientResponse[]; totalCount: number }>
  >(`/api/patient?status=${status}`);
};

export const useGetPatient = ({ id }: { id: string }) => {
  return useSWR<ApiResponse<PatientResponse>>(id ? `/api/patient/${id}` : null);
};

export const useDeletePatient = async (
  url: string,
  { arg }: { arg: DeletePayload },
) => {
  return deleteRequest(url, arg);
};

export const useCreatePatient = async (
  url: string,
  { arg }: { arg: PatientForm },
) => {
  return await createRequest(url, arg);
};

export const useUpdatePatient = async (
  url: string,
  {
    arg,
  }: {
    arg: PatientForm & {
      id: string;
      daysPerEpisode?: string;
      patientAdmissionId?: string;
      payer?: string;
    };
  },
) => {
  return await updateRequest(url, arg);
};

export const useUpdateReferralSource = async (
  url: string,
  { arg }: { arg: ReferralSourceForm & { id: string; patientId?: string } },
) => {
  return await updateRequest(url, arg);
};

export const useUpdateAuthorization = async (
  url: string,
  { arg }: { arg: AuthorizationForm & { patientId?: string } },
) => {
  return await updateRequest(url, arg);
};

export const useUpdateCommercial = async (
  url: string,
  { arg }: { arg: CommercialForm & { id: string; patientId?: string } },
) => {
  return await updateRequest(url, arg);
};

export const useUpdateEmergencyContact = async (
  url: string,
  { arg }: { arg: EmergencyContactForm & { id: string; patientId?: string } },
) => {
  return await updateRequest(url, arg);
};

export const useUpdatePatientInsurance = async (
  url: string,
  { arg }: { arg: PatientInsuranceForm & { patientId?: string } },
) => {
  return await updateRequest(url, arg);
};
