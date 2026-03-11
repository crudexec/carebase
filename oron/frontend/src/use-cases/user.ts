"use client";

import { API_BASE_URL } from "@/constants";
import { User } from "@/types/UserTypes";

export const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const user = await response.json();
    return user;
  } catch (error: any) {
    console.error(error);
    throw new Error("Failed to fetch user profile");
  }
};

export const validateUserProfile = async (
  token: string
): Promise<User | boolean> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      return false;
    }

    const user = await response.json();

    if (!user) {
      return false;
    }

    return user;
  } catch (error: any) {
    console.error(error);
    return false;
  }
};
