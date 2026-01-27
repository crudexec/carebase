import { createRequest, deleteRequest, updateRequest } from "@/lib";
import { PatientMedicationForm } from "@/schema";

type DeletePatientMedicationPayload = {
  ids: string[];
  status: string;
};

export const useDeletePatientMedication = async (
  url: string,
  { arg }: { arg: DeletePatientMedicationPayload },
) => {
  return deleteRequest(url, arg);
};

export const useCreatePatientMedication = async (
  url: string,
  { arg }: { arg: Partial<PatientMedicationForm> },
) => {
  return await createRequest(url, arg);
};

export const useUpdatePatientMedication = async (
  url: string,
  { arg }: { arg: Partial<PatientMedicationForm> & { id: string } },
) => {
  return await updateRequest(url, arg);
};
