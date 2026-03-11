"use client";

import Button from "@/components/button/Button";
import { AlertCircleIcon, Calendar, Clock, File, PlusIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import FormSelect from "@/components/input-fields/FormSelect";
import { Label } from "@/components/ui/label";
import FormTextArea from "@/components/input-fields/FormTextArea";
import Image from "next/image";
import AdminEventsCalendar from "./calendar/AdminEventsCalendar";
import FormBanner from "@/components/banner/FormBanner";
import RequestWrapper from "./request/RequestWrapper";
import { format } from "date-fns";
import { formatDate } from "@/utils";
import Loader from "@/components/Loader";
import useAdminEventsLogic from "./use-logic";
import useEvent from "../use-event";
import SearchableFormSelect from "@/components/input-fields/SearchableFormSelect";

const AdminEventsWrapper = () => {
  const { tab, setTab } = useEvent();
  const {
    modalIsOpen,
    allEventsLoading,
    allClientsLoading,
    allEmployeesLoading,
    deleteModalOpen,
    setModalIsOpen,
    setDeleteModalOpen,
    deleteEventLoading,
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
    setErrors,
    errors,
    eventDateAlreadyScheduled,
    specialStartTime,
    specialEndTime,
  } = useAdminEventsLogic();

  if (allEventsLoading || allClientsLoading || allEmployeesLoading) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <section className="w-full flex flex-col gap-8">
      <div className="w-full flex flex-col lg:flex-row flex-wrap gap-5 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] font-[600] text-[#101828]">Events</h2>
          <p className="text-[16px] font-[400] text-[#475467]">
            Manage all schedules here
          </p>
        </div>

        <Button onClick={() => setModalIsOpen(true)} type="button">
          <PlusIcon className="w-5 h-5" /> New Event
        </Button>
      </div>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="lg:w-[400px]">
          <Image
            src="/assets/images/dashboard/trashIconBg.svg"
            width={50}
            height={50}
            alt="trash icon"
            className="mx-auto"
          />

          <h2 className="text-[#101828] font-[700] text-[18px] text-center">
            Delete Event
          </h2>

          <p className="w-[90%] mx-auto text-center text-[#475467] text-[14px] font-[400]">
            Are you sure you want to delete this event from the schedule? This
            action cannot be undone.
          </p>

          <div className="flex items-center gap-5 justify-end mt-5">
            <button
              disabled={deleteEventLoading}
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] bg-[#d9dde1] hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
            >
              Cancel
            </button>
            <button
              disabled={deleteEventLoading}
              type="button"
              onClick={deleteEvent}
              className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#EF4444] hover:bg-[#db3d3d] disabled:bg-[#e860606e] disabled:hover:bg-[#e860606e] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#ae3030] text-white`}
            >
              {deleteEventLoading ? <Loader height="h-fit" /> : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        {allClientsLoading || allEmployeesLoading ? (
          <DialogContent>
            <Loader height="h-fit" />
          </DialogContent>
        ) : (
          <>
            {scheduleEventStep === 1 && (
              <DialogContent
                className={`lg:w-[45%] xl:w-[40%] 2xl:w-[40%] max-w-full ${
                  clientTreatmentPlanLoadingSchedule && "border-none"
                } `}
              >
                {clientTreatmentPlanLoadingSchedule && (
                  <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/30">
                    <Loader height="h-fit" />
                  </div>
                )}

                <h2 className="text-[#101828] text-[24px] font-[600]">
                  {isEditing ? "Update Event" : "Schedule New Event"}
                </h2>

                {eventDateAlreadyScheduled && (
                  <div className="flex flex-col gap-3 p-5 border-[2px] border-[#FDA29B] bg-[#FFFBFA] rounded-[8px]">
                    <div className="flex gap-3 items-start">
                      <AlertCircleIcon className="w-5 h-5 text-[#D92D20]" />
                      <p className="text-[14px] font-[400] text-[#B42318]">
                        Selected time conflicts with selected staff&apos;s
                        schedule. Select a different time or staff
                      </p>
                    </div>
                  </div>
                )}

                <form className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                    <SearchableFormSelect
                      name="client"
                      labelText="Client"
                      placeholder="Select client"
                      selectContent={clients || []}
                      value={client}
                      onValueChange={(value) => {
                        setClient(value);
                        setErrors((prev) => ({ ...prev, client: "" }));
                      }}
                      isError={!!errors.client}
                      errorMessage={errors.client}
                      disabled={clientTreatmentPlanLoadingSchedule}
                    />

                    <SearchableFormSelect
                      name="staff"
                      labelText="Staff"
                      placeholder="Select staff"
                      selectContent={staffs || []}
                      value={staff}
                      onValueChange={(value) => {
                        setStaff(value);
                        setErrors((prev) => ({ ...prev, staff: "" }));
                      }}
                      isError={!!errors.staff}
                      errorMessage={errors.staff}
                      disabled={clientTreatmentPlanLoadingSchedule}
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                    <DatePicker
                      defaultDate={dateOfEvent}
                      getDate={(date) => {
                        setDateOfEvent(date);
                        setErrors((prev) => ({ ...prev, dateOfEvent: "" }));
                      }}
                      label="Date"
                      specialDates={clientTreatmentPlanDates}
                      disabled={clientTreatmentPlanLoadingSchedule}
                      isError={!!errors.dateOfEvent}
                      errorMessage={errors.dateOfEvent}
                    />

                    <div className="w-full flex flex-col">
                      <Label className={`text-[15px] text-[#0F172A]`}>
                        Time
                      </Label>

                      <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={timeOptions}
                          value={startTime}
                          onValueChange={handleStartTimeChange}
                          disabled={clientTreatmentPlanLoadingSchedule}
                          isError={!!errors.startTime}
                          errorMessage={errors.startTime}
                          specialItems={specialStartTime}
                        />
                        <span className="mt-2">-</span>
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={filterEndTimeOptions(
                            startTime,
                            timeOptions
                          )}
                          value={endTime}
                          onValueChange={handleEndTimeChange}
                          disabled={
                            startTime.length === 0 ||
                            clientTreatmentPlanLoadingSchedule
                          }
                          isError={!!errors.endTime}
                          errorMessage={errors.endTime}
                          specialItems={specialEndTime}
                        />
                      </div>
                    </div>
                  </div>

                  <FormTextArea
                    labelText="Notes (Optional)"
                    placeholder="Enter here ..."
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={clientTreatmentPlanLoadingSchedule}
                  />

                  <div className="mt-5 flex items-center gap-5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setModalIsOpen(false);
                        clearAllInputs();
                      }}
                      className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-full hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStepInForm}
                      className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </DialogContent>
            )}

            {scheduleEventStep === 2 && currentEvent && (
              <DialogContent className="lg:w-[55%] xl:w-[45%] 2xl:w-[40%] max-w-full">
                <h2 className="text-[#101828] text-[24px] font-[600]">
                  Preview Event
                </h2>

                {eventDateAlreadyScheduled && (
                  <div className="flex flex-col gap-3 p-5 border-[2px] border-[#FDA29B] bg-[#FFFBFA] rounded-[8px]">
                    <div className="flex gap-3 items-start">
                      <AlertCircleIcon className="w-5 h-5 text-[#D92D20]" />
                      <p className="text-[14px] font-[400] text-[#B42318]">
                        Selected time conflicts with selected staff&apos;s
                        schedule. Select a different time or staff
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center gap-3 flex-wrap lg:flex-nowrap">
                    <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(currentEvent.start), "eeee")} -{" "}
                      {formatDate(new Date(currentEvent.end))}
                    </p>
                    <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                      <Clock className="w-5 h-5" />
                      {currentEvent.content.start} - {currentEvent.content.end}
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-3 flex-wrap lg:flex-nowrap">
                    <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                      <span className="font-[700]">Client</span>
                      {currentEvent.client}
                    </p>
                    <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                      <span className="font-[700]">Staff</span>
                      {currentEvent.staff}
                    </p>
                  </div>

                  {currentEvent.notes && currentEvent.notes.length > 0 && (
                    <p className="text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                      <File className="w-5 h-5" />
                      {currentEvent.notes}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-5 justify-end">
                    <button
                      disabled={scheduleEventLoading}
                      type="button"
                      onClick={() => {
                        setScheduleEventStep(1);
                      }}
                      className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-full hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={createNewSchedule}
                      disabled={scheduleEventLoading}
                      className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
                    >
                      {scheduleEventLoading ? (
                        <Loader height="h-fit" />
                      ) : (
                        "Schedule Event"
                      )}
                    </button>
                  </div>
                </div>
              </DialogContent>
            )}
          </>
        )}
      </Dialog>

      <FormBanner text="To enhance the scheduling experience, please consider filtering the calendar by nurse or patient." />

      <div className="w-full flex items-center gap-5 border-b-[1px] border-[#EAECF0]">
        <button
          onClick={() => setTab("upcoming")}
          className={`text-[16px] font-[600] pb-3 ${
            tab === "upcoming" && "text-[#1A48AD] border-b-2 border-[#1A48AD]"
          } ${tab !== "upcoming" && "text-[#667085]"} py-1 px-2`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`text-[16px] font-[600] pb-3 ${
            tab === "requests" && "text-[#1A48AD] border-b-2 border-[#1A48AD]"
          } ${tab !== "requests" && "text-[#667085]"} flex items-center gap-2`}
        >
          <span>Requests</span>
          <span className="text-[#1A48AD] text-[14px] font-[400] py-1 px-2 rounded-full bg-[#F0F4FF]">
            {requests.length}
          </span>
        </button>
      </div>

      {tab === "upcoming" && (
        <AdminEventsCalendar
          events={events}
          handleDeleteEvent={handleDeleteEvent}
          handleEditEvent={handleEditEvent}
          handleEditUnscheduledEvent={handleEditUnscheduledEvent}
          createNewScheduleFromCalendarCells={
            createNewScheduleFromCalendarCells
          }
          clearAllInputs={clearAllInputs}
          staffs={staffs}
          clients={clients}
          handleFilterEvents={handleFilterEvents}
          filterEventLoading={filterEventLoading}
          resetEvents={resetEvents}
          scheduleEventLoading={scheduleEventLoading}
        />
      )}

      {tab === "requests" && (
        <RequestWrapper
          requests={requests}
          allRequestsLoading={allRequestsLoading}
        />
      )}
    </section>
  );
};

export default AdminEventsWrapper;
