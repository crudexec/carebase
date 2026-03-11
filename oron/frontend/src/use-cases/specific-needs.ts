"use client";

import { API_BASE_URL } from "@/constants";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

export const retrieveSpecificNeedsForm = async (
  token: string,
  intake_full_id: string
): Promise<FullSpecificNeedsForm> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/specificNeed/retrieve?intake_full_id=${intake_full_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch specific needs form");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ERROR FETCHING SPECIFIC NEEDS FORM:", error);
    throw error;
  }
};
