"use client";

import { SessionHighlightsFormData } from "@/components/clients/client-details/client-visits/fc-visit-form/FcSessionHighlights";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitSessionHighlightsForm = async (
  token: string,
  formData: SessionHighlightsFormData,
  visitId: string,
  sessionHighlightId: string | null,
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
        ? `${API_BASE_URL}/fcVisit/add/session-highlights`
        : `${API_BASE_URL}/fcVisit/edit/session-highlights`;

    const requestBody = {
      session_ocurred_in: validateField(formData.sessionCountry),
      those_present_for_the_family_consultant_session:
        typeof formData.other_description === "string" &&
        formData.other_description?.length > 0
          ? [formData.other_description]
          : formData.peoplePresent,
      ...(method === "POST"
        ? { visit_full_form_id: visitId }
        : { fc_session_id: sessionHighlightId }),
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
    console.error("ERROR SUBMITTING SESSION HIGHLIGHTS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
