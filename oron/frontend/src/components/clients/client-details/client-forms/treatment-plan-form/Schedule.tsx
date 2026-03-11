"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/button/Button";
import { DatePickerWithRange } from "@/components/calendar/DatePickerWithRange";
import FormSelect from "@/components/input-fields/FormSelect";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DashIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import {
  filterEndTimeOptions,
  generateTimeSlots,
  normalizeTimeFormat,
} from "@/utils/date-utils";
import { useMutation } from "@tanstack/react-query";
import { ClientSchedule, TreatmentPlan } from "@/types/Events";
import { submitScheduleForm } from "@/actions/clients/treatment-plan/schedule";
import { toast } from "@/components/ui/use-toast";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import FormBanner from "@/components/banner/FormBanner";

const timeSlotSchema = z.object({
  checked: z.boolean().optional(),
  day_of_week: z.string().min(1, { message: "Day of week is required" }),
  start_time: z.string().min(1, { message: "Start time is required" }),
  end_time: z.string().min(1, { message: "End time is required" }),
});

const schema = z.object({
  start_date: z.date().refine((date) => date != null, {
    message: "Start date is required",
  }),
  end_date: z.date().refine((date) => date != null, {
    message: "End date is required",
  }),
  time_slot: z
    .array(timeSlotSchema)
    .min(1, "At least one time slot is required")
    .refine((slots) => slots.some((slot) => slot.checked), {
      message: "At least one time slot must be checked",
    })
    .refine(
      (slots) =>
        slots.every((slot) => {
          if (slot.checked) {
            return slot.day_of_week && slot.start_time && slot.end_time;
          }
          return true;
        }),
      {
        message:
          "Checked time slots must have day_of_week, start_time, and end_time",
      }
    ),
});

type FormData = z.infer<typeof schema>;

type TIME_SLOT = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  checked: boolean;
};

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  treatmentPlanData: TreatmentPlan | undefined;
  clientId: string;
  refetchTreatmentPlan: any;
  formType: TreatmentPlanType;
  formId: string;
}

const Schedule = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  treatmentPlanData,
  clientId,
  refetchTreatmentPlan,
  formType,
  formId,
}: Props) => {
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [schedule, setSchedule] = useState<ClientSchedule>();
  const [loaded, setLoaded] = useState<"loaded" | "handled" | "unloaded">(
    "unloaded"
  );

  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields } = useFieldArray({
    control,
    name: "time_slot",
  });

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const timeOptions = useMemo(() => generateTimeSlots(), []);
  const start_date = watch("start_date");
  const end_date = watch("end_date");

  useEffect(() => {
    if (!treatmentPlanData) return;

    const treatmentPlanArray = treatmentPlanData.data.treatmentPlans;
    const data = treatmentPlanArray.find((item) => item.id === formId)!;
    const treatmentSchedule = data?.treatmentSchedule;
    if (
      treatmentSchedule &&
      Array.isArray(treatmentSchedule) &&
      treatmentSchedule?.length > 0
    ) {
      setSchedule(treatmentSchedule[0]);
      setMethod("PATCH");
    }
  }, [treatmentPlanData, formId]);

  useEffect(() => {
    if (loaded === "handled" && start_date && end_date) {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const data = daysOfWeek.map((day: string) => ({
        day_of_week: day,
        start_time: "",
        end_time: "",
        checked: false,
      }));
      setValue("time_slot", data);
    }
  }, [start_date, end_date, loaded, setValue]);

  const processedTimeSlots = useCallback((data: TIME_SLOT[]) => {
    return data.map((slot: TIME_SLOT) => ({
      ...slot,
      start_time: normalizeTimeFormat(slot.start_time),
      end_time: normalizeTimeFormat(slot.end_time),
    }));
  }, []);

  const memoizedProcessedTimeSlots = useMemo(() => {
    if (schedule?.time_slot) {
      return processedTimeSlots(schedule.time_slot as unknown as TIME_SLOT[]);
    }
    return [];
  }, [schedule?.time_slot, processedTimeSlots]);

  useEffect(() => {
    if (schedule && loaded === "unloaded") {
      setLoaded("loaded");

      setValue("start_date", new Date(schedule.start_date));
      setValue("end_date", new Date(schedule.end_date));

      setValue("time_slot", memoizedProcessedTimeSlots);
    }
  }, [schedule, loaded, setValue, memoizedProcessedTimeSlots]);

  const onSubmit = async (data: any, isDraft?: boolean) => {
    const token = localStorage.getItem("token") as string;
    const requestData = {
      ...data,
      time_slot: isDraft
        ? data.time_slot
        : data.time_slot.filter((e: any) => e.checked),
    };

    const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans || [];
    const treatmentData = treatmentPlanArray.find(
      (item) => item.id === formId
    )!;
    const scheduleId = treatmentData?.treatmentSchedule[0]?.id ?? "";

    const response = await submitScheduleForm(
      token,
      requestData,
      clientId,
      method,
      scheduleId,
      formType,
      formId
    );

    if (response.status === false) {
      toast({
        variant: "destructive",
        description: response.errorMessage,
      });
      return;
    }

    if (isDraft) {
      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } else {
      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    }
  };

  const { mutate: submitSchedule, isPending: isSchedulePending } = useMutation({
    mutationFn: async (data: { data: any; isDraft?: boolean }) =>
      await onSubmit(data.data, data?.isDraft),
    onSuccess: () => {
      refetchTreatmentPlan();
    },
  });

  const handleTimeChange = (
    index: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    // Update the current day's time
    setValue(`time_slot.${index}.${field}`, value);

    // If this is the first day's time being set, update all other days
    if (index === 0) {
      const allFields = getValues("time_slot");
      allFields.forEach((_, fieldIndex) => {
        if (fieldIndex !== 0) {
          // Skip the first day since it's already set
          setValue(`time_slot.${fieldIndex}.${field}`, value);
        }
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(getValues());
      }}
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      <FormBanner text="All fields must be filled in unless marked as optional" />

      <div className="flex flex-col gap-1">
        <h3
          data-testid="schedule-header"
          className="text-[#0F172A] text-[24px] font-[600]"
        >
          Schedule
        </h3>
        <p className="text-[16px] font-[400] text-[#334155]">
          Client visits will be limited to the schedule set here. The schedule
          can be updated later.
        </p>
      </div>

      <DatePickerWithRange
        defaultDate={{
          from: getValues("start_date"),
          to: getValues("end_date"),
        }}
        getDate={(data) => {
          setLoaded("handled");
          if (data && data?.to) setValue("end_date", data.to);
          if (data && data?.from) setValue("start_date", data.from);
        }}
        isError={Boolean(errors.end_date || errors.start_date)}
        label="Date Range"
        data-testid="schedule-date-picker-range"
      />

      <div className="flex flex-col gap-2 w-full xl:w-[60%]">
        <h3 className="text-[#0F172A] text-[16px] font-[600]">
          Weekly Schedule
        </h3>

        {fields.map((scheduleField, index) => {
          const watchedStartTime = watch(`time_slot.${index}.start_time`);

          return (
            <div
              key={scheduleField.id}
              className="flex items-center xl:justify-between gap-5"
            >
              <div className="flex gap-2 items-center">
                <Controller
                  name={`time_slot.${index}.checked`}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox
                      data-testid={`timeslot-${index}-checkbox`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <span
                  data-testid={`timeslot-${index}-day-of-week`}
                  className="text-[#0F172A] text-[14px] font-[600]"
                >
                  {scheduleField.day_of_week}
                </span>
              </div>

              <div className="flex gap-3 items-center w-[60%]">
                <Controller
                  name={`time_slot.${index}.start_time`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      labelText=""
                      placeholder="Select"
                      selectContent={timeOptions}
                      value={field.value}
                      onValueChange={(e) => {
                        handleTimeChange(index, "start_time", e);
                      }}
                      data-testid={`timeslot-${index}-start-time`}
                    />
                  )}
                />
                <DashIcon className="w-16 h-16" />
                <Controller
                  name={`time_slot.${index}.end_time`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      labelText=""
                      placeholder="Select"
                      selectContent={filterEndTimeOptions(
                        watchedStartTime,
                        timeOptions
                      )}
                      value={field.value}
                      onValueChange={(e) => {
                        handleTimeChange(index, "end_time", e);
                      }}
                      data-testid={`timeslot-${index}-end-time`}
                    />
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1 || isSchedulePending}
          data-testid="previous-section-button"
        >
          <DoubleArrowLeftIcon className="w-5 h-5" />
          Previous Section
        </Button>

        {!isFormDisabled && (
          <Button
            variant="light"
            type="button"
            disabled={isSchedulePending}
            isLoading={isSchedulePending}
            onClick={async () =>
              submitSchedule({ data: getValues(), isDraft: true })
            }
            data-testid="save-draft-button"
          >
            Save Draft
          </Button>
        )}

        {isFormDisabled ? (
          <Button
            onClick={() => {
              handleChangeIndex(currentIndex + 1);
            }}
            data-testid="next-section-button"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isFormDisabled || isSchedulePending}
            onClick={() => {
              submitSchedule({ data: getValues() });
            }}
            isLoading={isSchedulePending}
            data-testid="next-section-button"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default Schedule;
