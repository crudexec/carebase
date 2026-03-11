"use server";

import { API_BASE_URL } from "@/constants";

export const updateUserStatus = async (
  token: string,
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "DISENGAGED"
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user status");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update user status");
  }
};
