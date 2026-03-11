"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { ClientInformationType } from "@/components/clients/new-intake/ClientInformation";
import { revertFormattedSSN } from "@/utils/helpers";
import isOnline from "is-online";

export const handleClientInformationSubmission = async (
  formData: ClientInformationType,
  token: string,
  method: "POST" | "PATCH",
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

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/intake/add/client-information`
        : `${API_BASE_URL}/intake/${formId}/edit/client-information`;

    const requestBody = {
      first_name: validateField(formData.firstName),
      last_name: validateField(formData.lastName),
      date_of_birth: validateField(formData.dateOfBirth, true),
      state: validateField(formData.state),
      sex: validateField(formData.sex),
      race_or_ethinicity: validateField(formData.race),
      country: validateField(formData.country),
      social_security_number: validateField(
        revertFormattedSSN(formData.socialSecurityNumber ?? "")
      ),
      medicaid_number: validateField(formData.medicaid),
      city: validateField(formData.city),
      county: validateField(formData.county),
      zip_code: validateField(formData.zipCode),
      address_or_street: validateField(formData.address),
      apartment_number: validateField(formData.apartmentNumber),
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

    const responseData = await response.json();

    if (!response.ok) {
      return {
        status: false,
        errorMessage: responseData?.errorMessage || "An error occurred",
      };
    }

    return {
      status: true,
      errorMessage: responseData.data.id, // The id of this form passed in the errorMessage field to use as the payload for the next form
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};
