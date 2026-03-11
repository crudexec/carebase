"use client";

import { API_BASE_URL } from "@/constants";

export const handleDocumentUpload = async (
  file: FormData,
  token?: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fileUrl = data.data as string;

    return fileUrl;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Document upload failed");
  }
};
