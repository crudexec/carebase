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
import { getErrorMessage, SensoryNeedsOutput } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { sensoryNeedsSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type SensoryNeedsFormData = z.infer<typeof sensoryNeedsSchema>;

interface SensoryNeedsProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
}

const fineMotorOptions = [
  "Paste objects",
  "Copy simple shapes",
  "Turn pages of book",
  "Button a shirt",
  "Use of cutlery",
  "Cut simple shapes",
  "Use pencil and crayons well",
  "Zip a zipper",
  "Handle scissors well",
  "Play musical instruments",
  "Match simple objects",
  "Complete simple puzzles",
  "Build with blocks",
  "None",
];

const grossMotorOptions = [
  "Throw a ball",
  "Kick using balls",
  "Roll balls with hand or foot",
  "Skip in circles",
  "Hang clothes",
  "Go down slides",
  "Climb ladders",
  "Walk a straight line",
  "Jump rope",
  "Run around objects",
  "Toss a ball",
  "Walk backwards",
  "Balance on one foot",
  "Going up and down steps",
  "Pump legs on the swing at a playground",
  "None",
];

const fineMotorMap: {
  [key: string]: keyof Omit<
    SensoryNeedsOutput,
    | "other_error_specify_motor_development_skills"
    | "other_specify_gross_motor_skills"
  >;
} = {
  "Paste objects": "paste_objects",
  "Button a shirt": "button_a_shirt",
  "Use pencil and crayons well": "use_pencil_and_crayons_well",
  "Play musical instruments": "play_musical_instruments",
  "Build with blocks": "build_with_blocks",
  "Copy simple shapes": "copy_simple_shapes",
  "Use of cutlery": "use_of_cutlery",
  "Zip a zipper": "zip_a_zipper",
  "Match simple objects": "match_simple_objects",
  "Turn pages of book": "turn_pages_of_book",
  "Cut simple shapes": "cut_simple_shapes",
  "Handle scissors well": "handle_scissors_well",
  "Complete simple puzzles": "complete_simple_puzzles",
};

const grossMotorMap: {
  [key: string]: keyof Omit<
    SensoryNeedsOutput,
    | "other_error_specify_motor_development_skills"
    | "other_specify_gross_motor_skills"
  >;
} = {
  "Throw a ball": "throw_a_ball",
  "Skip in circles": "skip_in_circles",
  "Climb ladders": "climb_ladders",
  "Run around objects": "run_around_objects",
  "Balance on one foot": "balance_on_one_foot",
  "Kick using balls": "kick_using_balls",
  "Hang clothes": "hang_clothes",
  "Walk a straight line": "walk_a_straight_line",
  "Toss a ball": "toss_a_ball",
  "Going up and down steps": "going_up_and_down_steps",
  "Roll balls with hand or foot": "roll_balls_with_hand_or_foot",
  "Go down slides": "go_down_slides",
  "Jump rope": "jump_rope",
  "Walk backwards": "walk_backwards",
  "Pump legs on the swing at a playground":
    "pump_legs_on_the_swing_at_a_playground",
};

const populateSensoryNeedsForm = (data: SensoryNeedsOutput, setValue: any) => {
  const selectedFineMotorSkills = Object.entries(fineMotorMap).reduce(
    (acc, [skill, key]) => {
      if (data[key]) {
        acc.push(skill);
      }
      return acc;
    },
    [] as string[]
  );

  const selectedGrossMotorSkills = Object.entries(grossMotorMap).reduce(
    (acc, [skill, key]) => {
      if (data[key]) {
        acc.push(skill);
      }
      return acc;
    },
    [] as string[]
  );

  // Set fine motor skills
  setValue("fineMotorSkills", selectedFineMotorSkills);

  // Set gross motor skills
  setValue("grossMotorSkills", selectedGrossMotorSkills);

  // Handle "Other" cases for fine motor skills
  if (
    data.other_error_motor_development_skills &&
    data.other_error_specify_motor_development_skills &&
    data.other_error_specify_motor_development_skills?.length > 0
  ) {
    setValue("fineMotorSkills", [...selectedFineMotorSkills, "Other"]);
    setValue(
      "otherFineMotorSkill",
      data.other_error_specify_motor_development_skills || ""
    );
  }

  // Handle "Other" cases for gross motor skills
  if (
    data.other_gross_motor_skills &&
    data.other_specify_gross_motor_skills &&
    data.other_specify_gross_motor_skills?.length > 0
  ) {
    setValue("grossMotorSkills", [...selectedGrossMotorSkills, "Other"]);
    setValue(
      "otherGrossMotorSkill",
      data.other_specify_gross_motor_skills || ""
    );
  }

  if (
    selectedFineMotorSkills.length === 0 &&
    !data.other_error_specify_motor_development_skills
  ) {
    setValue("fineMotorSkills", ["None"]);
  }

  if (
    selectedGrossMotorSkills.length === 0 &&
    !data.other_specify_gross_motor_skills
  ) {
    setValue("grossMotorSkills", ["None"]);
  }
};

const SensoryNeeds: React.FC<SensoryNeedsProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<SensoryNeedsFormData>({
    resolver: zodResolver(sensoryNeedsSchema),

    defaultValues: {
      fineMotorSkills: [],
      grossMotorSkills: [],
    },
  });

  const { submitSensory } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;

  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.sensoryNeed) {
      populateSensoryNeedsForm(
        step_two_form.sensoryNeed as unknown as SensoryNeedsOutput,
        setValue
      );
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<SensoryNeedsFormData> = async (data) => {
    setLoading(true);
    // Convert form data to the expected output format
    const outputData: SensoryNeedsOutput = {
      paste_objects: data.fineMotorSkills.includes("Paste objects"),
      copy_simple_shapes: data.fineMotorSkills.includes("Copy simple shapes"),
      turn_pages_of_book: data.fineMotorSkills.includes("Turn pages of book"),
      button_a_shirt: data.fineMotorSkills.includes("Button a shirt"),
      use_of_cutlery: data.fineMotorSkills.includes("Use of cutlery"),
      cut_simple_shapes: data.fineMotorSkills.includes("Cut simple shapes"),
      use_pencil_and_crayons_well: data.fineMotorSkills.includes(
        "Use pencil and crayons well"
      ),
      zip_a_zipper: data.fineMotorSkills.includes("Zip a zipper"),
      handle_scissors_well: data.fineMotorSkills.includes(
        "Handle scissors well"
      ),
      play_musical_instruments: data.fineMotorSkills.includes(
        "Play musical instruments"
      ),
      match_simple_objects: data.fineMotorSkills.includes(
        "Match simple objects"
      ),
      complete_simple_puzzles: data.fineMotorSkills.includes(
        "Complete simple puzzles"
      ),
      build_with_blocks: data.fineMotorSkills.includes("Build with blocks"),
      other_error_motor_development_skills:
        data.fineMotorSkills.includes("Other"),
      other_error_specify_motor_development_skills:
        data.otherFineMotorSkill || "",
      throw_a_ball: data.grossMotorSkills.includes("Throw a ball"),
      kick_using_balls: data.grossMotorSkills.includes("Kick using balls"),
      roll_balls_with_hand_or_foot: data.grossMotorSkills.includes(
        "Roll balls with hand or foot"
      ),
      skip_in_circles: data.grossMotorSkills.includes("Skip in circles"),
      hang_clothes: data.grossMotorSkills.includes("Hang clothes"),
      go_down_slides: data.grossMotorSkills.includes("Go down slides"),
      climb_ladders: data.grossMotorSkills.includes("Climb ladders"),
      walk_a_straight_line: data.grossMotorSkills.includes(
        "Walk a straight line"
      ),
      jump_rope: data.grossMotorSkills.includes("Jump rope"),
      run_around_objects: data.grossMotorSkills.includes("Run around objects"),
      toss_a_ball: data.grossMotorSkills.includes("Toss a ball"),
      walk_backwards: data.grossMotorSkills.includes("Walk backwards"),
      balance_on_one_foot: data.grossMotorSkills.includes(
        "Balance on one foot"
      ),
      going_up_and_down_steps: data.grossMotorSkills.includes(
        "Going up and down steps"
      ),
      pump_legs_on_the_swing_at_a_playground: data.grossMotorSkills.includes(
        "Pump legs on the swing at a playground"
      ),
      other_gross_motor_skills: data.grossMotorSkills.includes("Other"),
      other_specify_gross_motor_skills: data.otherGrossMotorSkill || "",
    };
    await submitSensory(outputData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      const data = getValues();
      // Convert form data to the expected output format
      const outputData: SensoryNeedsOutput = {
        paste_objects: data.fineMotorSkills.includes("Paste objects"),
        copy_simple_shapes: data.fineMotorSkills.includes("Copy simple shapes"),
        turn_pages_of_book: data.fineMotorSkills.includes("Turn pages of book"),
        button_a_shirt: data.fineMotorSkills.includes("Button a shirt"),
        use_of_cutlery: data.fineMotorSkills.includes("Use of cutlery"),
        cut_simple_shapes: data.fineMotorSkills.includes("Cut simple shapes"),
        use_pencil_and_crayons_well: data.fineMotorSkills.includes(
          "Use pencil and crayons well"
        ),
        zip_a_zipper: data.fineMotorSkills.includes("Zip a zipper"),
        handle_scissors_well: data.fineMotorSkills.includes(
          "Handle scissors well"
        ),
        play_musical_instruments: data.fineMotorSkills.includes(
          "Play musical instruments"
        ),
        match_simple_objects: data.fineMotorSkills.includes(
          "Match simple objects"
        ),
        complete_simple_puzzles: data.fineMotorSkills.includes(
          "Complete simple puzzles"
        ),
        build_with_blocks: data.fineMotorSkills.includes("Build with blocks"),
        other_error_motor_development_skills:
          data.fineMotorSkills.includes("Other"),
        other_error_specify_motor_development_skills:
          data.otherFineMotorSkill || "",
        throw_a_ball: data.grossMotorSkills.includes("Throw a ball"),
        kick_using_balls: data.grossMotorSkills.includes("Kick using balls"),
        roll_balls_with_hand_or_foot: data.grossMotorSkills.includes(
          "Roll balls with hand or foot"
        ),
        skip_in_circles: data.grossMotorSkills.includes("Skip in circles"),
        hang_clothes: data.grossMotorSkills.includes("Hang clothes"),
        go_down_slides: data.grossMotorSkills.includes("Go down slides"),
        climb_ladders: data.grossMotorSkills.includes("Climb ladders"),
        walk_a_straight_line: data.grossMotorSkills.includes(
          "Walk a straight line"
        ),
        jump_rope: data.grossMotorSkills.includes("Jump rope"),
        run_around_objects:
          data.grossMotorSkills.includes("Run around objects"),
        toss_a_ball: data.grossMotorSkills.includes("Toss a ball"),
        walk_backwards: data.grossMotorSkills.includes("Walk backwards"),
        balance_on_one_foot: data.grossMotorSkills.includes(
          "Balance on one foot"
        ),
        going_up_and_down_steps: data.grossMotorSkills.includes(
          "Going up and down steps"
        ),
        pump_legs_on_the_swing_at_a_playground: data.grossMotorSkills.includes(
          "Pump legs on the swing at a playground"
        ),
        other_gross_motor_skills: data.grossMotorSkills.includes("Other"),
        other_specify_gross_motor_skills: data.otherGrossMotorSkill || "",
      };
      await submitSensory(outputData, true);
    } catch (error) {}
    setLoading(false);
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
        data-testid="sensory-needs-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Sensory Needs/ Motor Development
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        {/* Fine Motor Skills */}
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following fine motor development
            skills:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {fineMotorOptions.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <Controller
                  name="fineMotorSkills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      disabled={isFormDisabled}
                      id={`fine_${index}`}
                      checked={field.value.includes(skill)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, skill]
                          : field.value.filter((value) => value !== skill);
                        field.onChange(updatedValue);
                      }}
                      data-testid={`fine-motor-${skill
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`fine_${index}`}
                >
                  {skill}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Controller
                name="fineMotorSkills"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    disabled={isFormDisabled}
                    id="fine_other"
                    checked={field.value.includes("Other")}
                    onCheckedChange={(checked) => {
                      const updatedValue = checked
                        ? [...field.value, "Other"]
                        : field.value.filter((value) => value !== "Other");
                      field.onChange(updatedValue);
                    }}
                    data-testid="fine-motor-other"
                  />
                )}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="fine_other"
              >
                Other
              </Label>
            </div>
          </div>

          {watch("fineMotorSkills").includes("Other") && (
            <Controller
              name="otherFineMotorSkill"
              control={control}
              render={({ field }) => (
                <FormInput
                  disabled={isFormDisabled}
                  {...field}
                  labelText=""
                  placeholder="Please specify other fine motor skill"
                  type="text"
                  isAuth={false}
                  data-testid="other-fine-motor-skill"
                />
              )}
            />
          )}
        </div>

        {/* Gross Motor Skills */}
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following gross motor
            development skills:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {grossMotorOptions.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <Controller
                  name="grossMotorSkills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      disabled={isFormDisabled}
                      id={`gross_${index}`}
                      checked={field.value.includes(skill)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, skill]
                          : field.value.filter((value) => value !== skill);
                        field.onChange(updatedValue);
                      }}
                      data-testid={`gross-motor-${skill
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`gross_${index}`}
                >
                  {skill}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Controller
                name="grossMotorSkills"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    disabled={isFormDisabled}
                    id="gross_other"
                    checked={field.value.includes("Other")}
                    onCheckedChange={(checked) => {
                      const updatedValue = checked
                        ? [...field.value, "Other"]
                        : field.value.filter((value) => value !== "Other");
                      field.onChange(updatedValue);
                    }}
                    data-testid="gross-motor-other"
                  />
                )}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="gross_other"
              >
                Other
              </Label>
            </div>
          </div>

          {watch("grossMotorSkills").includes("Other") && (
            <Controller
              name="otherGrossMotorSkill"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify other gross motor skill"
                  type="text"
                  disabled={isFormDisabled}
                  isAuth={false}
                  data-testid="other-gross-motor-skill"
                />
              )}
            />
          )}
        </div>

        {errors.fineMotorSkills && (
          <p className="text-red-500">{errors.fineMotorSkills.message}</p>
        )}
        {errors.grossMotorSkills && (
          <p className="text-red-500">{errors.grossMotorSkills.message}</p>
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

export default SensoryNeeds;
