"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { useToast } from "@/components/ui/use-toast";
import {
  ServiceCordinatorSchema,
  ServiceCordinatorFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import FormSelect from "@/components/input-fields/FormSelect";
import { COUNTRIES } from "@/constants";
import { handleServiceCordinatorSubmission } from "@/actions/clients/new-intake/service-coordinator";
import useFormInputListener from "@/hooks/forms/useFormInputListener";
import { formatPhoneNumber, revertFormattedPhoneNumber } from "@/utils/helpers";
import { IntakeType } from "@/types/IntakeForm";

const ServiceCordinatorInformation = ({
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

  const formRef = useRef<HTMLFormElement>(null);

  const { setInputValue, values } = useFormInputListener(formRef, false);
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);
  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.service_coordinator_information_id
    ) {
      setInputValue(
        "phoneNumber",
        formatPhoneNumber(
          intakeForm?.serviceCoordinatorInformation?.phone ?? ""
        )
      );
      setRequestMethod("PATCH");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const fullname = formData.get("fullName") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phoneNumber") as string;
      const country = formData.get("country") as string;
      const faxNumber = formData.get("faxNumber") as string;

      const phoneNumber = revertFormattedPhoneNumber(phone);

      const data: ServiceCordinatorFormData = {
        fullname,
        email,
        phoneNumber,
        country,
        faxNumber,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;

        const response = await handleServiceCordinatorSubmission(
          data,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.emergency_contact_information_id ?? "-",
          intakeForm?.service_coordinator_information_id ?? "-",
          intakeForm?.id ?? "-"
        );

        await refetch();

        setIsSavingToDraft(false);

        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
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
      //   ServiceCordinatorSchema
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

      const response = await handleServiceCordinatorSubmission(
        data,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.emergency_contact_information_id ?? "-",
        intakeForm?.service_coordinator_information_id ?? "-",
        intakeForm?.id ?? "-"
      );

      await refetch();

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeSectionid(response.errorMessage);
      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <section className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3
        data-testid="service-cordinator-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Service Co-ordinator&apos;s Information
      </h3>

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-7">
        <FormInput
          defaultValue={
            intakeForm?.serviceCoordinatorInformation?.full_name ?? ""
          }
          name="fullName"
          placeholder="Enter Service Co-ordinator's full name"
          type="text"
          labelText="Full Name"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Full name")
          )}
          isError={!!error.field.find((field) => field.includes("Full name"))}
          disabled={isViewing}
          data-testid="sc-full-name-input"
        />

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            defaultValue={
              intakeForm?.serviceCoordinatorInformation?.email ?? ""
            }
            name="email"
            placeholder="Enter Service Co-ordinator's email address"
            type="text"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("email")
            )}
            isError={!!error.field.find((field) => field.includes("email"))}
            disabled={isViewing}
            data-testid="sc-email-input"
          />
          <FormInput
            value={formatPhoneNumber(values.phoneNumber ?? "")}
            onChange={(e) => {
              setInputValue(e.target.name, formatPhoneNumber(e.target.value));
            }}
            name="phoneNumber"
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Phone Number"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Phone number")
            )}
            isError={
              !!error.field.find((field) => field.includes("Phone number"))
            }
            disabled={isViewing}
            data-testid="sc-phone-number-input"
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormSelect
            defaultValue={
              intakeForm?.serviceCoordinatorInformation?.country ??
              "United States"
            }
            name="country"
            labelText="Select Country"
            placeholder="Country"
            errorMessage={error.message.find((message) =>
              message.includes("Country")
            )}
            isError={!!error.field.find((field) => field.includes("Country"))}
            selectContent={COUNTRIES}
            disabled={isViewing}
            data-testid="sc-country-select"
          />
          <FormInput
            defaultValue={
              intakeForm?.serviceCoordinatorInformation?.fax_number ?? ""
            }
            name="faxNumber"
            placeholder="Enter fax number"
            type="text"
            labelText="Fax Number"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Fax number")
            )}
            isError={
              !!error.field.find((field) => field.includes("Fax number"))
            }
            disabled={isViewing}
            data-testid="sc-fax-number-input"
          />
        </div>

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

export default ServiceCordinatorInformation;
