import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import { createReqQuery, createRequest } from "@/lib";
import { OtherInfoForm } from "@/schema";
import { ApiResponse, PatientOtherInfoResponse } from "@/types";

export const useGetOtherInfo = ({ patientId }: { patientId?: string }) => {
  const queryData = createReqQuery({ patientId });
  return useSWR<ApiResponse<PatientOtherInfoResponse>>(
    `/api/evv/other?${queryData}`,
  );
};

export const useSaveOtherInfo = () => {
  return useSWRMutation(
    "/api/evv/other",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<OtherInfoForm & { patientId?: string; id?: string }> },
    ) => await createRequest(url, arg),
  );
};
