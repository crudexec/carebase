"use client";

import { API_BASE_URL } from "@/constants";
import { ReferenceFormData } from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { exposeRefFormData } from "@/components/forms/reference-form/logic/useReferenceFormValidation";
import isOnline from "is-online";

export const handleReferenceFormSubmission = async (
  formData: ReferenceFormData,
  token: string,
  method: "POST" | "PATCH"
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

    let endpoint: string;

    if (method === "POST") {
      endpoint = `${API_BASE_URL}/referenceForm/add`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/referenceForm/edit`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const requestBody = formData;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        errorMessage: "Invalid response status, Please try again",
        status: false,
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    console.error(error);

    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};

export const handleReferenceFormFinalSubmission = async (
  formData: FormData,
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

    const requestBody = formData;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/referenceForm/submit`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        errorMessage: "Invalid response status, Please try again",
        status: false,
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    console.error(error);

    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};

export const getReferenceData = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/referenceForm/retrieve`, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(error);
    return null;
  }
};
