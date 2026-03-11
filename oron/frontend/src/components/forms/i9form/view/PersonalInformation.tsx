"use client";

import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { INineFormResponse } from "@/types/form-types/FormTypes";
import Loader from "@/components/Loader";
import FormBanner from "../../../banner/FormBanner";
import { User } from "@/types/UserTypes";
import FormSelect from "@/components/input-fields/FormSelect";
import { STATES } from "@/constants";
import useLogic from "../logic/personal-information/useLogic";
import { formatSSN } from "@/utils";
import { useRef, useEffect } from "react";
import useFormInputListener from "@/hooks/forms/useFormInputListener";
import {
  FormCitySelect,
  FormStateSelect,
} from "@/components/location-selectors";
import { formatPhoneNumber } from "@/utils/helpers";

const PersonalInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  personalInformation,
  user,
  method,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  personalInformation: boolean | INineFormResponse | undefined;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
}) => {
  const {
    state,
    dispatch,
    mutate,
    biodata,
    biodataLoading,
    processedPersonalInformation,
    handleSSNChange,
  } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    method,
    personalInformation
  );
  const { error, isFormDisabled, socialSecurityNumber } = state;

  const formRef = useRef<HTMLFormElement>(null);

  const { handleGetValue, setInputValue, values } = useFormInputListener(
    formRef,
    biodataLoading
  );

  useEffect(() => {
    if (
      processedPersonalInformation &&
      Object.keys(processedPersonalInformation).length > 0 &&
      Object.keys(processedPersonalInformation.data.personalInformation)
        .length > 0
    ) {
      setInputValue(
        "socialSecurityNumber",
        processedPersonalInformation?.data.personalInformation
          .social_security_number ?? ""
      );

      setInputValue(
        "phoneNumber",
        formatPhoneNumber(
          processedPersonalInformation?.data?.personalInformation?.phone ?? ""
        )
      );
    } else if (biodata && Object.keys(biodata).length > 0) {
      setInputValue(
        "socialSecurityNumber",
        biodata?.data?.social_security_number ?? ""
      );

      setInputValue(
        "phoneNumber",
        formatPhoneNumber(biodata?.data?.phone ?? "")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biodata, processedPersonalInformation]);

  if (biodataLoading) {
    return <Loader />;
  }

  return (
    <form
      action={mutate}
      ref={formRef}
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 lg:mt-12"
    >
      {!isFormDisabled && (
        <FormBanner text="Review prefilled fields to make sure they are correct for this form " />
      )}

      {isFormDisabled && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <div className="flex flex-col gap-5">
        <h3 className="text-[18px] font-[600] text-[#0F172A]">
          Personal Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          We&apos;ve already filled in some of the fields based on the
          information you provided earlier.
        </p>
      </div>

      <div className="w-full flex flex-col gap-7">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data.personalInformation
                ?.last_name ??
              biodata?.data.last_name ??
              user?.data.last_name ??
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
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data.personalInformation
                ?.first_name ??
              biodata?.data?.first_name ??
              user?.data.first_name ??
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

        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data.personalInformation
                ?.middle_name ??
              biodata?.data?.middle_name ??
              ""
            }
            name="middleName"
            placeholder="Enter your middle initial"
            type="text"
            labelText="Middle initial (if any)"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Middle")
            )}
            isError={!!error.field.find((field) => field.includes("Middle"))}
          />
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data.personalInformation
                ?.other_last_name ??
              biodata?.data?.other_last_name ??
              ""
            }
            name="otherLastName"
            placeholder="Enter other last names used"
            type="text"
            labelText="Other last names used (If any)"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Other")
            )}
            isError={!!error.field.find((field) => field.includes("Other"))}
          />
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.personalInformation?.email ??
              biodata?.data?.email ??
              user?.data?.email ??
              ""
            }
            name="email"
            placeholder="pietro.schirano@gmail.com"
            type="email"
            labelText="Email Address"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("email")
            )}
            isError={!!error.field.find((field) => field.includes("email"))}
          />
          <FormInput
            disabled={isFormDisabled}
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
              message.includes("Phone")
            )}
            isError={!!error.field.find((field) => field.includes("Phone"))}
          />
        </div>

        <FormInput
          disabled={isFormDisabled}
          defaultValue={
            processedPersonalInformation?.data?.personalInformation?.address ??
            biodata?.data?.address ??
            ""
          }
          name="address"
          placeholder="Enter your home address"
          type="text"
          labelText="Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Address")
          )}
          isError={!!error.field.find((field) => field.includes("Address"))}
        />

        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.personalInformation
                ?.apartment_number ??
              biodata?.data?.apartment_number ??
              ""
            }
            name="apartmentNumber"
            placeholder="Enter apartment number"
            type="text"
            labelText="Apartment number (if any)"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Apartment")
            )}
            isError={!!error.field.find((field) => field.includes("Apartment"))}
          />

          <FormCitySelect
            name="city"
            countryCode="US"
            label="City or town"
            onCityChange={(city) => {
              setInputValue("cityOrTown", city);
            }}
            stateCode={values.state}
            value={values.city}
            errorMessage={error.message.find((message) =>
              message.includes("City")
            )}
            isError={!!error.field.find((field) => field.includes("City"))}
          />
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <FormStateSelect
            disabled={isFormDisabled}
            countryCode="US"
            label="Select State"
            onStateChange={(value) => {
              setInputValue("state", value);
            }}
            errorMessage={error.message.find((message) =>
              message.includes("State")
            )}
            isError={!!error.field.find((field) => field.includes("State"))}
            value={
              values.state ||
              processedPersonalInformation?.data?.personalInformation?.state
            }
          />
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.personalInformation
                ?.zip_code ??
              biodata?.data?.zip_code ??
              ""
            }
            name="zipCode"
            placeholder="Enter Zip Code"
            type="text"
            labelText="Zip Code"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Zip")
            )}
            isError={!!error.field.find((field) => field.includes("Zip"))}
          />
        </div>

        <FormInput
          disabled={isFormDisabled}
          value={formatSSN(values.socialSecurityNumber ?? "")}
          defaultValue={formatSSN(socialSecurityNumber ?? "")}
          name="socialSecurityNumber"
          placeholder="Enter your US SSN"
          type="text"
          labelText="US Social Security number"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Social")
          )}
          isError={!!error.field.find((field) => field.includes("Social"))}
          onChange={(e) => {
            setInputValue(e.target.name, formatSSN(e.target.value));
            handleSSNChange(e);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        {currentIndex !== 1 && (
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            variant="light"
            type="button"
          >
            Previous Section
          </Button>
        )}

        {currentIndex !== 6 && <Button type="submit">Next Section</Button>}
      </div>
    </form>
  );
};

export default PersonalInformation;
