"use client";

import { useState, useMemo, useEffect } from "react";
import EmployeeEventsCalendar from "./EmployeeEventsCalendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import FormSelect from "@/components/input-fields/FormSelect";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/utils";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { rescheduleEvent } from "@/actions/events/events";
import {
  retrieveClientTreatmentPlanPlanSchedule,
  retrieveEmployeeEvents,
} from "@/use-cases/events";
import { AllEvents, ClientSchedule } from "@/types/Events";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import {
  formatClientTreatmentPlanDates,
  getSpecialEndTimes,
  getSpecialStartTimes,
} from "../admin-events/helpers";
import { generateTimeSlots, filterEndTimeOptions } from "@/utils/date-utils";
import { formatEmployeeEvents } from "./helpers";
import { EmployeeEventType } from "./types";
import Image from "next/image";
import { FormErrors } from "../admin-events/types";
import { employeeRescheduleFormSchema } from "../schema";

const EmployeeEventsWrapper = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") as string;

  const [errors, setErrors] = useState<FormErrors>({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dateOfEvent, setDateOfEvent] = useState<Date>();
  const [reasonForReschedule, setReasonForReschedule] = useState("");
  const [rescheduleData, setRescheduleData] = useState<EmployeeEventType>();
  const { toast } = useToast();
  const [clientTreatmentPlanDates, setClientTreatmentPlanDates] =
    useState<Date[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<EmployeeEventType[]>([]);
  const [specialStartTime, setSpecialStartTime] = useState<string[]>([]);
  const [specialEndTime, setSpecialEndTime] = useState<string[]>([]);

  const {
    data: allEvents,
    isLoading: allEventsLoading,
    refetch: refetchAllEvents,
  } = useQuery<AllEvents>({
    queryKey: ["employeeEvents"],
    queryFn: async () => await retrieveEmployeeEvents(token),
  });
  const {
    data: clientTreatmentPlanSchedule,
    isLoading: clientTreatmentPlanLoadingSchedule,
  } = useQuery<ClientSchedule[]>({
    queryKey: ["clientTreatmentPlanSchedule", rescheduleData?.clientId],
    queryFn: async () =>
      await retrieveClientTreatmentPlanPlanSchedule(
        token,
        rescheduleData?.clientId!
      ),
    enabled: rescheduleData && rescheduleData?.clientId.length > 0,
  });

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
    if (
      allEvents &&
      Array.isArray(allEvents.data) &&
      allEvents.data.length > 0
    ) {
      const eventsData = formatEmployeeEvents(allEvents);
      setEvents(eventsData);
    }
  }, [allEvents]);

  useEffect(() => {
    setClientTreatmentPlanDates([]);

    if (clientTreatmentPlanSchedule && clientTreatmentPlanSchedule.length > 0) {
      const scheduleDates = formatClientTreatmentPlanDates(
        clientTreatmentPlanSchedule
      );
      setClientTreatmentPlanDates(scheduleDates);
    }
  }, [clientTreatmentPlanSchedule]);

  const clearAllInputs = () => {
    setStartTime("");
    setEndTime("");
    setDateOfEvent(undefined);
    setReasonForReschedule("");
    setRescheduleData(undefined);
  };

  const toggleModal = (status: boolean, event?: EmployeeEventType) => {
    if (event) {
      setRescheduleData(event);
    }

    setModalIsOpen(status);
  };

  const timeOptions = useMemo(() => generateTimeSlots(), []);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    setErrors((prev) => ({ ...prev, startTime: "" }));
    if (endTime && endTime <= value) {
      setEndTime("");
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    setErrors((prev) => ({ ...prev, endTime: "" }));
  };

  const submitRescheduleRequest = async () => {
    setIsLoading(true);

    const formData = {
      dateOfEvent,
      startTime,
      endTime,
      reason: reasonForReschedule,
    };
    const result = employeeRescheduleFormSchema.safeParse(formData);

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
      setIsLoading(false);
      return;
    }

    try {
      const response = await rescheduleEvent(token, {
        event_schedule_id: rescheduleData?.id!,
        new_rescheduled_event_date: dateOfEvent!,
        start_time: startTime,
        end_time: endTime,
        reason_for_rescheduling: reasonForReschedule,
      });

      queryClient.invalidateQueries({
        queryKey: ["allRequests", "allEvents", "employeeEvents"],
      });
      refetchAllEvents();

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        setIsLoading(false);
        return;
      }

      clearAllInputs();
      setModalIsOpen(false);
      setIsLoading(false);
      toast({
        variant: "default",
        title: "Reschedule request successfully submitted",
        description:
          "Your reschedule request will be reviewed and you will get a response shortly.",
      });
    } catch (error: any) {
      clearAllInputs();
      setModalIsOpen(false);
      setIsLoading(false);
      toast({
        variant: "destructive",
        description: "An error occurred while scheduling the event.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateAllowed = (date: Date) => {
    if (!clientTreatmentPlanDates || clientTreatmentPlanDates.length === 0)
      return false;

    return !clientTreatmentPlanDates.some(
      (allowedDate) =>
        date.getFullYear() === allowedDate.getFullYear() &&
        date.getMonth() === allowedDate.getMonth() &&
        date.getDate() === allowedDate.getDate()
    );
  };

  if (allEventsLoading) {
    return <Loader height="h-[80vh]" />;
  }

  if (events.length === 0) {
    return (
      <div className="h-fit py-20 lg:h-[40vh] border-[1px] border-[#E4E4E7] rounded-[12px] flex flex-col gap-5 items-center justify-center">
        <Image
          src="/assets/images/dashboard/emptyClient.svg"
          width={161}
          height={120}
          alt="empty client"
        />
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          No Event Found
        </h2>
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col gap-12">
      <h2 className="text-[30px] font-[600] text-[#101828]">Schedule</h2>

      <EmployeeEventsCalendar
        events={events}
        clearAllInputs={clearAllInputs}
        toggleModal={toggleModal}
        modalIsOpen={modalIsOpen}
      />

      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        {rescheduleData && (
          <DialogContent
            className={`${
              clientTreatmentPlanLoadingSchedule && "border-none"
            } `}
          >
            {clientTreatmentPlanLoadingSchedule && (
              <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/30">
                <Loader height="h-fit" />
              </div>
            )}
            <h2 className="text-[#101828] text-[24px] font-[600]">
              Request Reschedule
            </h2>
            <p className="text-[16px] font-[500] text-[#475467]">
              Request reschedule for your visit with{" "}
              <span className="text-[#2563EB]">{rescheduleData.client}</span>
            </p>

            <div className="flex items-center gap-5 flex-wrap lg:flex-nowrap">
              <p className="text-[16px] font-[500] text-[#475467] flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                {formatDate(rescheduleData.date)}
              </p>

              <p className="text-[16px] font-[500] text-[#475467] flex items-center gap-3">
                <Clock className="w-4 h-4" />
                {rescheduleData.content.start} - {rescheduleData.content.end}
              </p>
            </div>

            <form className="flex flex-col gap-4 mt-5">
              <DatePicker
                defaultDate={dateOfEvent}
                getDate={(date) => {
                  setDateOfEvent(date);
                  setErrors((prev) => ({ ...prev, dateOfEvent: "" }));
                }}
                label="New Date"
                isDateAllowed={isDateAllowed}
                selectFutureDateOnly={true}
                isError={!!errors.dateOfEvent}
                errorMessage={errors.dateOfEvent}
              />

              <div className="w-full flex flex-col">
                <Label className={`text-[15px] text-[#0F172A]`}>Time</Label>

                <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                  <FormSelect
                    labelText=""
                    placeholder="Select"
                    selectContent={timeOptions}
                    value={startTime}
                    onValueChange={handleStartTimeChange}
                    isError={!!errors.startTime}
                    errorMessage={errors.startTime}
                    specialItems={specialStartTime}
                  />
                  <span className="mt-2">-</span>
                  <FormSelect
                    labelText=""
                    placeholder="Select"
                    selectContent={filterEndTimeOptions(startTime, timeOptions)}
                    value={endTime}
                    onValueChange={handleEndTimeChange}
                    disabled={startTime.length === 0}
                    isError={!!errors.endTime}
                    errorMessage={errors.endTime}
                    specialItems={specialEndTime}
                  />
                </div>
              </div>

              <FormTextArea
                labelText="Reason for rescheduling"
                placeholder="Enter here ..."
                name="notes"
                value={reasonForReschedule}
                onChange={(e) => {
                  setReasonForReschedule(e.target.value);
                  setErrors((prev) => ({ ...prev, reason: "" }));
                }}
                isError={!!errors.reason}
                errorMessage={errors.reason}
              />

              <div className="mt-5 flex items-center gap-5 justify-end">
                <button
                  disabled={isLoading}
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
                  disabled={isLoading}
                  type="button"
                  onClick={submitRescheduleRequest}
                  className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
                >
                  {isLoading ? <Loader height="h-fit" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};

export default EmployeeEventsWrapper;
