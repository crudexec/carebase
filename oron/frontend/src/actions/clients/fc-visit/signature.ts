"use client";

import { handleDocumentUpload } from "@/actions/upload";
import { FcVisitSignatureFormSchema } from "@/components/clients/client-details/client-visits/fc-visit-form/FcSignature";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitFcVisitSignatureForm = async (
  token: string,
  formData: FcVisitSignatureFormSchema,
  visitId: string,
  signatureId: string | null,
  method: "POST" | "PATCH"
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/fcVisit/add/signature`
        : `${API_BASE_URL}/fcVisit/edit/signature`;

    const base64Response = await fetch(formData.signature_url);
    const blob = await base64Response.blob();
    const file = new File([blob], "signature.png", { type: "image/png" });

    const form = new FormData();
    form.append("file", file);

    const signatureUrl = await handleDocumentUpload(form);

    const requestBody = {
      signature_url: validateField(signatureUrl),
      full_name: validateField(formData.name),
      parent_signature_url: null,
      ...(method === "POST"
        ? { visit_full_form_id: visitId }
        : { treatment_plan_signature_id: signatureId }),
    };

    const response = await fetch(url, {
      method,
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

export const submitFcVisit = async (
  token: string,
  visitId: string
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

    const url = `${API_BASE_URL}/fcVisit/submit`;

    const requestBody = {
      visit_full_form_id: visitId,
    };

    const response = await fetch(url, {
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

    return {
      status: true,
      errorMessage: "",
    };
  } catch (err: any) {
    console.error("ERROR SUBMITTING FC VISIT", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
