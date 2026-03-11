"use client";

import { API_BASE_URL } from "@/constants";
import { PneumococcalVaccinationEmployeeInformationFormData } from "@/utils/schemas/FormValidationSchema";
import { VaccinationInformationFormData } from "@/components/forms/pneumococcal-vaccination-form/view/VaccinationInformation";
import { handleDocumentUpload } from "../upload";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

// Function to handle submission of pneumococcal employee information form
export const handlePneumococcalEmployeeInformationFormSubmission = async (
  formData: PneumococcalVaccinationEmployeeInformationFormData, // Form data for pneumococcal employee information
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
      endpoint = `${API_BASE_URL}/pneumococcalForm/add/employeeInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/pneumococcalForm/edit/employeeInformation`; // PATCH endpoint
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

// Function to handle submission of pneumococcal vaccination information form
export const handlePneumococcalVaccinationInformationFormSubmission = async (
  formData: VaccinationInformationFormData, // Form data for pneumococcal vaccination information
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
      endpoint = `${API_BASE_URL}/pneumococcalForm/add/vaccinationInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/pneumococcalForm/edit/vaccinationInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Constructing request body based on form data
    const requestBody: any = constructRequestBody(formData);

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

// Function to handle submission of pneumococcal signature
export const handlePneumococcalSignatureSubmission = async (
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
      endpoint = `${API_BASE_URL}/pneumococcalForm/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/pneumococcalForm/edit/signature`; // PATCH endpoint
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

// Function to construct request body based on vaccination information form data
const constructRequestBody = (
  formData: VaccinationInformationFormData
): any => {
  const requestBody: any = {};

  if (formData.vaccine_status === "yes") {
    requestBody.had_pneumococcal_vaccination = true;
  } else if (formData.vaccine_status === "no") {
    requestBody.declined_pneumococcal_vaccination = true;

    switch (formData.decline_reasons) {
      case "I have already received the pneumococcal vaccination":
        requestBody.received_pneumococcal_vaccination = true;
        break;
      case "I have medical contraindications to receiving the pneumococcal vaccination":
        requestBody.medical_contraindication = true;
        break;
      case "I have personal or religious beliefs that prevent me from receiving the pneumococcal vaccination":
        requestBody.religious_beliefs = true;
        break;
      default:
        if (formData.other && formData.other.length > 0) {
          requestBody.other = formData.other;
        }
    }
  }

  return requestBody;
};
