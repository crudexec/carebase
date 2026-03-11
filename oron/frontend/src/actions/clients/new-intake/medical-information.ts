"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { MedicalInformationFormData } from "@/utils/schemas";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleMedicalInformationSubmission = async (
  formData: MedicalInformationFormData,
  token: string,
  method: "POST" | "PATCH",
  prevSectionId: string,
  formId: string,
  intakeFullId: string
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
      endpoint = `${API_BASE_URL}/intake/add/medical-information`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${formId}/edit/medical-information`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      diagnosis: validateField(formData.diagnosis),
      medical_history_or_allergies: validateField(
        formData.medicalHistoryAllergies
      ),
      medications: validateField(formData.medications),
      other_comments: validateField(formData.otherComments),
      more_about_information_id: prevSectionId,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...requestBody, intake_full_id: intakeFullId }
          : requestBody
      ),
    });

    // Check if response is successful
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
      errorMessage: responseData?.data?.id || "Unknown ID",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};
