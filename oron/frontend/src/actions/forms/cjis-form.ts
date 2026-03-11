"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { CJISEmployeeInformationType } from "@/utils/schemas";
import { handleDocumentUpload } from "../upload";
import isOnline from "is-online";

export const handleCJISEmployeeInformationSubmission = async (
  formData: CJISEmployeeInformationType,
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
      endpoint = `${API_BASE_URL}/cjis/addEmployeeInformation`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/cjis/editEmployeeInformation`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const requestBody = {
      last_name: formData.lastName,
      first_name: formData.firstName,
      date_of_hire: formData.dateOfHire,
      employee_id: formData.employeeId,
      job_title: formData.jobTitle,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method,
      headers,
      body:
        method === "POST" || method === "PATCH"
          ? JSON.stringify(requestBody)
          : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return { errorMessage: "", status: true };
  } catch (error: any) {
    return {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
      status: false,
    };
  }
};

export const handleCJISSignatureSubmission = async (
  formData: FormData,
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
      endpoint = `${API_BASE_URL}/cjis/addSignature`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/cjis/editSignature`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const fileUrl = await handleDocumentUpload(formData, token);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify({ signature_data: fileUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return { errorMessage: "", status: true };
  } catch (error: any) {
    return {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
      status: false,
    };
  }
};

export const handleCJISCompletionProofSubmission = async (
  token: string,
  fileUrl: string
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

    const response = await fetch(
      `${API_BASE_URL}/cjis/addPreRegistrationForm`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ pre_registration_pdf_url: fileUrl }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return { errorMessage: "", status: true };
  } catch (error: any) {
    return {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
      status: false,
    };
  }
};
