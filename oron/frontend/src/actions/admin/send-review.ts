"use client";

import { API_BASE_URL } from "@/constants";

export const sendReview = async (
  token: string,
  formName: string,
  formId: string,
  review_notes: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/${formId}/review/${formName}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review_notes }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const sendDocumentReview = async (
  token: string,
  documentId: string,
  review_notes: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/approveform/${documentId}/user/review/document`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review_notes }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};
