"use client";

import { FamilyDiscussionFormData } from "@/components/clients/client-details/client-visits/fc-visit-form/FcFamilyDiscussion";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitFamilyDiscussionForm = async (
  token: string,
  formData: FamilyDiscussionFormData,
  visitId: string,
  familyDiscussionId: string | null,
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
        ? `${API_BASE_URL}/fcVisit/add/family-discussion`
        : `${API_BASE_URL}/fcVisit/edit/family-discussion`;

    const requestBody = {
      accomplishments_client_family_made_void_of_family_consultation_treatment:
        validateField(formData.accomplishmentFamily),
      accomplishments_client_made_void_of_family_consultation_treatment:
        validateField(formData.accomplishmentSelf),
      topic_not_related_discussed_during_family_consultation: validateField(
        formData.discussionTopics
      ),
      ...(method === "POST"
        ? { visit_full_form_id: visitId }
        : { family_discussion_id: familyDiscussionId }),
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
    console.error("ERROR SUBMITTING FAMILY DISCUSSION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
