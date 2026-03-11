"use client";

import { useState, useEffect } from "react";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DatePicker } from "../../calendar/CalendarSelect";
import { useToast } from "@/components/ui/use-toast";
import {
  ReferralInformationSchema,
  ReferralInformationFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import { handleReferralInformationSubmission } from "@/actions/clients";
import { IntakeType } from "@/types/IntakeForm";
import FormSelect from "@/components/input-fields/FormSelect";
import { formatDateToUTCString } from "@/utils/date-utils";

const ReferralInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  prevSectionId,
  handleChangeSectionid,
  intakeForm,
  isEditing,
  isViewing,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  prevSectionId: string;
  handleChangeSectionid: (newId: string) => void;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;
  refetch: any;
}) => {
  const { toast } = useToast();

  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });
  const [dateOfReferral, setDateOfReferral] = useState<string>("");
  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.referral_information_id
    ) {
      setRequestMethod("PATCH");
      setDateOfReferral(
        intakeForm?.referralInformation?.date_of_referral ?? ""
      );
    }
  }, [intakeForm]);

  const getDateOfReferral = (date: Date) => {
    setDateOfReferral(formatDateToUTCString(date));
  };

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const referralType = formData.get("referralType") as string;
      const referralSourceName = formData.get("referralSourceName") as string;

      const data: ReferralInformationFormData = {
        dateOfReferral,
        referralType,
        referralSourceName,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleReferralInformationSubmission(
          data,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.client_information_id ?? "-",
          intakeForm?.referral_information_id ?? "-",
          intakeForm?.id ?? "-"
        );

        await refetch();

        setIsSavingToDraft(false);

        if (!response.status) {
          toast({
            variant: "destructive",
            description: "An error occurred while submitting form! try again",
          });
          return;
        }

        toast({
          variant: "success",
          description: "Draft Saved Successfully",
        });
        return;
      }

      // const validationResult = validationEngine(
      //   data,
      //   validateForm,
      //   ReferralInformationSchema
      // );

      // if (validationResult.field.length > 0) {
      //   setError(validationResult);
      //   toast({
      //     variant: "destructive",
      //     description: "Please complete all required fields.",
      //   });
      //   return;
      // }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleReferralInformationSubmission(
        data,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.client_information_id ?? "-",
        intakeForm?.referral_information_id ?? "-",
        intakeForm?.id ?? "-"
      );

      await refetch();

      if (!response.status) {
        toast({
          variant: "destructive",
          description: "An error occurred while submitting form! try again",
        });
        return;
      }

      handleChangeSectionid(response.errorMessage);
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <section className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3
        data-testid="referral-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Referral Information
      </h3>

      <form action={handleSubmit} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <DatePicker
            defaultDate={
              dateOfReferral && dateOfReferral.length > 1
                ? new Date(dateOfReferral)
                : undefined
            }
            errorMessage={error.message.find((message) =>
              message.includes("Date of Referral")
            )}
            isError={
              !!error.field.find((field) => field.includes("Date of Referral"))
            }
            label="Date of Referral"
            getDate={getDateOfReferral}
            disabled={isViewing}
            data-testid="date-of-referral-picker"
          />

          <FormSelect
            disabled={isViewing}
            defaultValue={intakeForm?.referralInformation?.referral_type ?? ""}
            name="referralType"
            errorMessage={error.message.find((message) =>
              message.includes("Referral Type")
            )}
            isError={
              !!error.field.find((field) => field.includes("Referral Type"))
            }
            labelText="Referral Type"
            selectContent={[
              {
                label: "Service Coordinator",
                value: "Service Coordinator",
              },
              {
                label: "Agency",
                value: "Agency",
              },
              {
                label: "Individual",
                value: "Individual",
              },
            ]}
            placeholder="Select Referral Type"
            data-testid="referral-type-select"
          />
        </div>
        <FormInput
          disabled={isViewing}
          defaultValue={
            intakeForm?.referralInformation?.referral_source_name ?? ""
          }
          errorMessage={error.message.find((message) =>
            message.includes("Referral Source Name")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Referral Source Name")
            )
          }
          name="referralSourceName"
          placeholder="Enter the referral source name"
          type="text"
          labelText="Referral Source Name"
          isAuth={false}
          data-testid="referral-source-input"
        />

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-full">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            Previous Section
          </Button>

          {!isViewing && (
            <Button
              disabled={isViewing}
              variant="light"
              type="submit"
              onClick={() => {
                setIsSavingToDraft(true);
              }}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          <Button data-testid="next-section-button" type="submit">
            Next Section
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ReferralInformation;
