"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export type FormName =
  | "i9form"
  | "employeeform"
  | "pneumococcalForm"
  | "tuberculosisForm"
  | "hepatitisBForm"
  | "varicellaForm"
  | "mmrForm"
  | "fluForm"
  | "referenceForm"
  | "cjis";

export const submitForm = async (
  token: string,
  formName: FormName
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

    if (formName === "cjis") {
      endpoint = `${API_BASE_URL}/${formName}/submitCJISForm`;
    } else {
      endpoint = `${API_BASE_URL}/${formName}/submit`;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let response: Response;

    if (formName === "cjis") {
      response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: null,
      });
    } else {
      response = await fetch(endpoint, {
        method: "PATCH",
        headers: headers,
        body: null,
      });
    }

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
    // Cosntruct object to send to the client on succesful login attempt
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse; // Error occurred during login
  }
};
