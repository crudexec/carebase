"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleSignOfferLetter = async (
  offer_letter_pdf_url: string,
  token: string
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

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/sign/offer-letter`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ offer_letter_pdf_url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errorMessage:
          errorData?.errorMessage ??
          "Invalid response status, Please try again",
        status: false,
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    return {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
  }
};
