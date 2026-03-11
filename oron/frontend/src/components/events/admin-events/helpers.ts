import {
  AllClientsIntake,
  AllEmployeesForSchedule,
  AllEvents,
  AllRequests,
  ClientSchedule,
} from "@/types/Events";
import { DraftEvent, Event, RequestType } from "./types";
import moment from "moment";
import {
  convertTimeFormat,
  formatTimeString,
  getDayOfWeekIndex,
  getFirstDayOfWeekInRange,
  parseFilteringEventTime,
} from "@/utils/date-utils";

export const formatClientTreatmentPlanDates = (
  clientTreatmentPlanSchedule: ClientSchedule[]
): Date[] => {
  const datesSet = new Set<Date>();

  const clientSchedule = clientTreatmentPlanSchedule[0];
  const startDate = moment(clientSchedule.start_date);
  const endDate = moment(clientSchedule.end_date);

  clientSchedule.time_slot.forEach((slot) => {
    if (slot.checked) {
      const dayOfWeekIndex = getDayOfWeekIndex(slot.day_of_week);
      let currentDay = getFirstDayOfWeekInRange(
        startDate,
        endDate,
        dayOfWeekIndex
      );

      if (currentDay) {
        datesSet.add(currentDay.toDate());

        while (currentDay.isBefore(endDate)) {
          currentDay.add(7, "days");
          if (
            currentDay.isBefore(endDate) ||
            currentDay.isSame(endDate, "day")
          ) {
            datesSet.add(currentDay.toDate());
          }
        }
      }
    }
  });

  return Array.from(datesSet);
};

export const getSpecialStartTimes = (
  clientTreatmentPlanSchedule: ClientSchedule[],
  dateOfEvent: Date
): string[] => {
  const startTimes: string[] = [];

  const availableDates = formatClientTreatmentPlanDates(
    clientTreatmentPlanSchedule
  ).filter((date) => moment(date).isValid()); // Convert Date to moment for validation

  if (!availableDates.length) return startTimes;

  const eventDateMoment = moment(dateOfEvent);
  const isEventDateIncluded = availableDates.some(
    (date) => moment(date).isSame(eventDateMoment, "day") // Convert Date to moment for comparison
  );

  if (!isEventDateIncluded) return startTimes;

  const selectedDayOfWeek = eventDateMoment.format("dddd");

  clientTreatmentPlanSchedule.forEach((schedule) => {
    schedule.time_slot.forEach((slot) => {
      if (slot.checked && slot.day_of_week === selectedDayOfWeek) {
        startTimes.push(convertTimeFormat(slot.start_time));
      }
    });
  });

  return startTimes;
};

export const getSpecialEndTimes = (
  clientTreatmentPlanSchedule: ClientSchedule[],
  dateOfEvent: Date
): string[] => {
  const endTimes: string[] = [];

  const availableDates = formatClientTreatmentPlanDates(
    clientTreatmentPlanSchedule
  ).filter((date) => moment(date).isValid()); // Convert Date to moment for validation

  if (!availableDates.length) return endTimes;

  const eventDateMoment = moment(dateOfEvent);
  const isEventDateIncluded = availableDates.some(
    (date) => moment(date).isSame(eventDateMoment, "day") // Convert Date to moment for comparison
  );

  if (!isEventDateIncluded) return endTimes;

  const selectedDayOfWeek = eventDateMoment.format("dddd");

  clientTreatmentPlanSchedule.forEach((schedule) => {
    schedule.time_slot.forEach((slot) => {
      if (slot.checked && slot.day_of_week === selectedDayOfWeek) {
        endTimes.push(convertTimeFormat(slot.end_time));
      }
    });
  });

  return endTimes;
};

export const formatStaffField = (
  allEmployees: AllEmployeesForSchedule
): {
  label: string;
  value: string;
}[] => {
  return allEmployees.data
    .map((employee) => ({
      label: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const formatClientField = (
  allClients: AllClientsIntake
): {
  label: string;
  value: string;
}[] => {
  return allClients.data
    .filter((client) => client.treatment_plan_exists === true)
    .map((client) => ({
      label: `${client.first_name} ${client.last_name}`,
      value: client.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const formatEvent = (allEvents: AllEvents): Event[] => {
  const excludedEventIds = [
    "1e0b3e40-85bf-4f2b-ab46-ed5134ebb32e",
    "bc3d451e-7bbe-433b-b0a3-bd3b78ecb1a7",
  ];

  const eventsData: Event[] = allEvents.data
    .filter((event) => !excludedEventIds.includes(event.id))
    .map((event) => {
      const eventDate = moment(event.event_date);

      const eventStartDateTime = moment(event.start_time, "h:mma").set({
        year: eventDate.year(),
        month: eventDate.month(),
        date: eventDate.date(),
      });

      const eventEndDateTime = moment(event.end_time, "h:mma").set({
        year: eventDate.year(),
        month: eventDate.month(),
        date: eventDate.date(),
      });

      return {
        id: event.id,
        date: eventDate.toDate(),
        start: eventStartDateTime.format(),
        end: eventEndDateTime.format(),
        staff: event.employee_or_staff_name,
        client: event.client_name,
        notes: event.notes,
        content: {
          start: formatTimeString(event.start_time),
          end: formatTimeString(event.end_time),
        },
        original: {
          start: event.start_time,
          end: event.end_time,
          clientId: event.client_intake_id,
          staffId: event.employee_or_staff_id,
          was_rescheduled: event.was_rescheduled,
          from_treatment_plan: false,
          event_approved: event?.event_approved,
        },
      };
    });

  return eventsData;
};

export const formatTreatmentPlanEvent = (
  retrievedSchedule: ClientSchedule[],
  clientName?: string,
  clientId?: string
) => {
  const clientSchedule = retrievedSchedule[0];
  const startDate = moment(clientSchedule.start_date);
  const endDate = moment(clientSchedule.end_date);

  const newEvents = clientSchedule.time_slot.reduce((acc, slot) => {
    if (slot.checked) {
      const dayOfWeekIndex = getDayOfWeekIndex(slot.day_of_week);
      let currentDay = getFirstDayOfWeekInRange(
        startDate,
        endDate,
        dayOfWeekIndex
      )!;

      while (currentDay.isSameOrBefore(endDate)) {
        const startTime = parseFilteringEventTime(slot.start_time);
        const endTime = parseFilteringEventTime(slot.end_time);

        const startDateTime = moment(currentDay).set({
          hour: startTime.hours,
          minute: startTime.minutes,
        });

        const endDateTime = moment(currentDay).set({
          hour: endTime.hours,
          minute: endTime.minutes,
        });

        const newEvent = {
          id: Math.random().toString(),
          date: currentDay.toDate(),
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          staff: "",
          client: clientName ?? "",
          notes: "",
          content: {
            start: startDateTime.format("h:mma"),
            end: endDateTime.format("h:mma"),
          },
          original: {
            start: startDateTime.format("h:mma").toLowerCase(),
            end: endDateTime.format("h:mma").toLowerCase(),
            clientId: clientId ?? "",
            staffId: "",
            was_rescheduled: false,
            from_treatment_plan: true,
          },
        };

        acc.push(newEvent);

        // Move to the next occurrence of the day of the week
        currentDay = currentDay.add(7, "days");
      }
    }
    return acc;
  }, [] as Event[]);

  return newEvents;
};

export const formatClientFilteringSchedule = (
  retrievedSchedule: ClientSchedule[],
  eventsData: Event[],
  clientName?: string,
  clientId?: string
): Event[] => {
  const clientSchedule = retrievedSchedule[0];
  const startDate = moment(clientSchedule.start_date);
  const endDate = moment(clientSchedule.end_date);

  const newEvents = clientSchedule.time_slot.reduce((acc, slot) => {
    if (slot.checked) {
      const dayOfWeekIndex = getDayOfWeekIndex(slot.day_of_week);
      let currentDay = getFirstDayOfWeekInRange(
        startDate,
        endDate,
        dayOfWeekIndex
      )!;

      while (currentDay.isSameOrBefore(endDate)) {
        const startTime = parseFilteringEventTime(slot.start_time);
        const endTime = parseFilteringEventTime(slot.end_time);

        const startDateTime = moment(currentDay).set({
          hour: startTime.hours,
          minute: startTime.minutes,
        });

        const endDateTime = moment(currentDay).set({
          hour: endTime.hours,
          minute: endTime.minutes,
        });

        const newEvent = {
          id: Math.random().toString(),
          date: currentDay.toDate(),
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          staff: "",
          client: clientName ?? "",
          notes: "",
          content: {
            start: startDateTime.format("h:mma"),
            end: endDateTime.format("h:mma"),
          },
          original: {
            start: startDateTime.format("h:mma").toLowerCase(),
            end: endDateTime.format("h:mma").toLowerCase(),
            clientId: clientId ?? "",
            staffId: "",
            was_rescheduled: false,
            from_treatment_plan: true,
          },
        };

        const isDuplicate = eventsData.some(
          (event) =>
            moment(event.date).isSame(newEvent.date, "day") &&
            event.original.start === newEvent.original.start &&
            event.original.end === newEvent.original.end &&
            event.original.clientId === newEvent.original.clientId
        );

        if (!isDuplicate) {
          acc.push(newEvent);
        }

        // Move to the next occurrence of the day of the week
        currentDay = currentDay.add(7, "days");
      }
    }
    return acc;
  }, [] as Event[]);

  return newEvents;
};

export const formatDraftEvent = (
  startTime: string,
  endTime: string,
  dateOfEvent: Date,
  rawData: {
    allClients: AllClientsIntake | undefined;
    allEmployees: AllEmployeesForSchedule | undefined;
  },
  client: string,
  staff: string,
  notes: string
): DraftEvent => {
  const { allClients, allEmployees } = rawData;

  const startDateTime = moment(dateOfEvent).set(
    parseFilteringEventTime(startTime)
  );
  const endDateTime = moment(dateOfEvent).set(parseFilteringEventTime(endTime));

  const clientData = allClients?.data?.find((item) => item.id === client);
  const staffData = allEmployees?.data?.find((item) => item.id === staff);

  const newEvent: DraftEvent = {
    id: Math.random().toString(),
    date: moment(dateOfEvent).toDate(),
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
    staff: `${staffData?.first_name} ${staffData?.last_name}`,
    client: `${clientData?.first_name} ${clientData?.last_name}`,
    notes: notes,
    content: {
      start: startDateTime.format("h:mma"),
      end: endDateTime.format("h:mma"),
    },
  };

  return newEvent;
};

export const formatTime = (time?: string) => {
  return time?.replace(/\s+/g, "").toLowerCase() ?? "";
};

export const formatRequest = (allRequests: AllRequests): RequestType[] => {
  const requestData: RequestType[] = allRequests.data.map((request) => {
    return {
      requestId: request.id,
      eventId: request?.events?.id ?? "-",
      staffName: request?.events?.employee_or_staff_name ?? "-",
      clientName: request?.events?.client_name ?? "-",
      currentEventDate: request?.events
        ? moment(request?.events?.event_date).toDate()
        : moment().toDate(),
      currentEventTime: request?.events?.start_time ?? "-",
      proposedEventDate: moment(request.new_rescheduled_event_date).toDate(),
      proposedEventTime: request?.start_time ?? "-",
      proposedEventEndTime: request?.end_time ?? "-",
      reason: request.reason_for_rescheduling,
    };
  });

  return requestData;
};

/*
The purpose of replaceEventsWithEmptyStaffId is to ensure that the events list is updated with any new or modified event data from eventsData, particularly for events that previously lacked a staffId. If a matching event is found in eventsData for an event in prevEvents that has an empty staffId, the prevEvent is replaced with the matching event from eventsData.
*/
export const replaceEventsWithEmptyStaffId = (
  prevEvents: Event[],
  eventsData: Event[]
): Event[] => {
  return prevEvents.map((prevEvent) => {
    // 1) Check if the event has an empty staffId (either null or an empty string)
    const hasEmptyStaffId =
      !prevEvent.original.staffId || prevEvent.original.staffId.length === 0;

    // 2) If the event has an empty staffId, try to find a matching event in eventsData by comparing date, start, end, and clientId
    if (hasEmptyStaffId) {
      const matchingEvent = eventsData.find(
        (event) =>
          moment(event.date)
            .startOf("day")
            .isSame(moment(prevEvent.date).startOf("day")) &&
          event.original.start === prevEvent.original.start &&
          event.original.end === prevEvent.original.end &&
          event.original.clientId === prevEvent.original.clientId
      );

      // 3) If a matching event is found, replace the prevEvent with the matching event from eventsData
      if (matchingEvent) {
        return matchingEvent;
      }
    }

    // 4) If no matching event is found or the staffId is not empty, return the original event unchanged
    return prevEvent;
  });
};

/*
The purpose of replaceEventsWithStaffId is to ensure that events with assigned staffId are updated with any changes that might have occurred in the eventsData. If a matching event is found in eventsData for an event in prevEvents, the prevEvent is replaced with the matching event from eventsData. Otherwise, the existing event is kept unchanged.
*/
export const replaceEventsWithStaffId = (
  replacedEvents: Event[],
  eventsData: Event[]
): Event[] => {
  return replacedEvents.map((prevEvent) => {
    // 1) Check if the event has a non-empty staffId (assigned to a staff member)
    if (prevEvent.original.staffId && prevEvent.original.staffId.length > 0) {
      // 2) Try to find a matching event in eventsData by comparing the event id
      const matchingEvent = eventsData.find(
        (event) => event.id === prevEvent.id
      );

      // 3) If a matching event is found, replace the prevEvent with the matching event from eventsData
      return matchingEvent || prevEvent;
    }

    // 4) If the event doesn't have a staffId, return it unchanged
    return prevEvent;
  });
};

/*
The purpose of addNewEvents is to ensure that any new events introduced in eventsData—which were not part of prevEvents—are added to the final list of events. It filters out events in eventsData that already exist in replacedEventsWithStaffId and adds the remaining new events to the list.
*/
export const addNewEvents = (
  replacedEventsWithStaffId: Event[],
  eventsData: Event[]
): Event[] => {
  // 1) Filter events in eventsData that do not exist in replacedEventsWithStaffId
  return eventsData.filter((event) => {
    return !replacedEventsWithStaffId.some(
      (prevEvent) =>
        prevEvent.id === event.id ||
        (moment(prevEvent.date)
          .startOf("day")
          .isSame(moment(event.date).startOf("day")) &&
          prevEvent.start === event.start &&
          prevEvent.end === event.end &&
          prevEvent.original.clientId === event.original.clientId &&
          prevEvent.original.staffId === event.original.staffId)
    );
  });
};

/*
The purpose of filterPrevEvents is twofold:

1. Remove Events: This function removes any events that were previously associated with a non-empty staffId but no longer exist in eventsData. It helps ensure that outdated events that no longer exist in the latest data are removed from the final list.

2. Handle Unscheduled Events: If an event has a non-empty staffId but no longer exists in eventsData, it checks the treatmentPlanEvents. If the event exists in the treatment plan, it resets the event's staffId and staff fields to empty strings (returning it to an unscheduled state). If the event doesn't exist in treatmentPlanEvents, it is removed from the final list.
*/
export const filterPrevEvents = (
  replacedEventsWithStaffId: Event[],
  eventsData: Event[],
  treatmentPlanEvents: Event[]
): Event[] => {
  return (
    replacedEventsWithStaffId
      .map((prevEvent) => {
        // 1) Check if the event has a non-empty staffId (i.e., the event is associated with a staff member)
        if (
          prevEvent.original.staffId &&
          prevEvent.original.staffId.length > 0
        ) {
          // 2) Check if the event still exists in eventsData (based on event id)
          const existsInEventsData = eventsData.some(
            (event) => event.id === prevEvent.id
          );

          // 3) If the event doesn't exist in eventsData, check the treatmentPlanEvents for a match based on date, start, end, and clientId
          if (!existsInEventsData) {
            const eventAnUnscheduledEvent = treatmentPlanEvents.find(
              (event) =>
                moment(event.date)
                  .startOf("day")
                  .isSame(moment(prevEvent.date).startOf("day")) &&
                event.original.start === prevEvent.original.start &&
                event.original.end === prevEvent.original.end &&
                event.original.clientId === prevEvent.original.clientId
            );

            // 4) If the event exists in the treatment plan, reset its staffId and staff to empty strings
            if (eventAnUnscheduledEvent) {
              return {
                ...prevEvent,
                staff: "",
                original: {
                  ...prevEvent.original,
                  staffId: "",
                },
              };
            }

            // 5) If the event is not part of the treatment plan, return null to remove it from the final list
            return null;
          }
        }

        // 6) If the event exists in eventsData or has an empty staffId, keep it unchanged
        return prevEvent;
      })
      // 7) Filter out any null values to ensure only valid events are returned
      .filter((event): event is Event => event !== null)
  );
};
