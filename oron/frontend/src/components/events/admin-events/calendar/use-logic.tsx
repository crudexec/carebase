"use client";

import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
} from "react";
import FullCalendar from "@fullcalendar/react";
import { startOfToday } from "date-fns";
import { Event } from "../types";
import { EventClickArg } from "@fullcalendar/core/index.js";

const useAdminEventsCalendarLogic = (
  staffs: { label: string; value: string }[],
  clients: { label: string; value: string }[],
  events: Event[],
  resetEvents: () => void,
  clearAllInputs: () => void
) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [unscheduledEvent, setUnscheduledEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [eventPosition, setEventPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const eventBoxRef = useRef<HTMLDivElement>(null);
  const [staff, setStaff] = useState("");
  const [notes, setNotes] = useState("");
  const [isSelectedStaffAvailable, setIsSelectedStaffAvailable] =
    useState(true);
  const [isMediumScreenOrLess, setIsMediumScreenOrLess] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [noOfEmployeesToDisplay, setNoOfEmployeesToDisplay] = useState(5);
  const [noOfClientsToDisplay, setNoOfClientsToDisplay] = useState(5);
  const [filterValues, setFilterValues] = useState({
    client: {
      label: "",
      value: "",
    },
    employee: {
      label: "",
      value: "",
    },
  });
  const [filteredEmployees, setFilteredEmployees] = useState(staffs);
  const [filteredClients, setFilteredClients] = useState(clients);

  const mappedEvents = useMemo(() => {
    return events.map((event) => ({
      title: `${event.staff}`,
      start: event.start,
      end: event.end,
      extendedProps: event,
    }));
  }, [events]);

  useEffect(() => {
    if (
      filterValues.client.label.length === 0 &&
      filterValues.employee.label.length === 0
    ) {
      resetEvents();
      setHasFiltered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues]);

  useEffect(() => {
    setFilteredEmployees(staffs);
  }, [staffs]);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const event = clickInfo.event.extendedProps as Event;

      if (event.staff.length < 1) {
        if (unscheduledEvent && event.id === unscheduledEvent.id) {
          setUnscheduledEvent(null);
        } else {
          setActiveEvent(null);
          setUnscheduledEvent(event);
        }
      } else {
        setUnscheduledEvent(null);
        setActiveEvent(event);
      }

      const rect = clickInfo.el.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      let leftPosition;

      if (spaceRight > 480) {
        leftPosition = rect.right + window.scrollX;
      } else if (spaceLeft > 100) {
        leftPosition = rect.left - 480 + window.scrollX;
      } else {
        leftPosition = rect.left + window.scrollX;
      }

      setEventPosition({ top: rect.top + window.scrollY, left: leftPosition });
    },
    [unscheduledEvent]
  );

  const handlePrev = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

  const handleNext = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

  const handleToday = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        eventBoxRef.current &&
        !eventBoxRef.current.contains(event.target as Node)
      ) {
        clearAllInputs();
        setNotes("");
        setActiveEvent(null);
        if (activeEvent && !unscheduledEvent) {
          setEventPosition(null);
        }
      }
    },
    [clearAllInputs, unscheduledEvent, activeEvent]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreenOrLess(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleEmployeeAndClientsSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>, type: "employee" | "clients") => {
      if (type === "employee") {
        const value = event.target.value.toLowerCase();

        const filteredEmployees = staffs.filter((employee) =>
          employee.label.toLowerCase().includes(value)
        );
        setFilteredEmployees(filteredEmployees);
      } else if (type === "clients") {
        const value = event.target.value.toLowerCase();

        const filteredClients = clients.filter((client) =>
          client.label.toLowerCase().includes(value)
        );
        setFilteredClients(filteredClients);
      }
    },
    [clients, staffs]
  );

  return {
    sheetOpen,
    setSheetOpen,
    activeEvent,
    setActiveEvent,
    unscheduledEvent,
    setUnscheduledEvent,
    currentDate,
    setCurrentDate,
    eventPosition,
    setEventPosition,
    calendarRef,
    eventBoxRef,
    staff,
    setStaff,
    notes,
    setNotes,
    isSelectedStaffAvailable,
    setIsSelectedStaffAvailable,
    isMediumScreenOrLess,
    setIsMediumScreenOrLess,
    hasFiltered,
    setHasFiltered,
    noOfEmployeesToDisplay,
    setNoOfEmployeesToDisplay,
    noOfClientsToDisplay,
    setNoOfClientsToDisplay,
    filterValues,
    setFilterValues,
    filteredEmployees,
    setFilteredEmployees,
    filteredClients,
    setFilteredClients,
    mappedEvents,
    handleEventClick,
    handlePrev,
    handleNext,
    handleToday,
    handleEmployeeAndClientsSearch,
  };
};

export default useAdminEventsCalendarLogic;
