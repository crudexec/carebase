"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useVisitingFormSubmission, {
  useVisitFormDraftHandler,
} from "../../logic";
import { CONCERN_AND_CHALLENGES } from "../../store/reducer";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { ConcernAndChallengeSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type FormData = z.infer<typeof ConcernAndChallengeSchema>;

const ConcernsAndChallenges = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  admin,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  admin?: boolean;
}) => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(ConcernAndChallengeSchema),
  });

  const { submitConcern } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();

  const { isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  const { saveConcernAndChallenges, retrieveConcernAndChallenges } =
    useVisitFormDraftHandler();

  const [loading, setLoading] = useState(false);
  const watchChallenges = watch("was_there_any_concerns_or_challenges");

  useEffect(() => {
    const formD = state.step_one_form;

    if (formD !== null) {
      const ConcernAndChallengeSchemaKeys = Object.keys(
        ConcernAndChallengeSchema.shape
      );
      ConcernAndChallengeSchemaKeys.forEach((key) => {
        const value = formD[key as keyof typeof formD];
        if (key in formD && value !== undefined) {
          if (
            key === "was_there_any_concerns_or_challenges" ||
            key === "supervisor_to_contact_during_session"
          ) {
            if (typeof value === "string") {
              setValue(key as any, value);
            } else if (typeof value === "boolean") {
              setValue(key as any, value ? "yes" : "no");
            }
          } else {
            setValue(key as any, value as any);
          }
        }
      });
    } else if (retrieveConcernAndChallenges !== null) {
      Object.keys(retrieveConcernAndChallenges).forEach((val) => {
        const value =
          retrieveConcernAndChallenges[val as keyof CONCERN_AND_CHALLENGES];
        if (value !== "") {
          if (
            val === "was_there_any_concerns_or_challenges" ||
            val === "supervisor_to_contact_during_session"
          ) {
            if (typeof value === "string") {
              setValue(val as any, value);
            } else if (typeof value === "boolean") {
              setValue(val as any, value ? "yes" : "no");
            }
          } else {
            setValue(val as any, value);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step_one_form]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {
      await submitConcern(data as CONCERN_AND_CHALLENGES);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      await submitConcern(data as CONCERN_AND_CHALLENGES, true);
    } catch (e) {
    } finally {
      setLoading(false);
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
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="concerns-and-challenges-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Concerns and challenges
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <Controller
            name="was_there_any_concerns_or_challenges"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                onValueChange={field.onChange}
                className="flex flex-col gap-5"
                disabled={isFormDisabled}
                data-testid="was-there-any-challenges-radio"
              >
                <h4 className={`text-[16px] font-[400] text-[#09090B]`}>
                  Were there any challenges/ concerns during this session?
                </h4>
                <div className="flex items-center flex-wrap gap-5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="challenges_yes"
                      value="yes"
                      data-testid="was-there-any-challenges-radio-item-yes"
                    />
                    <Label
                      className="text-[16px] font-[400] text-[#09090B]"
                      htmlFor="challenges_yes"
                    >
                      Yes
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="challenges_no"
                      value="no"
                      data-testid="was-there-any-challenges-radio-item-no"
                    />
                    <Label
                      className="text-[16px] font-[400] text-[#09090B]"
                      htmlFor="challenges_no"
                    >
                      No
                    </Label>
                  </div>
                </div>
                {errors.was_there_any_concerns_or_challenges && (
                  <span className="text-red-500">
                    {errors.was_there_any_concerns_or_challenges.message}
                  </span>
                )}
              </RadioGroup>
            )}
          />

          {watchChallenges === "yes" && (
            <Controller
              name="describe_circumstances_involved"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  labelText="Describe the circumstances involved"
                  placeholder="Describe here.."
                  isError={Boolean(
                    errors.describe_circumstances_involved?.message
                  )}
                  disabled={isFormDisabled}
                  errorMessage={errors.describe_circumstances_involved?.message}
                  data-testid="describe-circumstances-involved"
                />
              )}
            />
          )}
        </div>

        <Controller
          name="supervisor_to_contact_during_session"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              onValueChange={field.onChange}
              disabled={isFormDisabled}
              className="flex flex-col gap-5"
              data-testid="supervisor-to-contact-radio"
            >
              <h4 className={`text-[16px] font-[400] text-[#09090B]`}>
                Would you like a supervisor to contact you regarding this
                session?
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="supervisor_yes"
                    value="yes"
                    data-testid="supervisor-to-contact-radio-item-yes"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="supervisor_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    id="supervisor_no"
                    value="no"
                    data-testid="supervisor-to-contact-radio-item-no"
                  />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="supervisor_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.supervisor_to_contact_during_session && (
                <span className="text-red-500">
                  {errors.supervisor_to_contact_during_session.message}
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
              type="button"
              isLoading={loading}
              onClick={() => {
                saveDraft(getValues());
              }}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              isLoading={loading}
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
                isLoading={loading}
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

export default ConcernsAndChallenges;
