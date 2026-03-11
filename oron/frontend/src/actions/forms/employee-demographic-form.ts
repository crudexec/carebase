"use client";

import { API_BASE_URL } from "@/constants";
import {
  EmployeeDemographicContactInformationFormData,
  EmployeeDemographicPersonalInformationFormData,
} from "@/utils/schemas/FormValidationSchema";
import { FormMutationResponse } from "@/types/GeneralTypes";
import {
  revertFormattedPhoneNumber,
  revertFormattedSSN,
} from "@/utils/helpers";
import isOnline from "is-online";

// Function to handle submission of Employee Demographic Personal Information
export const handleEmployeeDemographicPersonalInformationSubmission = async (
  formData: EmployeeDemographicPersonalInformationFormData, // Form data containing personal information
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
      endpoint = `${API_BASE_URL}/employeeform/add/personalInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/employeeform/edit/personalInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with personal information
    const requestBody = {
      first_name: formData.firstName, // First name
      last_name: formData.lastName, // Last name
      date_of_birth: formData.dateOfBirth, // Date of birth
      home_phone_number: revertFormattedPhoneNumber(formData.homePhoneNumber), // Home phone number
      race_or_ethinicity: formData.race, // Race or ethnicity
      phone: revertFormattedPhoneNumber(formData.cellPhoneNumber), // Cell phone number
      street_address: formData.address, // Street address
      city: formData.cityOrTown, // City
      state: formData.state, // State
      zip_code: formData.zipCode, // Zip code
      gender: formData.gender, // Gender
      social_security_number: revertFormattedSSN(formData.socialSecurityNumber), // Social security number
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

// Function to handle submission of Employee Demographic Emergency Contact Information
export const handleEmployeeDemographicEmergencyContactInformationSubmission =
  async (
    formData: EmployeeDemographicContactInformationFormData, // Form data containing emergency contact information
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
        endpoint = `${API_BASE_URL}/employeeform/add/emergencyContactInformation`; // POST endpoint
      } else if (method === "PATCH") {
        endpoint = `${API_BASE_URL}/employeeform/edit/emergencyContactInformation`; // PATCH endpoint
      } else {
        return {
          errorMessage: "Invalid request method, Please try again",
          status: false,
        }; // Invalid method
      }

      // Creating request body with emergency contact information
      const requestBody = {
        first_name: formData.firstName, // First name
        last_name: formData.lastName, // Last name
        relationship_to_employee: formData.relationshipToEmployee, // Relationship to employee
        street_address: formData.address, // Street address
        phone: formData.cellPhoneNumber, // Cell phone number
        city: formData.cityOrTown, // City
        zip_code: formData.zipCode, // Zip code
        state: formData.state, // State
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
