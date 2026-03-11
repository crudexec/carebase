"use client";

import { API_BASE_URL } from "@/constants";
import { mapForms } from "@/lib/api-utils";
import {
  AllUsersResponse,
  UserFormDataResponse,
  UserFormInfo,
  UserFormStatusTotalResponse,
  AdmimUserDocument,
  VisitExportApiResponse,
} from "@/types/AdminTypes";

import {
  filterCompletedForms,
  mapFormCreatedDate,
  mapFormIds,
  mapFormProgress,
  mapFormStatus,
  mapFormSubmittedDate,
} from "../lib/forms/helpers";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";

export const fetchUsersWithForms = async (
  token: string,
  page: number,
  size: number = 5,
  role: string = "STANDARD",
  status: string = "all"
): Promise<AllUsersResponse | boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/users/all/users?size=${size}&page=${page}&role=${role}&status=${status}`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data as AllUsersResponse;
  } catch (error) {
    console.error(error);
    return false;
  }
};
export const generateUserFormData = async (
  token: string,
  user_id: string
): Promise<UserFormInfo> => {
  try {
    const form = await fetchAllUsersForms(token, user_id ?? "no");

    if (typeof form === "boolean") {
      throw new Error(
        "An error occurred while fetching form! Refresh and try again."
      );
    }

    const data = form?.data;

    const forms = [
      { data: data?.userBioDataForm?.userBioData },
      { data: data?.referenceForm.referenceForm },
      { data: data?.i9Form },
      { data: data?.employeeDemographicForm },
      { data: data?.tuberculosisForm },
      { data: data?.pneumococcalForm },
      { data: data?.hepatitisBForm },
      { data: data?.varicellaForm },
      { data: data?.mmrForm },
      { data: data?.fluForm },
      { data: data?.cjisForm },
    ];

    const formData: any = {
      status: mapFormStatus(forms, true),
      createdDate: mapFormCreatedDate(forms, true),
      submittedDate: mapFormSubmittedDate(forms, true),
      progress: mapFormProgress(forms, true),
      completedForms: filterCompletedForms(forms, true),
      formIds: mapFormIds(forms, true),
      forms: mapForms(forms),
    };

    return formData;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const fetchUserFormStatusTotal = async (
  token: string,
  user_id: string,
  endpoint: "awaiting-approval" | "approved" | "not-filled"
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/users/${user_id}/forms/${endpoint}`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data as UserFormStatusTotalResponse;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

const fetchAllUsersForms = async (
  token: string,
  user_id: string
): Promise<UserFormDataResponse | boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/${user_id}/forms`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data as UserFormDataResponse;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const fetchUserOfferLetter = async (
  user_id: string,
  token: string
): Promise<OfferLetterResponse | boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/approveform/${user_id}/retrieve/offer-letter`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data as OfferLetterResponse;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const fetchUserDocumentsById = async (
  user_id: string,
  token: string
): Promise<AdmimUserDocument> => {
  if (!user_id || !token) {
    throw new Error("No user_id or token");
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/approveform/${user_id}/retrieve/user/documents`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveVisitExport = async (
  token: string,
  employee_id: string,
  start_date: string,
  end_date: string,
  visitType: string
): Promise<VisitExportApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const visitTypeEndpoints: Record<string, string> = {
      iiss: `/visit/${employee_id}/export`,
      fc: `/fcVisit/${employee_id}/filter-export`,
    };

    const endpointPath =
      visitTypeEndpoints[visitType] || `/visit/${employee_id}/export`;

    const endpoint = `${API_BASE_URL}${endpointPath}?start_date=${start_date}&end_date=${end_date}`;

    const response = await fetch(endpoint, { method: "GET", headers });

    if (!response.ok) {
      throw new Error("Invalid response status");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export type CreateUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  role: "ADMINISTRATOR" | "STANDARD" | "CLIENT_MANAGER";
};

export type CreateUserResponse = {
  statusCode: number;
  message: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    generated_password: string;
    created_at: string;
  };
};

export const createUser = async (
  token: string,
  payload: CreateUserPayload
): Promise<CreateUserResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create user");
    }

    const data = await response.json();
    return data as CreateUserResponse;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export type ResetPasswordResponse = {
  statusCode: number;
  message: string;
  data: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    new_password: string;
  };
};

export const resetUserPassword = async (
  token: string,
  userId: string
): Promise<ResetPasswordResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reset password");
    }

    const data = await response.json();
    return data as ResetPasswordResponse;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
