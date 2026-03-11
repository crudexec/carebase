"use client";

import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import isOnline from "is-online";

export const submitGoalForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
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

    if (method === "POST") {
      const response = await fetch(
        `${API_BASE_URL}/treatment/${clientId}/add/treatment-goal`,
        {
          method,
          headers,
          body: JSON.stringify({
            goalArray: formData,
            treatment_plan_type,
            treatment_full_id,
          }),
        }
      );

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
    } else {
      for (const data of formData) {
        const response = await fetch(
          `${API_BASE_URL}/treatment/${data.id}/edit/treatment-goal`,
          {
            method,
            headers,
            body: JSON.stringify(data),
          }
        );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          status: false,
          errorMessage: errorData?.errorMessage ?? "Invalid response status",
        };
      }
      }

      return {
        status: true,
        errorMessage: "",
      };
    }
  } catch (err: any) {
    console.error("ERROR SUBMITTING GOALS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const addNewTreatmentGoal = async (
  token: string,
  formData: any,
  clientId: string,
  formType: TreatmentPlanType,treatment_full_id: string
): Promise<FormMutationResponse> => {
  const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/treatment/${clientId}/add/treatment-goal`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ goalArray: formData, treatment_plan_type,treatment_full_id }),
      }
    );

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
    console.error("ERROR SUBMITTING GOALS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const deleteTreatmentGoal = async (
  token: string,
  goalId: any,
  formType: TreatmentPlanType
): Promise<FormMutationResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/treatment/${goalId}/delete`, {
      method: "DELETE",
      headers,
      body: null,
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
    console.error("ERROR SUBMITTING GOALS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
