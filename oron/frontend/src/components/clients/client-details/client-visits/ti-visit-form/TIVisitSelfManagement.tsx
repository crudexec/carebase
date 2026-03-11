"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, FieldPath } from "react-hook-form";
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
import { submitRespiteSelfManagement } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";
import { validateField } from "@/lib/api-utils";

type CheckedState = boolean | "indeterminate";

const responseLabels = [
  { label: "Responding to others, during", value: "responding_to_others" },
  { label: "Sharing, during", value: "sharing" },
  {
    label: "Increasing on-task behaviors, during",
    value: "increasing_on_task_behaviors",
  },
  {
    label: "Initiating interactions, during",
    value: "initiating_interactions",
  },
  { label: "Conversing with others, during", value: "conversing_with_others" },
  { label: "Increasing play skills, during", value: "increasing_play_skills" },
  {
    label: "Promoting daily living skills, during",
    value: "promoting_daily_living_skills",
  },
  { label: "Taking turns, during", value: "taking_turns" },
  { label: "Following the rules, during", value: "following_the_rules" },
  {
    label: "Reducing the occurrence of interfering behaviours, during",
    value: "reducing_occurrence_of_interfering_behaviours",
  },
  {
    label: "Co-operate with peers in group activity, during",
    value: "cooperate_with_peers_in_group_activity",
  },
  { label: "Other", value: "other" },
] as const;

type ResponseLabel = (typeof responseLabels)[number];

const selfManagementSchema = z.object({
  responses: z
    .record(
      z.object({
        checked: z.boolean(),
        during: z.string().optional(),
      })
    )
    .refine(
      (data) => {
        return Object.values(data).some((value) => value.checked === true);
      },
      {
        message: "Please select at least one option",
      }
    ),
  other_description: z.string().optional().nullable(),
});

type SelfManagementFormData = z.infer<typeof selfManagementSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const TIVisitSelfManagement = ({
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
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SelfManagementFormData>({
    resolver: zodResolver(selfManagementSchema),
    defaultValues: {
      responses: Object.fromEntries(
        responseLabels.map(({ value }) => [
          value,
          { checked: false, during: "" },
        ])
      ),
      other_description: "",
    },
  });

  const watchResponses = watch("responses");

  useEffect(() => {
    if (!tiForm?.selfManagement) return;

    setMethod("PATCH");
    const { selfManagement } = tiForm;

    setValue(
      "responses.responding_to_others.checked",
      Boolean(selfManagement.responding_to_others)
    );
    setValue("responses.responding_to_others.during", "");

    setValue("responses.sharing.checked", Boolean(selfManagement.sharing));
    setValue("responses.sharing.during", "");

    setValue(
      "responses.increasing_on_task_behaviors.checked",
      Boolean(selfManagement.increasing_on_task_behavior)
    );
    setValue("responses.increasing_on_task_behaviors.during", "");

    setValue(
      "responses.initiating_interactions.checked",
      Boolean(selfManagement.initiating_interactions)
    );
    setValue("responses.initiating_interactions.during", "");

    setValue(
      "responses.conversing_with_others.checked",
      Boolean(selfManagement.conversing_with_others)
    );
    setValue("responses.conversing_with_others.during", "");

    setValue(
      "responses.increasing_play_skills.checked",
      Boolean(selfManagement.increasing_play_skills)
    );
    setValue("responses.increasing_play_skills.during", "");

    setValue(
      "responses.promoting_daily_living_skills.checked",
      Boolean(selfManagement.promoting_daily_living_skills)
    );
    setValue("responses.promoting_daily_living_skills.during", "");

    setValue(
      "responses.taking_turns.checked",
      Boolean(selfManagement.taking_turns)
    );
    setValue("responses.taking_turns.during", "");

    setValue(
      "responses.following_the_rules.checked",
      Boolean(selfManagement.following_the_rules)
    );
    setValue("responses.following_the_rules.during", "");

    setValue(
      "responses.reducing_occurrence_of_interfering_behaviours.checked",
      Boolean(selfManagement.reducing_occurence_of_interfering_behavior)
    );
    setValue(
      "responses.reducing_occurrence_of_interfering_behaviours.during",
      ""
    );

    setValue(
      "responses.cooperate_with_peers_in_group_activity.checked",
      Boolean(selfManagement.cooperate_with_peers_in_group_activity)
    );
    setValue("responses.cooperate_with_peers_in_group_activity.during", "");

    setValue("responses.other.checked", Boolean(selfManagement.other));

    if (selfManagement.other) {
      setValue("other_description", selfManagement.other || "");
    }
  }, [tiForm, setValue]);

  const handleCheckboxChange = (value: string, checked: CheckedState) => {
    setValue(`responses.${value}.checked` as any, checked === true);
  };

  const onSubmit = async (data: SelfManagementFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        responding_to_others: data.responses.responding_to_others?.checked,
        sharing: data.responses.sharing?.checked,
        increasing_on_task_behavior:
          data.responses.increasing_on_task_behaviors?.checked,
        initiating_interactions:
          data.responses.initiating_interactions?.checked,
        conversing_with_others: data.responses.conversing_with_others?.checked,
        increasing_play_skills: data.responses.increasing_play_skills?.checked,
        promoting_daily_living_skills:
          data.responses.promoting_daily_living_skills?.checked,
        taking_turns: data.responses.taking_turns?.checked,
        following_the_rules: data.responses.following_the_rules?.checked,
        reducing_occurence_of_interfering_behavior:
          data.responses.reducing_occurrence_of_interfering_behaviours?.checked,
        cooperate_with_peers_in_group_activity:
          data.responses.cooperate_with_peers_in_group_activity?.checked,
        other: data.responses.other?.checked,
        other_description: data.responses.other?.checked
          ? data.other_description
          : null,

        // During fields
        responding_to_others_during: validateField(
          data.responses.responding_to_others?.during
        ),
        sharing_during: validateField(data.responses.sharing?.during),
        increasing_on_task_behaviors_during: validateField(
          data.responses.increasing_on_task_behaviors?.during
        ),
        initiating_interactions_during: validateField(
          data.responses.initiating_interactions?.during
        ),
        conversing_with_others_during: validateField(
          data.responses.conversing_with_others?.during
        ),
        increasing_play_skills_during: validateField(
          data.responses.increasing_play_skills?.during
        ),
        promoting_daily_living_skills_during: validateField(
          data.responses.promoting_daily_living_skills?.during
        ),
        taking_turns_during: validateField(data.responses.taking_turns?.during),
        following_the_rules_during: validateField(
          data.responses.following_the_rules?.during
        ),
        reducing_occurrence_of_interfering_behaviours_during: validateField(
          data.responses.reducing_occurrence_of_interfering_behaviours?.during
        ),
        cooperate_with_peers_in_group_activity_during: validateField(
          data.responses.cooperate_with_peers_in_group_activity?.during
        ),
      };

      const response = await submitRespiteSelfManagement(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.selfManagement?.id
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
      console.error("ERROR SUBMITTING SELF MANAGEMENT", err);
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
        responding_to_others: data.responses.responding_to_others?.checked,
        sharing: data.responses.sharing?.checked,
        increasing_on_task_behavior:
          data.responses.increasing_on_task_behaviors?.checked,
        initiating_interactions:
          data.responses.initiating_interactions?.checked,
        conversing_with_others: data.responses.conversing_with_others?.checked,
        increasing_play_skills: data.responses.increasing_play_skills?.checked,
        promoting_daily_living_skills:
          data.responses.promoting_daily_living_skills?.checked,
        taking_turns: data.responses.taking_turns?.checked,
        following_the_rules: data.responses.following_the_rules?.checked,
        reducing_occurence_of_interfering_behavior:
          data.responses.reducing_occurrence_of_interfering_behaviours?.checked,
        cooperate_with_peers_in_group_activity:
          data.responses.cooperate_with_peers_in_group_activity?.checked,
        other: data.responses.other?.checked,
        other_description: data.responses.other?.checked
          ? data.other_description
          : null,

        // During fields
        responding_to_others_during: validateField(
          data.responses.responding_to_others?.during
        ),
        sharing_during: validateField(data.responses.sharing?.during),
        increasing_on_task_behaviors_during: validateField(
          data.responses.increasing_on_task_behaviors?.during
        ),
        initiating_interactions_during: validateField(
          data.responses.initiating_interactions?.during
        ),
        conversing_with_others_during: validateField(
          data.responses.conversing_with_others?.during
        ),
        increasing_play_skills_during: validateField(
          data.responses.increasing_play_skills?.during
        ),
        promoting_daily_living_skills_during: validateField(
          data.responses.promoting_daily_living_skills?.during
        ),
        taking_turns_during: validateField(data.responses.taking_turns?.during),
        following_the_rules_during: validateField(
          data.responses.following_the_rules?.during
        ),
        reducing_occurrence_of_interfering_behaviours_during: validateField(
          data.responses.reducing_occurrence_of_interfering_behaviours?.during
        ),
        cooperate_with_peers_in_group_activity_during: validateField(
          data.responses.cooperate_with_peers_in_group_activity?.during
        ),
      };

      const response = await submitRespiteSelfManagement(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.selfManagement?.id
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

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Self-Management</h3>

      <div className="flex flex-col gap-3">
        <p className="text-[18px] font-[400] text-[#0F172A]">
          Please answer the following question on self-management skills
        </p>

        <p className="text-[18px] font-[600] text-[#0F172A]">
          I observed {username} perform the following self-management skill(s)
          without any help from me:
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
          {responseLabels.map(({ label, value }) => (
            <div key={value} className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Controller
                  name={`responses.${value}.checked` as any}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={value}
                      checked={field.value as CheckedState}
                      onCheckedChange={(checked: CheckedState) =>
                        handleCheckboxChange(value, checked)
                      }
                      disabled={isFormDisabled}
                      className="mt-1"
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={value}
                >
                  {label}
                </Label>
              </div>
              {watchResponses[value]?.checked && value !== "other" && (
                <Controller
                  name={`responses.${value}.during` as const}
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      labelText=""
                      placeholder="Enter activity"
                      type="text"
                      isAuth={false}
                      disabled={isFormDisabled}
                      className="ml-7"
                    />
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {watchResponses.other.checked && (
          <Controller
            name="other_description"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={field.value === null ? "" : field.value}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
                disabled={isFormDisabled}
              />
            )}
          />
        )}

        {errors?.responses && (
          <p className="text-red-700">
            {String(
              errors.responses?.message || errors.responses?.root?.message
            )}
          </p>
        )}

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
              data-testid="save-draft-button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => handleChangeIndex(currentIndex + 1)}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              data-testid="next-section-button"
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

export default TIVisitSelfManagement;
