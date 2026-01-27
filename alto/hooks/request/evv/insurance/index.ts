import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { InsuranceForm } from "@/schema";
import { ApiResponse, DeletePayload, PatientInsuranceResponse } from "@/types";

export const useGetInsurances = ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const queryData = createReqQuery({ id, status });
  return useSWR<
    ApiResponse<{ insurances: PatientInsuranceResponse[]; totalCount: number }>
  >(`/api/evv/insurance?${queryData}`);
};

export const useCreateInsurance = () => {
  return useSWRMutation(
    "/api/evv/insurance",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<InsuranceForm & { patientId?: string; id?: string }> },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateInsurance = () => {
  return useSWRMutation(
    "/api/evv/insurance",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<InsuranceForm & { patientId?: string; id?: string }> },
    ) => await updateRequest(url, arg),
  );
};

export const useArchiveInsurance = () => {
  return useSWRMutation(
    "/api/evv/insurance",
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
