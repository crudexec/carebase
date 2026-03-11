"use client";

import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import isOnline from "is-online";

export const signTreatmentPlan = async (
  token: string,
  signatureUrl: string,
  full_name: string,
  treatment_full_id: string,
  intake_full_id: string,
  formType: TreatmentPlanType
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

    const response = await fetch(`${API_BASE_URL}/treatment/sign`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        signature_url: signatureUrl,
        full_name,
        treatment_full_id,
        intake_full_id,
        treatment_plan_type,
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
    console.error("ERROR SUBMITTING SIGNATURE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const completeTreatmentplan = async (
  token: string,
  formId: string,
  formType: TreatmentPlanType
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

    const response = await fetch(`${API_BASE_URL}/treatment/complete`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ treatment_full_id: formId }),
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
    console.error("ERROR SUBMITTING SIGNATURE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
