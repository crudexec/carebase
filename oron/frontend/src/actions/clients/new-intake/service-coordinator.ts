"use client";

import { API_BASE_URL } from "@/constants";
import { ServiceCordinatorFormData } from "@/utils/schemas";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { validateField } from "@/lib/api-utils";
import isOnline from "is-online";

export const handleServiceCordinatorSubmission = async (
  formData: ServiceCordinatorFormData,
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
      endpoint = `${API_BASE_URL}/intake/add/service-coordinator-information`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${formId}/edit/service-coordinator-information`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      full_name: validateField(formData.fullname),
      email: validateField(formData.email),
      phone: validateField(formData.phoneNumber),
      country: validateField(formData.country),
      fax_number: validateField(formData.faxNumber),
      emergency_contact_information_id: prevSectionId,
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
      errorMessage: responseData?.data?.id || "No ID returned",
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
