"use client";

import { API_BASE_URL } from "@/constants";
import { formatDateToUTCString } from "@/utils/date-utils";

export const handleHandbookAgreement = async (
  token: string,
  employee_first_name: string,
  employee_last_name: string,
  employee_email: string,
  document_url: string
): Promise<boolean> => {
  try {
    const requestBody = {
      employee_first_name,
      employee_last_name,
      employee_email,
      document_url,
      date_of_agreement: formatDateToUTCString(new Date()),
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/handbook/agree`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) return false;

    return true;
  } catch (error) {
    return false;
  }
};
