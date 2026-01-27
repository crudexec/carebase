import { DischargeSummary, DischargeSummaryType } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import { createReqQuery, createRequest } from "@/lib";
import { DischargeSummaryForm } from "@/schema";
import { ApiResponse } from "@/types";

export const useGetDischargeSummary = ({
  patientId,
  type,
}: {
  patientId?: string;
  type?: DischargeSummaryType;
}) => {
  const queryData = createReqQuery({
    patientId,
    type,
  });
  return useSWR<ApiResponse<DischargeSummary>>(
    `/api/evv/discharge-summary?${queryData}`,
  );
};

export const useSaveDischargeSummary = () => {
  return useSWRMutation(
    "/api/evv/discharge-summary",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          DischargeSummaryForm & {
            patientId?: string;
            id?: string;
            type: DischargeSummaryType;
            mediaId?: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};
