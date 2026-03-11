"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { BiodataType } from "./schema";
import { revertFormattedPhoneNumber } from "@/utils/helpers";
import isOnline from "is-online";

export const handleBiodataSubmission = async (
  formData: BiodataType,
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
      endpoint = `${API_BASE_URL}/biodata/add`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/biodata/update`;
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      };
    }

    const requestBody = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      state: formData.state,
      address: formData.address,
      middle_name:
        formData.middleName && formData.middleName.length > 1
          ? formData.middleName
          : null,
      other_last_name:
        formData.otherLastName && formData.otherLastName.length > 1
          ? formData.otherLastName
          : null,
      phone: revertFormattedPhoneNumber(formData.phoneNumber),
      apartment_number:
        formData.apartmentNumber && formData.apartmentNumber.length > 1
          ? formData.apartmentNumber
          : null,
      city: formData.city,
      zip_code: formData.zipCode,
      social_security_number: formData.socialSecurityNumber.replace(/-/g, ""),
      npi: formData.npi && formData.npi?.length > 0 ? formData.npi : null,
      lba: formData.lba && formData.lba?.length > 0 ? formData.lba : null,
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
        errorMessage:
          errorData?.errorMessage ??
          "Invalid response status, Please try again",
        status: false,
      };
    }

    const clientResponse: FormMutationResponse = {
      errorMessage: "",
      status: true,
    };

    return clientResponse;
  } catch (error: any) {
    console.error(error);
    const clientResponse: FormMutationResponse = {
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network errror occurred! Try again",
      status: false,
    };
    return clientResponse;
  }
};
