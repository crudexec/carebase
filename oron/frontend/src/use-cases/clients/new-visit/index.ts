"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import {
  BEHAVIOUR_MANAGEMENT,
  COMMUNICATION,
  CONCERN_AND_CHALLENGES,
  DOMESTIC_TRAINING,
  MEAL_TIME_FORM,
  SAFETY,
  SELF_MANAGEMENT,
  SENSORY_NEEDS,
  SOCIALIZATION,
  UTILIZATION,
} from "@/components/clients/client-details/client-visits/visit-form/store/reducer";
import {
  ChoresOutput,
  LeisureOutput,
  PersonalCareOutput,
  SensoryNeedsOutput,
  SocializationOutput,
  SurvivalSkillsOutput,
  UtilizationOfMoneyOutput,
} from "@/utils/helpers";
import { TreatmentPlanFormTabOptionIdType } from "@/components/clients/client-details/ClientDetailPageWrapper";
import {
  convertTreatmentPlanTypeToEnumType,
  getVisitApiRouteByType,
} from "@/utils/treatmentPlanHelpers";
import isOnline from "is-online";

export const createSessionHighlights = async (
  token: string,
  formData: any,
  formId: string,
  method: "POST" | "PATCH",
  session_highlights_id?: string
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

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/session-highlights`
        : `${API_BASE_URL}/visit/edit/session-highlights`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...formData, visit_full_form_id: formId }
          : { ...formData, session_highlights_id }
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
      errorMessage: responseData.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleConcernAndChallenges = async (
  token: string,
  formData: CONCERN_AND_CHALLENGES,
  formId: string,
  method: "POST" | "PATCH",
  concern_and_challenges_id?: string
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

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/concern-challenges`
        : `${API_BASE_URL}/visit/edit/concern-challenges`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...formData, visit_full_form_id: formId }
          : { ...formData, concern_and_challenges_id }
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
      errorMessage: responseData.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSelfManagement = async (
  token: string,
  formData: SELF_MANAGEMENT,
  formId: string,
  method: "POST" | "PATCH",
  self_management_id?: string
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

    const data = { ...formData.responses };

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/self-management`
        : `${API_BASE_URL}/visit/edit/self-management`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...data, visit_full_form_id: formId }
          : { ...data, self_management_id }
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
      errorMessage: responseData.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleBehaviourManagement = async (
  token: string,
  formData: BEHAVIOUR_MANAGEMENT[],
  formId: string,
  method: "POST" | "PATCH",
  behavior_management_id?: string
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

    const data = { behaviorManagementArray: formData };

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/behavior-management`
        : `${API_BASE_URL}/visit/edit/behavior-management`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (method === "POST") {
      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: JSON.stringify({ ...data }),
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
        errorMessage: responseData.data?.id ?? null,
      };
    } else {
      // For PATCH method, we loop through the behavior data array
      for (const dataItem of formData) {
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({ ...dataItem, behavior_management_id: dataItem.id }),
        });

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
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleCommunication = async (
  token: string,
  formData: any,
  formId: string,
  method: "POST" | "PATCH",
  communication_id?: string
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

    const data = {
      ...formData.responses,
      other_description: formData.other_description,
    };

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/communication`
        : `${API_BASE_URL}/visit/edit/communication`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...data, visit_full_form_id: formId }
          : { ...data, communication_id }
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
      errorMessage: responseData.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleMealTime = async (
  token: string,
  formData: any,
  formId: string,
  method: "POST" | "PATCH",
  snack_meal_time_id?: string
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

    const data = formData.none
      ? {
          ate_all_meal_or_snack: false,
          ate_some_meal_or_snack: false,
          refused_all_meal_or_snack: false,
          drank_a_lot_of_water: false,
          drank_some_water: false,
          refused_all_water: false,
          drank_a_lot_of_juice: false,
          drank_some_juice: false,
          refused_all_juice: false,
          specify_what_snack_or_meal_provided: "",
          prepared_snack_or_meal: false,
          served_snack_or_meal: false,
          assisted_with_feeding: false,
          clean_up_after_snack_or_meal: false,
          other: null,
          specify_other: null,
          client_helped_to_clean_up_and_put_away_dishes: false,
        }
      : { ...formData };

    const endpoint =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/snack-meal-time`
        : `${API_BASE_URL}/visit/edit/snack-meal-time`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...data, visit_full_form_id: formId }
          : { ...data, snack_meal_time_id }
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
      errorMessage: responseData.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSkillTraining = async (
  token: string,
  formData: ChoresOutput,
  formId: string,
  method: "POST" | "PATCH",
  domestic_skill_training_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/domestic-skill-training`
        : `${API_BASE_URL}/visit/edit/domestic-skill-training`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, domestic_skill_training_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handlePlayLeisure = async (
  token: string,
  formData: LeisureOutput,
  formId: string,
  method: "POST" | "PATCH",
  play_leisure_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/play-leisure`
        : `${API_BASE_URL}/visit/edit/play-leisure`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, play_leisure_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handlePersonalWork = async (
  token: string,
  formData: MEAL_TIME_FORM,
  formId: string,
  method: "POST" | "PATCH",
  personal_work_reading_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/personal-work-reading`
        : `${API_BASE_URL}/visit/edit/personal-work-reading`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, personal_work_reading_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handlePersonalCare = async (
  token: string,
  formData: PersonalCareOutput,
  formId: string,
  method: "POST" | "PATCH",
  personal_care_and_bladder_control_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/personal-care-bowel-control`
        : `${API_BASE_URL}/visit/edit/personal-care-bowel-control`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, personal_care_and_bladder_control_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSensoryNeeds = async (
  token: string,
  formData: SensoryNeedsOutput,
  formId: string,
  method: "POST" | "PATCH",
  sensory_need_and_motor_development_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/sensory-needs-development`
        : `${API_BASE_URL}/visit/edit/sensory-needs-development`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, sensory_need_and_motor_development_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSocialization = async (
  token: string,
  formData: SocializationOutput,
  formId: string,
  method: "POST" | "PATCH",
  socialization_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/socialization`
        : `${API_BASE_URL}/visit/edit/socialization`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, socialization_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSafety = async (
  token: string,
  formData: SurvivalSkillsOutput,
  formId: string,
  method: "POST" | "PATCH",
  safety_and_survival_skills_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/safety-survival-skills`
        : `${API_BASE_URL}/visit/edit/safety-survival-skills`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, safety_and_survival_skills_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleUtilzation = async (
  token: string,
  formData: UtilizationOfMoneyOutput,
  formId: string,
  method: "POST" | "PATCH",
  utilization_of_money_id?: string
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

    const data = { ...formData };
    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/utilization-of-money`
        : `${API_BASE_URL}/visit/edit/utilization-of-money`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body =
      method === "POST"
        ? JSON.stringify({ ...data, visit_full_form_id: formId })
        : JSON.stringify({ ...data, utilization_of_money_id });

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleSubmitThirdForm = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH"
) => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (method === "POST") {
      const res = await fetch(`${API_BASE_URL}/visit/add/visit-goal`, {
        method: "POST",
        headers,
        body: JSON.stringify({ visitGoalArray: formData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return {
          status: false,
          errorMessage: errorData?.errorMessage ?? "Invalid response status",
        };
      }
      const responseData = await res.json();
      return {
        status: true,
        errorMessage: responseData?.data?.id ?? null,
      };
    } else {
      // Check if formData is valid before proceeding
      if (!Array.isArray(formData) || formData.length === 0) {
        return {
          status: false,
          errorMessage: "formData is null or undefined",
        };
      }

      await Promise.all(
        formData.map(async (data: { id: any; treatment_plan_id?: string }) => {
          const res = await fetch(`${API_BASE_URL}/visit/edit/visit-goal`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              ...data,
              visit_goal_id: data.treatment_plan_id,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            return {
              status: false,
              errorMessage:
                errorData?.errorMessage ?? "Invalid response status",
            };
          }
        })
      );

      return {
        status: true,
        errorMessage: null,
      };
    }
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const handleFinalSubmit = async (token: string, formId: any) => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE_URL}/visit/submit-generic-visit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ visit_full_form_id: formId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const createVisitForm = async (
  token: string,
  formData: any,
  formType?: TreatmentPlanFormTabOptionIdType
) => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const route = getVisitApiRouteByType(formType);

    const res = await fetch(`${API_BASE_URL}/${route}/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...formData }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: responseData?.data?.id ?? null,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const retriveVisitFormData = async (
  formId: string,
  token: string
): Promise<FormMutationResponse & { data?: any }> => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE_URL}/visit/${formId}/retrieve`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: "Retrieved",
      data: responseData?.data ?? null,
    };
  } catch (e) {
    console.error(e);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const handleRetrieveStepThree = async (
  clientId: string,
  token: string
) => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    const treatment_plan_type = "IISS_Assessment";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(
      `${API_BASE_URL}/visit/${clientId}/retrieve-treatment-goals?treatment_plan_type=${treatment_plan_type}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: "Retrieved",
      data: responseData?.data ?? null,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const handleRetrieveVisit = async (clientId: string, token: string) => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE_URL}/visit/${clientId}/retrieve-all`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: "Retrieved",
      data: responseData?.data ?? null,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const deleteVisitForm = async (
  id: string,
  token: string,
  formType: TreatmentPlanFormTabOptionIdType
) => {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    let endpoint: string;
    if (formType === "iiss") {
      endpoint = `${API_BASE_URL}/visit/generic/delete`;
    } else if (formType === "fc") {
      endpoint = `${API_BASE_URL}/fcVisit/delete`;
    } else {
      endpoint = `${API_BASE_URL}/visit/generic/delete`;
    }

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ visit_full_form_id: id }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const responseData = await res.json();

    return {
      status: true,
      errorMessage: "Deleted",
      data: responseData?.data ?? null,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};
