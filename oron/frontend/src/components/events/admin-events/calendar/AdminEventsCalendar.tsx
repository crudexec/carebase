"use client";

import FullCalendar from "@fullcalendar/react";
import {
  EventContentArg,
  DayHeaderContentArg,
  SlotLabelContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronLeft, ChevronRight, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Event } from "../types";
import Loader from "@/components/Loader";
import Image from "next/image";
import FilterSheet from "./FilterSheet";
import ActiveEvent from "./ActiveEvent";
import UnscheduledEvent from "./UnscheduledEvent";
import useAdminEventsCalendarLogic from "./use-logic";

interface Props {
  events: Event[];
  handleDeleteEvent: (id: string) => void;
  handleEditEvent: (id: string) => void;
  handleEditUnscheduledEvent: (
    id: string,
    staff: string,
    notes: string
  ) => Promise<void>;
  createNewScheduleFromCalendarCells: (
    date: Date,
    time?: string,
    client?: string,
    staff?: string
  ) => void;
  clearAllInputs: () => void;
  staffs: { label: string; value: string }[];
  clients: { label: string; value: string }[];
  handleFilterEvents: (
    clientName?: string,
    employeeName?: string,
    clientId?: string,
    employeeId?: string
  ) => Promise<void>;
  filterEventLoading: boolean;
  resetEvents: () => void;
  scheduleEventLoading: boolean;
}

const AdminEventsCalendar = ({
  events,
  handleDeleteEvent,
  handleEditEvent,
  handleEditUnscheduledEvent,
  createNewScheduleFromCalendarCells,
  clearAllInputs,
  staffs,
  clients,
  handleFilterEvents,
  filterEventLoading,
  resetEvents,
  scheduleEventLoading,
}: Props) => {
  const {
    sheetOpen,
    setSheetOpen,
    activeEvent,
    setActiveEvent,
    unscheduledEvent,
    setUnscheduledEvent,
    currentDate,
    eventPosition,
    calendarRef,
    eventBoxRef,
    staff,
    setStaff,
    notes,
    setNotes,
    isSelectedStaffAvailable,
    setIsSelectedStaffAvailable,
    isMediumScreenOrLess,
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
  } = useAdminEventsCalendarLogic(
    staffs,
    clients,
    events,
    resetEvents,
    clearAllInputs
  );

  const renderUnFilteredEventContent = (info: EventContentArg) => {
    const { original, staff, client, content } = info.event.extendedProps;

    const statusColor =
      original.was_rescheduled &&
      (!original?.event_approved ||
        original?.event_approved === null ||
        original?.event_approved === undefined)
        ? "bg-orange-600"
        : "bg-[#039855]";

    return (
      <div className="w-full flex justify-center pb-2 px-[5px]">
        <div className="flex flex-col gap-2 justify-start h-fit overflow-auto max-w-full mx-auto active:text-gray-300">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-2 rounded-full p-[5px] ${statusColor}`} />

            <span className="text-[12px] font-[300] text-[#64748B] active:text-gray-500">
              {content.start}
            </span>

            <p className="text-[12px] font-[500] text-[#1E293B] active:text-gray-300">
              {staff} x {client}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderUnFilteredDayHeaderContent = (info: DayHeaderContentArg) => (
    <div className="flex flex-col gap-2 py-5">
      <h2 className="text-[#475569] text-[24px] font-[600]">
        {format(info.date, "eee")}
      </h2>
    </div>
  );

  const renderFilteredEventContent = (info: EventContentArg) => {
    return info.event.extendedProps.staff.length > 1 ? (
      <div className="min-w-full flex flex-col gap-2 justify-start h-full pr-2">
        <p className="text-white font-[700] text-[13x]">
          Client: {info.event.extendedProps.client}
        </p>
        <p className="text-white font-[400] text-[10px]">
          {info.event.extendedProps.content.start} -{" "}
          {info.event.extendedProps.content.end}
        </p>
      </div>
    ) : (
      <div className="flex flex-col gap-2 justify-around text-black p-0">
        <Button
          variant="outline"
          className="flex gap-2 items-center overflow-auto"
        >
          <PlusIcon className="w-4 h-4" /> Schedule
        </Button>
      </div>
    );
  };

  const renderFilteredDayHeaderContent = (info: DayHeaderContentArg) => (
    <div className="flex flex-col gap-1 py-5">
      <h2 className="text-[#475569] text-[12px] font-[400]">
        {format(info.date, "eee")}
      </h2>
      <h1 className="text-[#475569] text-[24px] font-[600]">
        {format(info.date, "d")}
      </h1>
    </div>
  );

  const renderFilteredSlotLabelContent = (info: SlotLabelContentArg) => (
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

        <div className="flex gap-5 items-center flex-wrap">
          <FilterSheet
            sheetOpen={sheetOpen}
            clients={clients}
            staffs={staffs}
            handleFilterEvents={handleFilterEvents}
            filterEventLoading={filterEventLoading}
            hasFiltered={hasFiltered}
            setFilterValues={setFilterValues}
            filterValues={filterValues}
            handleEmployeeAndClientsSearch={handleEmployeeAndClientsSearch}
            filteredEmployees={filteredEmployees}
            noOfEmployeesToDisplay={noOfEmployeesToDisplay}
            setNoOfEmployeesToDisplay={setNoOfEmployeesToDisplay}
            filteredClients={filteredClients}
            noOfClientsToDisplay={noOfClientsToDisplay}
            setNoOfClientsToDisplay={setNoOfClientsToDisplay}
            setHasFiltered={setHasFiltered}
            setSheetOpen={setSheetOpen}
            setFilteredEmployees={setFilteredEmployees}
            setFilteredClients={setFilteredClients}
          />
        </div>
      </div>

      {filterEventLoading && <Loader height="h-[60vh]" />}

      {events.length === 0 && (
        <div className="h-fit py-20 lg:h-[40vh] border-[1px] border-[#E4E4E7] rounded-[12px] flex flex-col gap-5 items-center justify-center">
          <Image
            src="/assets/images/dashboard/emptyClient.svg"
            width={161}
            height={120}
            alt="empty client"
          />
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            No Events Found
          </h2>

          {hasFiltered &&
            filterValues.client.label.length > 0 &&
            filterValues.employee.label.length > 0 && (
              <p className="text-[16px] font-[400] text-[#667085] text-center">
                No event was found with `Client Name:{" "}
                {filterValues.client.label} and Staff Name:{" "}
                {filterValues.employee.label}`
              </p>
            )}
        </div>
      )}

      <div className="relative overflow-x-auto lg:max-w-full md:max-w-[95vw] max-w-[90vw]">
        <div className="min-w-[1600px] lg:min-w-full">
          {!hasFiltered && !filterEventLoading && events.length > 0 && (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
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
                if (info.event.extendedProps.staff.length < 1) {
                  return "text-white cursor-pointer m-0 flex flex-col items-start hover:bg-transparent p-0 w-fit h-fit";
                }
                return "text-white cursor-pointer m-0 flex flex-col items-start hover:bg-transparent p-0 h-fit";
              }}
              dayHeaderClassNames="bg-white text-gray-800"
              dayCellClassNames="border p-0 border-gray-200 cursor-pointer h-[200px]"
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              slotDuration="01:00:00"
              expandRows
              slotLabelClassNames="text-center bg-[#E2E8F0] py-3"
              dateClick={(info) => {
                createNewScheduleFromCalendarCells(
                  info.date,
                  "",
                  filterValues.client.value,
                  filterValues.employee.value
                );
              }}
              dayHeaderContent={renderUnFilteredDayHeaderContent}
              eventContent={renderUnFilteredEventContent}
              datesSet={(arg) => {
                // setCurrentDate(arg.start);
              }}
            />
          )}

          {hasFiltered && !filterEventLoading && (
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
                  info.event.extendedProps.original.was_rescheduled === true &&
                  (!info.event.extendedProps.original?.event_approved ||
                    info.event.extendedProps.original?.event_approved ===
                      null ||
                    info.event.extendedProps.original?.event_approved ===
                      undefined)
                    ? "bg-orange-600 hover:bg-orange-600/50"
                    : "bg-[#039855] hover:bg-[#039855]/50";

                if (info.event.extendedProps.staff.length < 1) {
                  return "cursor-pointer m-0 flex flex-col items-start p-0 w-fit h-fit bg-transparent border-0 mt-1 mx-auto";
                }
                return `text-white cursor-pointer m-0 flex flex-col items-start p-0 ${backgroundColorClass} w-full`;
              }}
              dayHeaderClassNames="bg-white text-gray-800"
              dayCellClassNames="border p-0 border-gray-200 cursor-pointer overflow-auto h-[200px]"
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              slotDuration="01:00:00"
              expandRows
              slotLabelClassNames="text-center bg-[#E2E8F0] py-3"
              dateClick={(info) => {
                const date = info.date;
                const time = format(date, "h:mm a");
                createNewScheduleFromCalendarCells(
                  info.date,
                  time,
                  filterValues.client.value,
                  filterValues.employee.value
                );
              }}
              dayHeaderContent={renderFilteredDayHeaderContent}
              eventContent={renderFilteredEventContent}
              slotLabelContent={renderFilteredSlotLabelContent}
              eventOverlap={false}
              eventOrder="start,-duration,allDay,title"
              slotEventOverlap={false}
              datesSet={(arg) => {
                // setCurrentDate(arg.start);
              }}
            />
          )}
        </div>
      </div>

      {activeEvent && eventPosition && events.length > 0 && (
        <ActiveEvent
          eventBoxRef={eventBoxRef}
          isMediumScreenOrLess={isMediumScreenOrLess}
          eventPosition={eventPosition}
          handleEditEvent={handleEditEvent}
          setActiveEvent={setActiveEvent}
          activeEvent={activeEvent}
          handleDeleteEvent={handleDeleteEvent}
          clearAllInputs={clearAllInputs}
          setStaff={setStaff}
          setNotes={setNotes}
        />
      )}

      {unscheduledEvent && eventPosition && (
        <UnscheduledEvent
          eventBoxRef={eventBoxRef}
          isMediumScreenOrLess={isMediumScreenOrLess}
          eventPosition={eventPosition}
          setIsSelectedStaffAvailable={setIsSelectedStaffAvailable}
          setUnscheduledEvent={setUnscheduledEvent}
          clearAllInputs={clearAllInputs}
          setStaff={setStaff}
          setNotes={setNotes}
          unscheduledEvent={unscheduledEvent}
          isSelectedStaffAvailable={isSelectedStaffAvailable}
          filterValues={filterValues}
          staffs={staffs}
          notes={notes}
          scheduleEventLoading={scheduleEventLoading}
          handleEditUnscheduledEvent={handleEditUnscheduledEvent}
          staff={staff}
        />
      )}
    </div>
  );
};

export default AdminEventsCalendar;
