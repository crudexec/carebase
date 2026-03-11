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
import { submitAlpSelfDirections } from "@/actions/clients/alp-form/intakeAssessment";

const selfDirectionsSchema = z.object({
  planningSkills: z.object({
    notApplicable: z.boolean(),
    organizeTime: z.boolean(),
    organizeResources: z.boolean(),
    organizeEffort: z.boolean(),
    planJobs: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  selfDirectionSkills: z.object({
    notApplicable: z.boolean(),
    figureStrengths: z.boolean(),
    selectField: z.boolean(),
    generateIdeas: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  selfMotivationSkills: z.object({
    notApplicable: z.boolean(),
    energizeMotivate: z.boolean(),
    learnFaster: z.boolean(),
    keepDeveloping: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  determiningImportant: z.object({
    notApplicable: z.boolean(),
    findDeeper: z.boolean(),
    masterSkills: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  settingGoals: z.object({
    notApplicable: z.boolean(),
    setSelfGoals: z.boolean(),
    setPerformanceGoals: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  takingAuthority: z.object({
    notApplicable: z.boolean(),
    findVoice: z.boolean(),
    copeWithProblems: z.boolean(),
    takeCharge: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  takingRisks: z.object({
    notApplicable: z.boolean(),
    identifyGoals: z.boolean(),
    assessRisks: z.boolean(),
    startSmall: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  takingResponsibility: z.object({
    notApplicable: z.boolean(),
    takeOwnership: z.boolean(),
    meetDeadlines: z.boolean(),
    beingDependable: z.boolean(),
    maintainOrganization: z.boolean(),
    beingProactive: z.boolean(),
    acceptFeedback: z.boolean(),
    other: z.boolean(),
    otherSpecify: z.string().optional(),
  }),
  potentialBarriers: z.string(),
  relatedInformation: z.string(),
  otherComments: z.string(),
});

type SelfDirectionsFormData = z.infer<typeof selfDirectionsSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

type OptionType<T extends keyof SelfDirectionsFormData> = {
  id: keyof SelfDirectionsFormData[T];
  label: string;
};

const PLANNING_OPTIONS: OptionType<"planningSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "organizeTime", label: "To organize time effectively" },
  { id: "organizeResources", label: "To organize resources effectively" },
  {
    id: "organizeEffort",
    label: "To organize effort and contacts effectively",
  },
  {
    id: "planJobs",
    label: "To know how to lay out plans for getting his/her jobs done",
  },
  { id: "other", label: "Other" },
];

const SELF_DIRECTION_OPTIONS: OptionType<"selfDirectionSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "figureStrengths",
    label:
      "To figure out what one's strengths are and how to use them effectively",
  },
  {
    id: "selectField",
    label: "To select a field of interest and become informed about it",
  },
  { id: "generateIdeas", label: "To generate new ideas" },
  { id: "other", label: "Other" },
];

const SELF_MOTIVATION_OPTIONS: OptionType<"selfMotivationSkills">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "energizeMotivate",
    label: "To energize and motivate self to become highly productive",
  },
  { id: "learnFaster", label: "To learn anything faster and more effectively" },
  {
    id: "keepDeveloping",
    label: "To keep developing everyday by living a productive lifestyle",
  },
  { id: "other", label: "Other" },
];

const DETERMINING_IMPORTANT_OPTIONS: OptionType<"determiningImportant">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "findDeeper",
    label:
      "To find a deeper, richer feeling of enjoyment and fulfilment in one's life",
  },
  {
    id: "masterSkills",
    label: "To learn how to master skills one wants or needs to develop etc.",
  },
  { id: "other", label: "Other" },
];

const SETTING_GOALS_OPTIONS: OptionType<"settingGoals">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "setSelfGoals", label: "To set goals for one's self" },
  {
    id: "setPerformanceGoals",
    label: "To set goals for one's present performance, etc",
  },
  { id: "other", label: "Other" },
];

const TAKING_AUTHORITY_OPTIONS: OptionType<"takingAuthority">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  {
    id: "findVoice",
    label:
      "To find one's voice among all of the other voices telling one what to do",
  },
  {
    id: "copeWithProblems",
    label:
      "Know how to cope with problems one runs into while trying to get my work done",
  },
  { id: "takeCharge", label: "Take charge of one's self and life etc" },
  { id: "other", label: "Other" },
];

const TAKING_RISKS_OPTIONS: OptionType<"takingRisks">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "identifyGoals", label: "To identify his/her goals" },
  { id: "assessRisks", label: "To assess risks" },
  { id: "startSmall", label: "To start small" },
  { id: "other", label: "Other" },
];

const TAKING_RESPONSIBILITY_OPTIONS: OptionType<"takingResponsibility">[] = [
  { id: "notApplicable", label: "Not Applicable" },
  { id: "takeOwnership", label: "To take ownership of tasks and projects" },
  { id: "meetDeadlines", label: "To meet deadlines consistently" },
  { id: "beingDependable", label: "Being dependable" },
  {
    id: "maintainOrganization",
    label: "To maintain a high level of organization",
  },
  { id: "beingProactive", label: "Being proactive and taking initiative" },
  {
    id: "acceptFeedback",
    label: "To accept constructive feedback and learn from mistakes",
  },
  { id: "other", label: "Other" },
];

const AlpIntakeAssessmentSelfDirections = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  isViewing,
  isEditing,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");

  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SelfDirectionsFormData>({
    resolver: zodResolver(selfDirectionsSchema),
    defaultValues: {
      planningSkills: {
        notApplicable: false,
        organizeTime: false,
        organizeResources: false,
        organizeEffort: false,
        planJobs: false,
        other: false,
        otherSpecify: "",
      },
      selfDirectionSkills: {
        notApplicable: false,
        figureStrengths: false,
        selectField: false,
        generateIdeas: false,
        other: false,
        otherSpecify: "",
      },
      selfMotivationSkills: {
        notApplicable: false,
        energizeMotivate: false,
        learnFaster: false,
        keepDeveloping: false,
        other: false,
        otherSpecify: "",
      },
      determiningImportant: {
        notApplicable: false,
        findDeeper: false,
        masterSkills: false,
        other: false,
        otherSpecify: "",
      },
      settingGoals: {
        notApplicable: false,
        setSelfGoals: false,
        setPerformanceGoals: false,
        other: false,
        otherSpecify: "",
      },
      takingAuthority: {
        notApplicable: false,
        findVoice: false,
        copeWithProblems: false,
        takeCharge: false,
        other: false,
        otherSpecify: "",
      },
      takingRisks: {
        notApplicable: false,
        identifyGoals: false,
        assessRisks: false,
        startSmall: false,
        other: false,
        otherSpecify: "",
      },
      takingResponsibility: {
        notApplicable: false,
        takeOwnership: false,
        meetDeadlines: false,
        beingDependable: false,
        maintainOrganization: false,
        beingProactive: false,
        acceptFeedback: false,
        other: false,
        otherSpecify: "",
      },
      potentialBarriers: "",
      relatedInformation: "",
      otherComments: "",
    },
  });

  const watchPlanningOther = watch("planningSkills.other");
  const watchSelfDirectionOther = watch("selfDirectionSkills.other");
  const watchSelfMotivationOther = watch("selfMotivationSkills.other");
  const watchDeterminingOther = watch("determiningImportant.other");
  const watchSettingGoalsOther = watch("settingGoals.other");
  const watchTakingAuthorityOther = watch("takingAuthority.other");
  const watchTakingRisksOther = watch("takingRisks.other");
  const watchTakingResponsibilityOther = watch("takingResponsibility.other");

  const onSubmit = async (data: SelfDirectionsFormData) => {
    try {
      // TODO: Implement submission logic

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpSelfDirections(
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
      console.error("ERROR SUBMITTING SELF DIRECTIONS", err);
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

      const { status, errorMessage } = await submitAlpSelfDirections(
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Self Directions</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 min-w-[768px]">
              {/* Headers */}
              <div className="grid grid-cols-3 p-4 border-b">
                <div>
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Self Directions
                  </h4>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[#0F172A] text-[16px] font-[500]">
                    Areas of support
                  </h4>
                </div>
              </div>

              <div className="divide-y">
                {/* Planning & Organizing Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Planning & Organizing Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {PLANNING_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`planningSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`planning${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`planning${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchPlanningOther && (
                        <Controller
                          name="planningSkills.otherSpecify"
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

                {/* Self-Direction Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Self-Direction Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SELF_DIRECTION_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`selfDirectionSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`selfDirection${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`selfDirection${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSelfDirectionOther && (
                        <Controller
                          name="selfDirectionSkills.otherSpecify"
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

                {/* Self-Motivation Skills */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Self-Motivation Skills
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SELF_MOTIVATION_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`selfMotivationSkills.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`selfMotivation${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`selfMotivation${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSelfMotivationOther && (
                        <Controller
                          name="selfMotivationSkills.otherSpecify"
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

                {/* Determining What Is Important */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Determining What Is Important
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {DETERMINING_IMPORTANT_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`determiningImportant.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`determining${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`determining${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchDeterminingOther && (
                        <Controller
                          name="determiningImportant.otherSpecify"
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

                {/* Setting & Achieving Goals */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Setting & Achieving Goals
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {SETTING_GOALS_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`settingGoals.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`settingGoals${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`settingGoals${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchSettingGoalsOther && (
                        <Controller
                          name="settingGoals.otherSpecify"
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

                {/* Taking Authority */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Taking Authority
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {TAKING_AUTHORITY_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`takingAuthority.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`takingAuthority${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`takingAuthority${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchTakingAuthorityOther && (
                        <Controller
                          name="takingAuthority.otherSpecify"
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

                {/* Taking Risks */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Taking Risks
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {TAKING_RISKS_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`takingRisks.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`takingRisks${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label htmlFor={`takingRisks${option.id}`}>
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchTakingRisksOther && (
                        <Controller
                          name="takingRisks.otherSpecify"
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

                {/* Taking Responsibility */}
                <div className="grid grid-cols-3">
                  <div className="p-4">
                    <h4 className="text-[#0F172A] text-[16px] font-[500]">
                      Taking Responsibility
                    </h4>
                  </div>
                  <div className="col-span-2 p-4">
                    <div className="space-y-4">
                      {TAKING_RESPONSIBILITY_OPTIONS.map((option) => (
                        <Controller
                          key={option.id}
                          name={`takingResponsibility.${option.id}` as const}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`takingResponsibility${option.id}`}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                                disabled={isFormDisabled}
                              />
                              <Label
                                htmlFor={`takingResponsibility${option.id}`}
                              >
                                {option.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                      {watchTakingResponsibilityOther && (
                        <Controller
                          name="takingResponsibility.otherSpecify"
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

                {/* Text Areas */}
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

export default AlpIntakeAssessmentSelfDirections;
