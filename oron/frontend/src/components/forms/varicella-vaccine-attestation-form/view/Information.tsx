"use client";

import { useState } from "react";
import { User } from "@/types/UserTypes";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { useToast } from "@/components/ui/use-toast";
import { validationEngine, validateForm } from "@/utils/validators";
import {
  PneumococcalVaccinationEmployeeInformationFormData,
  pneumococcalVaccinationEmployeeInformationSchema,
} from "@/utils/schemas";
import {
  VaricellaEmployeeInformation,
  VaricellaResponse,
} from "@/types/form-types/VaricellaFormTypes";
import { handleVaricellaInformationFormSubmission } from "@/actions/forms";
import FormBanner from "@/components/banner/FormBanner";
import { formatDateToUTCString } from "@/utils/date-utils";

const Information = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  method,
  refetch,
  data,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  data: VaricellaResponse | boolean | undefined;
}) => {
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  let formDisabled = false;
  let isFormAwaitingApproval: boolean = false;

  let information: VaricellaEmployeeInformation | undefined;
  if (typeof data === "boolean") {
    information = undefined;
  } else {
    if (
      data?.data?.status === "awaiting_approval" ||
      data?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    isFormAwaitingApproval = data?.data?.status === "awaiting_approval";

    information = data?.data.varicellaEmployeeInformation;
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

      const response = await handleVaricellaInformationFormSubmission(
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
      className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      {isFormAwaitingApproval && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <h3 className="text-[#0F172A] text-[18px] font-[600]">Information</h3>

      <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
        <FormInput
          disabled={formDisabled}
          defaultValue={information?.last_name ?? user?.data.last_name ?? ""}
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
          defaultValue={information?.first_name ?? user?.data.first_name ?? ""}
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

        {currentIndex !== 3 && <Button type="submit">Next Section</Button>}
      </div>
    </form>
  );
};

export default Information;
