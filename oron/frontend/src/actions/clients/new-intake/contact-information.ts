"use client";

import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { ContactFormData } from "@/utils/schemas";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { revertFormattedPhoneNumber } from "@/utils/helpers";
import isOnline from "is-online";

export const handleContactFormSubmission = async (
  formData: ContactFormData,
  token: string,
  method: "POST" | "PATCH",
  prevSectionId: string,
  intakeFullId: string
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
      endpoint = `${API_BASE_URL}/intake/add/general/contact-information`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/intake/${intakeFullId}/edit/general/contact-information`;
    } else {
      return {
        status: false,
        errorMessage: "Invalid method",
      };
    }

    const requestBody = {
      father_first_name: validateField(formData.fatherContact.contactFirstName),
      father_last_name: validateField(formData.fatherContact.contactLastName),
      father_relationship: validateField(formData.fatherContact.relationship),
      father_email: validateField(formData.fatherContact.email),
      father_street_number_and_house_address: validateField(
        formData.fatherContact.streetAddress
      ),
      father_country: validateField(formData.fatherContact.country),
      father_state: validateField(formData.fatherContact.state),
      father_city: validateField(formData.fatherContact.city),
      father_zip_code: validateField(formData.fatherContact.zipCode),
      father_apartment_number: validateField(
        formData.fatherContact.apartmentNumber
      ),
      father_phone: validateField(
        revertFormattedPhoneNumber(formData.fatherContact.cellPhone)
      ),
      father_home_phone_number: validateField(
        revertFormattedPhoneNumber(formData.fatherContact.homePhone)
      ),
      father_work_phone_number: validateField(
        revertFormattedPhoneNumber(formData.fatherContact.workPhone)
      ),
      mother_first_name: validateField(formData.motherContact.contactFirstName),
      mother_last_name: validateField(formData.motherContact.contactLastName),
      mother_relationship: validateField(formData.motherContact.relationship),
      mother_email: validateField(formData.motherContact.email),
      mother_street_number_and_house_address: validateField(
        formData.motherContact.streetAddress
      ),
      mother_country: validateField(formData.motherContact.country),
      mother_state: validateField(formData.motherContact.state),
      mother_city: validateField(formData.motherContact.city),
      mother_zip_code: validateField(formData.motherContact.zipCode),
      mother_apartment_number: validateField(
        formData.motherContact.apartmentNumber
      ),
      mother_phone: validateField(
        revertFormattedPhoneNumber(formData.motherContact.cellPhone)
      ),
      mother_home_phone_number: validateField(
        revertFormattedPhoneNumber(formData.motherContact.homePhone)
      ),
      mother_work_phone_number: validateField(
        revertFormattedPhoneNumber(formData.motherContact.workPhone)
      ),
      emergency_first_name: validateField(
        formData.emergencyContact.contactFirstName
      ),
      emergency_last_name: validateField(
        formData.emergencyContact.contactLastName
      ),
      emergency_relationship: validateField(
        formData.emergencyContact.relationship
      ),
      emergency_email: validateField(formData.emergencyContact.email),
      emergency_street_number_and_house_address: validateField(
        formData.emergencyContact.streetAddress
      ),
      emergency_country: validateField(formData.emergencyContact.country),
      emergency_state: validateField(formData.emergencyContact.state),
      emergency_city: validateField(formData.emergencyContact.city),
      emergency_zip_code: validateField(formData.emergencyContact.zipCode),
      emergency_apartment_number: validateField(
        formData.emergencyContact.apartmentNumber
      ),
      emergency_phone: validateField(
        revertFormattedPhoneNumber(formData.emergencyContact.cellPhone)
      ),
      emergency_home_phone_number: validateField(
        revertFormattedPhoneNumber(formData.emergencyContact.homePhone)
      ),
      emergency_work_phone_number: validateField(
        revertFormattedPhoneNumber(formData.emergencyContact.workPhone)
      ),
      name_of_school: validateField(formData.schoolContact.nameOfSchool),
      school_address: validateField(formData.schoolContact.schoolAddress),
      school_phone: validateField(
        revertFormattedPhoneNumber(formData.schoolContact.telephone)
      ),
      school_email: validateField(formData.schoolContact.emailAddress),
      school_contact_person: validateField(
        formData.schoolContact.contactPerson
      ),
      intake_information_id: prevSectionId,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(
        method === "POST"
          ? { ...requestBody, intake_full_id: intakeFullId }
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

    const responseData = await response.json();

    return {
      status: true,
      errorMessage: responseData.data.emergency.id, // The id of this form passed in the errorMessage field to use as the payload for the next form
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ?? "An unknown error occurred",
    };
  }
};
