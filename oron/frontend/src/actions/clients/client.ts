"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { handleDocumentUpload } from "../upload";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { TreatmentPlanFormTabOptionIdType } from "@/components/clients/client-details/ClientDetailPageWrapper";
import isOnline from "is-online";

export const uploadClientProfilePicture = async (
  intakeId: string,
  fileUrl: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/intake/${intakeId}/upload/profile-picture`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_picture: fileUrl }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const deleteClientById = async (clientId: string, token: string) => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    const response = await fetch(`${API_BASE_URL}/intake/${clientId}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
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

export const handleSendTreatmentPlanToParent = async (
  selectedParentName: string,
  selectedParentEmail: string,
  selectedParentRelationToParticipant: string,
  clientId: string,
  treatmentPlanId: string,
  token: string,
  treatmentType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType
): Promise<FormMutationResponse> => {
  const online = await isOnline();
  if (!online) {
    return {
      status: false,
      errorMessage:
        "No internet connection. Please check your connection and try again.",
    };
  }

  const treatment_plan_type = convertTreatmentPlanTypeToEnumType(treatmentType);
  try {
    const requestBody = {
      parent_name: selectedParentName,
      parent_email: selectedParentEmail,
      relation_to_participant: selectedParentRelationToParticipant,
      treatment_full_id: treatmentPlanId,
      intake_full_id: clientId,
      treatment_plan_type: treatment_plan_type,
    };

    const response = await fetch(`${API_BASE_URL}/treatment/send-to-parent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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

export const handleSignAndCompleteTreatmentPlan = async (
  treatmentPlanId: string,
  signature: string,
  treatmentPlanType: string,
  hasBeenUploaded?: boolean
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

    const base64Response = await fetch(signature);
    const blob = await base64Response.blob();
    const file = new File([blob], "signature.png", { type: "image/png" });

    const form = new FormData();
    form.append("file", file);

    const signatureUrl = await handleDocumentUpload(form);

    const requestBody = {
      treatment_full_id: treatmentPlanId,
      parent_signature_url: hasBeenUploaded ? signature : signatureUrl,
      treatment_plan_type: treatmentPlanType,
    };

    const response = await fetch(`${API_BASE_URL}/treatment/sign-parent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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

export const shareTreatmentPlan = async (
  recipentName: string,
  recipentEmail: string,
  recipentRole: string,
  treatmentPlanId: string,
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType,
  intake_full_id: string,
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
      intake_full_id,
    };

    const response = await fetch(`${API_BASE_URL}/treatment/share`, {
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
