"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "@/actions/admin/dashboard";
import { DashboardMetrics } from "@/types/DashboardTypes";

export const useDashboardMetrics = () => {
  const token = localStorage.getItem("token") as string;

  return useQuery<DashboardMetrics>({
    queryKey: ["dashboardMetrics"],
    queryFn: () => fetchDashboardMetrics(token),
    refetchInterval: 60000, // Auto-refresh every minute
    enabled: !!token,
  });
};
