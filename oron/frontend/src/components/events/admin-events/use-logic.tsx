"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  retrieveAllEvents,
  retrieveAllClientsIntake,
  retrieveAllEmployeesForSchedule,
  filterAndRetrieveEvent,
  retrieveClientTreatmentPlanPlanSchedule,
  retrieveAllRequests,
} from "@/use-cases/events";
import {
  AllClientsIntake,
  AllEmployeesForSchedule,
  AllEvents,
  AllRequests,
  ClientSchedule,
} from "@/types/Events";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { RequestType, Event, DraftEvent, FormErrors } from "./types";
import {
  createNewEvent,
  deleteEventSchedule,
  editEvent,
} from "@/actions/events/events";
import {
  formatClientTreatmentPlanDates,
  formatStaffField,
  formatClientField,
  formatEvent,
  formatClientFilteringSchedule,
  formatDraftEvent,
  formatTime,
  replaceEventsWithEmptyStaffId,
  replaceEventsWithStaffId,
  addNewEvents,
  filterPrevEvents,
  formatRequest,
  getSpecialStartTimes,
  getSpecialEndTimes,
  formatTreatmentPlanEvent,
} from "./helpers";
import { eventFormSchema } from "../schema";
import { generateTimeSlots, filterEndTimeOptions } from "@/utils/date-utils";

const useAdminEventsLogic = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") as string;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [dateOfEvent, setDateOfEvent] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [staff, setStaff] = useState("");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState("");
  const [deletingEventId, setDeletingEventId] = useState("");

  const [eventDateAlreadyScheduled, setEventDateAlreadyScheduled] =
    useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [treatmentPlanEvents, setTreatmentPlanEvents] = useState<Event[]>([]);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [currentEvent, setCurrentEvent] = useState<DraftEvent>();
  const [scheduleEventStep, setScheduleEventStep] = useState(1);

  const [clients, setClients] = useState<{ label: string; value: string }[]>(
    []
  );
  const [staffs, setStaffs] = useState<{ label: string; value: string }[]>([]);

  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [scheduleEventLoading, setScheduleEventLoading] = useState(false);
  const [filterEventLoading, setFilterEventLoading] = useState(false);

  const [filterEnabled, setFilterEnabled] = useState(false);
  const [filterValues, setFilterValues] = useState({
    clientId: "",
    staffId: "",
  });

  const [clientTreatmentPlanDates, setClientTreatmentPlanDates] =
    useState<Date[]>();
  const [specialStartTime, setSpecialStartTime] = useState<string[]>([]);
  const [specialEndTime, setSpecialEndTime] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});

  const {
    data: allEvents,
    isLoading: allEventsLoading,
    refetch: refetchAllEvents,
  } = useQuery<AllEvents>({
    queryKey: ["allEvents"],
    queryFn: async () => await retrieveAllEvents(token),
  });
  const { data: allClients, isLoading: allClientsLoading } =
    useQuery<AllClientsIntake>({
      queryKey: ["allClients"],
      queryFn: async () => await retrieveAllClientsIntake(token),
    });
  const { data: allEmployees, isLoading: allEmployeesLoading } =
    useQuery<AllEmployeesForSchedule>({
      queryKey: ["allEmployees"],
      queryFn: async () => await retrieveAllEmployeesForSchedule(token),
    });
  const {
    data: clientTreatmentPlanSchedule,
    isLoading: clientTreatmentPlanLoadingSchedule,
  } = useQuery<ClientSchedule[]>({
    queryKey: ["clientTreatmentPlanSchedule", client],
    queryFn: async () =>
      await retrieveClientTreatmentPlanPlanSchedule(token, client),
    enabled: client.length > 0,
  });

  const {
    data: allRequests,
    isLoading: allRequestsLoading,
    refetch: refetchAllRequests,
  } = useQuery<AllRequests>({
    queryKey: ["allRequests"],
    queryFn: async () => await retrieveAllRequests(token),
  });

  useEffect(() => {
    setClient(filterValues.clientId);
    setStaff(filterValues.staffId);
  }, [filterValues.clientId, filterValues.staffId]);

  const clearAllInputs = useCallback(() => {
    setDateOfEvent(undefined);
    setStartTime("");
    setEndTime("");
    setStaff("");
    setNotes("");
    setClient("");
    setIsEditing(false);
  }, [
    setDateOfEvent,
    setStartTime,
    setEndTime,
    setStaff,
    setNotes,
    setClient,
    setIsEditing,
  ]);

  useEffect(() => {
    if (modalIsOpen === false) {
      clearAllInputs();
      setScheduleEventStep(1);
      setEventDateAlreadyScheduled(false);
    }
  }, [modalIsOpen, clearAllInputs]);

  useEffect(() => {
    setClientTreatmentPlanDates([]);

    if (clientTreatmentPlanSchedule && clientTreatmentPlanSchedule.length > 0) {
      const scheduleDates = formatClientTreatmentPlanDates(
        clientTreatmentPlanSchedule
      );
      setClientTreatmentPlanDates(scheduleDates);
    }
  }, [clientTreatmentPlanSchedule]);

  useEffect(() => {
    setSpecialStartTime([]);
    setSpecialEndTime([]);

    if (
      clientTreatmentPlanSchedule &&
      clientTreatmentPlanSchedule.length > 0 &&
      dateOfEvent
    ) {
      const specialStartTimes = getSpecialStartTimes(
        clientTreatmentPlanSchedule,
        dateOfEvent
      );
      const specialEndTimes = getSpecialEndTimes(
        clientTreatmentPlanSchedule,
        dateOfEvent
      );

      setSpecialStartTime(specialStartTimes);
      setSpecialEndTime(specialEndTimes);
    }
  }, [clientTreatmentPlanSchedule, dateOfEvent]);

  useEffect(() => {
    if (allEmployees && Array.isArray(allEmployees.data)) {
      if (allEmployees.data.length > 0) {
        const staffFields = formatStaffField(allEmployees);
        setStaffs(staffFields);
      } else {
        setStaffs([]);
      }
    }
  }, [allEmployees]);

  useEffect(() => {
    if (allClients && Array.isArray(allClients.data)) {
      if (allClients.data.length > 0) {
        const clientFields = formatClientField(allClients);
        setClients(clientFields);
      } else {
        setClients([]);
      }
    }
  }, [allClients]);

  useEffect(() => {
    if (allRequests && Array.isArray(allRequests.data)) {
      if (allRequests.data.length > 0) {
        const requestData: RequestType[] = formatRequest(allRequests);
        setRequests(requestData);
      } else {
        setRequests([]);
      }
    }
  }, [allRequests]);

  useEffect(() => {
    if (allEvents && Array.isArray(allEvents.data)) {
      if (allEvents.data.length > 0) {
        const eventsData = formatEvent(allEvents);

        if (filterEnabled) {
          setEvents((prevEvents) => {
            // Step 1: Replace events with empty staffId
            const replacedEvents = replaceEventsWithEmptyStaffId(
              prevEvents,
              eventsData
            );

            // Step 2: Replace events with non-empty staffId:  Handles replacing events where staffId is not null.
            const replacedEventsWithStaffId = replaceEventsWithStaffId(
              replacedEvents,
              eventsData
            );

            // Step 3: Add new events: Adds new events that are not already in "replacedEventsWithStaffId"
            const newEvents = addNewEvents(
              replacedEventsWithStaffId,
              eventsData
            );

            // Step 4: Filter previous events
            const filteredPrevEvents = filterPrevEvents(
              replacedEventsWithStaffId,
              eventsData,
              treatmentPlanEvents
            );

            const transformedData = [
              ...filteredPrevEvents,
              ...newEvents.filter((event) => {
                const hasClientId = !!filterValues.clientId;
                const hasStaffId = !!filterValues.staffId;

                if (hasClientId && hasStaffId) {
                  // Filter by both clientId and staffId
                  return (
                    event.original.clientId === filterValues.clientId &&
                    event.original.staffId === filterValues.staffId
                  );
                } else if (hasClientId) {
                  // Filter only by clientId
                  return event.original.clientId === filterValues.clientId;
                } else if (hasStaffId) {
                  // Filter only by staffId
                  return event.original.staffId === filterValues.staffId;
                } else {
                  // If neither exists, include all events
                  return true;
                }
              }),
            ];

            let finalData = transformedData;

            if (
              filterValues.clientId.length > 0 &&
              filterValues.staffId.length > 0
            ) {
              finalData = transformedData;
            } else if (
              filterValues.clientId.length > 0 &&
              filterValues.staffId.length < 1
            ) {
              finalData = transformedData.filter(
                (item) => item.original.clientId === filterValues.clientId
              );
            } else if (
              filterValues.clientId.length < 1 &&
              filterValues.staffId.length > 0
            ) {
              finalData = transformedData.filter(
                (item) => item.original.staffId === filterValues.staffId
              );
            }

            return finalData;
          });
        } else {
          setEvents(eventsData);
        }
      } else {
        setEvents([]);
      }
    }
  }, [
    allEvents,
    filterEnabled,
    filterValues,
    deletingEventId,
    treatmentPlanEvents,
  ]);

  const timeOptions = useMemo(() => generateTimeSlots(), []);

  const handleStartTimeChange = useCallback(
    (value: string) => {
      setStartTime(value);
      setErrors((prev) => ({ ...prev, startTime: "" }));
    },
    [setStartTime]
  );

  const handleEndTimeChange = useCallback(
    (value: string) => {
      setEndTime(value);
      setErrors((prev) => ({ ...prev, endTime: "" }));
    },
    [setEndTime]
  );

  const editExistingSchedule = useCallback(
    async (clientName: string, staffName: string) => {
      try {
        const editResponse = await editEvent(token, {
          event_schedule_id: editingEventId,
          client_name: clientName,
          employee_or_staff_name: staffName,
          event_date: dateOfEvent!,
          start_time: startTime,
          end_time: endTime,
          notes,
          should_repeat: false,
          employee_or_staff_id: staff,
        });

        setScheduleEventLoading(false);
        refetchAllEvents();
        queryClient.invalidateQueries({
          queryKey: ["employeeEvents"],
        });

        if (!editResponse.status) {
          toast({
            variant: "destructive",
            description: editResponse.errorMessage,
          });
          return;
        }

        setIsEditing(false);
        clearAllInputs();
        setScheduleEventStep(1);
        setCurrentEvent(undefined);
        setModalIsOpen(false);

        toast({
          variant: "default",
          title: "Schedule Updated",
          description:
            "Schedule updated successfully. Staff has been notified by email.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          description: "An error occurred while updating the schedule.",
        });
      } finally {
        setScheduleEventLoading(false);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      token,
      editingEventId,
      dateOfEvent,
      startTime,
      endTime,
      notes,
      staff,
      refetchAllEvents,
    ]
  );

  const createNewSchedule = useCallback(async () => {
    try {
      setEventDateAlreadyScheduled(false);
      setScheduleEventLoading(true);

      const clientData = allClients?.data?.find((item) => item.id === client);
      const staffData = allEmployees?.data?.find((item) => item.id === staff);

      const clientName = `${clientData?.first_name ?? ""} ${
        clientData?.last_name ?? ""
      }`;
      const staffName = `${staffData?.first_name ?? ""} ${
        staffData?.last_name ?? ""
      }`;

      if (isEditing) {
        await editExistingSchedule(clientName, staffName);
        return;
      }

      const response = await createNewEvent(token, {
        client_intake_id: client,
        client_name: clientName,
        employee_or_staff_name: staffName,
        event_date: dateOfEvent!,
        start_time: startTime,
        end_time: endTime,
        notes,
        should_repeat: false,
        employee_or_staff_id: staff,
      });

      refetchAllEvents();
      queryClient.invalidateQueries({
        queryKey: ["employeeEvents"],
      });

      if (
        response.errorMessage ===
        "Event already scheduled for this date and time slot"
      ) {
        setEventDateAlreadyScheduled(true);
      }

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      clearAllInputs();
      setScheduleEventStep(1);
      setCurrentEvent(undefined);
      setModalIsOpen(false);

      toast({
        variant: "default",
        title: "Event Scheduled Successfully",
        description:
          "The event has been successfully scheduled, and a notification has been sent to the staff.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "An error occurred while scheduling the event.",
      });
    } finally {
      setScheduleEventLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    client,
    staff,
    dateOfEvent,
    startTime,
    endTime,
    notes,
    isEditing,
    editExistingSchedule,
    refetchAllEvents,
    allClients,
    allEmployees,
  ]);

  const handleDeleteEvent = useCallback((id: string) => {
    setDeletingEventId(id);
    setDeleteModalOpen(true);
  }, []);

  const handleEditEvent = useCallback(
    (id: string, staff?: string, client?: string) => {
      setIsEditing(true);
      setModalIsOpen(true);
      setEditingEventId(id);

      const event = events.find((event) => event.id === id);

      setStartTime(event?.original.start ?? "");
      setEndTime(event?.original.end ?? "");
      setDateOfEvent(new Date(event?.date!));
      setStaff(event?.original?.staffId ?? "");
      setNotes(event?.notes ?? "");
      setClient(event?.original?.clientId ?? "");
    },
    [events]
  );

  const handleEditUnscheduledEvent = useCallback(
    async (id: string, staff: string, notes: string): Promise<void> => {
      setScheduleEventLoading(true);

      const selectedEvent = events.find((event) => event.id === id) as Event;
      const staffData = allEmployees?.data?.find((item) => item.id === staff);

      try {
        const response = await createNewEvent(token, {
          client_intake_id: selectedEvent.original.clientId,
          client_name: selectedEvent.client,
          employee_or_staff_name: `${staffData?.first_name} ${staffData?.last_name}`,
          event_date: selectedEvent.date,
          start_time: selectedEvent.original.start,
          end_time: selectedEvent.original.end,
          notes: notes,
          should_repeat: false,
          employee_or_staff_id: staff,
        });

        setScheduleEventLoading(false);

        refetchAllEvents();
        queryClient.invalidateQueries({
          queryKey: ["allRequests", "employeeEvents"],
        });

        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
          });
          return;
        }

        toast({
          variant: "default",
          title: "Event Updated",
          description:
            "Event updated successfully. Staff has been notified by email.",
        });
      } catch (error: any) {
        throw new Error(error);
      } finally {
        setScheduleEventLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, allEmployees, token, refetchAllEvents]
  );

  const createNewScheduleFromCalendarCells = useCallback(
    (date: Date, time?: string, client?: string, staff?: string) => {
      const formattedTime = formatTime(time);

      setStartTime(formattedTime);
      setClient(client ?? "");
      setStaff(staff ?? "");
      setDateOfEvent(date);
      setModalIsOpen(true);
    },
    [setStartTime, setClient, setStaff, setDateOfEvent, setModalIsOpen]
  );

  const resetEvents = useCallback(() => {
    setFilterEnabled(false);

    if (allEvents?.data?.length) {
      const eventsData = formatEvent(allEvents);
      setEvents(eventsData);
    }
  }, [allEvents]);

  const applyFilters = async (
    eventsData: Event[],
    clientId: string | undefined,
    clientName: string | undefined
  ) => {
    if (clientId && clientName) {
      try {
        const retrievedSchedule = await retrieveClientTreatmentPlanPlanSchedule(
          token,
          clientId
        );

        if (retrievedSchedule.length > 0) {
          const formattedTreatmentPlanEvents = formatTreatmentPlanEvent(
            retrievedSchedule,
            clientName,
            clientId
          );

          setTreatmentPlanEvents(formattedTreatmentPlanEvents);

          const newEvents = formatClientFilteringSchedule(
            retrievedSchedule,
            eventsData,
            clientName,
            clientId
          );
          setEvents([...eventsData, ...newEvents]);
        } else {
          setEvents(eventsData);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          description: "Failed to retrieve client treatment plan schedule.",
        });
      }
    } else {
      setEvents(eventsData);
    }
  };

  const handleFilterEvents = useCallback(
    async (
      clientName?: string,
      employeeName?: string,
      clientId?: string,
      employeeId?: string
    ) => {
      try {
        setFilterEnabled(true);
        setFilterEventLoading(true);
        setFilterValues({
          clientId: clientId ?? "",
          staffId: employeeId ?? "",
        });

        const response = await filterAndRetrieveEvent(
          token,
          employeeName,
          clientName
        );
        const eventsData = formatEvent(response);

        await applyFilters(eventsData, clientId, clientName);
      } catch (error: any) {
        toast({
          variant: "destructive",
          description: "An error occurred while filtering events.",
        });
      } finally {
        setFilterEventLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const deleteEvent = useCallback(async () => {
    let undoClickCounter = 0;

    const handleUndo = async (eventDeleted: Event) => {
      undoClickCounter += 1;
      toast({
        variant: "default",
        title: "Undo Successful",
        description: "The event has been restored to its original state.",
      });

      if (undoClickCounter === 1) {
        try {
          const undoResponse = await createNewEvent(token, {
            client_intake_id: eventDeleted.original.clientId,
            client_name: `${eventDeleted.client}`,
            employee_or_staff_name: `${eventDeleted.staff}`,
            event_date: eventDeleted.date,
            start_time: eventDeleted.original.start,
            end_time: eventDeleted.original.end,
            notes: eventDeleted.notes ?? "",
            should_repeat: false,
            employee_or_staff_id: eventDeleted.original.staffId,
          });

          refetchAllEvents();
          queryClient.invalidateQueries({
            queryKey: ["allRequests", "employeeEvents"],
          });

          if (!undoResponse.status) {
            return toast({
              variant: "destructive",
              description: undoResponse.errorMessage,
            });
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            description: "An error occurred while undoing the event deletion.",
          });
        }
      } else if (undoClickCounter > 1) {
        toast({
          variant: "destructive",
          description: "Event already exist",
        });
      }
    };

    try {
      setDeleteEventLoading(true);
      const eventDeleted = events.find((event) => event.id === deletingEventId);

      if (!eventDeleted) return;

      const response = await deleteEventSchedule(token, {
        event_schedule_id: deletingEventId,
      });

      setDeleteEventLoading(false);
      refetchAllEvents();
      queryClient.invalidateQueries({
        queryKey: ["allRequests", "employeeEvents"],
      });

      if (!response.status) {
        return toast({
          variant: "destructive",
          description: response.errorMessage,
        });
      }

      setDeleteModalOpen(false);
      toast({
        variant: "default",
        description: "Event deleted successfully",
        action: (
          <button
            disabled={undoClickCounter > 0}
            onClick={() => handleUndo(eventDeleted)}
            className="text-[#3374FF] text-[16px] font-[700] mr-auto hover:underline disabled:text-[#0f172a4b] disabled:cursor-not-allowed"
          >
            {undoClickCounter > 0 ? "Reverting ..." : "Undo action"}
          </button>
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "An error occurred while deleting the event.",
      });
    } finally {
      setDeleteEventLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, events, deletingEventId, refetchAllEvents]);

  const handleNextStepInForm = useCallback(() => {
    const formData = {
      client,
      staff,
      dateOfEvent,
      startTime,
      endTime,
      notes,
    };
    const result = eventFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      // Convert array of errors to a single error message string
      const errorMessages: FormErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([key, messages]) => [
          key,
          messages?.[0] || "", // Take the first error message or an empty string
        ])
      );

      setErrors(errorMessages);
      toast({
        variant: "destructive",
        description: "Please fill all required fields.",
      });
      return;
    }

    const newEvent = formatDraftEvent(
      startTime,
      endTime,
      dateOfEvent!,
      { allClients, allEmployees },
      client,
      staff,
      notes
    );

    setCurrentEvent(newEvent);
    setScheduleEventStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateOfEvent,
    startTime,
    endTime,
    staff,
    client,
    allClients,
    allEmployees,
    notes,
  ]);

  return {
    modalIsOpen,
    allEventsLoading,
    allClientsLoading,
    allEmployeesLoading,
    deleteModalOpen,
    setModalIsOpen,
    setDeleteModalOpen,
    deleteEventLoading,
    token,
    deletingEventId,
    refetchAllEvents,
    deleteEvent,
    scheduleEventStep,
    isEditing,
    clients,
    client,
    setClient,
    staffs,
    staff,
    setStaff,
    dateOfEvent,
    setDateOfEvent,
    timeOptions,
    startTime,
    handleStartTimeChange,
    filterEndTimeOptions,
    endTime,
    handleEndTimeChange,
    notes,
    setNotes,
    clearAllInputs,
    handleNextStepInForm,
    currentEvent,
    scheduleEventLoading,
    setScheduleEventStep,
    createNewSchedule,
    requests,
    events,
    handleDeleteEvent,
    handleEditEvent,
    handleEditUnscheduledEvent,
    createNewScheduleFromCalendarCells,
    handleFilterEvents,
    filterEventLoading,
    resetEvents,
    clientTreatmentPlanDates,
    clientTreatmentPlanLoadingSchedule,
    allRequestsLoading,
    refetchAllRequests,
    setErrors,
    errors,
    eventDateAlreadyScheduled,
    specialStartTime,
    specialEndTime,
  };
};

export default useAdminEventsLogic;
