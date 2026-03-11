"use client";

import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import isOnline from "is-online";

export const submitBasicInformationForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  basicInformationId: string | undefined,
  formType: TreatmentPlanType,
  treatment_full_id: string
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

    const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const url =
      method === "POST"
        ? `${API_BASE_URL}/treatment/${clientId}/add/basic-information`
        : `${API_BASE_URL}/treatment/${basicInformationId}/edit/basic-information`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
        treatment_plan_type,
        treatment_full_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (err: any) {
    console.error("ERROR SUBMITTING BASIC INFORMATION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
