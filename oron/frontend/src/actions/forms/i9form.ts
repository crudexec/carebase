"use client";

import { API_BASE_URL } from "@/constants";
import {
  BiodataFormData,
  DocumentAFormData,
  DocumentBAndCFormData,
} from "@/utils/schemas/FormValidationSchema";
import {
  CitizenshipRequest,
  DocumentUploadRequest,
} from "@/types/form-types/FormTypes";
import { handleDocumentUpload } from "../upload";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { removeEmptyStrings } from "@/utils/helpers";
import isOnline from "is-online";

// Function to handle submission of I-9 Form personal information
export const handleI9FormPersonalInformationSubmission = async (
  formData: BiodataFormData, // Form data containing personal information
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
      endpoint = `${API_BASE_URL}/i9form/add/personalInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/personalInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      first_name: formData.firstName, // First name
      last_name: formData.lastName, // Last name
      email: formData.email, // Email
      state: formData.state, // State
      address: formData.address, // Address
      middle_name: formData.middleName, // Middle name
      other_last_name: formData.otherLastName, // Other last name
      phone: formData.phoneNumber, // Phone number
      apartment_number: formData.apartmentNumber, // Apartment number
      city: formData.cityOrTown, // City
      zip_code: formData.zipCode, // Zip code
      social_security_number: formData.socialSecurityNumber, // Social security number
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

export const handleSubmitPDFInput = async (
  filled_pdf_json_data: string,
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
      endpoint = `${API_BASE_URL}/i9form/upload/pdf`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/pdf`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with form data
    const requestBody = {
      filled_pdf_json_data,
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

// Function to handle submission of I-9 Form citizenship information
export const handleI9FormCitizenshipSubmission = async (
  formData: CitizenshipRequest, // Form data containing citizenship information
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
      endpoint = `${API_BASE_URL}/i9form/add/citizenshipInformation`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/citizenshipInformation`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with citizenship information
    const requestBody: CitizenshipRequest = {
      citizenship_status: formData.citizenship_status,
      uscis_number: "",
      i_94_number: "",
      foreign_passport_number: "",
      foreign_passport_issuing_country: "",
    };

    // Including additional properties in request body
    Object.keys(formData).forEach((property) => {
      if (
        property in formData &&
        formData[property as keyof CitizenshipRequest]
      ) {
        requestBody[property as keyof CitizenshipRequest] =
          formData[property as keyof CitizenshipRequest]!;
      }
    });

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

// Function to handle submission of I-9 Form with a single document
export const handleI9FormSingleDocumentSubmission = async (
  formData: DocumentAFormData, // Form data containing document information
  token: string, // User token
  fileUrl: string, // URL of the uploaded document
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
      endpoint = `${API_BASE_URL}/i9form/add/document`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/document`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    const requestBody = [
      removeEmptyStrings({
        title: formData.documentA, // Document title
        issuing_authority: formData.documentAIssuingAuthority, // Issuing authority
        document_number: formData.documentADocumentNumber ?? "", // Document number
        file_url: fileUrl, // URL of the uploaded document
        expiration_date: formData.documentAExpirationDate ?? null, // Expiration date
      }),
    ];

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify({ documentData: requestBody }),
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

export const handleI9PDFSubmission = async (
  token: string, // User token
  fileUrl: string, // URL of the uploaded document
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
      endpoint = `${API_BASE_URL}/i9form/upload/pdf`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/pdf`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with document information
    const requestBody = {
      i9_pdf_document_url: fileUrl,
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

// Function to handle submission of I-9 Form with multiple documents
export const handleI9FormMultipleDocumentSubmission = async (
  formData: DocumentBAndCFormData, // Form data containing document information
  token: string, // User token
  documentBFileUrl: string, // URL of the uploaded document B
  documentCFileUrl: string, // URL of the uploaded document C
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
      endpoint = `${API_BASE_URL}/i9form/add/document`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/document`; // PATCH endpoint
    } else {
      return {
        errorMessage: "Invalid request method, Please try again",
        status: false,
      }; // Invalid method
    }

    // Creating request body with document information
    const requestBody: any[] = [
      removeEmptyStrings({
        title: formData.documentB, // Document title for document B
        issuing_authority: formData.documentBIssuingAuthority, // Issuing authority for document B
        document_number: formData.documentBDocumentNumber ?? "", // Document number for document B
        file_url: documentBFileUrl, // URL of the uploaded document B
        expiration_date: formData.documentBExpirationDate ?? "", // Expiration date for document B
      }),
      removeEmptyStrings({
        title: formData.documentC, // Document title for document C
        issuing_authority: formData.documentCIssuingAuthority, // Issuing authority for document C
        document_number: formData.documentCDocumentNumber ?? "", // Document number for document C
        file_url: documentCFileUrl, // URL of the uploaded document C
        expiration_date: formData.documentCExpirationDate ?? "", // Expiration date for document C
      }),
    ];

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify({ documentData: requestBody }),
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

// Function to handle submission of I-9 Form signature
export const handleI9FormSignatureSubmission = async (
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
      endpoint = `${API_BASE_URL}/i9form/add/signature`; // POST endpoint
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/i9form/edit/signature`; // PATCH endpoint
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
