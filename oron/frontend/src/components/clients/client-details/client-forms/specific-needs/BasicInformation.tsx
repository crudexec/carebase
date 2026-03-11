"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import FormBanner from "@/components/banner/FormBanner";
import { IntakeType } from "@/types/IntakeForm";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import FormInput from "@/components/input-fields/FormInput";
import FormSelect from "@/components/input-fields/FormSelect";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import { formatDateToUTCString } from "@/utils/date-utils";
import { formatPhoneNumber, revertFormattedPhoneNumber } from "@/utils/helpers";
import { submitBasicInformationForm } from "@/actions/clients/specific-needs/specificNeeds";
import { toast } from "@/components/ui/use-toast";
import { validateField } from "@/lib/api-utils";
import { useEffect, useState } from "react";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

// Define the form schema using Zod
const basicInfoSchema = z.object({
  participant_first_name: z.string().min(1, "First name is required"),
  participant_last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  father_name: z.string().min(1, "Father's name is required"),
  mother_name: z.string().min(1, "Mother's name is required"),
  father_mobile_number: z.string().min(1, "Father Phone number is required"),
  mother_mobile_number: z.string().min(1, "Mother Phone number is required"),
  home_address: z.string().min(1, "Home address is required"),
});

// Infer the type from the schema
type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: IntakeType | undefined;
  clientId: string;
  specificNeedsData: FullSpecificNeedsForm | undefined;
  refetchSpecificNeeds: any;
}

const BasicInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  clientId,
  specificNeedsData,
  refetchSpecificNeeds,
}: Props) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      participant_first_name:
        user?.clientInformation?.first_name ?? user?.first_name ?? "",
      participant_last_name:
        user?.clientInformation?.last_name ?? user?.last_name ?? "",
      gender: user?.clientInformation?.sex ?? "",
      date_of_birth: user?.clientInformation?.date_of_birth ?? "",
      father_name: user?.fatherContactInformation?.first_name ?? "",
      mother_name: user?.motherContactInformation?.first_name ?? "",
      father_mobile_number:
        user?.fatherContactInformation?.home_phone_number ?? "",
      mother_mobile_number:
        user?.motherContactInformation?.home_phone_number ?? "",
      home_address: user?.clientInformation?.address_or_street ?? "",
    },
  });

  useEffect(() => {
    if (!specificNeedsData) return;

    const data = specificNeedsData?.data;
    const basicInformation = data?.basicInformation;

    if (basicInformation) {
      setMethod("PATCH");

      // Set all form fields with the basic information data
      setValue(
        "participant_first_name",
        basicInformation.participant_first_name
      );
      setValue("participant_last_name", basicInformation.participant_last_name);
      setValue("father_name", basicInformation.participant_father_name);
      setValue("mother_name", basicInformation.participant_mother_name);
      setValue("gender", basicInformation.gender);
      setValue("date_of_birth", basicInformation.date_of_birth);
      setValue("father_mobile_number", basicInformation.father_mobile_number);
      setValue("mother_mobile_number", basicInformation.mother_mobile_number);
      setValue("home_address", basicInformation.home_address);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificNeedsData]);

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setIsLoading(true);

      const basicInformation = specificNeedsData?.data?.basicInformation;
      const token = localStorage.getItem("token") as string;

      const requestBody = {
        participant_first_name: validateField(data.participant_first_name),
        participant_last_name: validateField(data.participant_last_name),
        gender: validateField(data.gender),
        date_of_birth: validateField(data.date_of_birth, true),
        father_name: validateField(data.father_name),
        mother_name: validateField(data.mother_name),
        father_mobile_number: validateField(
          revertFormattedPhoneNumber(data.father_mobile_number)
        ),
        mother_mobile_number: validateField(
          revertFormattedPhoneNumber(data.mother_mobile_number)
        ),
        home_address: validateField(data.home_address),
      };

      const { status, errorMessage } = await submitBasicInformationForm(
        token,
        requestBody,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        basicInformation?.id
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
      console.error("Error submitting form:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while submitting the form",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    const formData = getValues();
    try {
      setIsSubmittingDraft(true);

      const basicInformation = specificNeedsData?.data?.basicInformation;
      const token = localStorage.getItem("token") as string;

      const requestBody = {
        participant_first_name: validateField(formData.participant_first_name),
        participant_last_name: validateField(formData.participant_last_name),
        gender: validateField(formData.gender),
        date_of_birth: validateField(formData.date_of_birth, true),
        father_name: validateField(formData.father_name),
        mother_name: validateField(formData.mother_name),
        father_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.father_mobile_number)
        ),
        mother_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.mother_mobile_number)
        ),
        home_address: validateField(formData.home_address),
      };

      const { status, errorMessage } = await submitBasicInformationForm(
        token,
        requestBody,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        basicInformation?.id
      );

      await refetchSpecificNeeds();

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
      console.error("Error saving draft:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while saving the draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[4vh]">
      <FormBanner
        variant="warning"
        text="Review prefilled fields to make sure they are correct for this form"
      />

      <h3
        data-testid="basic-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Basic Information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="participant_first_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={true}
                placeholder="Enter participant's first name"
                type="text"
                labelText="Participant's First Name"
                isAuth={false}
                errorMessage={errors.participant_first_name?.message}
                isError={!!errors.participant_first_name}
                data-testid="first-name"
              />
            )}
          />

          <Controller
            name="participant_last_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={true}
                placeholder="Enter participant's last name"
                type="text"
                labelText="Participant's Last Name"
                isAuth={false}
                errorMessage={errors.participant_last_name?.message}
                isError={!!errors.participant_last_name}
                data-testid="last-name"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormSelect
                disabled={isFormDisabled}
                labelText="Gender"
                selectContent={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                placeholder="Select"
                errorMessage={errors.gender?.message}
                isError={!!errors.gender}
                onValueChange={field.onChange}
                value={field.value}
                data-testid="gender-select"
              />
            )}
          />

          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DatePicker
                disabled={isFormDisabled}
                label="Date of Birth"
                errorMessage={errors.date_of_birth?.message}
                isError={!!errors.date_of_birth}
                getDate={(date) => {
                  const dateString = formatDateToUTCString(date);
                  field.onChange(dateString);
                }}
                defaultDate={field.value ? new Date(field.value) : undefined}
                data-testid="date-of-birth-picker"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="father_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={isFormDisabled}
                placeholder="Enter client's father's name"
                type="text"
                labelText="Father's Name"
                isAuth={false}
                errorMessage={errors.father_name?.message}
                isError={!!errors.father_name}
                data-testid="father-name"
              />
            )}
          />

          <Controller
            name="mother_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={isFormDisabled}
                placeholder="Enter client's mother's name"
                type="text"
                labelText="Mother's Name"
                isAuth={false}
                errorMessage={errors.mother_name?.message}
                isError={!!errors.mother_name}
                data-testid="mother-name"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="father_mobile_number"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={formatPhoneNumber(field.value)}
                disabled={isFormDisabled}
                placeholder="+1 (555) 000-0000"
                type="text"
                labelText="Father's Mobile Number"
                isAuth={false}
                withSelect={true}
                selectDefaultValue="US"
                selectValue={["US"]}
                isPhoneNumber
                errorMessage={errors.father_mobile_number?.message}
                isError={!!errors.father_mobile_number}
                data-testid="father-mobile-number"
              />
            )}
          />

          <Controller
            name="mother_mobile_number"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={formatPhoneNumber(field.value)}
                disabled={isFormDisabled}
                placeholder="+1 (555) 000-0000"
                type="text"
                labelText="Mother's Mobile Number"
                isAuth={false}
                withSelect={true}
                selectDefaultValue="US"
                selectValue={["US"]}
                isPhoneNumber
                errorMessage={errors.mother_mobile_number?.message}
                isError={!!errors.mother_mobile_number}
                data-testid="mother-mobile-number"
              />
            )}
          />
        </div>

        <Controller
          name="home_address"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              disabled={isFormDisabled}
              placeholder="Enter participant's contact's address"
              type="text"
              labelText="Home Address"
              isAuth={false}
              errorMessage={errors.home_address?.message}
              isError={!!errors.home_address}
              data-testid="home-address"
            />
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              onClick={handleDraftSubmit}
              type="button"
              isLoading={isSubmittingDraft}
              disabled={isSubmittingDraft}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => handleChangeIndex(2)}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              data-testid="next-section-button"
              type="submit"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default BasicInformation;
