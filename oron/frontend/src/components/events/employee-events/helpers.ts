import { AllEvents } from "@/types/Events";
import { EmployeeEventType } from "./types";
import { formatTimeString } from "@/utils/date-utils";
import { format, parse } from "date-fns";

export const formatEmployeeEvents = (
  allEvents: AllEvents
): EmployeeEventType[] => {
  const excludedEventIds = [
    "1e0b3e40-85bf-4f2b-ab46-ed5134ebb32e",
    "bc3d451e-7bbe-433b-b0a3-bd3b78ecb1a7",
  ];

  const eventsData: EmployeeEventType[] = allEvents.data
    .filter((event) => !excludedEventIds.includes(event.id))
    .map((event) => {
      const eventDate = new Date(event.event_date);

      const eventStartDateTime = parse(event.start_time, "h:mma", eventDate);
      const eventEndDateTime = parse(event.end_time, "h:mma", eventDate);

      return {
        id: event.id,
        date: eventDate,
        start: format(eventStartDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        end: format(eventEndDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        staff: event.employee_or_staff_name,
        client: event.client_name,
        notes: event.notes,
        clientId: event.client_intake_id,
        wasRescheduled: event.was_rescheduled,
        event_approved: event?.event_approved,
        content: {
          start: formatTimeString(event.start_time),
          end: formatTimeString(event.end_time),
        },
      };
    });

  return eventsData;
};

export const getClosestFutureEvent = (
  allEvents: AllEvents
): EmployeeEventType | null => {
  const currentDate = new Date(); // Get the current date and time

  // Filter out past events (consider both date and time)
  const futureEvents = allEvents.data.filter((event) => {
    const eventDate = new Date(event.event_date); // Parse the ISO date
    const eventStartDateTime = parse(event.start_time, "h:mma", eventDate); // Combine event date and start time
    return eventStartDateTime >= currentDate; // Only keep events in the future (or later today)
  });

  // If no future events, return null
  if (futureEvents.length === 0) {
    return null;
  }

  // Sort future events by the closest date and time
  futureEvents.sort((a, b) => {
    const eventDateA = new Date(a.event_date); // Parse the ISO date
    const eventStartTimeA = parse(a.start_time, "h:mma", eventDateA); // Combine event date and start time

    const eventDateB = new Date(b.event_date); // Parse the ISO date
    const eventStartTimeB = parse(b.start_time, "h:mma", eventDateB); // Combine event date and start time

    return eventStartTimeA.getTime() - eventStartTimeB.getTime(); // Sort by both date and time
  });

  const closestEvent = futureEvents[0]; // Get the closest future event

  const eventDate = new Date(closestEvent.event_date); // Parse closest event's date
  const eventStartDateTime = parse(closestEvent.start_time, "h:mma", eventDate); // Combine date and start time
  const eventEndDateTime = parse(closestEvent.end_time, "h:mma", eventDate); // Combine date and end time

  const formattedFutureEvent = {
    id: closestEvent.id,
    date: eventDate,
    start: format(eventStartDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    end: format(eventEndDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    staff: closestEvent.employee_or_staff_name,
    client: closestEvent.client_name,
    notes: closestEvent.notes,
    clientId: closestEvent.client_intake_id,
    wasRescheduled: closestEvent.was_rescheduled,
    content: {
      start: format(eventStartDateTime, "h:mma"),
      end: format(eventEndDateTime, "h:mma"),
    },
  };

  // Return the closest event (first in the sorted array)
  return formattedFutureEvent;
};

export const getEventsDates = (allEvents: AllEvents): Date[] => {
  return allEvents.data.map((event) => new Date(event.event_date));
};
