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
import {
  checkFormData,
  getErrorMessage,
  hasAnyTrueValue,
  LeisureOutput,
} from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { leisureSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type LeisureInput = {
  activities: string[];
  other?: string;
};

const leisureMap: {
  [key: string]: keyof Omit<LeisureOutput, "other" | "other_specify">;
} = {
  Puzzle: "puzzle",
  Dance: "dance",
  "Arts & crafts": "arts_and_crafts",
  "Listen to music": "listen_to_music",
  "Icons/Pictures": "icons_or_pictures",
  "Computer games": "computer_games",
  "Short naps": "short_naps",
};

function convertLeisure(input: LeisureInput): LeisureOutput {
  const output: LeisureOutput = {
    puzzle: false,
    dance: false,
    arts_and_crafts: false,
    listen_to_music: false,
    icons_or_pictures: false,
    computer_games: false,
    short_naps: false,
    other: false,
    other_specify: input.other || null,
  };

  input.activities.forEach((activity) => {
    const key = leisureMap[activity];
    if (key) {
      output[key] = true;
    } else if (activity === "Other") {
      output.other = true;
    }
  });

  return output;
}

type LeisureFormData = z.infer<typeof leisureSchema>;

interface LeisureProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const activitiesOptions = [
  "Puzzle",
  "Icons/Pictures",
  "Dance",
  "Computer games",
  "Arts & crafts",
  "Short naps",
  "Listen to music",
  "None",
];

const populateLeisureForm = (
  data: LeisureOutput & { id?: string },
  setValue: any
) => {
  const selectedActivities = Object.entries(leisureMap).reduce(
    (acc, [activity, key]) => {
      if (data[key]) {
        acc.push(activity);
      }
      return acc;
    },
    [] as string[]
  );

  if (data.other) {
    selectedActivities.push("Other");
  }

  setValue("activities", selectedActivities);

  if (hasAnyTrueValue(data, leisureMap) === false && data?.id && !data.other) {
    setValue("activities", ["None"]);
  }
  if (data.other) {
    setValue("other", data.other_specify || "");
  }
};

const Leisure: React.FC<LeisureProps> = ({
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
  } = useForm<LeisureFormData>({
    resolver: zodResolver(leisureSchema),
    defaultValues: {
      activities: [],
    },
  });

  const { submitPlay } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.play) {
      populateLeisureForm(
        step_two_form.play as unknown as LeisureOutput & { id?: string },
        setValue
      );

      if (step_two_form.play.other) {
        setSelectOther(true);
      }
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<LeisureFormData> = async (data) => {
    setLoading(true);
    const convertedData = convertLeisure(data);
    await submitPlay(convertedData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    const data = getValues();
    try {
      const convertedData = convertLeisure(data);
      await submitPlay(convertedData, true);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckboxChange = (activity: string) => {
    const selectedActivities = getValues("activities");

    if (activity === "None") {
      if (selectedActivities.includes("None")) {
        setValue("activities", []);
      } else {
        setSelectOther(false);
        setValue("activities", ["None"]);
      }
    } else {
      const c = selectedActivities.filter((item: string) => item !== "None");

      if (selectedActivities.includes(activity)) {
        setValue(
          "activities",
          c.filter((item: string) => item !== activity)
        );
      } else {
        setValue("activities", [...c, activity]);
      }
    }
  };

  useEffect(() => {
    if (errors.activities) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);
  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="leisure-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Play / Leisure
      </h3>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I assisted {username} with the following activities:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4">
            {activitiesOptions.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Controller
                  name="activities"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`activity_${idx}`}
                      checked={(field.value as string[]).includes(activity)}
                      onCheckedChange={() => handleCheckboxChange(activity)}
                      disabled={isFormDisabled}
                      data-testid={`activity-${activity
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`activity_${idx}`}
                >
                  {activity}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="other"
                checked={selectOther}
                onCheckedChange={(checked) => {
                  setSelectOther(checked === true);
                  if (checked) {
                    handleCheckboxChange("Other");
                  } else {
                    const selectedActivities = getValues("activities");
                    setValue(
                      "activities",
                      selectedActivities.filter(
                        (item: string) => item !== "Other"
                      )
                    );
                  }
                }}
                data-testid={`activity-other`}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </div>
          {errors.activities && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(errors.activities)}
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
                data-testid="other-activity"
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

export default Leisure;
