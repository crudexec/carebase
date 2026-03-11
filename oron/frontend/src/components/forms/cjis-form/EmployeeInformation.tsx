"use client";

import { useState, useEffect } from "react";
import FormInput from "@/components/input-fields/FormInput";
import { User } from "@/types/UserTypes";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import {
  CJISEmployeeInformationSchema,
  CJISEmployeeInformationType,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import { useToast } from "@/components/ui/use-toast";
import { handleCJISEmployeeInformationSubmission } from "@/actions/forms/cjis-form";
import FormFooterNavigation from "@/components/form-footer-navigation/FormFooterNavigation";
import { formatDateToUTCString } from "@/utils/date-utils";

const EmployeeInformation = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  refetch,
  method,
  formInfo,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  refetch: any;
  method: "POST" | "PATCH";
  formInfo: any;
}) => {
  const { toast } = useToast();
  const [dateOfHire, setDateOfHire] = useState("");
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  let employeeInformation: any;

  if (typeof formInfo === "boolean") {
    employeeInformation = undefined;
  } else {
    employeeInformation = formInfo?.data?.employeeInformation;
  }

  const isFormDisabled =
    formInfo?.data?.cjisForm?.status === "awaiting_approval" ||
    formInfo?.data?.cjisForm?.status === "approved";

  useEffect(() => {
    if (
      employeeInformation &&
      typeof employeeInformation === "object" &&
      Object.keys(employeeInformation).length > 0
    ) {
      setDateOfHire(employeeInformation?.date_of_hire);
    }
  }, [employeeInformation]);

  const handleSubmit = async (formData: FormData) => {
    if (isFormDisabled) {
      handleChangeIndex(currentIndex + 1);
    }

    try {
      const lastName = formData.get("lastName") as string;
      const firstName = formData.get("firstName") as string;
      const employeeId = "";
      const jobTitle = "";

      const data: CJISEmployeeInformationType = {
        lastName,
        firstName,
        employeeId,
        jobTitle,
        dateOfHire,
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        CJISEmployeeInformationSchema
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

      const response = await handleCJISEmployeeInformationSubmission(
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

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1 mt-5">
        <h3 className="text-[#0F172A] text-[24px] font-[600]">
          Employee Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          We&apos;ve already filled in some of the fields based on the
          information you provided earlier.
        </p>
      </div>

      <div className="mt-5 w-full flex flex-col xl:flex-row justify-between items-start gap-5">
        <FormInput
          defaultValue={
            employeeInformation?.last_name ?? user?.data?.last_name ?? ""
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
          disabled={isFormDisabled}
        />
        <FormInput
          defaultValue={
            employeeInformation?.first_name ?? user?.data?.first_name ?? ""
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
          disabled={isFormDisabled}
        />
      </div>

      <div className="xl:w-[50%] w-full flex flex-col xl:flex-row justify-between items-start gap-5">
        <DatePicker
          defaultDate={
            dateOfHire && dateOfHire?.length > 1
              ? new Date(dateOfHire)
              : undefined
          }
          getDate={(date) => setDateOfHire(formatDateToUTCString(date))}
          label="Date of Hire"
          errorMessage={error.message.find((message) =>
            message.includes("Date")
          )}
          isError={!!error.field.find((field) => field.includes("Date"))}
          disabled={isFormDisabled}
        />
      </div>

      <FormFooterNavigation
        currentIndex={currentIndex}
        handleChangeIndex={handleChangeIndex}
        totalSection={2}
      />
    </form>
  );
};

export default EmployeeInformation;
