import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { FrequencyForm } from "@/schema";
import { ApiResponse, DeletePayload, PatientFrequencyResponse } from "@/types";

export const useGetFrequencies = ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const queryData = createReqQuery({ id, status });
  return useSWR<
    ApiResponse<{ frequencies: PatientFrequencyResponse[]; totalCount: number }>
  >(`/api/evv/frequency?${queryData}`);
};

export const useCreateFrequency = () => {
  return useSWRMutation(
    "/api/evv/frequency",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<FrequencyForm & { patientId?: string; id?: string }> },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateFrequency = () => {
  return useSWRMutation(
    "/api/evv/frequency",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<FrequencyForm & { patientId?: string; id?: string }> },
    ) => await updateRequest(url, arg),
  );
};

export const useArchiveFrequency = () => {
  return useSWRMutation(
    "/api/evv/frequency",
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
