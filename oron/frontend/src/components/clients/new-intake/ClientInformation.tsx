"use client";

import { useState, useEffect } from "react";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DatePicker } from "../../calendar/CalendarSelect";
import { useToast } from "@/components/ui/use-toast";
import { formatSSN } from "@/utils";
import { handleClientInformationSubmission } from "@/actions/clients";
import {
  FormCitySelect,
  FormStateSelect,
} from "@/components/location-selectors";
import { IntakeType } from "@/types/IntakeForm";
import FormSelect from "@/components/input-fields/FormSelect";
import { Country, ICountry } from "country-state-city";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { formatDateToUTCString } from "@/utils/date-utils";

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  sex: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  race: z.string().min(1, { message: "Race is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  county: z.string().min(1, { message: "County is required" }),
  zipCode: z
    .string()
    .min(5, { message: "Zip code must be at least 5 characters long" }),
  address: z.string().min(1, { message: "Address is required" }),
  apartmentNumber: z
    .string()
    .min(1, { message: "Apartment number is required" }),
  socialSecurityNumber: z.string().min(1, { message: "Invalid SSN format" }),
  medicaid: z.string().min(1, { message: "Medicaid is required" }),
});

export type ClientInformationType = z.infer<typeof schema>;

const ClientInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  handleChangeSectionid,
  intakeForm,
  isEditing,
  isViewing,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  handleChangeSectionid: (newId: string) => void;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;
  refetch: any;
}) => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    // resolver: isViewing || isSavingToDraft ? undefined : zodResolver(schema),
    resolver: undefined,
    defaultValues: {
      firstName:
        intakeForm?.clientInformation?.first_name ??
        intakeForm?.first_name ??
        "",
      lastName:
        intakeForm?.clientInformation?.last_name ?? intakeForm?.last_name ?? "",
      sex: intakeForm?.clientInformation?.sex ?? "",
      dateOfBirth: intakeForm?.clientInformation?.date_of_birth ?? "",
      race: intakeForm?.clientInformation?.race_or_ethinicity ?? "",
      country: intakeForm?.clientInformation?.country ?? "US",
      state: intakeForm?.clientInformation?.state ?? "",
      city: intakeForm?.clientInformation?.city ?? "",
      county: intakeForm?.clientInformation?.county ?? "",
      zipCode: intakeForm?.clientInformation?.zip_code?.toString() ?? "",
      address: intakeForm?.clientInformation?.address_or_street ?? "",
      apartmentNumber:
        intakeForm?.clientInformation?.apartment_number?.toString() ?? "",
      socialSecurityNumber: intakeForm?.clientInformation
        ?.social_security_number
        ? formatSSN(intakeForm?.clientInformation?.social_security_number)
        : "",
      medicaid:
        intakeForm?.clientInformation?.medicaid_number?.toString() ?? "",
    },
  });

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.client_information_id
    ) {
      setRequestMethod("PATCH");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const onSubmit = async (data: ClientInformationType) => {
    setLoading(true);

    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleClientInformationSubmission(
          data,
          token,
          requestMethod,
          intakeForm?.client_information_id ?? "-",
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

      const token = localStorage.getItem("token") as string;
      const response = await handleClientInformationSubmission(
        data,
        token,
        requestMethod,
        intakeForm?.client_information_id ?? "-",
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
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const watchedCountry = watch("country");
  const watchedState = watch("state");

  return (
    <section
      className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh] pb-[100px]"
      data-testid="participant-info-section"
    >
      <h3
        className="text-[#0F172A] text-[24px] font-[600]"
        data-testid="participant-info-header"
      >
        Participant Information
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7"
        data-testid="participant-info-form"
      >
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter participant's first name"
                type="text"
                labelText="First Name"
                isAuth={false}
                errorMessage={errors.firstName?.message}
                isError={!!errors.firstName}
                disabled={isViewing}
                data-testid="first-name-input"
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter participant's last name"
                type="text"
                labelText="Last Name"
                isAuth={false}
                errorMessage={errors.lastName?.message}
                isError={!!errors.lastName}
                disabled={isViewing}
                data-testid="last-name-input"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                disabled={isViewing}
                labelText="Gender"
                selectContent={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                placeholder="Select gender"
                errorMessage={errors.sex?.message}
                isError={!!errors.sex}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("sex", value);
                }}
                data-testid="gender-select"
              />
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                disabled={isViewing}
                label="Date of Birth"
                errorMessage={errors.dateOfBirth?.message}
                isError={!!errors.dateOfBirth}
                getDate={(date) =>
                  setValue("dateOfBirth", formatDateToUTCString(date))
                }
                defaultDate={
                  field.value.length > 1 ? new Date(field.value) : undefined
                }
                data-testid="date-of-birth-picker"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="race"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                disabled={isViewing}
                labelText="Race"
                selectContent={[
                  {
                    label: "American Indian or Alaska Native",
                    value: "American Indian or Alaska Native",
                  },
                  {
                    label: "Hawaiian or Pacific Islander",
                    value: "Hawaiian or Pacific Islander",
                  },
                  {
                    label: "Black or African American",
                    value: "Black or African American",
                  },
                  { label: "White or Caucasian", value: "White or Caucasian" },
                  { label: "Mongoloid or Asian", value: "Asian" },
                ]}
                placeholder="Select Race"
                errorMessage={errors.race?.message}
                isError={!!errors.race}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("race", value);
                }}
                data-testid="race-select"
              />
            )}
          />

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="Select Country"
                placeholder="Select a country"
                selectContent={countries.map((country) => ({
                  label: country.name,
                  value: country.isoCode,
                }))}
                onValueChange={(country) => setValue("country", country)}
                disabled={isViewing}
                errorMessage={errors.country?.message}
                isError={!!errors.country}
                data-testid="country-select"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <FormStateSelect
                {...field}
                disabled={isViewing}
                countryCode={watchedCountry}
                label="Select State"
                onStateChange={(value) => setValue("state", value)}
                errorMessage={errors.state?.message}
                isError={!!errors.state}
                data-testid="state-select"
              />
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <FormCitySelect
                {...field}
                disabled={isViewing}
                label="Select City"
                stateCode={watchedState}
                onCityChange={(city) => setValue("city", city)}
                countryCode={watchedCountry}
                errorMessage={errors.city?.message}
                isError={!!errors.city}
                data-testid="city-select"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="county"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter county"
                type="text"
                labelText="County"
                isAuth={false}
                disabled={isViewing}
                errorMessage={errors.county?.message}
                isError={!!errors.county}
                data-testid="county-input"
              />
            )}
          />

          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter Zip code"
                type="text"
                labelText="Zip Code"
                isAuth={false}
                errorMessage={errors.zipCode?.message}
                isError={!!errors.zipCode}
                disabled={isViewing}
                data-testid="zip-code-input"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter address"
                type="text"
                labelText="Address/Street"
                isAuth={false}
                disabled={isViewing}
                errorMessage={errors.address?.message}
                isError={!!errors.address}
                data-testid="address-input"
              />
            )}
          />

          <Controller
            name="apartmentNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter apartment number here"
                type="text"
                labelText="Apartment Number"
                isAuth={false}
                disabled={isViewing}
                errorMessage={errors.apartmentNumber?.message}
                isError={!!errors.apartmentNumber}
                data-testid="apartment-number-input"
              />
            )}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="socialSecurityNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter SSN here"
                type="text"
                labelText="Social Security Number"
                isAuth={false}
                errorMessage={errors.socialSecurityNumber?.message}
                isError={!!errors.socialSecurityNumber}
                disabled={isViewing}
                value={formatSSN(field.value)}
                onChange={(e) => {
                  const { value } = e.target;

                  const numericValue = value.replace(/\D/g, "");

                  const formattedSSN = formatSSN(numericValue);

                  field.onChange(formattedSSN);
                  setValue("socialSecurityNumber", e.target.value);

                  if (value.length > 11) {
                    setError("socialSecurityNumber", {
                      message:
                        "Social Security Cannot Be More Than Nine Characters",
                    });
                  } else {
                    const ssnRegex =
                      /^(?!000|666|9\d{2})\d{0,3}-?\d{0,2}-?\d{0,4}$/;
                    if (ssnRegex.test(numericValue)) {
                      clearErrors("socialSecurityNumber");
                    } else {
                      setError("socialSecurityNumber", {
                        message: "Invalid Social Security Number",
                      });
                    }
                  }
                }}
                data-testid="ssn-input"
              />
            )}
          />

          <Controller
            name="medicaid"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Enter Medicaid Number here"
                type="text"
                labelText="Medicaid Number"
                isAuth={false}
                errorMessage={errors.medicaid?.message}
                isError={!!errors.medicaid}
                disabled={isViewing}
                data-testid="medicaid-number-input"
              />
            )}
          />
        </div>

        <div
          className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-full"
          data-testid="form-navigation"
        >
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
              disabled={isViewing || loading}
              variant="light"
              type="submit"
              onClick={() => {
                setIsSavingToDraft(true);
              }}
              isLoading={loading && isSavingToDraft}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          <Button
            disabled={loading}
            isLoading={loading && !isSavingToDraft}
            type="submit"
            data-testid="next-section-button"
          >
            Next Section
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ClientInformation;
