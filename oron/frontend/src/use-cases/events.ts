"use client";

import { API_BASE_URL } from "@/constants";
import {
  AllClientsIntake,
  AllEmployeesForSchedule,
  AllEvents,
  SingleEvent,
  FilteredEvent,
  ClientSchedule,
  AllRequests,
  TreatmentPlan,
} from "@/types/Events";

export const retrieveAllClientsIntake = async (
  token: string
): Promise<AllClientsIntake> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/fetch-all-clients-intake`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveAllEmployeesForSchedule = async (
  token: string
): Promise<AllEmployeesForSchedule> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/fetch-all-employees-for-schedule`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveAllEvents = async (token: string): Promise<AllEvents> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/retrieve-all-events-schedule`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveEventById = async (
  token: string,
  eventId: string
): Promise<SingleEvent> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/retrieve-single-event-schedule`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const filterAndRetrieveEvent = async (
  token: string,
  employeeName?: string,
  clientName?: string
): Promise<FilteredEvent> => {
  try {
    const data: any = {
      employee_or_staff_name: employeeName,
      client_name: clientName,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/filter-calendar-events-schedule`,
      {
        method: "GET",
        headers: headers,
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveClientTreatmentPlanPlanSchedule = async (
  token: string,
  clientId: string
): Promise<ClientSchedule[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/treatment/${clientId}/retrieve`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    const schedule = (await response.json())?.data?.treatmentSchedule;

    return schedule;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveAllRequests = async (
  token: string
): Promise<AllRequests> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/retrieve-event-reschedule`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const retrieveEmployeeEvents = async (
  token: string
): Promise<AllEvents> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${API_BASE_URL}/events/retrieve-employee-schedule`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Invalid response status: " + response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
