"use client";

import { useForm, Controller } from "react-hook-form";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import FormSelect from "@/components/input-fields/FormSelect";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { BasicInformationSchema } from "../../logic/schema";

type FormData = z.infer<typeof BasicInformationSchema>;
const BasicInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
}) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BasicInformationSchema),
  });

  const onSubmit = (data: any) => {
    handleNewCompletedSection(currentIndex + 1);
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Basic Information
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="participant_last_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter participant's last name"
                type="text"
                labelText="Participant's Last Name (Family Name)"
                isAuth={false}
                isError={Boolean(errors.participant_last_name?.message)}
                // errorMessage={errors.participant_last_name?.message || ""}
              />
            )}
          />
          <Controller
            name="participant_first_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter participant's first name"
                type="text"
                labelText="Participant's First Name (Given Name)"
                isAuth={false}
                isError={Boolean(errors?.participant_first_name?.message)}
                // errorMessage={errors.participant_first_name?.message ?? ""}
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="participant_age"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Age"
                type="text"
                labelText="Age"
                isAuth={false}
                isError={Boolean(errors.participant_age?.message)}
              />
            )}
          />
          <Controller
            name="participant_gender"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="Sex"
                placeholder="Sex"
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                selectContent={[
                  { label: "Female", value: "Female" },
                  { label: "Male", value: "Male" },
                ]}
                isError={Boolean(errors.participant_gender?.message)}
              />
            )}
          />
        </div>

        <div className="flex w-full xl:w-[50%]">
          <Controller
            name="date_of_session"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date Of Session"
                // selected={field.value}µ∆
                // onChange={(date) => field.onChange(date)}
                // error={errors.date_of_session?.message}
                // defaultDate={field.value ? new Date(field.value) : undefined}
                getDate={(date) => {
                  setValue("date_of_session", date);
                }}
                isError={Boolean(errors.date_of_session?.message)}
                // errorMessage={errors.date_of_session?.message}
              />
            )}
          />
          {/* <DatePicker label="Date Of Session" getDate={(date) => {}} /> */}
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          <Button variant="light" type="button">
            Save Draft
          </Button>

          {currentIndex !== 6 && (
            <Button type="submit">
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default BasicInformation;
