"use client";

import { API_BASE_URL } from "@/constants";
import { FullRespiteForm, SingleRespiteForm } from "@/types/Respite";

export const retrieveAllRespiteForms = async (
  token: string,
  intake_full_id: string
): Promise<FullRespiteForm> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/visit/${intake_full_id}/retrieve-all?treatment_type=Respite`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch respite form");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ERROR FETCHING RESPITE FORM:", error);
    throw error;
  }
};

export const retrieveSingleRespiteForm = async (
  token: string,
  respiteId: string
): Promise<SingleRespiteForm> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/visit/${respiteId}/retrieve`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch respite form");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ERROR FETCHING RESPITE FORM:", error);
    throw error;
  }
};
