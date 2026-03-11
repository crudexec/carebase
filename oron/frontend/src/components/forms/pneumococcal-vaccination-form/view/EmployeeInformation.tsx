"use client";

import { useState } from "react";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { User } from "@/types/UserTypes";
import { useToast } from "@/components/ui/use-toast";
import { validationEngine, validateForm } from "@/utils/validators";
import {
  PneumococcalVaccinationEmployeeInformationFormData,
  pneumococcalVaccinationEmployeeInformationSchema,
} from "@/utils/schemas";
import { handlePneumococcalEmployeeInformationFormSubmission } from "@/actions/forms";
import {
  PneumococcalEmployeeInformation,
  PneumococcalVaccinationForm,
} from "@/types/form-types/PneumococcalFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useCustomMutation from "@/hooks/useCustomMutation";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { formatDateToUTCString } from "@/utils/date-utils";

const EmployeeInformation = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  formInfo,
  refetch,
  formCompleted,
  status,
  reviewNote,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  formInfo: boolean | PneumococcalVaccinationForm | undefined;
  refetch: any;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
}) => {
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  let formDisabled: boolean = false;

  let processedEmployeeInformation: PneumococcalEmployeeInformation | undefined;
  if (typeof formInfo === "boolean") {
    processedEmployeeInformation = undefined;
  } else {
    if (
      formInfo?.data?.status === "awaiting_approval" ||
      formInfo?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    processedEmployeeInformation = formInfo?.data.employeeInformation;
  }

  const handleSubmit = async (formData: FormData) => {
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    }

    try {
      const lastName = formData.get("lastName") as string;
      const firstName = formData.get("firstName") as string;
      const jobTitle = "";

      const data: PneumococcalVaccinationEmployeeInformationFormData = {
        lastName,
        firstName,
        jobTitle,
        todayDate: formatDateToUTCString(new Date()),
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        pneumococcalVaccinationEmployeeInformationSchema
      );

      if (validationResult.field.length > 0) {
        setError(validationResult);
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;

      const response =
        await handlePneumococcalEmployeeInformationFormSubmission(
          data,
          token,
          method
        );

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate } = useCustomMutation<FormData>(handleSubmit, [
    "pneumococcalForm",
    "formData",
  ]);

  return (
    <form
      action={mutate}
      className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      {status === "Awaiting Approval" && (
        <FormBanner
          variant="success"
          text="Your Pneumococcal Vaccination Form has been successfully submitted. We'll notify you once it's approved."
        />
      )}

      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">
          Employee Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          We&apos;ve already filled in some of the fields based on the
          information you provided earlier.
        </p>
      </div>

      <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
        <FormInput
          disabled={formDisabled}
          defaultValue={
            processedEmployeeInformation?.last_name ??
            user?.data?.last_name ??
            ""
          }
          name="lastName"
          placeholder="Doe"
          type="text"
          labelText="Last Name (Family Name)"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Last")
          )}
          isError={!!error.field.find((field) => field.includes("Last"))}
        />
        <FormInput
          disabled={formDisabled}
          defaultValue={
            processedEmployeeInformation?.first_name ??
            user?.data?.first_name ??
            ""
          }
          name="firstName"
          placeholder="Sandra"
          type="text"
          labelText="First Name (Given Name)"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("First")
          )}
          isError={!!error.field.find((field) => field.includes("First"))}
        />
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
        >
          Previous Section
        </Button>

        {currentIndex !== 4 && <Button type="submit">Next Section</Button>}
      </div>
    </form>
  );
};

export default EmployeeInformation;
