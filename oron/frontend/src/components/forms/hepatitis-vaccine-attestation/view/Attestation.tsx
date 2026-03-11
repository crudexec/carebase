"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Button from "@/components/button/Button";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useLogic from "../logic/attestation/useLogic";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import FormInput from "@/components/input-fields/FormInput";
import { User } from "@/types/UserTypes";

const Attestation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
  formCompleted,
  status,
  reviewNote,
  informationMethod,
  user,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  refetch: any;
  data: HepatitisResponse | boolean | undefined;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
  informationMethod: "POST" | "PATCH";
  user: User;
}) => {
  const { state, mutate, defaultValue, information } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    { informationMethod, attestationMethod: method },
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
          variant="success"
          text="Your Hepatitis B Vaccination Attestation Form has been successfully submitted. We'll notify you once it's approved."
        />
      )}

      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

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

      <div className="flex flex-col gap-5">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">Attestation</h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          I understand that a series of three injections of Hepatitis B vaccines
          is needed to become protected from the Hepatitis B virus (HBV). I
          understand that if I do not become protected from HBV by receiving the
          HBV vaccination, and if I have direct contact with blood or other
          bodily fluids at work, that I will need to receive post-exposure
          treatment.
          <br />
          <br />
          With this understanding, I have chosen one of the following 3 options
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-[16px] font-[500] text-[#0F172A]">
          Please Select one
        </h4>
        <RadioGroup
          disabled={isFormDisabled}
          defaultValue={defaultValue}
          name="attestation"
          className="flex flex-col gap-5"
        >
          <div className="flex items-start gap-2">
            <RadioGroupItem
              id="1"
              value="had_hepatitis_b_vaccine_series_of_three"
            />
            <Label
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.includes("attestation") && "text-[#EF4444]"
              } `}
              htmlFor="1"
            >
              I have already had the Hepatitis B vaccination series of 3
              vaccines.
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <RadioGroupItem
              id="2"
              value="arranged_for_hepatitis_b_vaccine_series_of_three"
            />
            <Label
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.includes("attestation") && "text-[#EF4444]"
              } `}
              htmlFor="2"
            >
              I will make arrangements with my health care provider to get the
              Hepatitis B series of 3 vaccines.
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <RadioGroupItem
              id="3"
              value="declined_hepatitis_b_vaccine_series_of_three"
            />
            <Label
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.includes("attestation") && "text-[#EF4444]"
              } `}
              htmlFor="3"
            >
              I understand that due to my occupational exposure to blood or
              other potentially infectious materials that I may be at risk of
              acquiring Hepatitis B virus (HBV) infection. I have been given the
              opportunity to be vaccinated with the Hepatitis B vaccine, at no
              charge to myself. However, I decline the Hepatitis B vaccination
              at this time. I understand that by declining this vaccine, I
              continue to be at risk of acquiring the Hepatitis B infection, a
              serious disease. If in the future, I continue to have occupational
              exposure to blood or other potentially infectious materials and I
              change my mind.
            </Label>
          </div>
        </RadioGroup>

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            variant="light"
          >
            Previous Section
          </Button>

          {currentIndex !== 2 && <Button type="submit">Next Section</Button>}
        </div>
      </div>
    </form>
  );
};

export default Attestation;
