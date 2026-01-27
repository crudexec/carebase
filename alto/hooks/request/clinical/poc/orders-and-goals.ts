import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { OrdersAndGoalsForm } from "@/schema";
import { ApiResponse, DeletePayload, OrdersAndGoalsResponse } from "@/types";

export const useCreateOrdersAndGoals = () => {
  return useSWRMutation(
    "/api/clinical/poc/orders",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          OrdersAndGoalsForm & {
            id?: string;
            patientId: string;
            caregiverId: string;
            planOfCareId: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateOrdersAndGoals = () => {
  return useSWRMutation(
    "/api/clinical/poc/orders",
    async (
      url: string,
      { arg }: { arg: Partial<OrdersAndGoalsForm & { id?: string }> },
    ) => await updateRequest(url, arg),
  );
};

export const useGetOrdersAndGoals = ({
  planOfCareId,
  status,
}: {
  planOfCareId: string;
  status: string;
}) => {
  const queryData = createReqQuery({ planOfCareId, status });
  return useSWR<
    ApiResponse<{
      ordersAndGoals: OrdersAndGoalsResponse[];
      totalCount: number;
    }>
  >(planOfCareId ? `/api/clinical/poc/orders?${queryData}` : null);
};

export const useArchiveorActivateOrdersAndGoals = () => {
  return useSWRMutation(
    `/api/clinical/poc/orders`,
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
