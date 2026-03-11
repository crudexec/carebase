"use client";

import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { TreatmentPlanFormTabOptionIdType } from "@/components/clients/client-details/ClientDetailPageWrapper";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import { formatDateToUTCString } from "@/utils/date-utils";

export const createGenericTreatmentPlan = async (
  intake_full_id: string,
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType,
  token: string,
  tpType: string,
  tpImplementedBy: string,
  startDate: Date,
  endDate: Date
): Promise<FormMutationResponse<any>> => {
  try {
    const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);
    const formattedStartDate = formatDateToUTCString(startDate);
    const formattedEndDate = formatDateToUTCString(endDate);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/treatment/create-generic`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        intake_full_id,
        treatment_plan_type,
        tp_type: tpType,
        tp_implemented_by: tpImplementedBy,
        implementation_start_date: formattedStartDate,
        implementation_end_date: formattedEndDate,
      }),
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
      errorMessage: "",
      data: responseData?.data,
    };
  } catch (err: any) {
    console.error("ERROR CREATING TREATMENT PLAN", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const shareTreatmentPlan = async (
  recipentName: string,
  recipentEmail: string,
  recipentRole: string,
  treatmentPlanId: string,
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType,
  token: string
) => {
  try {
    const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      treatment_plan_type,
      treatment_full_id: treatmentPlanId,
      recipent_name: recipentName,
      recipent_email: recipentEmail,
      recipent_role: recipentRole,
    };

    const response = await fetch(`${API_BASE_URL}/`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
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
      errorMessage: "",
      data: responseData?.data,
    };
  } catch (err: any) {
    console.error("ERROR SHARING TREATMENT PLAN", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const deleteTreatmentPlan = async (
  treatmentPlanId: string,
  token: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/treatment/delete`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ treatment_plan_id: treatmentPlanId }),
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
      errorMessage: "",
      data: responseData?.data,
    };
  } catch (error) {
    console.error("ERROR DELETING TREATMENT PLAN", error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const markTreatmentPlanAsActive = async (
  treatment_plan_id: string,
  intake_full_id: string,
  treatment_plan_type: string,
  token: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/treatment/mark-as-active`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        treatment_plan_id,
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

    const responseData = await response.json();

    return {
      status: true,
      errorMessage: "",
      data: responseData?.data,
    };
  } catch (error) {
    console.error("ERROR MARK TREATMENT PLAN AS ACTIVE", error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};
