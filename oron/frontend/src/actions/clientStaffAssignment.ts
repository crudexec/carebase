import { API_BASE_URL } from "@/constants";
import { StaffMember, AssignedStaff, AssignmentHistoryResponse } from "@/types/ClientStaffAssignment";

export const assignStaffToClient = async (
  token: string,
  clientId: string,
  staffIds: string[],
  notes?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/client-staff-assignment/client/${clientId}/assign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ staff_ids: staffIds, notes }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assign staff to client");
  }

  return response.json();
};

export const unassignStaffFromClient = async (
  token: string,
  clientId: string,
  staffId: string,
  notes?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/client-staff-assignment/client/${clientId}/staff/${staffId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to unassign staff from client");
  }

  return response.json();
};

export const fetchClientAssignments = async (
  token: string,
  clientId: string
): Promise<AssignedStaff[]> => {
  const response = await fetch(
    `${API_BASE_URL}/client-staff-assignment/client/${clientId}/assignments`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch client assignments");
  }

  const data = await response.json();
  return data.data;
};

export const fetchAvailableStaff = async (
  token: string,
  clientId: string
): Promise<StaffMember[]> => {
  const response = await fetch(
    `${API_BASE_URL}/client-staff-assignment/client/${clientId}/available-staff`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available staff");
  }

  const data = await response.json();
  return data.data;
};

export const fetchAssignmentHistory = async (
  token: string,
  clientId: string,
  page: number = 1,
  size: number = 20
): Promise<AssignmentHistoryResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/client-staff-assignment/client/${clientId}/history?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch assignment history");
  }

  const data = await response.json();
  return data.data;
};
