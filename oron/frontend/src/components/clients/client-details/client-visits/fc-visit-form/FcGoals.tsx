"use client";

import React, { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  FieldError,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/button/Button";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { FcGoalsTable } from "./FcGoalsTable";
import { submitFcVisitGoalsForm } from "@/actions/clients/fc-visit/goals";
import { toast } from "@/components/ui/use-toast";
import { FullFcVisitForm } from "@/types/Visit";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientTreatmentPlanGoals } from "@/use-cases/clients";
import Loader from "@/components/Loader";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: (step: number) => void;
  formId: string;
  visitForms: FullFcVisitForm | undefined;
  clientId: string;
}

// Improved schema with more descriptive names
const goalSchema = z.object({
  visit_goal_id: z.string().optional(),
  goalDescription: z.string().min(1, "Goal description is required"),
  targetSkill: z.string().min(1, "Target skill is required"),
  shortTermObjective: z.string().min(1, "Short-term objective is required"),
  familyMembersInvolved: z
    .array(z.string())
    .min(1, "At least one family member must be selected"),
  goalImplementationDetails: z.object({
    currentTeachingMethods: z.array(
      z.object({
        id: z.string(),
        method: z.string(),
        discussedAtSession: z.string().optional(),
      })
    ),
    parentChallenges: z
      .string()
      .min(1, "Parent challenges description is required"),
    trainingProvided: z.string().min(1, "Training details are required"),
    additionalComments: z.string().optional(),
  }),
});

const formSchema = z.object({
  goals: z.array(goalSchema).min(1, "At least one goal is required"),
});

export type FcGoalsFormSchema = z.infer<typeof formSchema>;

const FcGoals: React.FC<Props> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  handleChangeStep,
  formId,
  visitForms,
  clientId,
}) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const token = localStorage.getItem("token") as string;
  const { data: treatmentPlanGoals, isLoading: isLoadingTreatmentPlanGoals } =
    useQuery({
      queryKey: ["fcTreatmentPlanGoals", clientId],
      queryFn: async () =>
        retrieveClientTreatmentPlanGoals(token, clientId, "fc"),
    });
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = false;

  const peoplePresentOptions = [
    { label: "Mom", value: "mom" },
    { label: "Dad", value: "dad" },
    { label: "Brother", value: "brother" },
    { label: "Sister", value: "sister" },
    { label: "Grandma", value: "grandma" },
    { label: "Grandpa", value: "grandpa" },
    { label: "Guardian", value: "guardian" },
    { label: "Foster Mom", value: "foster_mom" },
    { label: "Step Mom", value: "step_mom" },
    { label: "Step Dad", value: "step_dad" },
  ] as const;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
    getValues,
  } = useForm<FcGoalsFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "goals",
  });

  useEffect(() => {
    if (!visitForms) return;

    const { data } = visitForms;
    const { visitGoals } = data;

    if (visitGoals && Array.isArray(visitGoals) && visitGoals?.length > 0) {
      setMethod("PATCH");
    }

    if (
      treatmentPlanGoals?.data &&
      Array.isArray(treatmentPlanGoals?.data) &&
      treatmentPlanGoals?.data?.length > 0
    ) {
      const mappedGoals = treatmentPlanGoals?.data.map((goal, index) => {
        const targetSkill = goal?.target_skill ?? "";
        const shortTermObjective = goal?.short_term_objective ?? "";
        const currentSkillLevel = goal?.current_skill_level ?? "";
        const targetSkillLevel = goal?.target_performance_level ?? "";
        const frequency = goal?.goal_frequency ?? "";
        const numberOfTrials = goal?.number_of_trials ?? "";

        return {
          visit_goal_id: visitGoals[index]?.id,
          goalDescription: `${username} will ${shortTermObjective} (from ${currentSkillLevel}) to ${targetSkillLevel} in ${frequency} trials for a ${numberOfTrials} period`,
          targetSkill: targetSkill,
          shortTermObjective: shortTermObjective ?? "-",
          familyMembersInvolved:
            visitGoals[index]?.family_members_goal_discussed_with ?? [],
          goalImplementationDetails: {
            currentTeachingMethods: (goal?.objective_term_steps || []).map(
              (item) => ({
                id: `${index + 1}`,
                method: item.task_analysis,
                discussedAtSession:
                  (
                    visitGoals[index]?.current_teaching_methods_or_strategies ||
                    []
                  ).find(
                    (method) =>
                      method.current_teaching_methods === item.task_analysis
                  )?.discussed_at_fc_session ?? undefined,
              })
            ),
            parentChallenges:
              visitGoals[index]
                ?.parent_or_family_members_challenges_when_implementing_strategies ??
              "",
            trainingProvided:
              visitGoals[index]
                ?.training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies ??
              "",
            additionalComments: visitGoals[index]?.additional_comments ?? "",
          },
        };
      });

      setValue("goals", mappedGoals);
      clearErrors("goals");
    }
  }, [visitForms, setValue, clearErrors, treatmentPlanGoals, username]);

  useEffect(() => {
    if (
      errors?.goals &&
      Array.isArray(errors?.goals) &&
      errors?.goals?.length > 0
    ) {
      toast({
        variant: "destructive",
        description: "At least one field must be filled.",
      });
    }
  }, [errors]);

  const onSubmit = async (data: FcGoalsFormSchema) => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await submitFcVisitGoalsForm(
        token,
        data,
        formId,
        method
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeStep(3);
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT GOALS", err);
    }
  };

  const handleDraftSubmit = async () => {
    const data = getValues();
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;
      const response = await submitFcVisitGoalsForm(
        token,
        data,
        formId,
        method
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT GOALS", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const addCheckboxValue = (fieldValue: string[], value: string): string[] => {
    return [...fieldValue, value];
  };

  const removeCheckboxValue = (
    fieldValue: string[],
    value: string
  ): string[] => {
    return fieldValue.filter((v: string) => v !== value);
  };

  if (isLoadingTreatmentPlanGoals) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <form
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      {fields.map((field, goalIndex) => (
        <div
          key={field.id}
          className="flex flex-col gap-7 h-fit w-full border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
        >
          <div className="flex flex-col gap-2">
            <h3
              data-testid={`goal-${goalIndex + 1}-header`}
              className="text-[#0F172A] text-[24px] font-[600]"
            >
              Goal {goalIndex + 1}
            </h3>
            <p className="text-[16px] font-[400] text-[#334155]">
              {field.goalDescription}
            </p>
          </div>

          <h4 className="text-[#09090B] text-[18px] font-[600]">
            Target Skill:{" "}
            <span className="font-[400]">{field.targetSkill}</span>
          </h4>
          <h4 className="text-[#09090B] text-[18px] font-[600]">
            Short Term Objective:{" "}
            <span className="font-[400]">{field.shortTermObjective}</span>
          </h4>

          <div className="flex flex-col gap-4">
            <p className="text-[16px] font-[600] text-[#09090B]">
              Family member(s) goal was discussed with
            </p>

            <Controller
              name={`goals.${goalIndex}.familyMembersInvolved`}
              control={control}
              render={({ field: familyField }) => (
                <div className="min-w-full grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
                  {peoplePresentOptions.map(({ label, value }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${value}-${goalIndex}`}
                        checked={familyField.value.includes(value)}
                        onCheckedChange={(checked: boolean) => {
                          const updatedValue = checked
                            ? addCheckboxValue(familyField.value, value)
                            : removeCheckboxValue(familyField.value, value);
                          familyField.onChange(updatedValue);
                        }}
                        disabled={isFormDisabled}
                        data-testid={`family-member-${value}`}
                      />
                      <Label
                        className="text-[14px] font-[400] text-[#09090B]"
                        htmlFor={`${value}-${goalIndex}`}
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />

            {errors.goals?.[goalIndex]?.familyMembersInvolved && (
              <span className="text-red-500 text-sm">
                {errors.goals[goalIndex]?.familyMembersInvolved?.message}
              </span>
            )}

            <Controller
              name={`goals.${goalIndex}.goalImplementationDetails.currentTeachingMethods`}
              control={control}
              render={({ field: teachingMethodsField }) => (
                <FcGoalsTable
                  index={goalIndex}
                  data={teachingMethodsField.value.map((item) => ({
                    ...item,
                    discussedAtSession: item.discussedAtSession ?? undefined,
                  }))}
                  onDataUpdate={(updatedData) => {
                    setValue(
                      `goals.${goalIndex}.goalImplementationDetails.currentTeachingMethods`,
                      updatedData
                    );
                  }}
                  errors={
                    (errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.currentTeachingMethods as {
                      id?: FieldError;
                      method?: FieldError;
                      discussedAtSession?: FieldError;
                    }[]) ?? undefined
                  }
                  clearErrors={clearErrors}
                />
              )}
            />

            <div className="flex flex-col gap-2">
              <h3 className="text-[#0F172A] text-[20px] font-[600]">
                Summary Of Methods/Strategies Implemented By {username}&apos;s
                Family Member(s)
              </h3>
              <p className="text-[16px] font-[400] text-[#334155]">
                Reports that the strategy/strategies implemented to support{" "}
                {username}&apos;s family members
              </p>
            </div>

            <Controller
              name={`goals.${goalIndex}.goalImplementationDetails.parentChallenges`}
              control={control}
              render={({ field: parentChallengesField }) => (
                <FormTextArea
                  {...parentChallengesField}
                  labelText={`Parent/Family Member's Challenges/Difficulties when Implementing Strategies`}
                  placeholder="Enter here.."
                  errorMessage={
                    errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.parentChallenges?.message ?? ""
                  }
                  isError={
                    !!errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.parentChallenges
                  }
                  disabled={isFormDisabled}
                  data-testid="parent-challenges"
                />
              )}
            />

            <Controller
              name={`goals.${goalIndex}.goalImplementationDetails.trainingProvided`}
              control={control}
              render={({ field: trainingField }) => (
                <FormTextArea
                  {...trainingField}
                  labelText={`Training/Instructions provided to Parents/Family Member on how to implement strategies`}
                  placeholder="Enter here.."
                  errorMessage={
                    errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.trainingProvided?.message ?? ""
                  }
                  isError={
                    !!errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.trainingProvided
                  }
                  disabled={isFormDisabled}
                  data-testid="training-provided"
                />
              )}
            />

            <Controller
              name={`goals.${goalIndex}.goalImplementationDetails.additionalComments`}
              control={control}
              render={({ field: commentsField }) => (
                <FormTextArea
                  {...commentsField}
                  labelText={`Any additional comments (Optional)`}
                  placeholder="Enter here.."
                  errorMessage={
                    errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.additionalComments?.message ?? ""
                  }
                  isError={
                    !!errors.goals?.[goalIndex]?.goalImplementationDetails
                      ?.additionalComments
                  }
                  disabled={isFormDisabled}
                  data-testid="additional-comment"
                />
              )}
            />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
        <Button
          variant="light"
          onClick={() => handleChangeStep(1)}
          type="button"
          data-testid="previous-section-button"
        >
          <DoubleArrowLeftIcon className="w-5 h-5" />
          Previous Section
        </Button>

        {!isFormDisabled && (
          <Button
            onClick={handleDraftSubmit}
            variant="light"
            type="button"
            disabled={isSubmittingDraft}
            isLoading={isSubmittingDraft}
            data-testid="save-draft-button"
          >
            Save Draft
          </Button>
        )}

        {isFormDisabled ? (
          <Button
            onClick={() => {
              handleChangeStep(3);
            }}
            data-testid="next-section-button"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            data-testid="next-section-button"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default FcGoals;
