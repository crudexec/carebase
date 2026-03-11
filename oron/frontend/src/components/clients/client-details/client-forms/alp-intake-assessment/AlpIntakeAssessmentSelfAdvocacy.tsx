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
import FormInput from "@/components/input-fields/FormInput";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { submitAlpSelfAdvocacy } from "@/actions/clients/alp-form/intakeAssessment";

type OptionType<T extends keyof SelfAdvocacyFormData> = {
  id: keyof SelfAdvocacyFormData[T];
  label: string;
};

const CHOICE_MAKING_OPTIONS: OptionType<"choiceMakingSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "choiceAndOrder", label: "Choice and order of an activity" },
  { id: "choosingLocation", label: "Choosing a location to complete a task" },
  { id: "choosingWhoToWork", label: "Choosing who to work/live with" },
  { id: "choosingReinforces", label: "Choosing preferred reinforcers" },
  { id: "other", label: "Other" },
];

const DECISION_MAKING_OPTIONS: OptionType<"decisionMakingSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "choosingOptions",
    label: "Choosing among more than two known options",
  },
  { id: "problemSolving", label: "Using problem-solving skills" },
  { id: "other", label: "Other" },
];

const PROBLEM_SOLVING_OPTIONS: OptionType<"problemSolvingSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "identifyProblems", label: "To identify problems" },
  { id: "developSolutions", label: "To develop possible solutions" },
  { id: "identifyImpact", label: "To identify impact of each solution" },
  { id: "decideBestSolution", label: "To decide the best solution" },
  { id: "other", label: "Other" },
];

const GOAL_SETTING_OPTIONS: OptionType<"goalSettingSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "setGoals", label: "To set goals" },
  { id: "developActionPlans", label: "To develop action plans" },
  { id: "adjustActionPlans", label: "To adjust action plans" },
  { id: "other", label: "Other" },
];

const SELF_REGULATION_OPTIONS: OptionType<"selfRegulationSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "selfInstruction", label: "Self-instruction capabilities" },
  { id: "selfMonitoring", label: "Self-monitoring capabilities" },
  { id: "selfEvaluation", label: "Self evaluation capabilities" },
  { id: "selfReinforcement", label: "Self-reinforcement capabilities" },
  { id: "other", label: "Other" },
];

const SELF_ADVOCACY_OPTIONS: OptionType<"selfAdvocacySkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "executeRequiredBehavior",
    label:
      "To successfully execute the behavior required to produce a given outcome",
  },
  {
    id: "produceAnticipatedOutcome",
    label: "To produce an anticipated outcome when a behavior is performed",
  },
  { id: "other", label: "Other" },
];

const SELF_AWARENESS_OPTIONS: OptionType<"selfAwarenessSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "understandStrengths", label: "To understand strengths" },
  { id: "understandAbilities", label: "To understand abilities" },
  { id: "understandLimitations", label: "To understand limitations" },
  {
    id: "understandLearningNeeds",
    label: "To understand learning and support needs",
  },
  { id: "other", label: "Other" },
];

const selfAdvocacySchema = z
  .object({
    choiceMakingSkills: z.object({
      notApplicable: z.boolean(),
      choiceAndOrder: z.boolean(),
      choosingLocation: z.boolean(),
      choosingWhoToWork: z.boolean(),
      choosingReinforces: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    decisionMakingSkills: z.object({
      notApplicable: z.boolean(),
      choosingOptions: z.boolean(),
      problemSolving: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    problemSolvingSkills: z.object({
      notApplicable: z.boolean(),
      identifyProblems: z.boolean(),
      developSolutions: z.boolean(),
      identifyImpact: z.boolean(),
      decideBestSolution: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    goalSettingSkills: z.object({
      notApplicable: z.boolean(),
      setGoals: z.boolean(),
      developActionPlans: z.boolean(),
      adjustActionPlans: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    selfRegulationSkills: z.object({
      notApplicable: z.boolean(),
      selfInstruction: z.boolean(),
      selfMonitoring: z.boolean(),
      selfEvaluation: z.boolean(),
      selfReinforcement: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    selfAdvocacySkills: z.object({
      notApplicable: z.boolean(),
      executeRequiredBehavior: z.boolean(),
      produceAnticipatedOutcome: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    selfAwarenessSkills: z.object({
      notApplicable: z.boolean(),
      understandStrengths: z.boolean(),
      understandAbilities: z.boolean(),
      understandLimitations: z.boolean(),
      understandLearningNeeds: z.boolean(),
      other: z.boolean(),
      otherSpecify: z.string().optional(),
    }),
    potentialBarriers: z.string(),
    relatedInformation: z.string(),
    otherComments: z.string(),
  })
  .refine(
    (data) => {
      // For each section, if notApplicable is false, at least one other option must be selected
      const validateSection = (section: Record<string, boolean | string>) => {
        if (section.notApplicable) return true;
        return Object.entries(section).some(
          ([key, value]) =>
            key !== "notApplicable" && key !== "otherSpecify" && value === true
        );
      };

      return (
        validateSection(data.choiceMakingSkills) &&
        validateSection(data.decisionMakingSkills) &&
        validateSection(data.problemSolvingSkills) &&
        validateSection(data.goalSettingSkills) &&
        validateSection(data.selfRegulationSkills) &&
        validateSection(data.selfAdvocacySkills) &&
        validateSection(data.selfAwarenessSkills)
      );
    },
    {
      message: "Please select at least one option or mark as Not Applicable",
    }
  );

type SelfAdvocacyFormData = z.infer<typeof selfAdvocacySchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

const AlpIntakeAssessmentSelfAdvocacy = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  isViewing,
  isEditing,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const isFormDisabled = isViewing;
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SelfAdvocacyFormData>({
    resolver: zodResolver(selfAdvocacySchema),
    defaultValues: {
      choiceMakingSkills: {
        notApplicable: false,
        choiceAndOrder: false,
        choosingLocation: false,
        choosingWhoToWork: false,
        choosingReinforces: false,
        other: false,
        otherSpecify: "",
      },
      decisionMakingSkills: {
        notApplicable: false,
        choosingOptions: false,
        problemSolving: false,
        other: false,
        otherSpecify: "",
      },
      problemSolvingSkills: {
        notApplicable: false,
        identifyProblems: false,
        developSolutions: false,
        identifyImpact: false,
        decideBestSolution: false,
        other: false,
        otherSpecify: "",
      },
      goalSettingSkills: {
        notApplicable: false,
        setGoals: false,
        developActionPlans: false,
        adjustActionPlans: false,
        other: false,
        otherSpecify: "",
      },
      selfRegulationSkills: {
        notApplicable: false,
        selfInstruction: false,
        selfMonitoring: false,
        selfEvaluation: false,
        selfReinforcement: false,
        other: false,
        otherSpecify: "",
      },
      selfAdvocacySkills: {
        notApplicable: false,
        executeRequiredBehavior: false,
        produceAnticipatedOutcome: false,
        other: false,
        otherSpecify: "",
      },
      selfAwarenessSkills: {
        notApplicable: false,
        understandStrengths: false,
        understandAbilities: false,
        understandLimitations: false,
        understandLearningNeeds: false,
        other: false,
        otherSpecify: "",
      },
      potentialBarriers: "",
      relatedInformation: "",
      otherComments: "",
    },
  });

  const watchChoiceMakingOther = watch("choiceMakingSkills.other");
  const watchDecisionMakingOther = watch("decisionMakingSkills.other");
  const watchProblemSolvingOther = watch("problemSolvingSkills.other");
  const watchGoalSettingOther = watch("goalSettingSkills.other");
  const watchSelfRegulationOther = watch("selfRegulationSkills.other");
  const watchSelfAdvocacyOther = watch("selfAdvocacySkills.other");
  const watchSelfAwarenessOther = watch("selfAwarenessSkills.other");

  const onSubmit = async (data: SelfAdvocacyFormData) => {
    try {
      // TODO: Implement submission logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpSelfAdvocacy(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING SELF ADVOCACY", err);
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
      // TODO: Implement draft saving logic

      const token = localStorage.getItem("token") as string;
      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpSelfAdvocacy(
        token,
        requestBody,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Self Advocacy / Self-Determination
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 min-w-[768px]">
              {/* Headers */}
              <div className="grid grid-cols-3 p-4 border-b">
                <div>
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Self Advocacy
                  </h4>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Areas of support
                  </h4>
                </div>
              </div>

              <div className="divide-y">
                {/* Choice Making Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Choice Making Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {CHOICE_MAKING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`choiceMakingSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`choiceMaking${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`choiceMaking${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchChoiceMakingOther && (
                        <Controller
                          name="choiceMakingSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Decision Making Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Decision Making Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {DECISION_MAKING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`decisionMakingSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`decisionMaking${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`decisionMaking${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchDecisionMakingOther && (
                        <Controller
                          name="decisionMakingSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Problem-Solving Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Problem-Solving Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {PROBLEM_SOLVING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`problemSolvingSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`problemSolving${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`problemSolving${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchProblemSolvingOther && (
                        <Controller
                          name="problemSolvingSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Goal Setting & Attainment Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Goal Setting & Attainment Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {GOAL_SETTING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`goalSettingSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`goalSetting${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`goalSetting${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchGoalSettingOther && (
                        <Controller
                          name="goalSettingSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Self-Regulation Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Self-Regulation Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SELF_REGULATION_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`selfRegulationSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`selfRegulation${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`selfRegulation${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSelfRegulationOther && (
                        <Controller
                          name="selfRegulationSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Self-Advocacy Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Self-Advocacy Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SELF_ADVOCACY_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`selfAdvocacySkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`selfAdvocacy${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`selfAdvocacy${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSelfAdvocacyOther && (
                        <Controller
                          name="selfAdvocacySkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Self-Awareness And Self-Knowledge Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Self-Awareness And Self-Knowledge Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SELF_AWARENESS_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`selfAwarenessSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`selfAwareness${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`selfAwareness${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSelfAwarenessOther && (
                        <Controller
                          name="selfAwarenessSkills.otherSpecify"
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              placeholder="Please specify"
                              type="text"
                              isAuth={false}
                              disabled={isFormDisabled}
                            />
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Text Areas */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Potential Barriers
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="potentialBarriers"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Related information from other AW services
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="relatedInformation"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Other Comments
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <Controller
                      name="otherComments"
                      control={control}
                      render={({ field }) => (
                        <FormTextArea
                          {...field}
                          placeholder="Enter here"
                          disabled={isFormDisabled}
                          className="min-h-[100px] w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
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

export default AlpIntakeAssessmentSelfAdvocacy;
