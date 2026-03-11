"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { AdmissionInformationFormData } from "@/utils/schemas";
import { WaiverService } from "@/components/clients/new-intake/AdmissionInformation";
import { submitIntakeForm } from "./submit-intake";
import isOnline from "is-online";

export const handleAdmissionInformationSubmission = async (
  formData: AdmissionInformationFormData,
  waiverServices: WaiverService[],
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

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/intake/add/admission-information`
        : `${API_BASE_URL}/intake/${formId}/edit/admission-information`;

    const requestBody = {
      poc_authorization_number: validateField(formData.pocAuthorizationNumber),
      poc_start_date: validateField(formData.pocStartDate, true),
      poc_end_date: validateField(formData.pocEndDate, true),
      waiver_services: waiverServices.every(
        (service) =>
          !service.select_waiver_system &&
          !service.service_start_date &&
          !service.service_end_date &&
          !service.amount_per_day_week_month &&
          !service.amount_per_year
      )
        ? []
        : waiverServices,
      medical_information_id: prevSectionId,
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

    const submitResponse = await submitIntakeForm(token, intakeFullId);

    if (!submitResponse.status) {
      return {
        status: false,
        errorMessage: "Invalid response status",
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
        "A network error occurred! Try again",
    };
  }
};
