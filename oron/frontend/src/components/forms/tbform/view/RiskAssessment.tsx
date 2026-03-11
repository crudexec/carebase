"use client";

import { useState, useEffect } from "react";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "../../../calendar/CalendarSelect";
import FormInput from "@/components/input-fields/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  RiskAssesmentClientDataType,
  TBFormMantouxRiskAssessment,
  TBFormResponse,
} from "@/types/form-types/TBFormTypes";
import { handleTbFormRiskAssessmentSubmission } from "@/actions/forms";
import FormBanner from "@/components/banner/FormBanner";
import FormSelect from "@/components/input-fields/FormSelect";
import { COUNTRIES } from "@/constants";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const RiskAssessment = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
  status,
  reviewNote,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  refetch: any;
  data: boolean | TBFormResponse | undefined;
  status: FormattedFormStatus;
  reviewNote: string;
}) => {
  const [hasUserHadTb, setHasUserHadTb] = useState<boolean>(false);
  const [tbDate, setTbDate] = useState<Date>();
  const [hasUserHadPRToTb, setHasUserHadPRToTb] = useState<boolean>(false);
  const [prTbDate, setPrTbDate] = useState<Date>();
  const [hasUserBeenImmunized, setHasUserBeenImmunized] =
    useState<boolean>(false);
  const [hasUserHadAbnormalChestXray, setHasUserHadAbnormalChestXray] =
    useState<boolean>(false);
  const [isUserBornInOptions, setIsUserBornInOptions] = useState<boolean>();
  const [hasUserLivedInOptions, setHasUserLivedInOptions] =
    useState<boolean>(false);
  const [hasHouseholdLivedInUS, setHasHouseholdLivedInUS] =
    useState<boolean>(false);
  const [lastChestXrayDate, setLastChestXrayDate] = useState<Date>();

  let formDisabled = false;

  let processedRiskAssessment: TBFormMantouxRiskAssessment | undefined;
  if (typeof data === "boolean") {
    processedRiskAssessment = undefined;
  } else {
    if (
      data?.data?.status === "awaiting_approval" ||
      data?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    processedRiskAssessment = data?.data.tuberculosisMantouxRiskAssessmentForm;
  }

  const [symptoms, setSymptoms] = useState<string[]>(() => {
    const initialSymptoms: string[] = [];

    const pushOptionIfTrue = (condition: boolean, symptom: string) => {
      if (condition) {
        initialSymptoms.push(symptom);
      }
    };

    if (processedRiskAssessment) {
      const {
        coughing_blood,
        profuse_night_sweats,
        loss_of_appetite,
        unexplained_weight_loss,
        chill_or_fever,
        persistent_cough_last_two_weeks,
        chest_pain,
      } = processedRiskAssessment;

      pushOptionIfTrue(coughing_blood, "Coughing up blood");

      pushOptionIfTrue(profuse_night_sweats, "Profuse night sweats");

      pushOptionIfTrue(loss_of_appetite, "Loss of appetite");

      pushOptionIfTrue(unexplained_weight_loss, "Unexplained weight loss");

      pushOptionIfTrue(chill_or_fever, "Chills and/or fever");

      pushOptionIfTrue(
        persistent_cough_last_two_weeks,
        "A persistent cough for longer than 2 weeks"
      );

      pushOptionIfTrue(
        chest_pain,
        "Recurring, dull, tightness or aching pain in the chest Coughing up blood"
      );

      if (
        Object.keys(processedRiskAssessment).length > 0 &&
        !processedRiskAssessment?.coughing_blood &&
        !processedRiskAssessment?.profuse_night_sweats &&
        !processedRiskAssessment?.loss_of_appetite &&
        !processedRiskAssessment?.unexplained_weight_loss &&
        !processedRiskAssessment?.chill_or_fever &&
        !processedRiskAssessment?.persistent_cough_last_two_weeks &&
        !processedRiskAssessment?.chest_pain
      ) {
        initialSymptoms.push("none");
      }
    }

    return initialSymptoms;
  });

  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  useEffect(() => {
    if (processedRiskAssessment?.had_tb_infection) {
      setHasUserHadTb(true);
    }
    if (processedRiskAssessment?.had_positive_tb_skin_test) {
      setHasUserHadPRToTb(true);
    }
    if (processedRiskAssessment?.had_tb_infection_date) {
      setTbDate(new Date(processedRiskAssessment?.had_tb_infection_date));
    }
    if (processedRiskAssessment?.had_positive_tb_skin_test_date) {
      setPrTbDate(
        new Date(processedRiskAssessment?.had_positive_tb_skin_test_date)
      );
    }
    if (processedRiskAssessment?.have_you_been_immunized_with_bcg_vaccine) {
      setHasUserBeenImmunized(true);
    }
    if (processedRiskAssessment?.country_of_birth) {
      setIsUserBornInOptions(true);
    }
    if (processedRiskAssessment?.country_of_travel) {
      setHasUserLivedInOptions(true);
    }
    if (processedRiskAssessment?.family_country_of_travel) {
      setHasHouseholdLivedInUS(true);
    }
    if (processedRiskAssessment?.last_chest_xray_date) {
      setLastChestXrayDate(
        new Date(processedRiskAssessment?.last_chest_xray_date)
      );
      setHasUserHadAbnormalChestXray(true);
    }
  }, [processedRiskAssessment]);

  const getTuberculosisDate = (date: Date) => {
    setTbDate(date);
  };
  const getPrTOTBDate = (date: Date) => {
    setPrTbDate(date);
  };

  const validateFormData = (formData: FormData): string[] => {
    const errors: string[] = [];
    const hasHadTb = formData.get("tuberculosis") as string;
    const hasHadPrToTb = formData.get("pr_to_tb") as string;
    const hasBeenImmunized = formData.get("immunized_tb") as string;
    const immunizedInformation = formData.get("immunized") as string;
    const hasTakenVaccine = formData.get("taken_vaccine") as string;
    const hasTakenSteroids = formData.get("taken_steroids") as string;
    const hasExposureToTb = formData.get("exposure_to_tb") as string;
    const spentTimeWithSick = formData.get("spent_time_with_sick_tb") as string;
    const userBornInOptions = formData.get("were_you_born") as string;
    const countryOfBirth = formData.get("country") as string;
    const travelledToSpeciicCountry = formData.get("have_you_lived") as string;
    const countryTravelledTo = formData.get("country_travelled_to") as string;
    const householdMembers = formData.get("household_members") as string;
    const householdCountry = formData.get("household_country") as string;

    const abnormalChestXray = formData.get("abnormal_chest_xray") as string;

    if (abnormalChestXray === "yes" && !lastChestXrayDate) {
      errors.push("Please select a date for xray.");
    }

    if (hasHadTb === "yes" && !tbDate) {
      errors.push("Please select a date for Tuberculosis.");
    }

    if (hasHadPrToTb === "yes" && !prTbDate) {
      errors.push(
        "Please select a date for positive reaction to TB skin test."
      );
    }

    if (hasBeenImmunized === "yes" && !immunizedInformation) {
      errors.push("Please describe the immunization against TB.");
    }

    if (userBornInOptions === "yes" && !countryOfBirth) {
      errors.push("Please select your country of birth.");
    }

    if (travelledToSpeciicCountry === "yes" && !countryTravelledTo) {
      errors.push("Please select the country you lived or travelled to.");
    }

    if (householdMembers === "yes" && !householdCountry) {
      errors.push("Please select the country your household member came from");
    }

    if (!abnormalChestXray) {
      errors.push(
        "Please indicate whether you have ever been told you have an abnormal chest X-Ray?."
      );
    }

    if (!hasHadTb) {
      errors.push("Please indicate whether you have ever had Tuberculosis.");
    }

    if (!hasHadPrToTb) {
      errors.push(
        "Please indicate whether you have ever had a positive reaction to a TB skin test."
      );
    }

    if (!hasBeenImmunized) {
      errors.push(
        "Please indicate whether you have ever been immunized against TB."
      );
    }

    if (!hasTakenVaccine) {
      errors.push(
        "Please select whether you've taken any vaccine within the last two weeks."
      );
    }

    if (!hasTakenSteroids) {
      errors.push(
        "Please select whether you've taken steroids in the last four weeks."
      );
    }

    if (!hasExposureToTb) {
      errors.push(
        "Please select whether you've had a known exposure to TB since your last TB test."
      );
    }

    if (!spentTimeWithSick) {
      errors.push(
        "Please select whether In the last 2 years, have you lived with or spent time with someone who has been sick with TB?."
      );
    }

    if (!userBornInOptions) {
      errors.push(
        "Please indicate whether you born in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East."
      );
    }

    if (!travelledToSpeciicCountry) {
      errors.push(
        "Please indicate whether you lived or traveled in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East for more than a month?."
      );
    }

    if (!householdMembers) {
      errors.push(
        "Please select whether any members of your household come to the Unites States from another country?."
      );
    }

    return errors;
  };

  const handleSubmit = async (formData: FormData) => {
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const hasHadTb = formData.get("tuberculosis") as string;
      const hasHadPrToTb = formData.get("pr_to_tb") as string;
      const hasBeenImmunized = formData.get("immunized_tb") as string;

      const immunizedInformation = formData.get("immunized") as string;
      const hasTakenVaccine = formData.get("taken_vaccine") as string;
      const hasTakenSteroids = formData.get("taken_steroids") as string;
      const hasExposureToTb = formData.get("exposure_to_tb") as string;

      const spentTimeWithSick = formData.get(
        "spent_time_with_sick_tb"
      ) as string;
      const userBornInOptions = formData.get("were_you_born") as string;
      const countryOfBirth = formData.get("country") as string;
      const travelledToSpeciicCountry = formData.get(
        "have_you_lived"
      ) as string;
      const countryTravelledTo = formData.get("country_travelled_to") as string;
      const householdMembers = formData.get("household_members") as string;
      const householdCountry = formData.get("household_country") as string;
      const abnormalChestXray = formData.get("abnormal_chest_xray") as string;

      const errors = validateFormData(formData);
      if (errors.length > 0) {
        setError({
          field: errors,
          message: errors,
        });
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

      const data: RiskAssesmentClientDataType = {
        hasHadTb,
        tbDate,
        hasHadPrToTb,
        prTbDate,
        hasBeenImmunized,
        immunizedInformation,
        hasTakenVaccine,
        hasTakenSteroids,
        hasExposureToTb,
        symptoms,
        spentTimeWithSick,
        userBornInOptions,
        countryOfBirth,
        travelledToSpeciicCountry,
        countryTravelledTo,
        householdMembers,
        householdCountry,
      };

      const token = localStorage.getItem("token") as string;
      const response = await handleTbFormRiskAssessmentSubmission(
        data,
        token,
        method,
        lastChestXrayDate
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

  const getDefaultTuberculosisValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.had_tb_infection !== undefined
    ) {
      return processedRiskAssessment.had_tb_infection ? "yes" : "no";
    }
    return undefined;
  };

  const getDefaultPositiveReactionValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.had_positive_tb_skin_test !== undefined
    ) {
      return processedRiskAssessment.had_positive_tb_skin_test ? "yes" : "no";
    }
    return undefined;
  };

  const getDefaultImmunizedValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.have_you_been_immunized_with_bcg_vaccine !==
        undefined
    ) {
      return processedRiskAssessment.have_you_been_immunized_with_bcg_vaccine
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultVaccineValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.vaccine_past_two_weeks !== undefined
    ) {
      return processedRiskAssessment.vaccine_past_two_weeks ? "yes" : "no";
    }
    return undefined;
  };

  const getDefaultSteroidsValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.steriod_injection_past_two_weeks !== undefined
    ) {
      return processedRiskAssessment.steriod_injection_past_two_weeks
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultExposureValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment.exposure_to_tb_past_two_weeks !== undefined
    ) {
      return processedRiskAssessment.exposure_to_tb_past_two_weeks
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultSpentTimeWithSickValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment?.spent_time_with_tb_patient_in_the_last_two_years !==
        undefined
    ) {
      return processedRiskAssessment.spent_time_with_tb_patient_in_the_last_two_years
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultBornOptionsValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment?.were_you_born_in_a_country_where_tb_is_common !==
        undefined
    ) {
      return processedRiskAssessment.were_you_born_in_a_country_where_tb_is_common
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultHaveYouLivedValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment?.traveled_to_a_country_where_tb_is_common !==
        undefined
    ) {
      return processedRiskAssessment.traveled_to_a_country_where_tb_is_common
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultHouseholdLivedValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment?.members_of_family_traveled_to_US_from_another_country !==
        undefined
    ) {
      return processedRiskAssessment.members_of_family_traveled_to_US_from_another_country
        ? "yes"
        : "no";
    }
    return undefined;
  };

  const getDefaultAbnormalChestXrayValue = (): string | undefined => {
    if (
      processedRiskAssessment &&
      processedRiskAssessment?.last_chest_xray_date !== undefined
    ) {
      return processedRiskAssessment.last_chest_xray_date ? "yes" : "no";
    }
    return undefined;
  };

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

      <h3 className="text-[#0F172A] text-[18px] font-[600]">Risk Assessment</h3>

      <form action={handleSubmit} className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <RadioGroup
            disabled={formDisabled}
            defaultValue={getDefaultTuberculosisValue()}
            name="tuberculosis"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasUserHadTb(true);
              } else {
                setHasUserHadTb(false);
              }
            }}
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please indicate whether you have ever had Tuberculosis."
                  )
                ) && "text-[#EF4444]"
              } `}
            >
              Have you ever had Tuberculosis?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="tb_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="tb_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="tb_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="tb_no"
                >
                  No
                </Label>
              </div>
            </div>

            {error.message.find((message) =>
              message.includes(
                "Please indicate whether you have ever had Tuberculosis."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please indicate whether you have ever had Tuberculosis."
                  )
                )}
              </p>
            )}
          </RadioGroup>
          {hasUserHadTb && (
            <div className="flex flex-col gap-5">
              <DatePicker
                disabled={formDisabled}
                defaultDate={tbDate}
                errorMessage={error.message.find((message) =>
                  message.includes("Please select a date for Tuberculosis.")
                )}
                isError={
                  !!error.field.find((field) =>
                    field.includes("Please select a date for Tuberculosis.")
                  )
                }
                label="When?"
                getDate={getTuberculosisDate}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup
            disabled={formDisabled}
            defaultValue={getDefaultPositiveReactionValue()}
            name="pr_to_tb"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasUserHadPRToTb(true);
              } else {
                setHasUserHadPRToTb(false);
              }
            }}
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please indicate whether you have ever had a positive reaction to a TB skin test."
                  )
                ) && "text-[#EF4444]"
              } `}
            >
              Have you ever had a positive reaction to a TB skin test?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="tb_rt_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="tb_rt_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="tb_rt_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="tb_rt_no"
                >
                  No
                </Label>
              </div>
            </div>
            {error.message.find((message) =>
              message.includes(
                "Please indicate whether you have ever had a positive reaction to a TB skin test."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please indicate whether you have ever had a positive reaction to a TB skin test."
                  )
                )}
              </p>
            )}
          </RadioGroup>
          {hasUserHadPRToTb && (
            <div className="flex flex-col gap-5">
              <DatePicker
                disabled={formDisabled}
                defaultDate={prTbDate}
                errorMessage={error.message.find((message) =>
                  message.includes(
                    "Please select a date for positive reaction to TB skin test."
                  )
                )}
                isError={
                  !!error.field.find((field) =>
                    field.includes(
                      "Please select a date for positive reaction to TB skin test."
                    )
                  )
                }
                label="When?"
                getDate={getPrTOTBDate}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup
            disabled={formDisabled}
            defaultValue={getDefaultAbnormalChestXrayValue()}
            name="abnormal_chest_xray"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasUserHadAbnormalChestXray(true);
              } else {
                setHasUserHadAbnormalChestXray(false);
                setLastChestXrayDate(undefined);
              }
            }}
            className="flex flex-col gap-5"
          >
            <h4 className={`text-[16px] font-[400] text-[#09090B] `}>
              Have you ever been told you have an abnormal chest X-Ray?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="abnormal_xray_yes" value="yes" />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.find((field) =>
                      field.includes(
                        "Please indicate whether you have ever been told you have an abnormal chest X-Ray?."
                      )
                    ) && "text-[#EF4444]"
                  } `}
                  htmlFor="abnormal_xray_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="abnormal_xray_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="abnormal_xray_no"
                >
                  No
                </Label>
              </div>
            </div>
          </RadioGroup>
          {hasUserHadAbnormalChestXray && (
            <div className="flex flex-col gap-5">
              <DatePicker
                defaultDate={lastChestXrayDate}
                disabled={formDisabled}
                label="When?"
                getDate={(date: Date) => {
                  setLastChestXrayDate(date);
                }}
                errorMessage={error.message.find((message) =>
                  message.includes("Please select a date for xray.")
                )}
                isError={
                  !!error.field.find((field) =>
                    field.includes("Please select a date for xray.")
                  )
                }
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup
            disabled={formDisabled}
            defaultValue={getDefaultImmunizedValue()}
            name="immunized_tb"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasUserBeenImmunized(true);
              } else {
                setHasUserBeenImmunized(false);
              }
            }}
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please indicate whether you have ever been immunized against TB."
                  )
                ) && "text-[#EF4444]"
              } `}
            >
              Have you ever been immunized against TB with BCG or other serum?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="immunized_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="immunized_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="immunized_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="immunized_no"
                >
                  No
                </Label>
              </div>
            </div>
            {error.message.find((message) =>
              message.includes(
                "Please indicate whether you have ever been immunized against TB."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please indicate whether you have ever been immunized against TB."
                  )
                )}
              </p>
            )}
          </RadioGroup>
          {hasUserBeenImmunized && (
            <FormInput
              disabled={formDisabled}
              defaultValue={
                processedRiskAssessment?.immunization_description ?? ""
              }
              name="immunized"
              placeholder="Describe immunization"
              type="text"
              labelText="Describe"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Please describe the immunization against TB.")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Please describe the immunization against TB.")
                )
              }
            />
          )}
        </div>

        <RadioGroup
          defaultValue={getDefaultSpentTimeWithSickValue()}
          disabled={formDisabled}
          name="spent_time_with_sick_tb"
          className="flex flex-col gap-5"
        >
          <h4
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) =>
                field.includes(
                  "Please select whether In the last 2 years, have you lived with or spent time with someone who has been sick with TB?."
                )
              ) && "text-[#EF4444]"
            }`}
          >
            In the last 2 years, have you lived with or spent time with someone
            who has been sick with TB?
          </h4>
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="spent_time_with_sick_tb_yes" value="yes" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="spent_time_with_sick_tb_yes"
              >
                Yes
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="spent_time_with_sick_tb_no" value="no" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="spent_time_with_sick_tb_no"
              >
                No
              </Label>
            </div>
          </div>

          {error.message.find((message) =>
            message.includes(
              "Please select whether In the last 2 years, have you lived with or spent time with someone who has been sick with TB?."
            )
          ) && (
            <p className="text-[14px] text-[#EF4444] font-[400]">
              {error.message.find((message) =>
                message.includes(
                  "Please select whether In the last 2 years, have you lived with or spent time with someone who has been sick with TB?."
                )
              )}
            </p>
          )}
        </RadioGroup>

        <div className="flex flex-col gap-5">
          <RadioGroup
            defaultValue={getDefaultBornOptionsValue()}
            disabled={formDisabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setIsUserBornInOptions(true);
              } else {
                setIsUserBornInOptions(false);
              }
            }}
            name="were_you_born"
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please indicate whether you born in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East."
                  )
                ) && "text-[#EF4444]"
              }`}
            >
              Were you born in Africa, Asia, Pacific Islands (except Japan),
              Central America, South America, Mexico, Eastern Europe, The
              Caribbean, or the Middle East?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="were_you_born_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="were_you_born_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="were_you_born_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="were_you_born_no"
                >
                  No
                </Label>
              </div>
            </div>
            {error.message.find((message) =>
              message.includes(
                "Please indicate whether you born in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please indicate whether you born in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East."
                  )
                )}
              </p>
            )}
          </RadioGroup>

          {isUserBornInOptions === true && (
            <FormSelect
              disabled={formDisabled}
              name="country"
              labelText="What country were you born in"
              placeholder="Country"
              selectContent={COUNTRIES}
              errorMessage={error.message.find((message) =>
                message.includes("Please select your country of birth.")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Please select your country of birth.")
                )
              }
              defaultValue={processedRiskAssessment?.country_of_birth ?? ""}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup
            defaultValue={getDefaultHaveYouLivedValue()}
            disabled={formDisabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasUserLivedInOptions(true);
              } else {
                setHasUserLivedInOptions(false);
              }
            }}
            name="have_you_lived"
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please indicate whether you lived or traveled in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East for more than a month?."
                  )
                ) && "text-[#EF4444]"
              }`}
            >
              Have you lived or traveled in Africa, Asia, Pacific Islands
              (except Japan), Central America, South America, Mexico, Eastern
              Europe, The Caribbean, or the Middle East for more than a month?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="have_you_lived_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="have_you_lived_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="have_you_lived_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="have_you_lived_no"
                >
                  No
                </Label>
              </div>
            </div>

            {error.message.find((message) =>
              message.includes(
                "Please indicate whether you lived or traveled in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East for more than a month?."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please indicate whether you lived or traveled in Africa, Asia, Pacific Islands (except Japan), Central America, South America, Mexico, Eastern Europe, The Caribbean, or the Middle East for more than a month?."
                  )
                )}
              </p>
            )}
          </RadioGroup>

          {hasUserLivedInOptions && (
            <FormSelect
              disabled={formDisabled}
              name="country_travelled_to"
              labelText="Select the country you travelled to"
              placeholder="Country"
              selectContent={COUNTRIES}
              errorMessage={error.message.find((message) =>
                message.includes(
                  "Please select the country you lived or travelled to."
                )
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes(
                    "Please select the country you lived or travelled to."
                  )
                )
              }
              defaultValue={processedRiskAssessment?.country_of_travel ?? ""}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup
            defaultValue={getDefaultHouseholdLivedValue()}
            disabled={formDisabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "yes") {
                setHasHouseholdLivedInUS(true);
              } else {
                setHasHouseholdLivedInUS(false);
              }
            }}
            name="household_members"
            className="flex flex-col gap-5"
          >
            <h4
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) =>
                  field.includes(
                    "Please select whether any members of your household come to the Unites States from another country?."
                  )
                ) && "text-[#EF4444]"
              }`}
            >
              Have any members of your household come to the Unites States from
              another country?
            </h4>
            <div className="flex items-center flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="household_members_yes" value="yes" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="household_members_yes"
                >
                  Yes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="household_members_no" value="no" />
                <Label
                  className="text-[16px] font-[400] text-[#09090B]"
                  htmlFor="household_members_no"
                >
                  No
                </Label>
              </div>
            </div>

            {error.message.find((message) =>
              message.includes(
                "Please select whether any members of your household come to the Unites States from another country?."
              )
            ) && (
              <p className="text-[14px] text-[#EF4444] font-[400]">
                {error.message.find((message) =>
                  message.includes(
                    "Please select whether any members of your household come to the Unites States from another country?."
                  )
                )}
              </p>
            )}
          </RadioGroup>

          {hasHouseholdLivedInUS && (
            <FormSelect
              disabled={formDisabled}
              name="household_country"
              labelText="Select the country"
              placeholder="Country"
              selectContent={COUNTRIES}
              errorMessage={error.message.find((message) =>
                message.includes(
                  "Please select the country your household member came from"
                )
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes(
                    "Please select the country your household member came from"
                  )
                )
              }
              defaultValue={
                processedRiskAssessment?.family_country_of_travel ?? ""
              }
            />
          )}
        </div>

        <RadioGroup
          disabled={formDisabled}
          defaultValue={getDefaultVaccineValue()}
          name="taken_vaccine"
          className="flex flex-col gap-5"
        >
          <h4
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) =>
                field.includes(
                  "Please select whether you've taken any vaccine within the last two weeks."
                )
              ) && "text-[#EF4444]"
            } `}
          >
            Have you had any type of vaccine within the past TWO weeks?
          </h4>
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="vaccine_yes" value="yes" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="vaccine_yes"
              >
                Yes
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="vaccine_no" value="no" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="vaccine_no"
              >
                No
              </Label>
            </div>
          </div>
          {error.message.find((message) =>
            message.includes(
              "Please select whether you've taken any vaccine within the last two weeks."
            )
          ) && (
            <p className="text-[14px] text-[#EF4444] font-[400]">
              {error.message.find((message) =>
                message.includes(
                  "Please select whether you've taken any vaccine within the last two weeks."
                )
              )}
            </p>
          )}
        </RadioGroup>

        <RadioGroup
          disabled={formDisabled}
          defaultValue={getDefaultSteroidsValue()}
          name="taken_steroids"
          className="flex flex-col gap-5"
        >
          <h4
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) =>
                field.includes(
                  "Please select whether you've taken steroids in the last four weeks."
                )
              ) && "text-[#EF4444]"
            } `}
          >
            Have you taken steriods of any kind during the last 4 weeks?
          </h4>
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="steroids_yes" value="yes" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="steroids_yes"
              >
                Yes
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="steroids_no" value="no" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="steroids_no"
              >
                No
              </Label>
            </div>
          </div>
          {error.message.find((message) =>
            message.includes(
              "Please select whether you've taken steroids in the last four weeks."
            )
          ) && (
            <p className="text-[14px] text-[#EF4444] font-[400]">
              {error.message.find((message) =>
                message.includes(
                  "Please select whether you've taken steroids in the last four weeks."
                )
              )}
            </p>
          )}
        </RadioGroup>

        <RadioGroup
          disabled={formDisabled}
          defaultValue={getDefaultExposureValue()}
          name="exposure_to_tb"
          className="flex flex-col gap-5"
        >
          <h4
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) =>
                field.includes(
                  "Please select whether you've had a known exposure to TB since your last TB test."
                )
              ) && "text-[#EF4444]"
            } `}
          >
            Have you had a known exposure to TB since your last TB test?
          </h4>
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="exposure_to_tb_yes" value="yes" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="exposure_to_tb_yes"
              >
                Yes
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="exposure_to_tb_no" value="no" />
              <Label
                className="text-[16px] font-[400] text-[#09090B]"
                htmlFor="exposure_to_tb_no"
              >
                No
              </Label>
            </div>
          </div>
          {error.message.find((message) =>
            message.includes(
              "Please select whether you've had a known exposure to TB since your last TB test."
            )
          ) && (
            <p className="text-[14px] text-[#EF4444] font-[400]">
              {error.message.find((message) =>
                message.includes(
                  "Please select whether you've had a known exposure to TB since your last TB test."
                )
              )}
            </p>
          )}
        </RadioGroup>

        <div className="flex flex-col gap-5">
          <h4
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) =>
                field.includes("Please select at least one symptom.")
              ) && "text-[#EF4444]"
            } `}
          >
            Do you have any of the following symptoms?
          </h4>

          <div className="flex flex-col lg:grid lg:grid-rows-4 grid-flow-col gap-5 xl:max-w-[700px]">
            <div className="flex items-center gap-5">
              <Checkbox
                id="1"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("Coughing up blood") ||
                  processedRiskAssessment?.coughing_blood
                }
                onCheckedChange={(e) => {
                  if (e === true && !symptoms.includes("Coughing up blood")) {
                    setSymptoms([...symptoms, "Coughing up blood"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) => symptom !== "Coughing up blood"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="1"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Coughing up blood
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="2"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("Profuse night sweats") ||
                  processedRiskAssessment?.profuse_night_sweats
                }
                onCheckedChange={(e) => {
                  if (
                    e === true &&
                    !symptoms.includes("Profuse night sweats")
                  ) {
                    setSymptoms([...symptoms, "Profuse night sweats"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) => symptom !== "Profuse night sweats"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="2"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Profuse night sweats
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="3"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes(
                    "A persistent cough for longer than 2 weeks"
                  ) || processedRiskAssessment?.persistent_cough_last_two_weeks
                }
                onCheckedChange={(e) => {
                  if (
                    e === true &&
                    !symptoms.includes(
                      "A persistent cough for longer than 2 weeks"
                    )
                  ) {
                    setSymptoms([
                      ...symptoms,
                      "A persistent cough for longer than 2 weeks",
                    ]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) =>
                          symptom !==
                          "A persistent cough for longer than 2 weeks"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="3"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                A persistent cough for longer than 2 weeks
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="4"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes(
                    "Recurring, dull, tightness or aching pain in the chest Coughing up blood"
                  ) || processedRiskAssessment?.chest_pain
                }
                onCheckedChange={(e) => {
                  if (
                    e === true &&
                    !symptoms.includes(
                      "Recurring, dull, tightness or aching pain in the chest Coughing up blood"
                    )
                  ) {
                    setSymptoms([
                      ...symptoms,
                      "Recurring, dull, tightness or aching pain in the chest Coughing up blood",
                    ]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) =>
                          symptom !==
                          "Recurring, dull, tightness or aching pain in the chest Coughing up blood"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="4"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Recurring, dull, tightness or aching pain in the chest Coughing
                up blood
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="5"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("Loss of appetite") ||
                  processedRiskAssessment?.loss_of_appetite
                }
                onCheckedChange={(e) => {
                  if (e === true && !symptoms.includes("Loss of appetite")) {
                    setSymptoms([...symptoms, "Loss of appetite"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) => symptom !== "Loss of appetite"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="5"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Loss of appetite
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="6"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("Unexplained weight loss") ||
                  processedRiskAssessment?.unexplained_weight_loss
                }
                onCheckedChange={(e) => {
                  if (e === true && !symptoms.includes("")) {
                    setSymptoms([...symptoms, "Unexplained weight loss"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) => symptom !== "Unexplained weight loss"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="6"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Unexplained weight loss
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="7"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("Chills and/or fever") ||
                  processedRiskAssessment?.chill_or_fever
                }
                onCheckedChange={(e) => {
                  if (e === true && !symptoms.includes("Chills and/or fever")) {
                    setSymptoms([...symptoms, "Chills and/or fever"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter(
                        (symptom) => symptom !== "Chills and/or fever"
                      )
                    );
                  }
                }}
              />

              <Label
                htmlFor="7"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Chills and/or fever
              </Label>
            </div>
            <div className="flex items-center gap-5">
              <Checkbox
                id="8"
                disabled={formDisabled}
                defaultChecked={
                  symptoms.includes("none") ||
                  (processedRiskAssessment &&
                    Object.keys(processedRiskAssessment).length > 0 &&
                    !processedRiskAssessment?.coughing_blood &&
                    !processedRiskAssessment?.profuse_night_sweats &&
                    !processedRiskAssessment?.loss_of_appetite &&
                    !processedRiskAssessment?.unexplained_weight_loss &&
                    !processedRiskAssessment?.chill_or_fever &&
                    !processedRiskAssessment?.persistent_cough_last_two_weeks &&
                    !processedRiskAssessment?.chest_pain)
                }
                onCheckedChange={(e) => {
                  if (e === true && !symptoms.includes("none")) {
                    setSymptoms([...symptoms, "none"]);
                  } else {
                    setSymptoms((prevSymptoms) =>
                      prevSymptoms.filter((symptom) => symptom !== "none")
                    );
                  }
                }}
              />

              <Label
                htmlFor="8"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                None
              </Label>
            </div>
          </div>
          {error.message.find((message) =>
            message.includes("Please select at least one symptom.")
          ) && (
            <p className="text-[14px] text-[#EF4444] font-[400]">
              {error.message.find((message) =>
                message.includes("Please select at least one symptom.")
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            variant="light"
          >
            Previous Section
          </Button>

          {currentIndex !== 6 && <Button type="submit">Next Section</Button>}
        </div>
      </form>
    </section>
  );
};

export default RiskAssessment;
