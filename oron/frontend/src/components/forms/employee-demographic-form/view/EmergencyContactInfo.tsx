"use client";

import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useLogic from "../logic/emergency-contact-information/useLogic";
import { useEffect, useState } from "react";
import { formatPhoneNumber } from "@/utils/helpers";
import {
  FormCitySelect,
  FormStateSelect,
} from "@/components/location-selectors";

const EmergencyContactInfo = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  contactInformation,
  refetch,
  handleToggleSign,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  contactInformation: boolean | EmployeeDemographicFormResponse | undefined;
  refetch: any;
  handleToggleSign: (status: boolean) => void;
}) => {
  const { state, mutate, processedContactInformation } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    method,
    contactInformation,
    handleToggleSign
  );
  const { error, isFormDisabled } = state;

  const [stateField, setStateField] = useState("");
  const [city, setCity] = useState("");
  const [cellPhone, setCellPhone] = useState("");

  useEffect(() => {
    if (
      processedContactInformation?.data &&
      processedContactInformation?.data?.emergencyContactInformation &&
      Object.keys(
        processedContactInformation?.data?.emergencyContactInformation
      ).length > 0
    ) {
      setCellPhone(
        formatPhoneNumber(
          processedContactInformation.data.emergencyContactInformation.phone ??
            ""
        )
      );

      setStateField(
        processedContactInformation?.data?.emergencyContactInformation?.state ??
          ""
      );

      setCity(
        processedContactInformation?.data?.emergencyContactInformation?.city ??
          ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedContactInformation]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {processedContactInformation?.data?.status === "awaiting_approval" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <h3 className="text-[#0F172A] text-[18px] font-[600]">
        Emergency Contact Information
      </h3>

      <form action={mutate} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedContactInformation?.data?.emergencyContactInformation
                ?.last_name ?? ""
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
              processedContactInformation?.data?.emergencyContactInformation
                ?.first_name ?? ""
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
            defaultValue={
              processedContactInformation?.data?.emergencyContactInformation
                ?.relationship_to_employee ?? ""
            }
            name="relationshipToEmployee"
            placeholder="Enter relationship"
            type="text"
            labelText="Relationship to employee"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Relationship")
            )}
            isError={
              !!error.field.find((field) => field.includes("Relationship"))
            }
          />
        </div>

        <FormInput
          disabled={isFormDisabled}
          defaultValue={
            processedContactInformation?.data?.emergencyContactInformation
              ?.street_address ?? ""
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
              if (city) {
                setCity(city);
              }
            }}
            stateCode={stateField}
            value={city}
            errorMessage={error.message.find((message) =>
              message.includes("City")
            )}
            defaultValue={
              processedContactInformation?.data?.emergencyContactInformation
                ?.city ?? ""
            }
            isError={!!error.field.find((field) => field.includes("City"))}
          />
          <FormInput
            disabled={isFormDisabled}
            defaultValue={
              processedContactInformation?.data?.emergencyContactInformation
                ?.zip_code ?? ""
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

export default EmergencyContactInfo;
