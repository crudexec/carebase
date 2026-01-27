import { createRequest } from "@/lib";

type AdmitPatientPayload = {
  patients: string[];
  payer: string;
  status: string;
};
export type UpdateStatusPayload = {
  patients: string[];
  status: string;
  date?: Date;
  reason?: string;
  other?: string;
};

export const useAdmitPatient = async (
  url: string,
  { arg }: { arg: AdmitPatientPayload },
) => {
  return await createRequest(url, arg);
};

export const useUpdatePatientStatus = async (
  url: string,
  { arg }: { arg: UpdateStatusPayload },
) => {
  return createRequest(url, arg);
};
export const useSaveAccessInfo = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      patient: string;
      caregivers: string[];
    };
  },
) => {
  return createRequest(url, arg);
};
