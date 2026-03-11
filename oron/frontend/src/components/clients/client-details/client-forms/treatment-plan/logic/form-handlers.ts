"use client";

import { FormMutationResponse } from "@/types/GeneralTypes";
import { API_BASE_URL } from "@/constants";
import { handleDocumentUpload } from "@/actions/upload";
import isOnline from "is-online";

export const retrieveFormData = async (
  clientId: string,
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/treatment/${clientId}/retrieve`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    const data = await response.json();
    return {
      status: true,
      errorMessage: "Retrieved",
      data: data.data,
    };
  } catch (e) {
    console.error(e);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const submitBasicInformationForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  basicInformationId: string | undefined
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

    let response: Response;

    if (method === "POST") {
      response = await fetch(
        `${API_BASE_URL}/treatment/${clientId}/add/basic-information`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(formData),
        }
      );
    } else {
      response = await fetch(
        `${API_BASE_URL}/treatment/${basicInformationId}/edit/basic-information`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify(formData),
        }
      );
    }

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "we go",
    };
  } catch (e) {
    console.error(e);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const submitGoalForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  goalFormId?: string
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

    if (method === "POST") {
      const response = await fetch(
        `${API_BASE_URL}/treatment/${clientId}/add/treatment-goal`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ goalArray: formData }),
        }
      );

      if (!response.ok) {
        return {
          status: false,
          errorMessage: "Invalid response status",
        };
      }

      return {
        status: true,
        errorMessage: "we go",
      };
    } else {
      for (const data of formData) {
        const response = await fetch(
          `${API_BASE_URL}/treatment/${goalFormId}/edit/treatment-goal`,
          {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to Update Goal");
        }
      }

      return {
        status: true,
        errorMessage: "we go",
      };
    }
  } catch (e) {
    console.error(e);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const submitScheduleForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  scheduleId: string
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let response: Response;

    if (method === "POST") {
      response = await fetch(
        `${API_BASE_URL}/treatment/${clientId}/add/treatment-schedule`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(formData),
        }
      );
    } else {
      response = await fetch(
        `${API_BASE_URL}/treatment/${scheduleId}/edit/treatment-schedule`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify(formData),
        }
      );
    }

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    const data = await response.json();
    return {
      status: true,
      errorMessage: data.id,
    };
  } catch (error) {
    console.error("Error", error);
    return {
      status: false,
      errorMessage: "Invalid response status",
    };
  }
};

export const completeTreatmentplan = async (token: string, formId: string) => {
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

    const response = await fetch(`${API_BASE_URL}/treatment/complete`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ treatment_full_id: formId }),
    });

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error) {
    console.error("Error", error);
    return {
      status: false,
      errorMessage: "Server Error",
    };
  }
};

export const signTreatmentPlan = async (
  token: string,
  signatureUrl: string,
  full_name: string,
  treatment_full_id: string,
  intake_full_id: string
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/treatment/sign`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        signature_url: signatureUrl,
        full_name,
        treatment_full_id,
        intake_full_id,
      }),
    });

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "we go",
    };
  } catch (error) {
    console.error("Error", error);
    return {
      status: true,
      errorMessage: "we go",
    };
  }
};
