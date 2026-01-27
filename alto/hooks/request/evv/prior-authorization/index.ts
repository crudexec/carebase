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
import {
  ApiResponse,
  DeletePayload,
  PriorAuthorizationResponse,
} from "@/types";

export const useGetPriorAuthorization = ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const queryData = createReqQuery({ id, status });
  return useSWR<
    ApiResponse<{
      priorAuthorizations: PriorAuthorizationResponse[];
      totalCount: number;
    }>
  >(`/api/evv/prior-authorization?${queryData}`);
};

export const useCreatePriorAuthorization = () => {
  return useSWRMutation(
    "/api/evv/prior-authorization",
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

export const useUpdatePriorAuthorization = () => {
  return useSWRMutation(
    "/api/evv/prior-authorization",
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

export const useArchivePriorAuthorization = () => {
  return useSWRMutation(
    "/api/evv/prior-authorization",
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};

export const useAddPriorAuthorizationRecurrence = () => {
  return useSWRMutation(
    "/api/evv/prior-authorization/recurrence",
    async (url: string, { arg }: { arg: Partial<PriorAuthorizationForm> }) =>
      await createRequest(url, arg),
  );
};
