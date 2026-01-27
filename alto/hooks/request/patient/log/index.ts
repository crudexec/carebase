import { Log } from "@prisma/client";
import useSWR from "swr";

import { ApiResponse } from "@/types";

export const useGetLogs = ({ id }: { id?: string }) => {
  return useSWR<ApiResponse<Log[]>>(id ? `/api/log?contextId=${id}` : null);
};
