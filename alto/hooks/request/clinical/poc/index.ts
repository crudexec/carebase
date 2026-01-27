import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { createRequest, deleteRequest } from "@/lib";
import { PlanOfCareForm } from "@/schema";
import { ApiResponse, DeletePayload, PlanOfCareResponse } from "@/types";

export const useGetPlanOfCares = ({
  patientId,
  status,
  isCert485,
}: { patientId?: string; status?: string; isCert485?: boolean } = {}) => {
  return useSWR<
    ApiResponse<{ planOfCares: PlanOfCareResponse[]; totalCount: number }>
  >(
    patientId
      ? `/api/clinical/poc?patientId=${patientId}&status=${status}${isCert485 ? `&isCert485=${isCert485}` : ""}`
      : null,
  );
};

export const useGetPlanOfCare = ({
  planOfCareId,
}: { planOfCareId?: string } = {}) => {
  return useSWR<ApiResponse<PlanOfCareResponse>>(
    planOfCareId ? `/api/clinical/poc/${planOfCareId}` : null,
  );
};

export const useArchiveorActivatePlanOfCare = () => {
  return useSWRMutation(
    `/api/clinical/poc`,
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};

export const useSavePlanOfCare = () => {
  return useSWRMutation(
    "/api/clinical/poc",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          PlanOfCareForm & {
            id?: string;
            patientId: string;
            caregiverId: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};
