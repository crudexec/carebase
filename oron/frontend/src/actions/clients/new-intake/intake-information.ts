"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { IntakeInformationFormData } from "@/utils/schemas";
import { PersonPresentAtIntake } from "@/components/clients/new-intake/IntakeInformation";
import isOnline from "is-online";

type ValidatedPersonPresentAtIntake = {
  first_name: string | null;
  relationship_to_participant: string | null;
};

const validatePeoplePresentField = (
  data: PersonPresentAtIntake[]
): ValidatedPersonPresentAtIntake[] | null => {
  return data.map((person) => ({
    first_name: person.first_name.length > 0 ? person.first_name : null,
    relationship_to_participant:
      person.relationship_to_participant.length > 0
        ? person.relationship_to_participant
        : null,
  }));
};

export const handleIntakeInformationSubmission = async (
  formData: IntakeInformationFormData,
  peoplePresentAtIntake: PersonPresentAtIntake[],
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

    let endpoint: string;

    if (method === "POST") {
      endpoint = `${API_BASE_URL}/intake/add/intake-information`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${formId}/edit/intake-information`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      who_conducted_intake: validateField(formData.whoConductedTheIntake),
      date_of_intake: validateField(formData.dateOfIntake, true),
      people_present: validatePeoplePresentField(peoplePresentAtIntake),
      referral_information_id: prevSectionId,
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

    const responseData = await response.json();

    return {
      status: true,
      errorMessage:
        responseData?.data?.savedIntakeInformation?.id || "Unknown ID",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ?? "An unknown error occurred",
    };
  }
};
