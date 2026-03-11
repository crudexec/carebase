"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Button from "@/components/button/Button";
import FormSelect from "@/components/input-fields/FormSelect";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { COUNTRIES, LEVEL_OF_COMPLIANCE, VISITING_INVENTS } from "@/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useVisitingFormSubmission, {
  useVisitFormDraftHandler,
} from "../../logic";
import { SESSION_HIGHLIGHT_FORM } from "../../store/reducer";
import { useEffect, useState } from "react";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { SessionHighlightSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

// Define the type for the form data
type FormData = z.infer<typeof SessionHighlightSchema>;

const SessionHighlights = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin = false,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}) => {
  const { submitSessionHighlight } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const { saveSessionHighlights, retrieveSessionHighlights } =
    useVisitFormDraftHandler();
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(SessionHighlightSchema),
  });

  const { isFormDisabled: stateDis } = state;

  useEffect(() => {
    const formD = state.step_one_form;

    if (formD !== null) {
      const SessionHighlightSchemaKeys = Object.keys(
        SessionHighlightSchema.shape
      );

      SessionHighlightSchemaKeys.forEach((key) => {
        const value = formD[key as keyof typeof formD];

        if (key in formD && value !== undefined) {
          if (typeof value === "boolean") {
            setValue(key as any, value ? "yes" : "no");
          } else {
            setValue(key as any, value);
          }
        }
      });
    } else if (retrieveSessionHighlights !== null) {
      Object.keys(retrieveSessionHighlights).forEach((val) => {
        if (
          retrieveSessionHighlights[val as keyof SESSION_HIGHLIGHT_FORM] !== ""
        ) {
          setValue(
            val as any,
            retrieveSessionHighlights[val as keyof SESSION_HIGHLIGHT_FORM]
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step_one_form, currentIndex]);

  const isFormDisabled = stateDis;
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await submitSessionHighlight(data as unknown as SESSION_HIGHLIGHT_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    setIsSubmittingDraft(true);
    try {
      await submitSessionHighlight(
        getValues() as unknown as SESSION_HIGHLIGHT_FORM,
        true
      );
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3
        data-testid="session-highlights-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Session Highlights
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="This session occured in"
                placeholder="Select an option"
                onValueChange={(val) => {
                  if (val) {
                    field.onChange(val);
                  }
                }}
                selectContent={[
                  { label: "Home", value: "Home" },
                  { label: "Community", value: "Community" },
                  { label: "Home & Community", value: "Home & Community" },
                  { label: "Virtual Session", value: "Virtual Session" },
                ]}
                isError={Boolean(errors.location?.message)}
                errorMessage={errors.location?.message}
                value={field.value}
                disabled={isFormDisabled}
                data-testid="session-occurred"
              />
            )}
          />
          <Controller
            name="level_of_compliance"
            control={control}
            render={({ field }) => {
              return (
                <FormSelect
                  {...field}
                  labelText="Level of compliance"
                  placeholder="Select an option"
                  selectContent={LEVEL_OF_COMPLIANCE.map((lev) => ({
                    label: lev,
                    value: lev,
                  }))}
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  isError={Boolean(errors.level_of_compliance?.message)}
                  errorMessage={errors.level_of_compliance?.message}
                  disabled={isFormDisabled}
                  data-testid="level-of-compliance"
                />
              );
            }}
          />
        </div>

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="injury_to_self"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="Injury to self"
                placeholder="Select an option"
                value={field.value}
                selectContent={VISITING_INVENTS.map((val) => ({
                  label: val,
                  value: val,
                }))}
                isError={Boolean(errors.injury_to_self?.message)}
                onValueChange={(val) => field.onChange(val)}
                errorMessage={errors.injury_to_self?.message}
                disabled={isFormDisabled}
                data-testid="injury-to-self"
              />
            )}
          />
          <Controller
            name="aggression_to_others"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                labelText="Aggression to others"
                placeholder="Select an option"
                onValueChange={(val) => field.onChange(val)}
                selectContent={VISITING_INVENTS.map((val) => ({
                  label: val,
                  value: val,
                }))}
                isError={Boolean(errors.aggression_to_others?.message)}
                errorMessage={errors.aggression_to_others?.message}
                disabled={isFormDisabled}
                data-testid="aggression-to-others"
              />
            )}
          />
        </div>

        <Controller
          name="client_hospitalized_in_care_today"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              className="flex flex-col gap-5"
              onValueChange={field.onChange}
              value={field.value}
              disabled={isFormDisabled}
              data-testid="client-hospitalized-radio"
            >
              <h4 className="text-[16px] font-[400] text-[#09090B]">
                {username} was hospitalized while in my care today
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="hospitalized_yes"
                    value="yes"
                    data-testid="client-hospitalized-radio-item-yes"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="hospitalized_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="hospitalized_no"
                    value="no"
                    data-testid="client-hospitalized-radio-item-no"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="hospitalized_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.client_hospitalized_in_care_today && (
                <span className="text-red-500">
                  {errors.client_hospitalized_in_care_today.message}
                </span>
              )}
            </RadioGroup>
          )}
        />

        <Controller
          name="client_placed_themselves_in_harm_by_leaving_my_care"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              className="flex flex-col gap-5"
              onValueChange={field.onChange}
              value={field.value}
              disabled={isFormDisabled}
              data-testid="client-placed-themselves-in-harm-radio"
            >
              <h4 className="text-[16px] font-[400] text-[#09090B]">
                {username} placed themselves in danger by walking or running
                away while in my care
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="danger_yes"
                    value="yes"
                    data-testid="client-placed-themselves-in-harm-radio-item-yes"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="danger_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="danger_no"
                    value="no"
                    data-testid="client-placed-themselves-in-harm-radio-item-no"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="danger_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.client_placed_themselves_in_harm_by_leaving_my_care && (
                <span className="text-red-500">
                  {
                    errors.client_placed_themselves_in_harm_by_leaving_my_care
                      .message
                  }
                </span>
              )}
            </RadioGroup>
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              isLoading={isSubmittingDraft}
              type="button"
              onClick={() => {
                saveDraft();
                // saveSessionHighlights(getValues());
              }}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              isLoading={isSubmitting}
              onClick={() => {
                handleChangeIndex(currentIndex + 1);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            currentIndex !== 6 && (
              <Button
                type="submit"
                isLoading={isSubmitting}
                data-testid="next-section-button"
              >
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            )
          )}
        </div>
      </form>
    </section>
  );
};

export default SessionHighlights;
