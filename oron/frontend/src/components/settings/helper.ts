"use client";

import { EditAccountFormData } from "./EditAccountDetails";
import { API_BASE_URL } from "@/constants";

export const updateUser = async (
  token: string,
  userData: EditAccountFormData
): Promise<boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) return false;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updatePassword = async (
  token: string,
  passwordData: {
    password: string;
    passwordNew: string;
  }
): Promise<boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) return false;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
