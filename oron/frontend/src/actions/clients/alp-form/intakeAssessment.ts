"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitAlpIntroduction = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH",
  intorductionId: string | undefined
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

    const url = method === "POST" ? `${API_BASE_URL}` : `${API_BASE_URL}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
      }),
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
    console.error("ERROR SUBMITTING INTRODUCTION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitAlpSelfAdvocacy = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH",
  selfAdvocacyId: string | undefined
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

    const url = method === "POST" ? `${API_BASE_URL}` : `${API_BASE_URL}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
      }),
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
    console.error("ERROR SUBMITTING SELF ADVOCAVY", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitAlpSelfDirections = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH",
  selfDirectionsId: string | undefined
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

    const url = method === "POST" ? `${API_BASE_URL}` : `${API_BASE_URL}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
      }),
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
    console.error("ERROR SUBMITTING SELF DIRECTIONS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitAlpCommunication = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH",
  communicationId: string | undefined
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

    const url = method === "POST" ? `${API_BASE_URL}` : `${API_BASE_URL}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
      }),
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
    console.error("ERROR SUBMITTING COMMUNICATIONS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

export const submitAlpHomeLiving = async (
  token: string,
  formData: any,
  method: "POST" | "PATCH",
  homeLivingId: string | undefined
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

    const url = method === "POST" ? `${API_BASE_URL}` : `${API_BASE_URL}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...formData,
      }),
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
    console.error("ERROR SUBMITTING HOME LIVING", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
