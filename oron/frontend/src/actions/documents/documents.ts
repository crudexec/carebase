"use client";

import { API_BASE_URL } from "@/constants";

export const handleUserDocumentSubmission = async (
  document_url: string,
  document_title: string,
  token: string,
  method: "POST" | "PATCH",
  documentId?: string
): Promise<boolean> => {
  try {
    let endpoint: string;

    if (method === "POST") {
      endpoint = `${API_BASE_URL}/users/upload/document`;
    } else if (method === "PATCH") {
      endpoint = `${API_BASE_URL}/users/${documentId}/edit/document`;
    } else {
      return false;
    }

    const requestBody = {
      document_url,
      document_title,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) return false;

    return true;
  } catch (error) {
    return false;
  }
};
