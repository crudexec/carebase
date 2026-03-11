"use client";

import { API_BASE_URL } from "@/constants";
import { FormMutationResponse } from "@/types/GeneralTypes";
import { formatDateToUTCString } from "@/utils/date-utils";
import isOnline from "is-online";

type NewEventType = {
  client_intake_id: string;
  client_name: string;
  employee_or_staff_name: string;
  event_date: Date;
  start_time: string;
  end_time: string;
  notes: string;
  should_repeat: boolean;
  employee_or_staff_id: string;
};

type EditEventType = {
  event_schedule_id: string;
  client_name: string;
  employee_or_staff_name: string;
  event_date: Date;
  start_time: string;
  end_time: string;
  notes: string;
  should_repeat: boolean;
  employee_or_staff_id: string;
};

type RescheduleEventType = {
  event_schedule_id: string;
  new_rescheduled_event_date: Date;
  start_time: string;
  end_time: string;
  reason_for_rescheduling: string;
};

type DeclineEventType = {
  declination_reason: string;
  event_schedule_id: string;
};

type ApproveEventType = {
  event_schedule_id: string;
};

type DeleteEventSchedule = {
  event_schedule_id: string;
};

export const createNewEvent = async (
  token: string,
  data: NewEventType
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

    const eventDateUTC = formatDateToUTCString(data.event_date);

    const response = await fetch(`${API_BASE_URL}/events/add-event-schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, event_date: eventDateUTC }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};

export const editEvent = async (
  token: string,
  data: EditEventType
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

    const eventDateUTC = formatDateToUTCString(data.event_date);

    const response = await fetch(`${API_BASE_URL}/events/edit-event-schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, event_date: eventDateUTC }),
    });

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};

export const rescheduleEvent = async (
  token: string,
  data: RescheduleEventType
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

    const eventDateUTC = formatDateToUTCString(data.new_rescheduled_event_date);

    const response = await fetch(
      `${API_BASE_URL}/events/reschedule-event-schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          new_rescheduled_event_date: eventDateUTC,
        }),
      }
    );

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};

export const declineEventSchedule = async (
  token: string,
  data: DeclineEventType
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

    const response = await fetch(
      `${API_BASE_URL}/events/decline-event-schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};

export const approveEventSchedule = async (
  token: string,
  data: ApproveEventType
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

    const response = await fetch(
      `${API_BASE_URL}/events/accept-event-reschedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};

export const deleteEventSchedule = async (
  token: string,
  data: DeleteEventSchedule
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

    const response = await fetch(
      `${API_BASE_URL}/events/delete-event-schedule`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return {
        status: false,
        errorMessage: "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (error: any) {
    return {
      status: false,
      errorMessage:
        error?.response?.data?.errorMessage ??
        "A network error occurred! Try again",
    };
  }
};
