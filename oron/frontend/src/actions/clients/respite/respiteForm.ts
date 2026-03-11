"use client";

import { RespiteSessionHighlightsFormData } from "@/components/clients/client-details/client-forms/respite-form/RespiteSessionHighlights";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const createGenericRespiteForm = async (
  token: string,
  date_of_visit: string,
  start_time: string,
  end_time: string,
  intake_full_id: string
): Promise<FormMutationResponse<{ id: string }>> => {
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

    const response = await fetch(`${API_BASE_URL}/visit/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        date_of_visit,
        start_time,
        end_time,
        intake_full_id,
        treatment_type: "Respite",
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
    console.error("ERROR CREATING RESPITE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteForm = async (
  token: string,
  respiteId: string
): Promise<FormMutationResponse<{ id: string }>> => {
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

    const response = await fetch(`${API_BASE_URL}/visit/submit-generic-visit`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        visit_full_form_id: respiteId,
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
    console.error("ERROR SUBMITTING RESPITE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSessionHighlights = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/session-highlights`
        : `${API_BASE_URL}/visit/edit/session-highlights`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      location: formData.location,
      level_of_compliance: formData.levelOfCompliance,
      injury_to_self: formData.injuryToSelf,
      aggression_to_others: formData.aggressionToOthers,
      client_hospitalized_in_care_today: formData.wasHospitalized === "yes",
      client_placed_themselves_in_harm_by_leaving_my_care:
        formData.placedInDanger === "yes",
      ti_onsite_locations: validateField(formData.tiOnsiteLocations),
      supervisor: validateField(formData.tiOnsiteLocations),
      visit_full_form_id,
      session_highlights_id,
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

export const submitRespiteConcernsAndChallenges = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/concern-challenges`
        : `${API_BASE_URL}/visit/edit/concern-challenges`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      concern_and_challenges_id,
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
    console.error("ERROR SUBMITTING CONCERNS AND CHALLENGES", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSelfManagement = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/self-management`
        : `${API_BASE_URL}/visit/edit/self-management`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      self_management_id,
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
    console.error("ERROR SUBMITTING SELF MANAGEMENT", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteBehaviourManagement = async (
  token: string,
  formData: any[],
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/behavior-management`
        : `${API_BASE_URL}/visit/edit/behavior-management`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (method === "POST") {
      const requestBody = {
        behaviorManagementArray: formData.map((item) => {
          return {
            ...item,
            visit_full_form_id,
          };
        }),
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
    } else {
      // For PATCH, we need to update each behavior management item
      for (const data of formData) {
        const requestBody = {
          ...data,
          behavior_management_id,
        };

        const response = await fetch(url, {
          method: "PATCH",
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
      }

      return {
        status: true,
        errorMessage: "",
      };
    }
  } catch (err: any) {
    console.error("ERROR SUBMITTING BEHAVIOUR MANAGEMENT", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteCommunication = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/communication`
        : `${API_BASE_URL}/visit/edit/communication`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,

      visit_full_form_id,
      communication_id,
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
    console.error("ERROR SUBMITTING COMMUNICATION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSnackMealTime = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/snack-meal-time`
        : `${API_BASE_URL}/visit/edit/snack-meal-time`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

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

    const requestBody = {
      ...data,
      visit_full_form_id,
      snack_meal_time_id,
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
    console.error("ERROR SUBMITTING SNACK MEAL TIME", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteDomesticSkillTraining = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/domestic-skill-training`
        : `${API_BASE_URL}/visit/edit/domestic-skill-training`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      domestic_skill_training_id,
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
    console.error("ERROR SUBMITTING DOMESTIC SKILL TRAINING", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespitePlayLeisure = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/play-leisure`
        : `${API_BASE_URL}/visit/edit/play-leisure`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      play_leisure_id,
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
    console.error("ERROR SUBMITTING PLAY LEISURE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespitePersonalWorkReading = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/personal-work-reading`
        : `${API_BASE_URL}/visit/edit/personal-work-reading`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      personal_work_reading_id,
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
    console.error("ERROR SUBMITTING PERSONAL WORK READING", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespitePersonalCare = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/personal-care-bowel-control`
        : `${API_BASE_URL}/visit/edit/personal-care-bowel-control`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      personal_care_and_bladder_control_id,
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
    console.error("ERROR SUBMITTING PERSONAL CARE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSensoryNeeds = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/sensory-needs-development`
        : `${API_BASE_URL}/visit/edit/sensory-needs-development`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      sensory_need_and_motor_development_id,
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
    console.error("ERROR SUBMITTING SENSORY NEEDS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSocialization = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/socialization`
        : `${API_BASE_URL}/visit/edit/socialization`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      socialization_id,
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
    console.error("ERROR SUBMITTING SOCIALIZATION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteSafetySurvivalSkills = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/safety-survival-skills`
        : `${API_BASE_URL}/visit/edit/safety-survival-skills`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      safety_and_survival_skills_id,
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
    console.error("ERROR SUBMITTING SAFETY SURVIVAL SKILLS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitRespiteUtilizationOfMoney = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/utilization-of-money`
        : `${API_BASE_URL}/visit/edit/utilization-of-money`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      utilization_of_money_id,
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
    console.error("ERROR SUBMITTING UTILIZATION OF MONEY", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitTiVisitTaskEngagement = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
  method: "POST" | "PATCH",
  task_engagement_id?: string
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/task-engagement`
        : `${API_BASE_URL}/visit/edit/task-engagement`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      task_engagement_id,
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
    console.error("ERROR SUBMITTING TASK ENGAGEMENT", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitTiVisitTransportationType = async (
  token: string,
  formData: any,
  visit_full_form_id: string,
  method: "POST" | "PATCH",
  transportation_type_id?: string
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/visit/add/transportation-type-and-objectives`
        : `${API_BASE_URL}/visit/edit/transportation-type-and-objectives`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      ...formData,
      visit_full_form_id,
      transportation_type_id,
      treatment_plan_id: null,
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
    console.error("ERROR SUBMITTING TRANSPORTATION TYPE", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
