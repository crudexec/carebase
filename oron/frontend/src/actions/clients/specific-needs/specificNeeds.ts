"use client";

import { type CurrentNeedsFormData } from "@/components/clients/client-details/client-forms/specific-needs/current-needs-table/schema";
import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const createGenericSpecificNeeds = async (
  token: string,
  intake_full_id: string
): Promise<
  FormMutationResponse<{
    id: string;
    intake_full_id: string;
    status: "draft" | "completed";
    registered_by: string;
    basic_information_id: string | null;
    service_needs_id: string | null;
    current_need_or_support_id: string | null;
    authorization_id: string | null;
    deleted_at: string | null;
    createdAt: string;
    updatedAt: string;
  }>
> => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    const url = `${API_BASE_URL}/specificNeed/create-generic`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      intake_full_id,
    };

    const response = await fetch(url, {
      method: "POST",
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

    const responseData = await response.json();

    return {
      status: true,
      errorMessage: "",
      data: responseData.data,
    };
  } catch (err: any) {
    console.error("ERROR CREATING SPECIFIC NEEDS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

// Basic Information Section
export const submitBasicInformationForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  specificNeedsId: string,
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

    const url =
      method === "POST"
        ? `${API_BASE_URL}/specificNeed/add/basic-information`
        : `${API_BASE_URL}/specificNeed/edit/basic-information`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      participant_first_name: formData.participant_first_name,
      participant_last_name: formData.participant_last_name,
      participant_father_name: formData.father_name,
      participant_mother_name: formData.mother_name,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      father_mobile_number: formData.father_mobile_number,
      mother_mobile_number: formData.mother_mobile_number,
      home_address: formData.home_address,
      specific_needs_implemented_by: "",
      intake_full_id: clientId,
      basic_information_id: basicInformationId,
      specific_needs_full_form_id: specificNeedsId,
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
    console.error("ERROR SUBMITTING BASIC INFORMATION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

// Service Needs Section
export const submitServiceNeedsForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  serviceNeedsId: string | undefined,
  specific_needs_full_form_id: string
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
        ? `${API_BASE_URL}/specificNeed/add/service-needs`
        : `${API_BASE_URL}/specificNeed/edit/service-needs`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      specific_needs_full_form_id: specific_needs_full_form_id,
      intake_full_id: clientId,
      iiss: formData.services.includes("iiss"),
      therapeuticServices: formData.services.includes("therapeutic_services"),
      respite: formData.services.includes("respite"),
      familyTraining: formData.services.includes("family_training"),
      transportToSchoolMorning: formData.transportation.includes("to_school"),
      transportFromSchoolToTI:
        formData.transportation.includes("from_school_to_ti"),
      transportFromTIToHome:
        formData.transportation.includes("from_ti_to_home"),
      transportToCommunity: formData.transportation.includes("to_community"),
      noSupervisionNeeded: formData.during_transportation === "no_supervision",
      supervisionNeeded: formData.during_transportation === "need_supervision",
      harnessNeeded: formData.during_transportation === "need_harness",
      hasPreferredCaregiver: formData.has_preferred_caregiver === "yes",
      preferredCaregiverName: formData.preferred_caregiver_name,
      preferredCaregiverPhone: formData.preferred_caregiver_phone,
      preferredCaregiverPhoneCountry: null,
      service_needs_id: serviceNeedsId,
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
    console.error("ERROR SUBMITTING SERVICE NEEDS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

// Current Needs Section
export const submitCurrentNeedsForm = async (
  token: string,
  formData: CurrentNeedsFormData,
  clientId: string,
  method: "POST" | "PATCH",
  specific_needs_full_form_id: string,
  currentNeedsId: string | undefined
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
        ? `${API_BASE_URL}/specificNeed/add/current-needs-and-support`
        : `${API_BASE_URL}/specificNeed/edit/current-needs-and-support`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Transform form data into the required format
    const requestBody = {
      specific_needs_full_form_id,
      intake_full_id: clientId,
      current_need_or_support_id: currentNeedsId,
      current_needs: [
        // Diagnosis Section
        formData.diagnosis
          ? {
              current_need_details: "diagnosis",
              description:
                formData.diagnosis?.description === "Other"
                  ? `[OTHER]${formData.diagnosis?.otherDescription || ""}`
                  : formData.diagnosis?.description || "",
              specificNeeds:
                formData.diagnosis?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.diagnosis?.recommendations || "",
            }
          : null,
        // Communication Section
        formData.communication
          ? {
              current_need_details: "communication",
              description: formData.communication?.description || "",
              specificNeeds: formData.communication?.specificNeeds
                ? [formData.communication.specificNeeds]
                : [],
              recommendation: formData.communication?.recommendations || "",
            }
          : null,
        // Nutritional Section
        formData.nutritional
          ? {
              current_need_details: "nutritional",
              description:
                formData.nutritional?.description === "Other"
                  ? `[OTHER]${formData.nutritional?.otherDescription || ""}`
                  : formData.nutritional?.description || "",
              specificNeeds:
                formData.nutritional?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.nutritional?.recommendations || "",
            }
          : null,
        // Health Section
        formData.health
          ? {
              current_need_details: "health",
              description:
                formData.health?.description === "Other"
                  ? `[OTHER]${formData.health?.otherDescription || ""}`
                  : formData.health?.description || "",
              specificNeeds:
                formData.health?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.health?.recommendations || "",
            }
          : null,
        // Allergies Section
        formData.allergies
          ? {
              current_need_details: "allergies",
              description:
                formData.allergies?.description === "Other"
                  ? `[OTHER]${formData.allergies?.otherDescription || ""}`
                  : formData.allergies?.description || "",
              specificNeeds:
                formData.allergies?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.allergies?.recommendations || "",
            }
          : null,
        // Medication Section
        formData.medication
          ? {
              current_need_details: "medication",
              description:
                formData.medication?.description === "Other"
                  ? `[OTHER]${formData.medication?.otherDescription || ""}`
                  : formData.medication?.description || "",
              specificNeeds:
                formData.medication?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.medication?.recommendations || "",
            }
          : null,
        // Toileting Section
        formData.toileting
          ? {
              current_need_details: "toileting",
              description:
                formData.toileting?.description === "Other"
                  ? `[OTHER]${formData.toileting?.otherDescription || ""}`
                  : formData.toileting?.description || "",
              specificNeeds: formData.toileting?.specificNeeds
                ? [formData.toileting.specificNeeds]
                : [],
              recommendation: formData.toileting?.recommendations || "",
            }
          : null,
        // Behaviors Section
        formData.behaviors
          ? {
              current_need_details: "behaviors",
              description: formData.behaviors?.description?.includes("Other")
                ? `[OTHER]${formData.behaviors?.otherDescription || ""}`
                : formData.behaviors?.description?.join(", ") || "",
              specificNeeds: [
                ...(formData.behaviors?.displayedBehaviors?.map(
                  (item) => `[BEHAVIOR]${item?.value || ""}`
                ) || []),
                ...(formData.behaviors?.managementStrategies?.map(
                  (item) => `[STRATEGY]${item?.value || ""}`
                ) || []),
                ...(formData.behaviors?.triggers?.map(
                  (item) => `[TRIGGER]${item?.value || ""}`
                ) || []),
              ],
              recommendation: formData.behaviors?.recommendations || "",
            }
          : null,
        // Rewards Section
        formData.rewards
          ? {
              current_need_details: "rewards",
              description: formData.rewards?.description?.includes("Other")
                ? `[OTHER]${formData.rewards?.otherDescription || ""}`
                : formData.rewards?.description?.join(", ") || "",
              specificNeeds:
                formData.rewards?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.rewards?.recommendations || "",
            }
          : null,
        // Transportation Section
        formData.transportation
          ? {
              current_need_details: "transportation",
              description: formData.transportation?.description?.includes(
                "Other"
              )
                ? `[OTHER]${formData.transportation?.otherDescription || ""}`
                : formData.transportation?.description?.join(", ") || "",
              specificNeeds:
                formData.transportation?.canBeTransportedAlone !== undefined
                  ? [
                      formData.transportation.canBeTransportedAlone
                        ? "Can be transported alone"
                        : "Cannot be transported alone",
                    ]
                  : [],
              recommendation: formData.transportation?.recommendations || "",
            }
          : null,
        // Staff Ratio Section
        formData.staffRatio
          ? {
              current_need_details: "staff_ratio",
              description: formData.staffRatio?.description?.includes("Other")
                ? `[OTHER]${formData.staffRatio?.otherDescription || ""}`
                : formData.staffRatio?.description?.join(", ") || "",
              specificNeeds: formData.staffRatio?.comments
                ? [formData.staffRatio.comments]
                : [],
              recommendation: formData.staffRatio?.recommendations || "",
            }
          : null,
        // Supervision Section
        formData.supervision
          ? {
              current_need_details: "supervision",
              description: formData.supervision?.description?.includes("Other")
                ? `[OTHER]${formData.supervision?.otherDescription || ""}`
                : formData.supervision?.description?.join(", ") || "",
              specificNeeds: formData.supervision?.comments
                ? [formData.supervision.comments]
                : [],
              recommendation: formData.supervision?.recommendations || "",
            }
          : null,
        // Recreational Section
        formData.recreational
          ? {
              current_need_details: "recreational",
              description: formData.recreational?.description?.includes("Other")
                ? `[OTHER]${formData.recreational?.otherDescription || ""}`
                : formData.recreational?.description?.join(", ") || "",
              specificNeeds:
                formData.recreational?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.recreational?.recommendations || "",
            }
          : null,
        // House Rules Section
        formData.houseRules
          ? {
              current_need_details: "house_rules",
              description: formData.houseRules?.description?.includes("Other")
                ? `[OTHER]${formData.houseRules?.otherDescription || ""}`
                : formData.houseRules?.description?.join(", ") || "",
              specificNeeds:
                formData.houseRules?.specificNeeds
                  ?.sort((a, b) => (a?.id || "").localeCompare(b?.id || ""))
                  .map((item) => item?.value || "") || [],
              recommendation: formData.houseRules?.recommendations || "",
            }
          : null,
        // Community Outing Section
        formData.communityOuting
          ? {
              current_need_details: "community_outing",
              description: formData.communityOuting?.comments || "",
              specificNeeds: [],
              recommendation: formData.communityOuting?.recommendations || "",
            }
          : null,
        // Special Alerts Section
        formData.specialAlerts
          ? {
              current_need_details: "special_alerts",
              description: formData.specialAlerts?.comments || "",
              specificNeeds: [],
              recommendation: formData.specialAlerts?.recommendations || "",
            }
          : null,
      ].filter(Boolean), // Remove null entries
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
    console.error("ERROR SUBMITTING CURRENT NEEDS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};

// Authorization Section
export const submitAuthorizationForm = async (
  token: string,
  formData: any,
  clientId: string,
  method: "POST" | "PATCH",
  specific_needs_full_form_id: string,
  authorization_id?: string
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
        ? `${API_BASE_URL}/specificNeed/add/authorization`
        : `${API_BASE_URL}/specificNeed/edit/authorization`;

    const requestBody = {
      creator_name: formData.creator_name,
      signature_confirmation: true,
      intake_full_id: clientId,
      specific_needs_full_form_id: specific_needs_full_form_id,
      signature_url: formData.signature_url,
      authorization_id,
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
    console.error("ERROR SUBMITTING AUTHORIZATION", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
