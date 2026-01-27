import { QAStatus } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { updateRequest } from "@/lib";
import { ApiResponse, AssessmentResponse } from "@/types";

export const useGetAssessmentSubmissions = ({
  patientId,
  status,
}: { patientId?: string; status?: string } = {}) => {
  return useSWR<
    ApiResponse<{ assessments: AssessmentResponse[]; totalCount: number }>
  >(`/api/qamanager?patientId=${patientId}&status=${status}`);
};

export const useUpdateQAStatus = () => {
  return useSWRMutation(
    "/api/qamanager",
    async (
      url: string,
      { arg }: { arg: { id: string; status: QAStatus; qaComment: string } },
    ) => await updateRequest(url, arg),
  );
};
