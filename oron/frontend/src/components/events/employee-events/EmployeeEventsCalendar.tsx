"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  EventClickArg,
  EventContentArg,
  DayHeaderContentArg,
  SlotLabelContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, File, XIcon } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { PersonIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { formatDate } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeEventType } from "./types";
import { useRouter } from "next/navigation";
import { formatDateToUTCString } from "@/utils/date-utils";

interface Props {
  events: EmployeeEventType[];
  clearAllInputs: () => void;
  toggleModal: (status: boolean, event?: EmployeeEventType) => void;
  modalIsOpen: boolean;
}

const EmployeeEventsCalendar = ({
  events,
  clearAllInputs,
  toggleModal,
  modalIsOpen,
}: Props) => {
  const router = useRouter();
  const [activeEvent, setActiveEvent] = useState<EmployeeEventType | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [eventPosition, setEventPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isMediumScreenOrLess, setIsMediumScreenOrLess] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const eventBoxRef = useRef<HTMLDivElement>(null);

  const mappedEvents = events.map((event) => ({
    title: `${event.staff}`, // Use staff and notes for the event title
    start: event.start, // Ensure correct ISO format
    end: event.end, // Ensure correct ISO format
    extendedProps: event, // Pass the custom event data as extendedProps
  }));

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.extendedProps as EmployeeEventType;

    if (event.id === activeEvent?.id) {
      setActiveEvent(null);
    } else {
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
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreenOrLess(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call initially to set the correct state

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (modalIsOpen) {
      setActiveEvent(null);
    }
  }, [modalIsOpen]);

  const renderEventContent = (info: EventContentArg) => {
    return (
      <div className="flex flex-col gap-2 justify-start h-fit pr-2">
        <p className="text-white font-[700] text-[13x]">
          Client: {info.event.extendedProps.client}
        </p>
        <p className="text-white font-[400] text-[10px]">
          {info.event.extendedProps.content.start} -{" "}
          {info.event.extendedProps.content.end}
        </p>
      </div>
    );
  };

  const renderDayHeaderContent = (info: DayHeaderContentArg) => (
    <div className="flex flex-col gap-1 py-5">
      <h2 className="text-[#475569] text-[12px] font-[400]">
        {format(info.date, "eee")}
      </h2>
      <h1 className="text-[#475569] text-[24px] font-[600]">
        {format(info.date, "d")}
      </h1>
    </div>
  );

  const renderSlotLabelContent = (info: SlotLabelContentArg) => (
    <div className="flex flex-col items-center px-10 py-5">
      <span className="text-[#475569] text-[14px] font-[400]">
        {format(info.date, "h a")}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <div className="w-full flex flex-col lg:flex-row flex-wrap gap-5 justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 items-center flex-wrap">
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>

            <div className="flex items-center">
              <Button variant="ghost" onClick={handlePrev}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" onClick={handleNext}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <h4 className="text-[#101828] text-[24px] font-[400]">
              {format(currentDate, "MMMM yyyy")}
            </h4>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto lg:max-w-full md:max-w-[95vw] max-w-[90vw]">
        <div className="min-w-[1600px] lg:min-w-full">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            events={mappedEvents}
            eventClick={handleEventClick}
            ref={calendarRef}
            height="auto"
            headerToolbar={false}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              meridiem: false,
            }}
            eventClassNames={(info) => {
              const backgroundColorClass =
                info.event.extendedProps.wasRescheduled === true &&
                (!info.event.extendedProps?.event_approved ||
                  info.event.extendedProps?.event_approved === null ||
                  info.event.extendedProps?.event_approved === undefined)
                  ? "bg-orange-600 hover:bg-orange-600/70 border-none"
                  : "bg-[#039855] hover:bg-[#039855]/70";

              return `text-white cursor-pointer m-0 flex flex-col items-start p-0 h-fit ${backgroundColorClass} `;
            }}
            dayHeaderClassNames="bg-white text-gray-800"
            dayCellClassNames="border p-0 border-gray-200 cursor-pointer overflow-auto h-[200px]"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={false}
            slotDuration="01:00:00"
            expandRows
            slotLabelClassNames="text-center bg-[#E2E8F0] py-3"
            dayHeaderContent={renderDayHeaderContent}
            eventContent={renderEventContent}
            slotLabelContent={renderSlotLabelContent}
          />
        </div>
      </div>

      {activeEvent && eventPosition && (
        <div
          ref={eventBoxRef}
          className={`flex flex-col p-5 bg-white border border-gray-300 shadow-lg w-full lg:w-[480px] md:w-[80%] z-50 rounded-[12px] fixed justify-center left-0 right-0 lg:justify-normal lg:absolute `}
          style={
            isMediumScreenOrLess
              ? undefined
              : {
                  position: "absolute",
                  top: eventPosition.top,
                  left: eventPosition.left,
                }
          }
        >
          <div className="flex gap-5 justify-end items-center flex-wrap">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="p-0 w-fit h-fit"
              >
                <button>
                  <DotsVerticalIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[10rem]">
                <DropdownMenuItem
                  disabled={activeEvent.date < new Date()}
                  onClick={(e) => {
                    if (activeEvent.date < new Date()) {
                      const clientProfilePage = `/clients/${
                        activeEvent.clientId
                      }?action=log_visit&date=${formatDateToUTCString(
                        activeEvent.date
                      )}&start_time=${activeEvent.start}&end_time${
                        activeEvent.end
                      }`;
                      router.push(clientProfilePage);
                    } else {
                      toggleModal(true, activeEvent);
                    }
                  }}
                >
                  {activeEvent.date < new Date()
                    ? "Log Visit"
                    : "Request Reschedule"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => {
                setActiveEvent(null);
                setEventPosition(null);
                clearAllInputs();
              }}
            >
              <XIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[#101828] text-[24px] font-[600]">
              {format(new Date(activeEvent.start), "eeee")} -{" "}
              {formatDate(new Date(activeEvent.end))}
            </h4>
            <p className="text-[#475569] text-[16px] font-[400]">
              {activeEvent.content.start} - {activeEvent.content.end}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[#0F172A] text-[16px] font-[400] flex gap-5 items-center">
              <PersonIcon className="w-5 h-5" />
              {activeEvent.client}
            </p>
            {activeEvent.notes && activeEvent.notes?.length > 0 && (
              <p className="text-[#0F172A] text-[16px] font-[400] flex gap-5 items-center">
                <File className="w-5 h-5" />
                {activeEvent.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeEventsCalendar;
