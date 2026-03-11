"use client";

import { API_BASE_URL } from "@/constants";
import { FullIntakeType } from "../types/IntakeForm";
import {
  FullVisitForm,
  FullVisit,
  FullTreatmentPlanGoals,
  FullFcVisit,
  FullFcVisitForm,
} from "@/types/Visit";
import { ParentTreatmentPlan, TreatmentPlan, TreatmentPlanDocuments } from "@/types/Events";
import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { convertTreatmentPlanTypeToEnumType } from "@/utils/treatmentPlanHelpers";
import { TreatmentPlanFormTabOptionIdType } from "@/components/clients/client-details/ClientDetailPageWrapper";

export const retrieveClientById = async (
  token: string,
  clientId: string
): Promise<FullIntakeType> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/intake/${clientId}/retrieve/single/intake`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data?.data) || data?.data?.length === 0) {
      throw new Error("Client not found");
    }

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveAllClientIISSVisitsById = async (
  token: string,
  clientId: string,
  formType?: string
): Promise<FullVisit> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const treatment_type = convertTreatmentPlanTypeToEnumType(formType!);

    const response = await fetch(
      `${API_BASE_URL}/visit/${clientId}/retrieve-all?treatment_type=${treatment_type}`,
      { method: "GET", headers }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return data as FullVisit;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveAllClientFcVisitsById = async (
  token: string,
  clientId: string
): Promise<FullFcVisit> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/fcVisit/${clientId}/retrieve-all`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveClientSingleFcVisitForm = async (
  token: string,
  visitFormId: string
): Promise<FullFcVisitForm> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/fcVisit/${visitFormId}/retrieve`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveClientSingleIISSVisitForm = async (
  token: string,
  visitFormId: string
): Promise<FullVisitForm> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/visit/${visitFormId}/retrieve`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();
    return data as FullVisitForm;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveClientTreatmentPlanGoals = async (
  token: string,
  clientId: string,
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType
): Promise<FullTreatmentPlanGoals> => {
  try {
    const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/visit/${clientId}/retrieve-treatment-goals?treatment_plan_type=${treatment_plan_type}`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();
    return data as FullTreatmentPlanGoals;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveClientTreatmentPlanForParent = async (
  intake_full_id: string,
  treatmentPlanType: string
): Promise<ParentTreatmentPlan> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/treatment/${intake_full_id}/parent/retrieve?treatment_type=${treatmentPlanType}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const data = await response.json();
    return data as ParentTreatmentPlan;
  } catch (error: any) {
    console.error("ERROR", error);
    throw new Error(error);
  }
};

export const retrieveClientTreatmentPlan = async (
  token: string,
  clientId: string,
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType
): Promise<TreatmentPlan> => {
  const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/treatment/${clientId}/retrieve?treatment_type=${treatment_plan_type}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch treatment plan: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error retrieving client treatment plan:", error);
    throw error;
  }
};

export const retriveClientDocuments = async (
  token: string,
  clientId: string,
): Promise<TreatmentPlanDocuments> => {

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/treatment/${clientId}/retrieve/documents`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch treatment plan: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error retrieving client treatment plan:", error);
    throw error;
  }
};

export const retrieveClientVisitExport = async (
  token: string,
  clientId: string,
  start_date: string,
  end_date: string,
  visitType: string
): Promise<any> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const visitTypeEndpoints: Record<string, string> = {
      iiss: `/visit/client/${clientId}/export`,
      fc: `/fcVisit/client/${clientId}/filter-export`,
    };

    const endpointPath =
      visitTypeEndpoints[visitType] || `/visit/client/${clientId}/export`;

    const endpoint = `${API_BASE_URL}${endpointPath}?start_date=${start_date}&end_date=${end_date}`;

    const response = await fetch(endpoint, { method: "GET", headers });

    if (!response.ok) {
      throw new Error("Invalid response status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to export client visits");
  }
};

