"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
import { submitRespiteSensoryNeeds } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const sensoryNeedsSchema = z.object({
  fineMotorSkills: z
    .array(z.string())
    .min(1, "Please select at least one fine motor skill"),
  otherFineMotorSkill: z.string().optional(),
  grossMotorSkills: z
    .array(z.string())
    .min(1, "Please select at least one gross motor skill"),
  otherGrossMotorSkill: z.string().optional(),
});

type SensoryNeedsFormData = z.infer<typeof sensoryNeedsSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const fineMotorOptions = [
  "Paste objects",
  "Copy simple shapes",
  "Turn pages of book",
  "Button a shirt",
  "Use of cutlery while eating",
  "Cut simple shapes",
  "Use pencil and crayon well",
  "Zip a zipper",
  "Handle scissors well",
  "Play musical instrument",
  "Match simple objects",
  "Complete simple puzzles",
  "Build with blocks",
  "None",
];

const grossMotorOptions = [
  "Throw a ball",
  "Kick using balls",
  "Roll balls with hand/feet",
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
  "Going up/down steps",
  "Pump legs on the swing at a playground",
  "None",
];

const TIVisitSensoryNeeds = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SensoryNeedsFormData>({
    resolver: zodResolver(sensoryNeedsSchema),
    defaultValues: {
      fineMotorSkills: [],
      otherFineMotorSkill: "",
      grossMotorSkills: [],
      otherGrossMotorSkill: "",
    },
  });

  useEffect(() => {
    if (!tiForm?.sensoryNeedAndMotorDevelopment) return;

    setMethod("PATCH");
    const { sensoryNeedAndMotorDevelopment } = tiForm;

    // Populate fine motor skills
    const selectedFineMotorSkills = [];
    if (sensoryNeedAndMotorDevelopment.paste_objects)
      selectedFineMotorSkills.push("Paste objects");
    if (sensoryNeedAndMotorDevelopment.copy_simple_shapes)
      selectedFineMotorSkills.push("Copy simple shapes");
    if (sensoryNeedAndMotorDevelopment.turn_pages_of_book)
      selectedFineMotorSkills.push("Turn pages of book");
    if (sensoryNeedAndMotorDevelopment.button_a_shirt)
      selectedFineMotorSkills.push("Button a shirt");
    if (sensoryNeedAndMotorDevelopment.use_of_cutlery)
      selectedFineMotorSkills.push("Use of cutlery while eating");
    if (sensoryNeedAndMotorDevelopment.cut_simple_shapes)
      selectedFineMotorSkills.push("Cut simple shapes");
    if (sensoryNeedAndMotorDevelopment.use_pencil_and_crayons_well)
      selectedFineMotorSkills.push("Use pencil and crayon well");
    if (sensoryNeedAndMotorDevelopment.zip_a_zipper)
      selectedFineMotorSkills.push("Zip a zipper");
    if (sensoryNeedAndMotorDevelopment.handle_scissors_well)
      selectedFineMotorSkills.push("Handle scissors well");
    if (sensoryNeedAndMotorDevelopment.play_musical_instruments)
      selectedFineMotorSkills.push("Play musical instrument");
    if (sensoryNeedAndMotorDevelopment.match_simple_objects)
      selectedFineMotorSkills.push("Match simple objects");
    if (sensoryNeedAndMotorDevelopment.complete_simple_puzzles)
      selectedFineMotorSkills.push("Complete simple puzzles");
    if (sensoryNeedAndMotorDevelopment.build_with_blocks)
      selectedFineMotorSkills.push("Build with blocks");
    if (selectedFineMotorSkills.length === 0)
      selectedFineMotorSkills.push("None");
    setValue("fineMotorSkills", selectedFineMotorSkills);

    if (sensoryNeedAndMotorDevelopment.other_error_motor_development_skills) {
      setValue("fineMotorSkills", [...selectedFineMotorSkills, "Other"]);
      setValue(
        "otherFineMotorSkill",
        sensoryNeedAndMotorDevelopment.other_error_specify_motor_development_skills ||
          ""
      );
    }

    // Populate gross motor skills
    const selectedGrossMotorSkills = [];
    if (sensoryNeedAndMotorDevelopment.throw_a_ball)
      selectedGrossMotorSkills.push("Throw a ball");
    if (sensoryNeedAndMotorDevelopment.kick_using_balls)
      selectedGrossMotorSkills.push("Kick using balls");
    if (sensoryNeedAndMotorDevelopment.roll_balls_with_hand_or_foot)
      selectedGrossMotorSkills.push("Roll balls with hand/feet");
    if (sensoryNeedAndMotorDevelopment.skip_in_circles)
      selectedGrossMotorSkills.push("Skip in circles");
    if (sensoryNeedAndMotorDevelopment.hang_clothes)
      selectedGrossMotorSkills.push("Hang clothes");
    if (sensoryNeedAndMotorDevelopment.go_down_slides)
      selectedGrossMotorSkills.push("Go down slides");
    if (sensoryNeedAndMotorDevelopment.climb_ladders)
      selectedGrossMotorSkills.push("Climb ladders");
    if (sensoryNeedAndMotorDevelopment.walk_a_straight_line)
      selectedGrossMotorSkills.push("Walk a straight line");
    if (sensoryNeedAndMotorDevelopment.jump_rope)
      selectedGrossMotorSkills.push("Jump rope");
    if (sensoryNeedAndMotorDevelopment.run_around_objects)
      selectedGrossMotorSkills.push("Run around objects");
    if (sensoryNeedAndMotorDevelopment.toss_a_ball)
      selectedGrossMotorSkills.push("Toss a ball");
    if (sensoryNeedAndMotorDevelopment.walk_backwards)
      selectedGrossMotorSkills.push("Walk backwards");
    if (sensoryNeedAndMotorDevelopment.balance_on_one_foot)
      selectedGrossMotorSkills.push("Balance on one foot");
    if (sensoryNeedAndMotorDevelopment.going_up_and_down_steps)
      selectedGrossMotorSkills.push("Going up/down steps");
    if (sensoryNeedAndMotorDevelopment.pump_legs_on_the_swing_at_a_playground)
      selectedGrossMotorSkills.push("Pump legs on the swing at a playground");
    if (selectedGrossMotorSkills.length === 0)
      selectedGrossMotorSkills.push("None");
    setValue("grossMotorSkills", selectedGrossMotorSkills);

    if (sensoryNeedAndMotorDevelopment.other_gross_motor_skills) {
      setValue("grossMotorSkills", [...selectedGrossMotorSkills, "Other"]);
      setValue(
        "otherGrossMotorSkill",
        sensoryNeedAndMotorDevelopment.other_specify_gross_motor_skills || ""
      );
    }
  }, [tiForm, setValue]);

  const onSubmit = async (data: SensoryNeedsFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        paste_objects: data.fineMotorSkills.includes("Paste objects"),
        copy_simple_shapes: data.fineMotorSkills.includes("Copy simple shapes"),
        turn_pages_of_book: data.fineMotorSkills.includes("Turn pages of book"),
        button_a_shirt: data.fineMotorSkills.includes("Button a shirt"),
        use_of_cutlery: data.fineMotorSkills.includes(
          "Use of cutlery while eating"
        ),
        cut_simple_shapes: data.fineMotorSkills.includes("Cut simple shapes"),
        use_pencil_and_crayons_well: data.fineMotorSkills.includes(
          "Use pencil and crayon well"
        ),
        zip_a_zipper: data.fineMotorSkills.includes("Zip a zipper"),
        handle_scissors_well: data.fineMotorSkills.includes(
          "Handle scissors well"
        ),
        play_musical_instruments: data.fineMotorSkills.includes(
          "Play musical instrument"
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
        other_error_specify_motor_development_skills: data.otherFineMotorSkill,
        throw_a_ball: data.grossMotorSkills.includes("Throw a ball"),
        kick_using_balls: data.grossMotorSkills.includes("Kick using balls"),
        roll_balls_with_hand_or_foot: data.grossMotorSkills.includes(
          "Roll balls with hand/feet"
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
          "Going up/down steps"
        ),
        pump_legs_on_the_swing_at_a_playground: data.grossMotorSkills.includes(
          "Pump legs on the swing at a playground"
        ),
        other_gross_motor_skills: data.grossMotorSkills.includes("Other"),
        other_specify_gross_motor_skills: data.otherGrossMotorSkill,
      };

      const response = await submitRespiteSensoryNeeds(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.sensoryNeedAndMotorDevelopment?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING SENSORY NEEDS", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        paste_objects: data.fineMotorSkills.includes("Paste objects"),
        copy_simple_shapes: data.fineMotorSkills.includes("Copy simple shapes"),
        turn_pages_of_book: data.fineMotorSkills.includes("Turn pages of book"),
        button_a_shirt: data.fineMotorSkills.includes("Button a shirt"),
        use_of_cutlery: data.fineMotorSkills.includes(
          "Use of cutlery while eating"
        ),
        cut_simple_shapes: data.fineMotorSkills.includes("Cut simple shapes"),
        use_pencil_and_crayons_well: data.fineMotorSkills.includes(
          "Use pencil and crayon well"
        ),
        zip_a_zipper: data.fineMotorSkills.includes("Zip a zipper"),
        handle_scissors_well: data.fineMotorSkills.includes(
          "Handle scissors well"
        ),
        play_musical_instruments: data.fineMotorSkills.includes(
          "Play musical instrument"
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
        other_error_specify_motor_development_skills: data.otherFineMotorSkill,
        throw_a_ball: data.grossMotorSkills.includes("Throw a ball"),
        kick_using_balls: data.grossMotorSkills.includes("Kick using balls"),
        roll_balls_with_hand_or_foot: data.grossMotorSkills.includes(
          "Roll balls with hand/feet"
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
          "Going up/down steps"
        ),
        pump_legs_on_the_swing_at_a_playground: data.grossMotorSkills.includes(
          "Pump legs on the swing at a playground"
        ),
        other_gross_motor_skills: data.grossMotorSkills.includes("Other"),
        other_specify_gross_motor_skills: data.otherGrossMotorSkill,
      };

      const response = await submitRespiteSensoryNeeds(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.sensoryNeedAndMotorDevelopment?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleCheckboxChange = (
    fieldName: "fineMotorSkills" | "grossMotorSkills",
    value: string
  ) => {
    const currentValues = getValues(fieldName);

    if (value === "None") {
      if (currentValues.includes("None")) {
        setValue(fieldName, []);
      } else {
        setValue(fieldName, ["None"]);
      }
    } else {
      const filtered = currentValues.filter((item: string) => item !== "None");
      if (filtered.includes(value)) {
        setValue(
          fieldName,
          filtered.filter((item: string) => item !== value)
        );
      } else {
        setValue(fieldName, [...filtered, value]);
      }
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Sensory Needs / Motor Development
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following fine motor development
            skills:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {fineMotorOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="fineMotorSkills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={(field.value as string[]).includes(option)}
                      onCheckedChange={() =>
                        handleCheckboxChange("fineMotorSkills", option)
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Controller
                name="fineMotorSkills"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="fine_other"
                    checked={(field.value as string[]).includes("Other")}
                    onCheckedChange={(checked) => {
                      const currentValues = field.value as string[];
                      if (checked) {
                        field.onChange([...currentValues, "Other"]);
                      } else {
                        field.onChange(
                          currentValues.filter((v) => v !== "Other")
                        );
                        setValue("otherFineMotorSkill", "");
                      }
                    }}
                    disabled={isFormDisabled}
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
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  isError={!!errors.otherFineMotorSkill}
                  disabled={isFormDisabled}
                  errorMessage={errors.otherFineMotorSkill?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} practice the following gross motor
            development skills:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {grossMotorOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="grossMotorSkills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={(field.value as string[]).includes(option)}
                      onCheckedChange={() =>
                        handleCheckboxChange("grossMotorSkills", option)
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Controller
                name="grossMotorSkills"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="gross_other"
                    checked={(field.value as string[]).includes("Other")}
                    onCheckedChange={(checked) => {
                      const currentValues = field.value as string[];
                      if (checked) {
                        field.onChange([...currentValues, "Other"]);
                      } else {
                        field.onChange(
                          currentValues.filter((v) => v !== "Other")
                        );
                        setValue("otherGrossMotorSkill", "");
                      }
                    }}
                    disabled={isFormDisabled}
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
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  isError={!!errors.otherGrossMotorSkill}
                  disabled={isFormDisabled}
                  errorMessage={errors.otherGrossMotorSkill?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default TIVisitSensoryNeeds;
