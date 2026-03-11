"use client";

import { User } from "@/types/UserTypes";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useLogic from "../logic/information/useLogic";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const Information = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  method,
  refetch,
  data,
  status,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  data: HepatitisResponse | boolean | undefined;
  status: FormattedFormStatus;
}) => {
  const { state, mutate, information } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    method,
    data
  );
  const { isFormDisabled, error } = state;

  return (
    <form
      action={mutate}
      className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      {status === "Awaiting Approval" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <h3 className="text-[#0F172A] text-[18px] font-[600]">Information</h3>

      <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
        <FormInput
          disabled={isFormDisabled}
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
          disabled={isFormDisabled}
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
