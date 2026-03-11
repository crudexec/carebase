"use client";

import { API_BASE_URL } from "@/constants";

export const approveForm = async (
  token: string,
  formId: string,
  formName: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/${formId}/${formName}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const approveI9Form = async (
  token: string,
  formId: string,
  filled_pdf_json_data: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/${formId}/i9form`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filled_pdf_json_data }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const approveDocument = async (
  token: string,
  documentId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/${documentId}/user/document`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};
