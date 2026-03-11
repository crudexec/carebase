"use client";

import { API_BASE_URL } from "@/constants";
import { handleDocumentUpload } from "../upload";
import { PneumococcalVaccinationEmployeeInformationFormData } from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const handleDeclinationFormSubmission = async (
  formData: {
    options: string[];
    other: string;
  },
  token: string,
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

    let endpoint: string;
    // Determining endpoint based on HTTP method
    if (method === "POST") {
      endpoint = `${API_BASE_URL}/influenzaForm/add/attestation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/influenzaForm/edit/attestation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with declination information
    const requestBody = {
      aware_influenza_serious_disease: formData.options.includes(
        "Influenza is a serious respiratory disease. Each year in the United States, influenza kills thousands of people and causes hundreds of thousands of hospitalizations."
      ),
      aware_vaccine_available_to_protect: formData.options.includes(
        "Influenza vaccination is recommended for me and all other healthcare personnel to protect our staff and our facility's patients from influenza, its complications, and death."
      ),
      can_shed_virus_after_contracting: formData.options.includes(
        "If I contract influenza, I can shed the virus for 24 hours before any influenza symptoms appear. During the time I shed the virus, I can transmit influenza to patients and staff in this facility."
      ),
      can_spread_influenza_without_symptoms: formData.options.includes(
        "If I become infected with influenza, even if my symptoms are mild or non-existent, I can spread influenza to others. Symptoms that are mild or non-existent in me can cause serious illness and death in others."
      ),
      my_influenza_vaccine_immunity_changes_every_year:
        formData.options.includes(
          "I understand that the strains of virus that cause influenza infection change almost every year and, even if they don't change, my immunity declines over time. This is why vaccination against influenza is recommended every year."
        ),
      can_not_get_influenza_from_vaccine: formData.options.includes(
        "I understand that it is impossible to get influenza from influenza vaccine."
      ),
      consequences_of_vaccination_refusal: formData.options.includes(
        "The consequences of my refusal to be vaccinated could have life-threatening consequences for my health and the health of everyone with whom I have contact, including my coworkers and all patients in this healthcare facility."
      ),
      reason_for_declining_vaccine:
        formData.other && formData.other.length > 1 ? formData.other : null, // Other reason for declining
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    // Return successful response object
    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse; // Request successful
  } catch (error: any) {
    // Cosntruct object to send to the client on succesful login attempt
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse; // Error occurred during login
  }
};

// Function to handle submission of Declination Employee Information
export const handleDeclinationEmployeeInformationSubmission = async (
  formData: PneumococcalVaccinationEmployeeInformationFormData, // Form data containing employee information
  token: string, // User token
  method: "POST" | "PATCH" // HTTP method for the request
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
      endpoint = `${API_BASE_URL}/influenzaForm/add/personalInformation`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/influenzaFor/edit/personalInformationm`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const requestBody = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      department: formData.jobTitle,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...requestBody, date_of_filling_form: formData.todayDate }
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

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};

export const handleDeclinationSignatureSubmission = async (
  formData: FormData,
  token: string,
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

    let endpoint: string;

    if (method === "POST") {
      endpoint = `${API_BASE_URL}/influenzaForm/add/signature`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/influenzaForm/edit/signature`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const fileUrl = await handleDocumentUpload(formData, token);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const body = JSON.stringify({
      signature_data: fileUrl,
    });

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};
