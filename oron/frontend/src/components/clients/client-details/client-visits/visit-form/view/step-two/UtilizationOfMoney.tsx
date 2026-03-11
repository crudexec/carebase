"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormTextArea from "@/components/input-fields/FormTextArea";
import {
  getErrorMessage,
  hasAnyTrueValue,
  UtilizationOfMoneyOutput,
} from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { utilizationOfMoneySchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type UtilizationOfMoneyInput = {
  skills: string[];
  activityLocation?: string | null;
};

const utilizationOfMoneyMap: {
  [key: string]: keyof Omit<
    UtilizationOfMoneyOutput,
    "this_activity_occured_at"
  >;
} = {
  "Handing bills to cashier": "handing_bills_to_cashier",
  "Waiting for and receiving the debit/credit card":
    "waiting_for_and_receiving_debit_credit_card",
  "Handing coins to cashier": "handing_coins_to_cashier",
  "Counting the change to make sure it was correct":
    "counting_the_change_to_make_sure_it_is_correct",
  "Handing debit/credit card to cashier":
    "handing_debit_credit_card_to_cashier",
  "Determining and handling the correct estimated amount":
    "determining_and_handling_the_correct_estimated_amount",
  "Using the dollar-up program": "using_the_dollar_up_program",
  "Obtaining and reviewing receipt for accuracy":
    "obtaining_and_reviewing_receipt_for_accuracy",
  "Waiting for and accepting the change":
    "waiting_for_and_accepting_the_change",
  None: "None",
};

function convertUtilizationOfMoney(
  input: UtilizationOfMoneyInput
): UtilizationOfMoneyOutput {
  const output: UtilizationOfMoneyOutput = {
    handing_bills_to_cashier: false,
    waiting_for_and_receiving_debit_credit_card: false,
    handing_coins_to_cashier: false,
    counting_the_change_to_make_sure_it_is_correct: false,
    handing_debit_credit_card_to_cashier: false,
    determining_and_handling_the_correct_estimated_amount: false,
    using_the_dollar_up_program: false,
    obtaining_and_reviewing_receipt_for_accuracy: false,
    waiting_for_and_accepting_the_change: false,
    this_activity_occured_at: input?.activityLocation,
    None: false,
  };

  input.skills.forEach((skill) => {
    const key = utilizationOfMoneyMap[skill];
    if (key) {
      output[key] = true;
    }
  });

  return output;
}

type UtilizationOfMoneyFormData = z.infer<typeof utilizationOfMoneySchema>;

interface UtilizationOfMoneyProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: (newIndex: number) => void;
  admin?: boolean;
}

const skillOptions = Object.keys(utilizationOfMoneyMap);

const populateUtilizationOfMoneyForm = (
  data: UtilizationOfMoneyOutput & { id?: string },
  setValue: any
) => {
  const selectedSkills = Object.entries(utilizationOfMoneyMap).reduce(
    (acc, [skill, key]) => {
      if (data[key]) {
        acc.push(skill);
      }
      return acc;
    },
    [] as string[]
  );

  setValue("skills", selectedSkills);
  setValue("activityLocation", data.this_activity_occured_at);

  if (hasAnyTrueValue(data, utilizationOfMoneyMap) === false && data?.id) {
    setValue("skills", ["None"]);
  }
};

const UtilizationOfMoney: React.FC<UtilizationOfMoneyProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  handleChangeStep,
  admin,
}) => {
  const [loading, setLoading] = useState(false);
  const [otherBol, setOtherBol] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<UtilizationOfMoneyFormData>({
    resolver: zodResolver(utilizationOfMoneySchema),
    defaultValues: {
      skills: [],
      activityLocation: "",
    },
  });

  const { submitUtilization } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    handleChangeStep
  );

  const { state } = useVisitingFormContext();

  const { step_two_form, isFormDisabled: stateDis } = state;

  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.utilization) {
      populateUtilizationOfMoneyForm(
        step_two_form.utilization as unknown as UtilizationOfMoneyOutput,
        setValue
      );
      if (
        step_two_form.utilization?.id &&
        step_two_form.utilization?.this_activity_occured_at
      ) {
        setOtherBol(true);
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<UtilizationOfMoneyFormData> = async (data) => {
    setLoading(true);
    const convertedData = convertUtilizationOfMoney(data);
    await submitUtilization(convertedData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      const data = getValues();
      const convertedData = convertUtilizationOfMoney(data);
      await submitUtilization(convertedData, true);
    } catch (error) {}

    setLoading(false);
  };

  const handleCheckboxChange = (skill: string) => {
    const selectedSkills = getValues("skills");
    if (skill === "None") {
      if (selectedSkills.includes("None")) {
        setValue("skills", []);
      } else {
        setOtherBol(false);
        setValue("skills", ["None"]);
      }
    } else {
      const c = selectedSkills.filter((item: string) => item !== "None");
      setOtherBol(true);

      if (selectedSkills.includes(skill)) {
        setValue(
          "skills",
          c.filter((item: string) => item !== skill)
        );
      } else {
        setValue("skills", [...c, skill]);
      }
    }
  };

  useEffect(() => {
    if (errors.skills) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="utilization-of-money-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Utilization of money
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following utilization of money
            skill(s):
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {skillOptions.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`skill_${idx}`}
                      checked={(field.value as string[]).includes(skill)}
                      onCheckedChange={() => handleCheckboxChange(skill)}
                      disabled={isFormDisabled}
                      data-testid={`money-skill-${skill
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`skill_${idx}`}
                >
                  {skill}
                </Label>
              </div>
            ))}
          </div>
          {errors.skills && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.skills)}
            </p>
          )}
        </div>

        {otherBol && (
          <div className="flex flex-col gap-5">
            <h4 className="text-[#0F172A] text-[18px] font-[600]">
              This activity occurred at:
            </h4>

            <Controller
              name="activityLocation"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  value={field.value ? field.value : ""}
                  disabled={isFormDisabled}
                  labelText=""
                  placeholder="Enter location here..."
                  data-testid="activity-location"
                />
              )}
            />
            {errors.activityLocation && (
              <p className="text-red-500 text-sm">
                {getErrorMessage(errors.activityLocation)}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%]">
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
              onClick={() => saveDraft()}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              isLoading={loading}
              onClick={() => {
                if (handleChangeStep) {
                  handleChangeStep(3);
                }
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default UtilizationOfMoney;
