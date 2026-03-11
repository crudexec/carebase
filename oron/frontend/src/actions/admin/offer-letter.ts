"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const sendOfferLetter = async (
  token: string,
  userId: string,
  fullName: string,
  jobPosition: string,
  offer_letter_pdf_url: string
): Promise<FormMutationResponse> => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    const requestBody = {
      full_name: fullName,
      job_position: jobPosition,
      offer_letter_pdf_url,
    };

    const response = await fetch(
      `${API_BASE_URL}/approveform/${userId}/send-offer-letter`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    console.error("error", error);
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};
