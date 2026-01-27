import useSWR from "swr";

import { createReqQuery } from "@/lib";
import { ApiResponse, PocDiagnosisProcedureResponse } from "@/types";

export const useGetDiagnosisProcedure = ({
  url,
  status,
  scope,
  parentId,
}: {
  url: string;
  status: string;
  scope: string;
  parentId: string;
}) => {
  const queryData = createReqQuery({ status, scope, parentId });
  return useSWR<
    ApiResponse<{
      diagnosisProcedures: PocDiagnosisProcedureResponse[];
      totalCount: number;
    }>
  >(parentId ? `/api/${url}?${queryData}` : null);
};
