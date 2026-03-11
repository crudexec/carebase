"use client";

import { API_BASE_URL } from "@/constants";
import { handleDocumentUpload } from "../upload";
import { PneumococcalVaccinationEmployeeInformationFormData } from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

// Function to handle submission of varicella attestation form
export const handleVaricellaAttestationFormSubmmision = async (
  formData: string[], // Form data array
  token: string, // User token
  other: string, // Additional information if "other" option is selected
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
      endpoint = `${API_BASE_URL}/varicellaForm/add/attestation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/varicellaForm/edit/attestation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      had_chicken_pox: formData.includes("I already have had chickenpox"),
      will_not_contract_chicken_pox: formData.includes(
        "I do not think I will contract chickenpox"
      ),
      chicken_pox_not_serious_disease: formData.includes(
        "I do not think chickenpox is a serious disease"
      ),
      side_effects_from_chicken_pox_vaccine: formData.includes(
        "I had side effects when I was vaccinated against chickenpox in the past"
      ),
      will_stay_home_if_infected: formData.includes(
        "I will stay home if I get chickenpox so I will not spread it to patients or colleagues"
      ),
      other: formData.includes("other") ? other : null, // Including additional information if "other" option selected
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

// Function to handle submission of varicella information form
export const handleVaricellaInformationFormSubmission = async (
  formData: PneumococcalVaccinationEmployeeInformationFormData, // Form data object
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
      endpoint = `${API_BASE_URL}/varicellaForm/add/personalInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/varicellaForm/edit/personalInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      job_title: formData.jobTitle,
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

// Function to handle submission of varicella signature
export const handleVaricellaSignatureSubmission = async (
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
      endpoint = `${API_BASE_URL}/varicellaForm/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/varicellaForm/edit/signature`; // PATCH endpoint
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
