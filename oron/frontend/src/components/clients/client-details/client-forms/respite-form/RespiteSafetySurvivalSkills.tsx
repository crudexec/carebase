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
import { submitRespiteSafetySurvivalSkills } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const safetySkillsSchema = z.object({
  skills: z.array(z.string()).min(1, "Please select at least one safety skill"),
  other: z.string().optional(),
});

type SafetySkillsFormData = z.infer<typeof safetySkillsSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const skillsOptions = [
  "Cross the street",
  "Fire emergency awareness",
  "Awareness of strangers",
  "Unlock door when trapped in a room",
];

const RespiteSafetySurvivalSkills = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  respiteForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [selectOther, setSelectOther] = useState(false);
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
  } = useForm<SafetySkillsFormData>({
    resolver: zodResolver(safetySkillsSchema),
    defaultValues: {
      skills: [],
      other: "",
    },
  });

  useEffect(() => {
    if (!respiteForm?.safetyAndSurvivalSkills) return;

    setMethod("PATCH");
    const { safetyAndSurvivalSkills } = respiteForm;

    // Populate skills
    const selectedSkills = [];
    if (safetyAndSurvivalSkills.cross_the_street)
      selectedSkills.push("Cross the street");
    if (safetyAndSurvivalSkills.awareness_of_strangers)
      selectedSkills.push("Awareness of strangers");
    if (safetyAndSurvivalSkills.fire_emergency_awareness)
      selectedSkills.push("Fire emergency awareness");
    if (safetyAndSurvivalSkills.unlock_door_when_trapped_in_a_room)
      selectedSkills.push("Unlock door when trapped in a room");
    setValue("skills", selectedSkills);

    if (safetyAndSurvivalSkills.other) {
      setSelectOther(true);
      setValue("skills", [...selectedSkills, "Other"]);
      setValue("other", safetyAndSurvivalSkills.specify_other || "");
    }
  }, [respiteForm, setValue]);

  const onSubmit = async (data: SafetySkillsFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      if (!respiteForm?.id) return;

      const transformedData = {
        cross_the_street: data.skills.includes("Cross the street"),
        awareness_of_strangers: data.skills.includes("Awareness of strangers"),
        fire_emergency_awareness: data.skills.includes(
          "Fire emergency awareness"
        ),
        unlock_door_when_trapped_in_a_room: data.skills.includes(
          "Unlock door when trapped in a room"
        ),
        other: data.skills.includes("Other"),
        specify_other: data.other || null,
      };

      const response = await submitRespiteSafetySurvivalSkills(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.safetyAndSurvivalSkills?.id
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
      console.error("ERROR SUBMITTING SAFETY SKILLS", err);
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
      if (!respiteForm?.id) return;

      const transformedData = {
        cross_the_street: data.skills.includes("Cross the street"),
        awareness_of_strangers: data.skills.includes("Awareness of strangers"),
        fire_emergency_awareness: data.skills.includes(
          "Fire emergency awareness"
        ),
        unlock_door_when_trapped_in_a_room: data.skills.includes(
          "Unlock door when trapped in a room"
        ),
        other: data.skills.includes("Other"),
        specify_other: data.other || null,
      };

      const response = await submitRespiteSafetySurvivalSkills(
        token,
        transformedData,
        respiteForm.id,
        method,
        respiteForm?.safetyAndSurvivalSkills?.id
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

  const handleCheckboxChange = (skill: string) => {
    const currentSkills = getValues("skills");
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];
    setValue("skills", updatedSkills);
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
        Safety/ Survival Skills
      </h3>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} to practice the following safety skill(s)
            today:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {skillsOptions.map((skill) => (
              <div key={skill} className="flex items-center gap-2">
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={skill}
                      checked={field.value.includes(skill)}
                      onCheckedChange={() => handleCheckboxChange(skill)}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={skill}
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
                    const currentSkills = getValues("skills");
                    setValue(
                      "skills",
                      currentSkills.filter((s) => s !== "Other")
                    );
                  }
                }}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </div>

          {selectOther && (
            <Controller
              name="other"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  isError={!!errors.other}
                  errorMessage={errors.other?.message}
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

export default RespiteSafetySurvivalSkills;
