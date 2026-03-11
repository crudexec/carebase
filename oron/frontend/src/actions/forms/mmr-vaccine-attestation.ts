"use client";

import { API_BASE_URL } from "@/constants";
import { handleDocumentUpload } from "../upload";
import { PneumococcalVaccinationEmployeeInformationFormData } from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

// Function to handle submission of MMR Form attestation
export const handleMMRAttestationSubmmision = async (
  formData: string[], // Array of form data representing user choices
  other: string, // Additional information provided by the user
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
    // Determining endpoint based on HTTP method
    if (method === "POST") {
      endpoint = `${API_BASE_URL}/mmrForm/add/attestation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/mmrForm/edit/attestation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      do_not_think_will_contract_mumps: formData.includes(
        "I do not think I will contract measles, mumps, and/or rubella"
      ),
      do_not_think_serious_disease: formData.includes(
        "I do not think these are serious illnesses"
      ),
      side_effects_from_vaccine: formData.includes(
        "I had side effects after I received the vaccine in the past"
      ),
      will_stay_home_if_infected: formData.includes(
        "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"
      ),
      other: formData.includes("other") ? other : null, // Including additional information if provided
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

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
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

// Function to handle submission of MMR Form personal information
export const handleMMRInformationSubmission = async (
  formData: PneumococcalVaccinationEmployeeInformationFormData, // Form data containing user information
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
    // Determining endpoint based on HTTP method
    if (method === "POST") {
      endpoint = `${API_BASE_URL}/mmrForm/add/personalInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/mmrForm/edit/personalInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with user information
    const requestBody = {
      first_name: formData.firstName, // First name of the user
      last_name: formData.lastName, // Last name of the user
      job_title: formData.jobTitle, // Job title of the user
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

// Function to handle submission of MMR Form signature
export const handleMMRSignatureSubmission = async (
  formData: FormData, // Form data containing signature
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
    // Determining endpoint based on HTTP method
    if (method === "POST") {
      endpoint = `${API_BASE_URL}/mmrForm/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/mmrForm/edit/signature`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Uploading document and getting file URL
    const fileUrl = await handleDocumentUpload(formData, token);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify({
        signature_data: fileUrl,
      }),
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
