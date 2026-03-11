"use error";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handlePasswordChange = async (
  formData: {
    oldPassword: string;
    newPassword: string;
  },
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

    const { oldPassword, newPassword } = formData;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ password: oldPassword, passwordNew: newPassword }),
    });

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
    console.error(error);
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
    };
  }
};
