"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVisitDetails } from "@/actions/admin/dashboard";
import { VisitDetails } from "@/types/DashboardTypes";

export const useVisitDetails = (visitId: string | null) => {
  const token = localStorage.getItem("token") as string;

  return useQuery<VisitDetails>({
    queryKey: ["visitDetails", visitId],
    queryFn: () => fetchVisitDetails(token, visitId!),
    enabled: !!token && !!visitId,
  });
};
