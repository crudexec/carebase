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
import FormInput from "@/components/input-fields/FormInput";
import { getErrorMessage } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { survivalSkillsSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type SurvivalSkillsInput = {
  skills: string[];
  other?: string;
};

type SurvivalSkillsOutput = {
  cross_the_street: boolean;
  awareness_of_strangers: boolean;
  fire_emergency_awareness: boolean;
  unlock_door_when_trapped_in_a_room: boolean;
  other: boolean;
  specify_other: string | null;
};

const survivalSkillsMap: {
  [key: string]: keyof Omit<SurvivalSkillsOutput, "other" | "specify_other">;
} = {
  "Cross the street": "cross_the_street",
  "Awareness of strangers": "awareness_of_strangers",
  "Fire emergency awareness": "fire_emergency_awareness",
  "Unlock door when trapped in a room": "unlock_door_when_trapped_in_a_room",
};

function convertSurvivalSkills(
  input: SurvivalSkillsInput
): SurvivalSkillsOutput {
  const output: SurvivalSkillsOutput = {
    cross_the_street: false,
    awareness_of_strangers: false,
    fire_emergency_awareness: false,
    unlock_door_when_trapped_in_a_room: false,
    other: false,
    specify_other: input.other || null,
  };

  input.skills.forEach((skill) => {
    const key = survivalSkillsMap[skill];
    if (key) {
      output[key] = true;
    } else if (skill === "Other") {
      output.other = true;
    }
  });

  return output;
}

type SurvivalSkillsFormData = z.infer<typeof survivalSkillsSchema>;

interface SurvivalSkillsProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const skillsOptions = [
  "Cross the street",
  "Awareness of strangers",
  "Fire emergency awareness",
  "Unlock door when trapped in a room",
  "None",
];

const populateSurvivalSkillsForm = (
  data: SurvivalSkillsOutput,
  setValue: any
) => {
  const selectedSkills = Object.entries(survivalSkillsMap).reduce(
    (acc, [skill, key]) => {
      if (data[key]) {
        acc.push(skill);
      }
      return acc;
    },
    [] as string[]
  );

  if (data.other && data.specify_other && data.specify_other?.length > 0) {
    selectedSkills.push("Other");
  }

  setValue("skills", selectedSkills);

  if (data.other && data.specify_other && data.specify_other?.length > 0) {
    setValue("other", data.specify_other || "");
  }

  if (selectedSkills.length === 0 && !data.specify_other) {
    setValue("skills", ["None"]);
  }
};

const SurvivalSkills: React.FC<SurvivalSkillsProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [selectOther, setSelectOther] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<SurvivalSkillsFormData>({
    resolver: zodResolver(survivalSkillsSchema),
    defaultValues: {
      skills: [],
    },
  });

  const { submitSafety } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;

  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.safty) {
      populateSurvivalSkillsForm(
        step_two_form.safty as unknown as SurvivalSkillsOutput,
        setValue
      );

      if (step_two_form.safty.other) {
        setSelectOther(true);
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<SurvivalSkillsFormData> = async (data) => {
    setLoading(true);
    const convertedData = convertSurvivalSkills(data);
    await submitSafety(convertedData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      const convertedData = convertSurvivalSkills(getValues());
      await submitSafety(convertedData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (skill: string) => {
    const selectedSkills = getValues("skills");

    if (skill === "None") {
      if (selectedSkills.includes("None")) {
        setValue("skills", []);
      } else {
        setValue("skills", ["None"]);
      }
    } else {
      const c = selectedSkills.filter((item: string) => item !== "None");

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
        data-testid="survival-skills-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Safety/ Survival Skills
      </h3>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} to practice the following safety skill(s)
            today:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {skillsOptions.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`skill_${idx}`}
                      disabled={isFormDisabled}
                      checked={(field.value as string[]).includes(skill)}
                      onCheckedChange={() => handleCheckboxChange(skill)}
                      data-testid={`survival-skill-${skill
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
            <div className="flex items-center gap-2">
              <Checkbox
                id="other"
                checked={selectOther}
                disabled={isFormDisabled}
                onCheckedChange={(checked) => {
                  setSelectOther(checked === true);
                  if (checked) {
                    handleCheckboxChange("Other");
                  } else {
                    const selectedSkills = getValues("skills");
                    setValue(
                      "skills",
                      selectedSkills.filter((item: string) => item !== "Other")
                    );
                  }
                }}
                data-testid="survival-skill-other"
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </div>
          {errors.skills && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.skills)}
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
                disabled={isFormDisabled}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
                isError={!!errors.other}
                errorMessage={getErrorMessage(errors.other)}
                data-testid="other-survival-skill"
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

export default SurvivalSkills;
