import { Provider } from "@prisma/client";
import useSWR from "swr";

import {} from "@/hooks";
import { ApiResponse } from "@/types";

export const useGetProviders = () => {
  return useSWR<ApiResponse<{ providers: Provider[]; totalCount: number }>>(
    "/api/provider",
  );
};
export const useGetProvider = (providerId?: string) => {
  return useSWR<ApiResponse<Provider>>(
    providerId ? `/api/provider/${providerId}` : null,
  );
};
