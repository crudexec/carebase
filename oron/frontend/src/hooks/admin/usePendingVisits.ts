"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPendingVisits } from "@/actions/admin/dashboard";
import { PendingVisitsResponse } from "@/types/DashboardTypes";

export const usePendingVisits = (page: number, size: number) => {
  const token = localStorage.getItem("token") as string;

  return useQuery<PendingVisitsResponse>({
    queryKey: ["pendingVisits", page, size],
    queryFn: () => fetchPendingVisits(token, page, size),
    enabled: !!token,
  });
};
