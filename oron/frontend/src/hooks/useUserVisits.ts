"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserVisits } from "@/actions/visits";
import { FetchVisitsParams } from "@/types/VisitsTypes";

export const useUserVisits = (params: FetchVisitsParams = {}) => {
  const token = localStorage.getItem("token") as string;

  return useQuery({
    queryKey: ["userVisits", params.page, params.size, params.status, params.employee_id, params.client_id, params.start_date, params.end_date],
    queryFn: () => fetchUserVisits(token, params),
    enabled: !!token,
  });
};

