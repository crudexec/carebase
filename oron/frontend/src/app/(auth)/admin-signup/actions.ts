"use client";

import { SignupFormData } from "@/utils/schemas/AuthValidationSchema";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleAdminSignup = async (
  formData: SignupFormData,
  role: "STANDARD" | "ADMINISTRATOR"
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

    const { firstName, lastName, email, password } = formData;

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};
