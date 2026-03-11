"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import FormBanner from "@/components/banner/FormBanner";
import FormInput from "@/components/input-fields/FormInput";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { toast } from "@/components/ui/use-toast";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import FormSelect from "@/components/input-fields/FormSelect";
import { TrashIcon } from "lucide-react";
import { submitAlpIntroduction } from "@/actions/clients/alp-form/intakeAssessment";

interface Person {
  name: string;
  relation: string;
  duration: string;
}

const introductionSchema = z.object({
  date_of_meeting: z.string().min(1, "Date of meeting is required"),
  meeting_location: z.string().min(1, "Meeting location is required"),
  people_present: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        relation: z.string().min(1, "Relation is required"),
        duration: z.string().min(1, "Duration is required"),
      })
    )
    .min(1, "At least one person must be present"),
  parent_alp_goal: z.string().min(1, "Parent ALP goal is required"),
  overview_of_alp_services: z
    .string()
    .min(1, "Overview of ALP services is required"),
  review_of_initial_assessment: z
    .string()
    .min(1, "Review of initial assessment is required"),
  review_of_lifestyle_summary: z
    .string()
    .min(1, "Review of lifestyle summary is required"),
  review_of_transition_checklist: z
    .string()
    .min(1, "Review of transition checklist is required"),
  additional_comments_from_parents: z.string().optional(),
  alp_provider_comments: z.string().optional(),
});

type IntroductionFormData = z.infer<typeof introductionSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const AlpIntakeAssessmentIntroduction = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IntroductionFormData>({
    resolver: zodResolver(introductionSchema),
    defaultValues: {
      people_present: [{ name: "", relation: "", duration: "" }],
      additional_comments_from_parents: "",
      alp_provider_comments: "",
    },
  });

  const onSubmit = async (data: IntroductionFormData) => {
    try {
      // TODO: Implement submission logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpIntroduction(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING INTRODUCTION", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      // TODO: Implement draft saving logic

      const token = localStorage.getItem("token") as string;
      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpIntroduction(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const addPerson = () => {
    const currentPeople = watch("people_present");
    setValue("people_present", [
      ...currentPeople,
      { name: "", relation: "", duration: "" },
    ]);
  };

  const removePerson = (index: number) => {
    const currentPeople = watch("people_present");
    if (currentPeople.length > 1) {
      setValue(
        "people_present",
        currentPeople.filter((_, i) => i !== index)
      );
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Introduction</h3>

      <FormBanner
        text="Review prefilled fields to make sure they are correct for this form. All fields must be filled unless marked as optional."
        variant="warning"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="bg-white border rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)}
            className="w-full px-6 py-4 flex justify-between items-center"
          >
            <h3 className="text-[#0F172A] text-[20px] font-[600]">
              Introduction
            </h3>
            <ChevronDownIcon
              className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
                isBasicInfoOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isBasicInfoOpen && (
            <div className="p-6 border-t border-[#EEEFF1]">
              <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                  <p className="text-[#0F172A] text-[14px] font-[600]">
                    Participant Name
                  </p>
                  <p className="text-[#475569] text-[14px] font-[400]">
                    Taye Smith
                  </p>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                  <p className="text-[#0F172A] text-[14px] font-[600]">
                    Date of Birth
                  </p>
                  <p className="text-[#475569] text-[14px] font-[400]">
                    05-02-2001
                  </p>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                  <p className="text-[#0F172A] text-[14px] font-[600]">Age</p>
                  <p className="text-[#475569] text-[14px] font-[400]">12</p>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                  <p className="text-[#0F172A] text-[14px] font-[600]">
                    Gender
                  </p>
                  <p className="text-[#475569] text-[14px] font-[400]">Male</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="date_of_meeting"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                disabled={isFormDisabled}
                label="Date Of Meeting"
                getDate={(date) => field.onChange(date.toDateString())}
                isError={Boolean(errors.date_of_meeting?.message)}
                errorMessage={errors.date_of_meeting?.message}
              />
            )}
          />
          <Controller
            name="meeting_location"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="Meeting Location"
                placeholder="Select location"
                selectContent={[
                  { label: "TI Technician", value: "TI Technician" },
                  { label: "Home", value: "Home" },
                  { label: "School", value: "School" },
                  { label: "Community", value: "Community" },
                ]}
                isError={Boolean(errors.meeting_location?.message)}
                errorMessage={errors.meeting_location?.message}
                disabled={isFormDisabled}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-[16px] font-[600] text-[#0F172A]">
            People Present At The Intake
          </h3>

          {watch("people_present").map((_, index) => (
            <div key={index} className="flex  gap-5 items-center">
              <Controller
                name={`people_present.${index}.name`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    labelText={`Name (Person ${index + 1})`}
                    placeholder="Enter name"
                    type="text"
                    isAuth={false}
                    disabled={isFormDisabled}
                    isError={Boolean(errors.people_present?.[index]?.name)}
                    errorMessage={errors.people_present?.[index]?.name?.message}
                  />
                )}
              />
              <Controller
                name={`people_present.${index}.relation`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    labelText="Relation to participant"
                    placeholder="Enter relation"
                    type="text"
                    isAuth={false}
                    disabled={isFormDisabled}
                    isError={Boolean(errors.people_present?.[index]?.relation)}
                    errorMessage={
                      errors.people_present?.[index]?.relation?.message
                    }
                  />
                )}
              />
              <Controller
                name={`people_present.${index}.duration`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    labelText="How long you've known participant"
                    placeholder="Enter duration"
                    type="text"
                    isAuth={false}
                    disabled={isFormDisabled}
                    isError={Boolean(errors.people_present?.[index]?.duration)}
                    errorMessage={
                      errors.people_present?.[index]?.duration?.message
                    }
                  />
                )}
              />
              <button
                type="button"
                onClick={() => removePerson(index)}
                className="p-2 hover:bg-red-50 rounded-md"
              >
                <TrashIcon className="w-5 h-5 text-black" />
              </button>
            </div>
          ))}

          {!isFormDisabled && (
            <button
              type="button"
              onClick={addPerson}
              className="w-fit text-[14px] font-[600] text-black hover:text-[#0F172A] bg-[#eff3f6] hover:bg-[#e2e6e9] rounded-md py-2 px-4 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add person
            </button>
          )}
        </div>

        <Controller
          name="parent_alp_goal"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Parent ALP Goal & Expectation"
              placeholder="Enter here.."
              isError={Boolean(errors.parent_alp_goal?.message)}
              errorMessage={errors.parent_alp_goal?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="overview_of_alp_services"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Overview Of ALP Services Road Map"
              placeholder="Enter here.."
              isError={Boolean(errors.overview_of_alp_services?.message)}
              errorMessage={errors.overview_of_alp_services?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="review_of_initial_assessment"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Review Of Initial Formal Assessment Tool"
              placeholder="Enter here.."
              isError={Boolean(errors.review_of_initial_assessment?.message)}
              errorMessage={errors.review_of_initial_assessment?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="review_of_lifestyle_summary"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Review Of The Personal Lifestyle Summary Tool"
              placeholder="Enter here.."
              isError={Boolean(errors.review_of_lifestyle_summary?.message)}
              errorMessage={errors.review_of_lifestyle_summary?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="review_of_transition_checklist"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Review Of The Transition Tool Checklist"
              placeholder="Enter here.."
              isError={Boolean(errors.review_of_transition_checklist?.message)}
              errorMessage={errors.review_of_transition_checklist?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="additional_comments_from_parents"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="Additional Comments/Questions From Parents"
              placeholder="Enter here.."
              isError={Boolean(
                errors.additional_comments_from_parents?.message
              )}
              errorMessage={errors.additional_comments_from_parents?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <Controller
          name="alp_provider_comments"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText="ALP Provider Additional Comments"
              placeholder="Enter here.."
              isError={Boolean(errors.alp_provider_comments?.message)}
              errorMessage={errors.alp_provider_comments?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default AlpIntakeAssessmentIntroduction;
