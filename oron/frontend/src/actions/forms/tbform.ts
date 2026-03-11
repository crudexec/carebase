"use client";

import { API_BASE_URL } from "@/constants";
import { RiskAssesmentClientDataType } from "@/types/form-types/TBFormTypes";
import { handleDocumentUpload } from "../upload";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

// Function to handle submission of TB form risk assessment
export const handleTbFormRiskAssessmentSubmission = async (
  formData: RiskAssesmentClientDataType, // Form data for risk assessment
  token: string, // User token
  method: "POST" | "PATCH",
  lastChestXrayDate: Date | undefined
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
      endpoint = `${API_BASE_URL}/tuberculosisForm/add/riskAssessment`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/tuberculosisForm/edit/riskAssessment`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      had_tb_infection: formData.hasHadTb === "yes",
      had_tb_infection_date: formData.tbDate,
      had_positive_tb_skin_test: formData.hasHadPrToTb === "yes",
      had_positive_tb_skin_test_date: formData.prTbDate,
      have_you_been_immunized_with_bcg_vaccine:
        formData.hasBeenImmunized === "yes",
      immunization_description: formData.immunizedInformation,
      vaccine_past_two_weeks: formData.hasTakenVaccine === "yes",
      steriod_injection_past_two_weeks: formData.hasTakenSteroids === "yes",
      exposure_to_tb_past_two_weeks: formData.hasExposureToTb === "yes",
      coughing_blood: formData.symptoms.includes("Coughing up blood"),
      loss_of_appetite: formData.symptoms.includes("Loss of appetite"),
      unexplained_weight_loss: formData.symptoms.includes(
        "Unexplained weight loss"
      ),
      chill_or_fever: formData.symptoms.includes("Chills and/or fever"),
      persistent_cough_last_two_weeks: formData.symptoms.includes(
        "A persistent cough for longer than 2 weeks"
      ),
      chest_pain: formData.symptoms.includes(
        "Recurring, dull, tightness or aching pain in the chest Coughing up blood"
      ),
      last_chest_xray_date: lastChestXrayDate ?? undefined,
      profuse_night_sweats: formData.symptoms.includes("Profuse night sweats"),
      spent_time_with_tb_patient_in_the_last_two_years:
        formData.spentTimeWithSick === "yes",
      were_you_born_in_a_country_where_tb_is_common:
        formData.userBornInOptions === "yes",
      country_of_birth:
        formData.userBornInOptions === "yes" ? formData.countryOfBirth : "",
      traveled_to_a_country_where_tb_is_common:
        formData.travelledToSpeciicCountry === "yes",
      country_of_travel:
        formData.travelledToSpeciicCountry === "yes"
          ? formData.countryTravelledTo
          : "",
      members_of_family_traveled_to_US_from_another_country:
        formData.householdMembers === "yes",
      family_country_of_travel:
        formData.householdMembers === "yes" ? formData.householdCountry : "",
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

// Function to handle submission of TB form signature
export const handleTBFormSignatureSubmission = async (
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
      endpoint = `${API_BASE_URL}/tuberculosisForm/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/tuberculosisForm/edit/signature`; // PATCH endpoint
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
