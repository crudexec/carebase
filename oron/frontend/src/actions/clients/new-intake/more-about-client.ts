"use client";

import { API_BASE_URL } from "@/constants";
import { AboutParticipantFormData } from "@/utils/schemas";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleMoreAboutClientSubmission = async (
  formData: AboutParticipantFormData,
  communicationMethod: string[],
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
      endpoint = `${API_BASE_URL}/intake/add/more-about-client`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${formId}/edit/more-about-client`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      things_I_can_do_by_myself:
        formData.strengths && formData.strengths?.length > 0
          ? formData.strengths
          : null,
      things_I_need_help_with:
        formData.thingsINeedHelpWith && formData.thingsINeedHelpWith?.length > 1
          ? formData.thingsINeedHelpWith
          : null,
      new_skills_I_want_to_learn:
        formData.newSkillsToLearn && formData.newSkillsToLearn?.length > 1
          ? formData.newSkillsToLearn
          : null,
      my_hobbies:
        formData.hobbies && formData.hobbies?.length > 1
          ? formData.hobbies
          : null,
      favorite_food_and_snacks:
        formData.favoriteFood && formData.favoriteFood?.length > 1
          ? formData.favoriteFood
          : null,
      what_makes_me_mad:
        formData.whatMakesMeMad && formData.whatMakesMeMad?.length > 1
          ? formData.whatMakesMeMad
          : null,
      behaviors_I_sometimes_Display:
        formData.behaviorsDisplayed && formData.behaviorsDisplayed?.length > 1
          ? formData.behaviorsDisplayed
          : null,
      ways_my_behaviors_can_be_managed:
        formData.behaviorManagement && formData.behaviorManagement?.length > 1
          ? formData.behaviorManagement
          : null,
      my_house_rules: formData.houseRules ?? null,
      familiar_communication_modes: communicationMethod,
      can_be_transported_alone:
        formData.transportAlone && formData.transportAlone?.length > 1
          ? formData.transportAlone.toLowerCase() === "yes"
          : null,
      toileting:
        formData.toileting && formData.toileting?.length > 1
          ? formData.toileting
          : null,
      cared_for_by:
        formData.preferredCareBy && formData.preferredCareBy?.length > 1
          ? formData.preferredCareBy
          : null,
      document_provided_during_intake:
        formData.intakeDocument && formData.intakeDocument?.length > 1
          ? formData.intakeDocument
          : null,
      good_performance_reward:
        formData.performanceReward && formData.performanceReward?.length > 1
          ? formData.performanceReward
          : null,
      other_comments:
        formData.otherComments && formData.otherComments?.length > 1
          ? formData.otherComments
          : null,
      service_coordinator_information_id: prevSectionId,
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
      errorMessage: responseData?.data?.id || "Unknown ID",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};
