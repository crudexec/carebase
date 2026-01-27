import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { createRequest, deleteRequest } from "@/lib";
import { AssessmentForm } from "@/schema";
import { ApiResponse, AssessmentResponse, DeletePayload } from "@/types";

type SaveAssessmentPayload = AssessmentForm & {
  id?: string | null;
  patientId?: string;
  patientScheduleId?: string;
  caregiverId: string;
  dateCompleted: Date;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
};

export const useGetAssessments = ({
  patientId,
  status,
}: { patientId?: string; status?: string } = {}) => {
  return useSWR<
    ApiResponse<{ assessments: AssessmentResponse[]; totalCount: number }>
  >(
    patientId
      ? `/api/clinical/assessment?patientId=${patientId}&status=${status}`
      : null,
  );
};

export const useGetClinicalAssessment = ({ id }: { id?: string } = {}) => {
  return useSWR<ApiResponse<AssessmentResponse>>(
    id ? `/api/clinical/assessment/${id}` : null,
  );
};

export const useGetScheduleAssessment = ({
  patientScheduleId,
}: { patientScheduleId?: string } = {}) => {
  return useSWR<ApiResponse<AssessmentResponse>>(
    patientScheduleId ? `/api/assessment/${patientScheduleId}` : null,
  );
};

export const useArchiveAssessment = () => {
  return useSWRMutation(
    `/api/clinical/assessment`,
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};

export const useSaveAssessment = () => {
  return useSWRMutation(
    "/api/clinical/assessment",
    async (url: string, { arg }: { arg: Partial<SaveAssessmentPayload> }) =>
      await createRequest(url, arg),
  );
};
