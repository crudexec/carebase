"use client";

import { API_BASE_URL } from "@/constants";
import { handleDocumentUpload } from "../upload";
import { PneumococcalVaccinationEmployeeInformationFormData } from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { FluVaccineVaccineInformationType } from "@/components/forms/flu-vaccine-form/logic/vaccine-information/reducer";
import isOnline from "is-online";

// Function to handle submission of Flu Vaccine Employee Information
export const handleFluVaccineEmployeeInformationSubmission = async (
  formData: PneumococcalVaccinationEmployeeInformationFormData, // Form data containing personal information
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
      endpoint = `${API_BASE_URL}/fluForm/add/personalInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/fluForm/edit/personalInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid response status, Please try again",
        status: false,
      };
    }

    // Creating request body with personal information
    const requestBody = {
      first_name: formData.firstName, // First name
      last_name: formData.lastName, // Last name
      job_title: formData.jobTitle, // Job title
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
          ? { ...requestBody, date_of_filling_form: new Date().toUTCString() }
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

// Function to handle submission of Flu Vaccine Vaccination Information
export const handleFluVaccineVaccinationInformationSubmission = async (
  formData: FluVaccineVaccineInformationType, // Form data containing vaccination information
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
      endpoint = `${API_BASE_URL}/fluForm/add/attestation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/fluForm/edit/attestation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid response status, Please try again",
        status: false,
      };
    }

    // Creating request body using build function
    const requestBody = {
      have_received_flu_vaccine: formData.have_received_flu_vaccine,
      date_received_flu_vaccine:
        formData.date_received_flu_vaccine.length > 1
          ? formData.date_received_flu_vaccine
          : null,
      received_flu_vaccine_elsewhere: formData.received_flu_vaccine_elsewhere,
      medical_contraindication_to_receiving_vaccine:
        formData.medical_contraindication_to_receiving_vaccine,
      personal_or_religious_beliefs_preventing_vaccination:
        formData.personal_or_religious_beliefs_preventing_vaccination,
      allergic_to_vaccine_components: formData.allergic_to_vaccine_components,
      declined_flu_vaccine: formData.declined_flu_vaccine,
      concerns_about_vaccine_safety: formData.concerns_about_vaccine_safety,
      other: formData.other === null ? "" : formData.other,
      vaccination_site: null,
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

// Function to handle submission of Flu Vaccine Signature
export const handleFluVaccineSignatureSubmission = async (
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
      endpoint = `${API_BASE_URL}/fluForm/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/fluForm/edit/signature`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid response status, Please try again",
        status: false,
      };
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
