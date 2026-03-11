"use client";

import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DatePicker } from "../../../calendar/CalendarSelect";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@/types/UserTypes";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useLogic from "../logic/personal-information/useLogic";
import { REDUCER_ACTION_TYPE } from "../logic/personal-information/reducer";
import Loader from "@/components/Loader";
import { formatSSN } from "@/utils";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { useEffect, useState } from "react";
import { formatPhoneNumber } from "@/utils/helpers";
import {
  FormCitySelect,
  FormStateSelect,
} from "@/components/location-selectors";
import { formatDateToUTCString } from "@/utils/date-utils";

const PersonalInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  method,
  personalInformation,
  refetch,
  status,
  reviewNote,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  personalInformation: boolean | EmployeeDemographicFormResponse | undefined;
  refetch: any;
  status: FormattedFormStatus;
  reviewNote: string;
}) => {
  const {
    state,
    dispatch,
    mutate,
    processedPersonalInformation,
    biodata,
    biodataLoading,
  } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    method,
    personalInformation
  );

  const [ssn, setSSN] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [homePhone, setHomePhone] = useState("");
  const [stateField, setStateField] = useState("");
  const [city, setCity] = useState("");

  const { isFormDisabled, error, formData } = state;

  useEffect(() => {
    if (processedPersonalInformation?.data?.employeeDemographicInformation) {
      setSSN(
        formatSSN(
          processedPersonalInformation?.data?.employeeDemographicInformation
            ?.social_security_number ??
            biodata?.data.social_security_number ??
            ""
        )
      );

      setCellPhone(
        formatPhoneNumber(
          processedPersonalInformation?.data?.employeeDemographicInformation
            ?.phone ?? ""
        )
      );

      setHomePhone(
        formatPhoneNumber(
          processedPersonalInformation?.data?.employeeDemographicInformation
            ?.home_phone_number ?? ""
        )
      );

      setStateField(
        processedPersonalInformation?.data?.employeeDemographicInformation
          ?.state ?? ""
      );

      setCity(
        processedPersonalInformation?.data?.employeeDemographicInformation
          ?.city ?? ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedPersonalInformation]);

  if (biodataLoading) {
    return <Loader />;
  }

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {status === "Awaiting Approval" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">
          Personal Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          Enter information as it appears on your social security card.
          We&apos;ve already filled in some of the fields based on the
          information you provided earlier.
        </p>
      </div>

      <form action={mutate} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data.employeeDemographicInformation
                ?.last_name ??
              biodata?.data.last_name ??
              user.data.last_name ??
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
              processedPersonalInformation?.data?.employeeDemographicInformation
                ?.first_name ??
              biodata?.data.first_name ??
              user.data.first_name ??
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

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            value={ssn}
            onChange={(e) => {
              setSSN(formatSSN(e.target.value));
            }}
            name="ssn"
            placeholder="012-34-5678"
            type="text"
            labelText="Social Security Number"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Social")
            )}
            isError={!!error.field.find((field) => field.includes("Social"))}
          />
          <DatePicker
            disabled={isFormDisabled}
            defaultDate={
              formData.dateOfBirth.length > 1
                ? new Date(formData.dateOfBirth)
                : undefined
            }
            errorMessage={error.message.find((message) =>
              message.includes("Date")
            )}
            isError={!!error.field.find((field) => field.includes("Date"))}
            label="Date of Birth"
            getDate={(date) =>
              dispatch({
                type: REDUCER_ACTION_TYPE.SET_DATE_OF_BIRTH,
                payload: {
                  dateOfBirth: formatDateToUTCString(date),
                },
              })
            }
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            value={cellPhone}
            onChange={(e) => {
              setCellPhone(formatPhoneNumber(e.target.value));
            }}
            name="cellPhoneNumber"
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Cell Phone Number"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Cell")
            )}
            isError={!!error.field.find((field) => field.includes("Cell"))}
          />
          <FormInput
            disabled={isFormDisabled}
            value={homePhone}
            onChange={(e) => {
              setHomePhone(formatPhoneNumber(e.target.value));
            }}
            name="homePhoneNumber"
            placeholder="+1 (555) 000-0000"
            type="text"
            labelText="Home Phone Number"
            isAuth={false}
            withSelect={true}
            selectDefaultValue="US"
            selectValue={["US"]}
            errorMessage={error.message.find((message) =>
              message.includes("Home")
            )}
            isError={!!error.field.find((field) => field.includes("Home"))}
          />
        </div>

        <FormInput
          disabled={isFormDisabled}
          defaultValue={
            processedPersonalInformation?.data?.employeeDemographicInformation
              ?.street_address ??
            biodata?.data.address ??
            ""
          }
          name="address"
          placeholder="Enter your home address"
          type="text"
          labelText="Street Address"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Address")
          )}
          isError={!!error.field.find((field) => field.includes("Address"))}
        />

        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 justify-between items-start gap-5">
          <FormStateSelect
            disabled={isFormDisabled}
            countryCode="US"
            label="Select State"
            onStateChange={(value) => {
              if (value) {
                setStateField(value);
              }
            }}
            errorMessage={error.message.find((message) =>
              message.includes("State")
            )}
            isError={!!error.field.find((field) => field.includes("State"))}
            value={stateField}
          />
          <FormCitySelect
            disabled={isFormDisabled}
            name="city"
            countryCode="US"
            label="City or town"
            onCityChange={(city) => {
              setCity(city);
            }}
            stateCode={stateField}
            value={city}
            errorMessage={error.message.find((message) =>
              message.includes("City")
            )}
            isError={!!error.field.find((field) => field.includes("City"))}
          />
          {/* <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.employeeDemographicInformation
                ?.city ??
              biodata?.data.city ??
              ""
            }
            name="city"
            placeholder="Enter city or town"
            type="text"
            labelText="City or town"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("City")
            )}
            isError={!!error.field.find((field) => field.includes("City"))}
          /> */}

          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.employeeDemographicInformation
                ?.zip_code ??
              biodata?.data.zip_code ??
              ""
            }
            name="zipCode"
            placeholder="Enter your zip code"
            type="text"
            labelText="Zip Code"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Zip")
            )}
            isError={!!error.field.find((field) => field.includes("Zip"))}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h4
              className={`text-[16px] text-[#09090B] ${
                error.field.find((field) => field.includes("Race")) &&
                "text-[#EF4444]"
              } `}
            >
              Race and ethnicity
            </h4>
            <p className="text-[12px] font-[400] text-[#475569]">
              Select one of the following categories to describe yourself
            </p>
          </div>

          <RadioGroup
            disabled={isFormDisabled}
            defaultValue={
              processedPersonalInformation?.data?.employeeDemographicInformation
                ?.race_or_ethinicity ?? ""
            }
            name="race"
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col lg:grid lg:grid-rows-3 grid-flow-col gap-3 xl:max-w-[700px]">
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="1"
                  value="American Indian or Alaska Native"
                />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="1"
                >
                  American Indian or Alaska Native
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="2" value="Hawaiian or Pacific Islander" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="2"
                >
                  Hawaiian or Pacific Islander
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="3" value="Black or African American" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="3"
                >
                  Black or African American
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="4" value="Asian" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="4"
                >
                  Asian
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="5" value="White or Caucasian" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="5"
                >
                  White or Caucasian
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <RadioGroup
          disabled={isFormDisabled}
          defaultValue={
            processedPersonalInformation?.data?.employeeDemographicInformation
              ?.gender ?? ""
          }
          name="gender"
          className="flex flex-col gap-5"
        >
          <h4
            className={`text-[16px] text-[#09090B] ${
              error.field.find((field) => field.includes("Gender")) &&
              "text-[#EF4444]"
            } `}
          >
            Gender
          </h4>
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="male" value="male" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="male"
              >
                Male
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="female" value="female" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="female"
              >
                Female
              </Label>
            </div>
          </div>
        </RadioGroup>

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
    </section>
  );
};

export default PersonalInformation;
