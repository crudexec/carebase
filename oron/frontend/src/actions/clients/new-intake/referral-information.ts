"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { ReferralInformationFormData } from "@/utils/schemas";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleReferralInformationSubmission = async (
  formData: ReferralInformationFormData,
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
      endpoint = `${API_BASE_URL}/intake/add/referral-information`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${formId}/edit/referral-information`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      date_of_referral: validateField(formData.dateOfReferral, true),
      referral_type: validateField(formData.referralType),
      referral_source_name: validateField(formData.referralSourceName),
      client_information_id: prevSectionId,
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
