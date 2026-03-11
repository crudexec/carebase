"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const createNewIntake = async (
  firstName: string,
  lastName: string,
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

    const requestBody = {
      first_name: firstName,
      last_name: lastName,
    };

    const endpoint = `${API_BASE_URL}/intake/create/generic/intake`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await response.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id,
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
    };
  }
};
