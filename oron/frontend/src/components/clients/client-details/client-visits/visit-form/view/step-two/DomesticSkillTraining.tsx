"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormInput from "@/components/input-fields/FormInput";
import { ChoresOutput, getErrorMessage } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { domesticSkillSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type ChoresInput = {
  chores: string[];
  other: string | undefined;
};

const choresMap: { [key: string]: keyof ChoresOutput } = {
  "Make bed": "assist_to_make_bed",
  "Dust furniture": "assist_to_dust_furniture",
  Vacuum: "assist_to_vacuum",
  "Arrange clothes": "assist_to_arrange_clothes",
  Laundry: "assist_to_laundry",
  "Do dishes": "assist_to_do_dishes",
  "Remove trash": "assist_to_remove_trash",
  "Fold clothes": "assist_to_fold_clothes",
};

function convertChores(
  input: ChoresInput,
  selectedOther: boolean
): ChoresOutput {
  const output: ChoresOutput = {
    assist_to_make_bed: false,
    assist_to_dust_furniture: false,
    assist_to_vacuum: false,
    assist_to_arrange_clothes: false,
    assist_to_laundry: false,
    assist_to_do_dishes: false,
    assist_to_remove_trash: false,
    assist_to_fold_clothes: false,
    other: selectedOther,
    specify_other: input.other,
  };

  input.chores.forEach((chore) => {
    const key = choresMap[chore];
    if (key && key in output) {
      (output[key] as boolean) = true;
    } else {
      output.other = true;
    }
  });

  return output;
}

interface DomesticSkillTrainingProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const choresOptions = [
  "Make bed",
  "Laundry",
  "Dust furniture",
  "Do dishes",
  "Vacuum",
  "Remove trash",
  "Arrange clothes",
  "Fold clothes",
  "None",
];

const populateChoresForm = (data: ChoresOutput, setValue: any) => {
  const selectedChores = Object.entries(choresMap).reduce(
    (acc, [chore, key]) => {
      if (data[key]) {
        acc.push(chore);
      }
      return acc;
    },
    [] as string[]
  );

  setValue("chores", selectedChores);

  if (data.other && data.specify_other && data.specify_other?.length > 0) {
    setValue("other", data.specify_other || "");
  }

  if (selectedChores.length === 0 && !data.specify_other) {
    setValue("chores", ["None"]);
  }
};

const DomesticSkillTraining: React.FC<DomesticSkillTrainingProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [selectOther, setSelectOther] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FieldValues>({
    resolver: zodResolver(domesticSkillSchema),
    defaultValues: {
      chores: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const { submitDomesticSkillTraining } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;

  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form) {
      populateChoresForm(
        step_two_form.domestic as unknown as ChoresOutput,
        setValue
      );

      if (
        step_two_form.domestic.other &&
        step_two_form.domestic.specify_other &&
        step_two_form.domestic.specify_other?.length > 0
      ) {
        setSelectOther(true);
        setValue("other", step_two_form.domestic.specify_other || "");
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    await submitDomesticSkillTraining(convertChores(data, selectOther));
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      await submitDomesticSkillTraining(
        convertChores(getValues() as any, selectOther),
        true
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (chore: string) => {
    const selectedChores = getValues("chores") || [];

    if (chore === "None") {
      if (selectedChores.includes("None")) {
        setValue("chores", []);
      } else {
        setSelectOther(false);
        setValue("chores", ["None"]);
      }
    } else {
      const c = selectedChores.filter((item: string) => item !== "None");

      if (c.includes(chore)) {
        setValue(
          "chores",
          c.filter((item: string) => item !== chore)
        );
      } else {
        setValue("chores", [...c, chore]);
      }
    }
  };

  useEffect(() => {
    if (errors.chores) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="domestic-training-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Domestic Skill Training
      </h3>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} with the following household chores:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {choresOptions.map((chore, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="chores"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`chore_${idx}`}
                      disabled={isFormDisabled}
                      checked={(field.value as string[]).includes(chore)}
                      onCheckedChange={() => handleCheckboxChange(chore)}
                      data-testid={`domestic-skill-${chore
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`chore_${idx}`}
                >
                  {chore}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other"
                checked={selectOther}
                disabled={isFormDisabled}
                onCheckedChange={(checked) => {
                  setSelectOther(checked === true);
                  if (!checked) {
                    setValue("other", undefined);
                  }
                }}
                data-testid={`domestic-skill-other`}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </div>
          {errors.chores && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.chores)}
            </p>
          )}
        </div>

        {selectOther && (
          <Controller
            name="other"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormInput
                {...field}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
                isError={!!errors.other}
                disabled={isFormDisabled}
                errorMessage={getErrorMessage(errors.other)}
                data-testid="other-domestic-skill"
              />
            )}
          />
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

export default DomesticSkillTraining;
