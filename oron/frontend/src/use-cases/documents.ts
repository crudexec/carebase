"use client";

import { API_BASE_URL } from "@/constants";
import { UserDocument } from "@/types/Documents";

export const fetchUserDocuments = async (
  token: string
): Promise<UserDocument> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users/retrieve/documents`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error("An error occurred when fetching documents");
    }

    const data = await response.json();
    return data as UserDocument;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveHandbook = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/handbook/retrieve/`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error);
    return false;
  }
};
