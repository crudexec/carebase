import { API_BASE_URL } from "@/constants";
import {
  DashboardMetrics,
  PendingVisitsResponse,
  VisitDetails,
} from "@/types/DashboardTypes";

export const fetchDashboardMetrics = async (
  token: string
): Promise<DashboardMetrics> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard metrics");
  }

  const data = await response.json();
  return data.data;
};

export const fetchPendingVisits = async (
  token: string,
  page: number,
  size: number
): Promise<PendingVisitsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/pending-visits?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pending visits");
  }

  const data = await response.json();
  return data.data;
};

export const fetchVisitDetails = async (
  token: string,
  visitId: string
): Promise<VisitDetails> => {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/visit/${visitId}/details`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch visit details");
  }

  const data = await response.json();
  return data.data;
};
