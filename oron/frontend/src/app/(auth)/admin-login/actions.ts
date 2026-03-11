"use client";

import { LoginFormData } from "@/utils/schemas/AuthValidationSchema";
import { API_BASE_URL } from "@/constants";
import { LoginResponse } from "@/types/AuthResponse";
import isOnline from "is-online";

export const handleAdminLogin = async (
  formData: LoginFormData
): Promise<LoginResponse> => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
        token: "",
      };
    }

    const { email, password } = formData;

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
        token: "",
      };
    }

    const responseData = (await response.json()) as {
      message: string;
      data: string;
    };

    const token = responseData.data.split(" ")[1];

    const clientResponse: LoginResponse = {
      errorMessage: "",
      status: true,
      token,
    };

    return clientResponse;
  } catch (error: any) {
    console.error("ERROR", error);
    const clientResponse: LoginResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
      token: "",
    };
    return clientResponse;
  }
};
