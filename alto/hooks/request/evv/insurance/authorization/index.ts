import { InsurancePriorAuthorization } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { PriorAuthorizationForm } from "@/schema";
import { ApiResponse, DeletePayload } from "@/types";

export const useGetAuthorizations = ({
  patientInsuranceId,
  status,
}: {
  patientInsuranceId: string;
  status: string;
}) => {
  const queryData = createReqQuery({ patientInsuranceId, status });
  return useSWR<
    ApiResponse<{
      authorizations: InsurancePriorAuthorization[];
      totalCount: number;
    }>
  >(`/api/evv/authorization?${queryData}`);
};

export const useCreateAuthorization = () => {
  return useSWRMutation(
    "/api/evv/authorization",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          PriorAuthorizationForm & { patientInsuranceId?: string; id?: string }
        >;
      },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateAuthorization = () => {
  return useSWRMutation(
    "/api/evv/authorization",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          PriorAuthorizationForm & { patientInsuranceId?: string; id?: string }
        >;
      },
    ) => await updateRequest(url, arg),
  );
};

export const useArchiveAuthorization = () => {
  return useSWRMutation(
    "/api/evv/authorization",
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
