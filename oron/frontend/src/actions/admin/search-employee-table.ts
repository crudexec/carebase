"use client";

import { API_BASE_URL } from "@/constants";

export const searchEmployee = async (searchQuery: string, token: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/search?searchQuery=${encodeURIComponent(
        searchQuery
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
