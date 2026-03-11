"use client";

import { FcVisitOtherTrainingsFormSchema } from "@/components/clients/client-details/client-visits/fc-visit-form/FcOtherTrainings";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitOtherTrainingsForm = async (
  token: string,
  formData: FcVisitOtherTrainingsFormSchema,
  visitId: string,
  otherTrainingsId: string | null,
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
        ? `${API_BASE_URL}/fcVisit/add/other-training`
        : `${API_BASE_URL}/fcVisit/edit/other-training`;

    const requestBody = {
      training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication:
        validateField(formData.trainingAAC),
      training_and_consultation_provided_on_communication_strategies:
        validateField(formData.trainingCommunication),
      training_and_consultation_provided_on_behavior_intervention_strategies:
        validateField(formData.trainingBehavior),
      training_and_consultation_provided_on_safety_at_home_and_in_the_community:
        validateField(formData.trainingSafety),
      any_other_training_and_consultation_topics: validateField(
        formData.otherTraining
      ),
      ...(method === "POST"
        ? { visit_full_form_id: visitId }
        : { fc_other_training_id: otherTrainingsId }),
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
