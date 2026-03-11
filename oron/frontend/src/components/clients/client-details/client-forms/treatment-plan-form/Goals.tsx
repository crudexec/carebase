"use client";

import Button from "@/components/button/Button";
import FormTextArea from "@/components/input-fields/FormTextArea";
import FormSelect from "@/components/input-fields/FormSelect";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { PlusIcon, Trash } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TreatmentPlan } from "@/types/Events";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  addNewTreatmentGoal,
  deleteTreatmentGoal,
  submitGoalForm,
} from "@/actions/clients/treatment-plan/goals";
import { toast } from "@/components/ui/use-toast";
import {
  goalBaselineOptions,
  goalCurrentSkillLevelOptions,
  goalFrequencyOptions,
  goalNumberOfTrialsOptions,
  goalSettingOptions,
  goalStatusOptions,
  goalTargetPerformanceOptions,
  goalConsequencesOption,
} from "./constant";
import {
  getGoalAreas,
  getShortTermObjectives,
  getTargetSkills,
  getTaskAnalysis,
} from "./helpers";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import GoalsTable from "./GoalsTable";
import { validateField } from "@/lib/api-utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import FormMultiSelect from "@/components/input-fields/FormMultiSelect";
import FormBanner from "@/components/banner/FormBanner";
import { MultiSelect } from "@/components/input-fields/MultiSelect";
import { Checkbox } from "@/components/ui/checkbox";

export type Step = {
  id: string;
  taskAnalysis: string;
  baseline: string;
  checked: boolean;
};

export type GoalType = {
  id?: string;
  goal_area: string;
  target_skill: string;
  short_term_objective: string;
  goal_status: string;
  goal_setting: string;
  number_of_trials: string;
  goal_frequency: string;
  current_skill_level: string;
  target_performance_level: string;
  goal_background: string;
  goal_statement: string;
  implementation_procedure: string;
  objective_term_steps: Step[];
  evaluating_progress: string[];
  progress_monitoring: string;
  mastery_towards_goal_achievement: string;
  reinforcers: string[];
  materials: string[];
  expected_outcome: string;
  goal_comment?: string;
  present_level?: string;
  target_level?: string;
  consequences?: string[];
};

const stepSchema = z.object({
  id: z.string().min(1, { message: "Step ID is required" }),
  taskAnalysis: z.string().min(1, { message: "Task Analysis is required" }),
  baseline: z.string(),
  checked: z.boolean(),
});

const defaultGoal: GoalType = {
  goal_area: "",
  target_skill: "",
  short_term_objective: "",
  goal_status: "",
  goal_setting: "",
  number_of_trials: "",
  goal_frequency: "",
  current_skill_level: "",
  target_performance_level: "",
  goal_background: "",
  goal_statement: "",
  implementation_procedure: "",
  objective_term_steps: [],
  evaluating_progress: [],
  progress_monitoring: "",
  mastery_towards_goal_achievement: "",
  reinforcers: [],
  materials: [],
  expected_outcome: "",
  goal_comment: "",
  present_level: "",
  target_level: "",
  consequences: [],
};

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  treatmentPlanData: TreatmentPlan | undefined;
  clientId: string;
  formType: TreatmentPlanType;
  username: string;
  refetchTreatmentPlan: any;
  formId: string;
}

type SelectProps = {
  label: string;
  value: string;
};

const Goals = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  treatmentPlanData,
  clientId,
  formType,
  username,
  refetchTreatmentPlan,
  formId,
}: Props) => {
  const goalSchema = z.object({
    goals: z.array(
      z.object({
        id: z.string().optional(),
        goal_area: z.string().min(1, { message: "Goal area is required" }),
        target_skill: z
          .string()
          .min(1, { message: "Target skill is required" }),
        short_term_objective: z
          .string()
          .min(1, { message: "Short-term objective is required" }),
        goal_status: z.string().min(1, { message: "Goal status is required" }),
        goal_setting: z
          .string()
          .min(1, { message: "Goal setting is required" }),
        number_of_trials: z
          .string()
          .min(1, { message: "Number of trials is required" }),
        goal_frequency: z
          .string()
          .min(1, { message: "Goal frequency is required" }),
        current_skill_level:
          formType === "ti"
            ? z.string().optional()
            : z.string().min(1, { message: "Current skill level is required" }),
        target_performance_level:
          formType === "ti"
            ? z.string().optional()
            : z
                .string()
                .min(1, { message: "Target performance level is required" }),
        goal_background: z
          .string()
          .min(1, { message: "Goal background is required" }),
        goal_statement: z
          .string()
          .min(1, { message: "Goal statement is required" }),
        implementation_procedure: z
          .string()
          .min(1, { message: "Implementation procedure is required" }),
        objective_term_steps: z
          .array(stepSchema)
          .min(1, { message: "At least one step is required" }),
        present_level:
          formType === "ti"
            ? z.string().min(1, { message: "Present Level is required" })
            : z.string().optional(),
        target_level:
          formType === "ti"
            ? z.string().min(1, { message: "Target Level is required" })
            : z.string().optional(),
        evaluating_progress:
          formType === "fc"
            ? z
                .array(z.string())
                .min(1, { message: "Evaluating progress is required" })
            : z.array(z.string()).default([]).optional(),
        progress_monitoring:
          formType === "fc"
            ? z.string().min(1, { message: "Progress monitoring is required" })
            : z.string().optional(),
        mastery_towards_goal_achievement:
          formType === "fc"
            ? z.string().min(1, {
                message: "Mastery towards goal achievement is required",
              })
            : z.string().optional(),
        reinforcers:
          formType === "fc"
            ? z
                .array(z.string())
                .min(1, { message: "At least one reinforcer is required" })
            : z.array(z.string()).default([]).optional(),
        materials:
          formType === "fc"
            ? z
                .array(z.string())
                .min(1, { message: "At least one material is required" })
            : z.array(z.string()).default([]).optional(),

        expected_outcome:
          formType === "fc"
            ? z.string().min(1, { message: "Expected outcome is required" })
            : z.string().optional(),
        goal_comment: z.string().optional(),
        consequences: z.array(z.string()).optional(),
      })
    ),
  });

  const replacePlaceholder = (text: string) =>
    text.replace(/{{CLIENT_NAME}}/g, username);

  const [goalOptions, setGoalOptions] = useState<{ [key: string]: any }>({});

  const goalAreaOptions: SelectProps[] = getGoalAreas(formType).map((item) => {
    return {
      label: replacePlaceholder(item),
      value: item,
    };
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexOfGoalToBeDeleted, setIndexOfGoalToBeDeleted] = useState<
    number | null
  >(null);
  const [idOfGoalToBeDeleted, setIdOfGoalToBeDeleted] = useState<string | null>(
    null
  );
  const [isAddingNewGoal, setIsAddingNewGoal] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    reset,
  } = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goals: [defaultGoal],
    },
    disabled: isFormDisabled,
  });

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    keyName: "uid",
    name: "goals",
  });

  const checkSteps = useMemo(
    () => (currentSteps: any[], step: Step) => {
      if (step.checked) {
        const steps = currentSteps.map((existingStep) =>
          existingStep.taskAnalysis === step.taskAnalysis
            ? { ...existingStep, ...step }
            : existingStep
        );

        if (!currentSteps.find((s) => s.taskAnalysis === step.taskAnalysis)) {
          steps.push(step);
        }
        return steps;
      }
      return currentSteps.filter((s) => s.taskAnalysis !== step.taskAnalysis);
    },
    []
  );

  const updateSteps = useCallback(
    (goalIndex: number, step: Step) => {
      const currentValues = getValues();
      const currentSteps =
        currentValues?.goals?.[goalIndex]?.objective_term_steps || [];
      const updatedSteps = checkSteps(currentSteps, step);

      update(goalIndex, {
        ...currentValues.goals[goalIndex],
        objective_term_steps: updatedSteps,
      });
    },
    [getValues, update, checkSteps]
  );

  // const updateSteps = (goalIndex: number, step: Step) => {
  //   // Use getValues to get the current values of the form
  //   const currentValues = getValues(); // Get all form values

  //   // Get the current steps for the specific goal (do not overwrite other fields)
  //   const currentSteps =
  //     currentValues?.goals?.[goalIndex]?.objective_term_steps || [];

  //   let updatedSteps;

  //   if (step.checked) {
  //     // If the step is checked, update it or add it
  //     updatedSteps = currentSteps.map((existingStep) =>
  //       existingStep.taskAnalysis === step.taskAnalysis
  //         ? { ...existingStep, ...step }
  //         : existingStep
  //     );

  //     // Add new step if it doesn't exist
  //     if (!currentSteps.find((s) => s.taskAnalysis === step.taskAnalysis)) {
  //       updatedSteps.push(step);
  //     }
  //   } else {
  //     // If the step is unchecked, remove it
  //     updatedSteps = currentSteps.filter(
  //       (s) => s.taskAnalysis !== step.taskAnalysis
  //     );
  //   }

  //   // Use the update method to update only the specific part of the goal (objective_term_steps)
  //   update(goalIndex, {
  //     ...currentValues.goals[goalIndex], // Retain other fields in the goal object
  //     objective_term_steps: updatedSteps, // Update only the objective_term_steps
  //   });
  // };

  const getMappedGoals = useMemo(() => {
    if (!treatmentPlanData) return [];

    const treatmentPlanArray = treatmentPlanData.data.treatmentPlans;
    const data = treatmentPlanArray.find((item) => item.id === formId)!;
    const treatmentGoal = data?.treatmentGoal;

    if (
      treatmentGoal &&
      Array.isArray(treatmentGoal) &&
      treatmentGoal?.length > 0
    ) {
      return treatmentGoal
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .map((goal, index) => ({
          id: goal.id,
          goal_area: goal.goal_area ?? "",
          target_skill: goal.target_skill ?? "",
          short_term_objective: goal.short_term_objective ?? "",
          goal_status: goal.goal_status ?? "",
          goal_setting: goal.goal_setting ?? "",
          number_of_trials: goal.number_of_trials
            ? goal.number_of_trials.toString()
            : "",
          goal_frequency: goal.goal_frequency ?? "",
          current_skill_level: goal.current_skill_level ?? "",
          target_performance_level: goal.target_performance_level ?? "",
          present_level: goal.present_level ?? "",
          target_level: goal.target_level ?? "",
          goal_background: goal.goal_background ?? "",
          goal_statement: goal.goal_statement ?? "",
          implementation_procedure: goal.implementation_procedure ?? "",
          objective_term_steps:
            goal.objective_term_steps?.map((step, stepIndex) => ({
              id: `goals${index + 1}_${stepIndex}`,
              taskAnalysis: step.task_analysis ?? "",
              baseline: step.baseline ?? "",
              checked: true,
            })) ?? [],
          evaluating_progress: goal?.evaluating_progress ?? [],
          progress_monitoring: goal?.progress_monitoring ?? "",
          mastery_towards_goal_achievement:
            goal?.mastery_towards_goal_achievement ?? "",
          reinforcers: goal?.reinforcers ?? [],
          materials: goal?.materials ?? [],
          expected_outcome: goal?.expected_outcome ?? "",
          goal_comment: goal?.goal_comment ?? "",
          consequences: goal?.consequences ?? [],
        }));
    }
    return [];
  }, [treatmentPlanData]);

  const handleGenerateOptions = useCallback(
    (goal: any, index: number) => {
      if (goal.goal_area) {
        const targetSkills = getTargetSkills(goal.goal_area, formType);
        const formattedTargetSkills = targetSkills.map((skill) => ({
          label: replacePlaceholder(skill.targetSkill),
          value: skill.targetSkill,
        }));
        setGoalOptions((prev) => ({
          ...prev,
          [`${index}_targetSkills`]: formattedTargetSkills,
        }));

        if (goal.target_skill) {
          const shortTermObjectives = getShortTermObjectives(
            targetSkills,
            goal.target_skill
          );
          const formattedShortTermObjectives = shortTermObjectives.map(
            (objective) => ({
              label: replacePlaceholder(objective.sto),
              value: objective.sto,
            })
          );
          setGoalOptions((prev) => ({
            ...prev,
            [`${index}_shortTermObjectives`]: formattedShortTermObjectives,
          }));

          if (goal.short_term_objective) {
            const taskAnalysisList = getTaskAnalysis(
              shortTermObjectives,
              goal.short_term_objective
            ).map((item, analysisIndex) => ({
              id: analysisIndex.toString(),
              taskAnalysis: replacePlaceholder(item),
              baseline: goalBaselineOptions,
              checked: false,
            }));

            setGoalOptions((prev) => ({
              ...prev,
              [`${index}_taskAnalysis`]: taskAnalysisList,
            }));
          }
        }
      }
    },
    [formType, setGoalOptions]
  );

  useEffect(() => {
    if (getMappedGoals.length > 0) {
      setMethod("PATCH");
      replace(getMappedGoals);

      getMappedGoals.forEach((goal, index) => {
        handleGenerateOptions(goal, index);
      });
    }
  }, [getMappedGoals]);

  // useEffect(() => {
  //   if (
  //     treatmentPlanData &&
  //     treatmentPlanData?.data?.treatmentGoal &&
  //     Array.isArray(treatmentPlanData?.data?.treatmentGoal) &&
  //     treatmentPlanData?.data?.treatmentGoal?.length > 0
  //   ) {
  //     setMethod("PATCH");

  //     const mappedGoals = treatmentPlanData.data.treatmentGoal
  //       .sort(
  //         (a, b) =>
  //           new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  //       )
  //       .map((goal, index) => ({
  //         id: goal.id,
  //         goal_area: goal.goal_area ?? "",
  //         target_skill: goal.target_skill ?? "",
  //         short_term_objective: goal.short_term_objective ?? "",
  //         goal_status: goal.goal_status ?? "",
  //         goal_setting: goal.goal_setting ?? "",
  //         number_of_trials: goal.number_of_trials
  //           ? goal.number_of_trials.toString()
  //           : "",
  //         goal_frequency: goal.goal_frequency ?? "",
  //         current_skill_level: goal.current_skill_level ?? "",
  //         target_performance_level: goal.target_performance_level ?? "",
  //         goal_background: goal.goal_background ?? "",
  //         goal_statement: goal.goal_statement ?? "",
  //         implementation_procedure: goal.implementation_procedure ?? "",
  //         objective_term_steps:
  //           goal.objective_term_steps?.map((step, stepIndex) => ({
  //             id: stepIndex.toString(),
  //             taskAnalysis: step.task_analysis ?? "",
  //             baseline: step.baseline ?? "",
  //             checked: true,
  //           })) ?? [],
  //         evaluating_progress: [],
  //         progress_monitoring: "",
  //         mastery_towards_goal_achievement: "",
  //         reinforcers: [],
  //         materials: [],
  //         expected_outcome: "",
  //         goal_comment: "",
  //       }));

  //     // Update the goals in the form
  //     replace(mappedGoals);

  //     mappedGoals.forEach((goal, index) => {
  //       if (goal.goal_area) {
  //         // Generate target skills options
  //         const targetSkills = getTargetSkills(goal.goal_area, formType);
  //         const formattedTargetSkills = targetSkills.map((skill) => ({
  //           label: replacePlaceholder(skill.targetSkill),
  //           value: skill.targetSkill,
  //         }));
  //         setGoalOptions((prev) => ({
  //           ...prev,
  //           [`${index}_targetSkills`]: formattedTargetSkills,
  //         }));

  //         if (goal.target_skill) {
  //           // Generate short-term objectives options
  //           const shortTermObjectives = getShortTermObjectives(
  //             targetSkills,
  //             goal.target_skill
  //           );
  //           const formattedShortTermObjectives = shortTermObjectives.map(
  //             (objective) => ({
  //               label: replacePlaceholder(objective.sto),
  //               value: objective.sto,
  //             })
  //           );
  //           setGoalOptions((prev) => ({
  //             ...prev,
  //             [`${index}_shortTermObjectives`]: formattedShortTermObjectives,
  //           }));

  //           if (goal.short_term_objective) {
  //             // Generate task analysis
  //             const taskAnalysisList = getTaskAnalysis(
  //               shortTermObjectives,
  //               goal.short_term_objective
  //             ).map((item, analysisIndex) => ({
  //               id: analysisIndex.toString(),
  //               taskAnalysis: replacePlaceholder(item),
  //               baseline: goalBaselineOptions,
  //               checked: false,
  //             }));

  //             setGoalOptions((prev) => ({
  //               ...prev,
  //               [`${index}_taskAnalysis`]: taskAnalysisList,
  //             }));
  //           }
  //         }
  //       }
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [treatmentPlanData, replace]);

  useEffect(() => {
    if (errors && errors?.goals) {
      toast({
        variant: "destructive",
        description: "Please fill all required fields",
      });
    }
  }, [errors]);

  const onSubmit = async (data: z.infer<typeof goalSchema>) => {
    try {
      const token = localStorage.getItem("token") as string;

      const requestBody: any[] = data.goals.map((goal) => {
        const formattedObjectiveTermSteps =
          goal.objective_term_steps.length > 0
            ? goal.objective_term_steps.map((step) => ({
                task_analysis: step.taskAnalysis,
                baseline: step.baseline,
              }))
            : null;

        return {
          id: goal?.id ?? undefined,
          goal_area: validateField(goal.goal_area),
          target_skill: validateField(goal.target_skill),
          short_term_objective: validateField(goal.short_term_objective),
          goal_status: validateField(goal.goal_status),
          goal_setting: validateField(goal.goal_setting),
          number_of_trials:
            typeof goal.number_of_trials === "string"
              ? parseInt(goal.number_of_trials)
              : null,
          goal_frequency: validateField(goal.goal_frequency),
          current_skill_level: validateField(goal.current_skill_level),
          target_performance_level: validateField(
            goal.target_performance_level
          ),
          goal_background: validateField(goal.goal_background),
          goal_statement: validateField(goal.goal_statement),
          implementation_procedure: validateField(
            goal.implementation_procedure
          ),
          objective_term_steps: formattedObjectiveTermSteps,
          evaluating_progress: goal.evaluating_progress,
          reinforcers: goal.reinforcers,
          materials: goal.materials,
          progress_monitoring: validateField(goal.progress_monitoring),
          mastery_towards_goal_achievement: validateField(
            goal.mastery_towards_goal_achievement
          ),
          expected_outcome: validateField(goal.expected_outcome),
          goal_comment: validateField(goal.goal_comment),
          present_level: validateField(goal.present_level),
          target_level: validateField(goal.target_level),
          consequences: goal.consequences,
        };
      });

      const response = await submitGoalForm(
        token,
        requestBody,
        clientId,
        method,
        formType,
        formId
      );

      await refetchTreatmentPlan();

      if (response.status === false) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error) {
      console.error("ERROR SUBMITTING TREATMENT PLAN GOALS", error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const token = localStorage.getItem("token") as string;
      const data = getValues();
      const requestBody: any[] = data.goals.map((goal) => {
        const formattedObjectiveTermSteps =
          goal.objective_term_steps.length > 0
            ? goal.objective_term_steps.map((step) => ({
                task_analysis: step.taskAnalysis,
                baseline: step.baseline,
              }))
            : null;

        return {
          id: goal?.id ?? undefined,
          goal_area: validateField(goal.goal_area),
          target_skill: validateField(goal.target_skill),
          short_term_objective: validateField(goal.short_term_objective),
          goal_status: validateField(goal.goal_status),
          goal_setting: validateField(goal.goal_setting),
          number_of_trials:
            typeof goal.number_of_trials === "string"
              ? parseInt(goal.number_of_trials)
              : null,
          goal_frequency: validateField(goal.goal_frequency),
          current_skill_level: validateField(goal.current_skill_level),
          target_performance_level: validateField(
            goal.target_performance_level
          ),
          goal_background: validateField(goal.goal_background),
          goal_statement: validateField(goal.goal_statement),
          implementation_procedure: validateField(
            goal.implementation_procedure
          ),
          objective_term_steps: formattedObjectiveTermSteps,
          evaluating_progress: goal.evaluating_progress,
          reinforcers: goal.reinforcers,
          materials: goal.materials,
          progress_monitoring: validateField(goal.progress_monitoring),
          mastery_towards_goal_achievement: validateField(
            goal.mastery_towards_goal_achievement
          ),
          expected_outcome: validateField(goal.expected_outcome),
          goal_comment: validateField(goal.goal_comment),
          present_level: validateField(goal.present_level),
          target_level: validateField(goal.target_level),
          consequences: goal.consequences,
        };
      });

      const response = await submitGoalForm(
        token,
        requestBody,
        clientId,
        method,
        formType,
        formId
      );

      await refetchTreatmentPlan();

      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } catch (error) {
      console.error("ERROR SAVING DRAFT", error);
      toast({
        variant: "destructive",
        description: "Error saving draft",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleAddNewGoal = async () => {
    if (method === "POST") {
      append(defaultGoal);
      return;
    }

    try {
      setIsAddingNewGoal(true);

      const token = localStorage.getItem("token") as string;

      const cleanGoal = (goal: any): any => {
        const updatedGoal = Object.entries(goal).reduce(
          (acc: any, [key, value]) => {
            acc[key] = value === "" ? null : value; // Replace only empty strings with null
            return acc;
          },
          {}
        );

        return updatedGoal;
      };

      const requestBody = [cleanGoal(defaultGoal)];

      const response = await addNewTreatmentGoal(
        token,
        requestBody,
        clientId,
        formType,
        formId
      );

      if (response.status === false) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      const data = getValues();

      const goalRequestBody: any[] = data.goals.map((goal) => {
        const formattedObjectiveTermSteps =
          goal.objective_term_steps.length > 0
            ? goal.objective_term_steps.map((step) => ({
                task_analysis: step.taskAnalysis,
                baseline: step.baseline,
              }))
            : null;

        return {
          id: goal?.id ?? undefined,
          goal_area: validateField(goal.goal_area),
          target_skill: validateField(goal.target_skill),
          short_term_objective: validateField(goal.short_term_objective),
          goal_status: validateField(goal.goal_status),
          goal_setting: validateField(goal.goal_setting),
          number_of_trials:
            typeof goal.number_of_trials === "string"
              ? parseInt(goal.number_of_trials)
              : null,
          goal_frequency: validateField(goal.goal_frequency),
          current_skill_level: validateField(goal.current_skill_level),
          target_performance_level: validateField(
            goal.target_performance_level
          ),
          goal_background: validateField(goal.goal_background),
          goal_statement: validateField(goal.goal_statement),
          implementation_procedure: validateField(
            goal.implementation_procedure
          ),
          objective_term_steps: formattedObjectiveTermSteps,
          evaluating_progress: goal.evaluating_progress,
          reinforcers: goal.reinforcers,
          materials: goal.materials,
          progress_monitoring: validateField(goal.progress_monitoring),
          mastery_towards_goal_achievement: validateField(
            goal.mastery_towards_goal_achievement
          ),
          expected_outcome: validateField(goal.expected_outcome),
          goal_comment: validateField(goal.goal_comment),
        };
      });

      const goalResponse = await submitGoalForm(
        token,
        goalRequestBody,
        clientId,
        method,
        formType,
        formId
      );

      if (goalResponse.status === false) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      await refetchTreatmentPlan();

      toast({
        variant: "success",
        description: "Goal created successfully",
      });
    } catch (err) {
      console.error("ERROR ADDING NEW GOAL", err);
    } finally {
      setIsAddingNewGoal(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (method === "POST") {
      // Remove the goal at the specified index
      // remove(indexOfGoalToBeDeleted!);

      setGoalOptions((prev) => {
        const newOptions: { [key: string]: any } = {};

        Object.keys(prev).forEach((key) => {
          const [index, type] = key.split("_"); // e.g., "0_targetSkills" -> ["0", "targetSkills"]
          const numericIndex = parseInt(index, 10);

          if (numericIndex > indexOfGoalToBeDeleted!) {
            // Shift the options for goals after the deleted index
            newOptions[`${numericIndex - 1}_${type}`] = prev[key];
          } else if (numericIndex < indexOfGoalToBeDeleted!) {
            // Keep the options for goals before the deleted index
            newOptions[key] = prev[key];
          }
          // Skip the deleted goal's options
        });

        return newOptions;
      });

      const currentGoals = getValues("goals");

      // Filter out the deleted goal
      const remainingGoals = currentGoals.filter(
        (_, index) => index !== indexOfGoalToBeDeleted
      );

      // Replace the form state with the remaining goals
      reset({ goals: remainingGoals });

      setIsDeleteModalOpen(false);
      setIndexOfGoalToBeDeleted(null);
      setIdOfGoalToBeDeleted(null);

      toast({
        variant: "success",
        description: "Goal deleted successfully",
      });
      return;
    }

    try {
      setIsDeletingGoal(true);

      const token = localStorage.getItem("token") as string;

      const response = await deleteTreatmentGoal(
        token,
        idOfGoalToBeDeleted,
        formType
      );

      await refetchTreatmentPlan();

      if (response.status === false) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      setIsDeleteModalOpen(false);
      setIndexOfGoalToBeDeleted(null);
      setIdOfGoalToBeDeleted(null);

      toast({
        variant: "success",
        description: "Goal deleted successfully",
      });
    } catch (err) {
      console.error("ERROR DELETING GOAL", err);
    } finally {
      setIsDeletingGoal(false);
    }
  };

  const formatOptions = useMemo(
    () => (items: any[], keyField: string) =>
      items.map((item) => ({
        label: replacePlaceholder(item[keyField]),
        value: item[keyField],
      })),
    [replacePlaceholder]
  );

  // Memoize option getter functions with proper hook usage
  const getTargetSkillsOptions = useCallback(
    (goalArea: string, index: number) => {
      if (goalOptions[`${index}_targetSkills`]) {
        return goalOptions[`${index}_targetSkills`];
      }

      const skills = getTargetSkills(goalArea, formType);
      const formattedTargetSkills = formatOptions(skills, "targetSkill");

      setGoalOptions((prev) => ({
        ...prev,
        [`${index}_targetSkills`]: formattedTargetSkills,
      }));

      return formattedTargetSkills;
    },
    [formType, goalOptions, formatOptions]
  );

  const getShortTermObjectiveOptions = useCallback(
    (goalArea: string, targetSkill: string, index: number) => {
      if (goalOptions[`${index}_shortTermObjectives`]) {
        return goalOptions[`${index}_shortTermObjectives`];
      }

      const skills = getTargetSkills(goalArea, formType);
      const objectives = getShortTermObjectives(skills, targetSkill);
      const formattedObjectives = formatOptions(objectives, "sto");

      setGoalOptions((prev) => ({
        ...prev,
        [`${index}_shortTermObjectives`]: formattedObjectives,
      }));

      return formattedObjectives;
    },
    [formType, goalOptions, formatOptions]
  );

  // Memoize task analysis format function
  const formatTaskAnalysis = useMemo(
    () => (analysis: string[], index: number) =>
      analysis.map((item, analysisIndex) => ({
        id: `goals${index + 1}_${analysisIndex}`,
        taskAnalysis: replacePlaceholder(item),
        baseline: goalBaselineOptions,
        checked: false,
      })),
    [replacePlaceholder]
  );

  const getTaskAnalysisItems = useCallback(
    (
      goalArea: string,
      targetSkill: string,
      shortTermObjective: string,
      index: number
    ) => {
      const skills = getTargetSkills(goalArea, formType);
      const objectives = getShortTermObjectives(skills, targetSkill);
      const analysis = getTaskAnalysis(objectives, shortTermObjective);
      const taskAnalysisList = formatTaskAnalysis(analysis, index);

      setGoalOptions((prev) => ({
        ...prev,
        [`${index}_taskAnalysis`]: taskAnalysisList,
      }));

      return taskAnalysisList;
    },
    [formType, goalOptions, formatTaskAnalysis]
  );

  //   // If not, generate new options
  //   const skills = getTargetSkills(goalArea, formType);
  //   const formattedTargetSkills = skills.map((skill) => ({
  //     label: replacePlaceholder(skill.targetSkill),
  //     value: skill.targetSkill,
  //   }));

  //   // Store options for this specific goal
  //   setGoalOptions((prev) => ({
  //     ...prev,
  //     [`${index}_targetSkills`]: formattedTargetSkills,
  //   }));

  //   return formattedTargetSkills;
  // };

  // const getShortTermObjectiveOptions = (
  //   goalArea: string,
  //   targetSkill: string,
  //   index: number
  // ) => {
  //   // Check if options for this specific goal and index already exist
  //   if (goalOptions[`${index}_shortTermObjectives`]) {
  //     return goalOptions[`${index}_shortTermObjectives`];
  //   }

  //   // If not, generate new options
  //   const skills = getTargetSkills(goalArea, formType);
  //   const objectives = getShortTermObjectives(skills, targetSkill);
  //   const formattedShortTermObjective = objectives.map((objective) => ({
  //     label: replacePlaceholder(objective.sto),
  //     value: objective.sto,
  //   }));

  //   // Store options for this specific goal
  //   setGoalOptions((prev) => ({
  //     ...prev,
  //     [`${index}_shortTermObjectives`]: formattedShortTermObjective,
  //   }));

  //   return formattedShortTermObjective;
  // };

  // const getTaskAnalysisItems = (
  //   goalArea: string,
  //   targetSkill: string,
  //   shortTermObjective: string,
  //   index: number
  // ) => {
  //   // Check if task analysis for this specific goal and index already exist
  //   if (goalOptions[`${index}_taskAnalysis`]) {
  //     return goalOptions[`${index}_taskAnalysis`];
  //   }

  //   // If not, generate new task analysis
  //   const skills = getTargetSkills(goalArea, formType);
  //   const objectives = getShortTermObjectives(skills, targetSkill);
  //   const analysis = getTaskAnalysis(objectives, shortTermObjective);

  //   const taskAnalysisList = analysis.map((item, analysisIndex) => ({
  //     id: `${index}_${analysisIndex}`,
  //     taskAnalysis: replacePlaceholder(item),
  //     baseline: goalBaselineOptions,
  //     checked: false,
  //   }));

  //   // Store task analysis for this specific goal
  //   setGoalOptions((prev) => ({
  //     ...prev,
  //     [`${index}_taskAnalysis`]: taskAnalysisList,
  //   }));

  //   return taskAnalysisList;
  // };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3
        data-testid="goals-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Goals
      </h3>

      <FormBanner text="All fields must be filled in unless marked as optional" />

      <form className="flex flex-col gap-10" onSubmit={handleSubmit(onSubmit)}>
        {fields.map((goal, index) => (
          <div
            key={goal.id}
            className="flex flex-col gap-10 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
          >
            <div className="flex items-center gap-5 justify-between flex-wrap">
              <h3 className="text-[#0F172A] text-[20px] font-[600]">
                Goal {index + 1}
              </h3>
              <button
                data-testid={`delete-goal-${index}-button`}
                type="button"
                disabled={fields.length === 1}
                onClick={() => {
                  setIndexOfGoalToBeDeleted(index);
                  setIdOfGoalToBeDeleted(goal.id!);
                  setIsDeleteModalOpen(true);
                }}
                className="disabled:text-gray-500 disabled:cursor-not-allowed text-black"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`goals.${index}.goal_area`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => {
                      field.onChange(value);

                      // Reset dependent fields
                      setValue(`goals.${index}.target_skill`, "");
                      setValue(`goals.${index}.short_term_objective`, "");

                      // Clear previous options
                      setGoalOptions((prev) => {
                        const newOptions = { ...prev };
                        delete newOptions[`${index}_targetSkills`];
                        delete newOptions[`${index}_shortTermObjectives`];
                        delete newOptions[`${index}_taskAnalysis`];
                        return newOptions;
                      });
                    }}
                    labelText="Goal Area"
                    placeholder="Select Option"
                    selectContent={goalAreaOptions}
                    isError={!!errors?.goals?.[index]?.goal_area}
                    errorMessage={errors?.goals?.[index]?.goal_area?.message}
                    data-testid={`goals-${index}-goal-area`}
                  />
                )}
              />

              <Controller
                name={`goals.${index}.target_skill`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => {
                      field.onChange(value);

                      // Reset dependent fields
                      setValue(`goals.${index}.short_term_objective`, "");

                      // Clear previous options
                      setGoalOptions((prev) => {
                        const newOptions = { ...prev };
                        delete newOptions[`${index}_shortTermObjectives`];
                        delete newOptions[`${index}_taskAnalysis`];
                        return newOptions;
                      });
                    }}
                    labelText="Target Skill"
                    placeholder="Select Option"
                    selectContent={getTargetSkillsOptions(
                      getValues(`goals.${index}.goal_area`),
                      index
                    )}
                    isError={!!errors?.goals?.[index]?.target_skill}
                    errorMessage={errors?.goals?.[index]?.target_skill?.message}
                    data-testid={`goals-${index}-target-skill`}
                  />
                )}
              />
            </div>

            <Controller
              name={`goals.${index}.short_term_objective`}
              control={control}
              render={({ field }) => (
                <FormSelect
                  {...field}
                  onValueChange={(value: string) => {
                    field.onChange(value);

                    // Set task analysis for this specific goal
                    const goalAreaValue = getValues(`goals.${index}.goal_area`);
                    const targetSkillValue = getValues(
                      `goals.${index}.target_skill`
                    );

                    getTaskAnalysisItems(
                      goalAreaValue,
                      targetSkillValue,
                      value,
                      index
                    );
                  }}
                  labelText="Short Term Objective (STO)"
                  placeholder="Select Option"
                  selectContent={getShortTermObjectiveOptions(
                    getValues(`goals.${index}.goal_area`),
                    getValues(`goals.${index}.target_skill`),
                    index
                  )}
                  isError={!!errors?.goals?.[index]?.short_term_objective}
                  errorMessage={
                    errors?.goals?.[index]?.short_term_objective?.message
                  }
                  data-testid={`goals-${index}-short-term-objective`}
                />
              )}
            />

            <GoalsTable
              data={goalOptions[`${index}_taskAnalysis`] || []}
              onStepChange={updateSteps}
              objective_term_steps={goal.objective_term_steps}
              index={index}
              errors={errors?.goals?.[index]?.objective_term_steps}
              formType={formType}
            />

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`goals.${index}.goal_status`}
                control={control}
                rules={{ required: "Goal Status is required" }}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => field.onChange(value)}
                    labelText="Goal Status"
                    placeholder="Select Option"
                    selectContent={goalStatusOptions}
                    isError={!!errors?.goals?.[index]?.goal_status}
                    errorMessage={errors?.goals?.[index]?.goal_status?.message}
                    data-testid={`goals-${index}-goal-status`}
                  />
                )}
              />

              <Controller
                name={`goals.${index}.goal_setting`}
                control={control}
                rules={{ required: "Setting is required" }}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => field.onChange(value)}
                    labelText="Setting"
                    placeholder="Select Option"
                    selectContent={goalSettingOptions}
                    isError={!!errors?.goals?.[index]?.goal_setting}
                    errorMessage={errors?.goals?.[index]?.goal_setting?.message}
                    data-testid={`goals-${index}-goal-setting`}
                  />
                )}
              />
            </div>

            {formType === "ti" && (
              <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
                <Controller
                  name={`goals.${index}.present_level`}
                  control={control}
                  rules={{ required: "Present Level is required" }}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value: string) => field.onChange(value)}
                      labelText="Present Level"
                      placeholder="Select Option"
                      selectContent={goalCurrentSkillLevelOptions}
                      isError={!!errors?.goals?.[index]?.present_level}
                      errorMessage={
                        errors?.goals?.[index]?.present_level?.message
                      }
                      data-testid={`goals-${index}-present-level`}
                    />
                  )}
                />

                <Controller
                  name={`goals.${index}.target_level`}
                  control={control}
                  rules={{ required: "Target Level is required" }}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value: string) => field.onChange(value)}
                      labelText="Target Level"
                      placeholder="Select Option"
                      selectContent={goalCurrentSkillLevelOptions}
                      isError={!!errors?.goals?.[index]?.target_level}
                      errorMessage={
                        errors?.goals?.[index]?.target_level?.message
                      }
                      data-testid={`goals-${index}-target-level`}
                    />
                  )}
                />
              </div>
            )}

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`goals.${index}.number_of_trials`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => field.onChange(value)}
                    labelText="Number of trials (out of 5)"
                    placeholder="Select Option"
                    selectContent={goalNumberOfTrialsOptions}
                    isError={!!errors?.goals?.[index]?.number_of_trials}
                    errorMessage={
                      errors?.goals?.[index]?.number_of_trials?.message
                    }
                    data-testid={`goals-${index}-number-of-trials`}
                  />
                )}
              />

              <Controller
                name={`goals.${index}.goal_frequency`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => field.onChange(value)}
                    labelText="Frequency"
                    placeholder="Select Option"
                    selectContent={goalFrequencyOptions}
                    isError={!!errors?.goals?.[index]?.goal_frequency}
                    errorMessage={
                      errors?.goals?.[index]?.goal_frequency?.message
                    }
                    data-testid={`goals-${index}-goal-frequency`}
                  />
                )}
              />
            </div>

            {formType !== "ti" && (
              <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
                <Controller
                  name={`goals.${index}.current_skill_level`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value: string) => field.onChange(value)}
                      labelText="Current Skill Level"
                      placeholder="Select Option"
                      selectContent={goalCurrentSkillLevelOptions}
                      isError={!!errors?.goals?.[index]?.current_skill_level}
                      errorMessage={
                        errors?.goals?.[index]?.current_skill_level?.message
                      }
                      data-testid={`goals-${index}-current-skill-level`}
                    />
                  )}
                />

                <Controller
                  name={`goals.${index}.target_performance_level`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value: string) => field.onChange(value)}
                      labelText="Target Performance Level"
                      placeholder="Select Option"
                      selectContent={goalTargetPerformanceOptions}
                      isError={
                        !!errors?.goals?.[index]?.target_performance_level
                      }
                      errorMessage={
                        errors?.goals?.[index]?.target_performance_level
                          ?.message
                      }
                      data-testid={`goals-${index}-target-performance-level`}
                    />
                  )}
                />
              </div>
            )}

            <Controller
              name={`goals.${index}.goal_background`}
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  labelText="Goal Background (the problem we are addressing)"
                  placeholder="Enter here..."
                  isError={!!errors?.goals?.[index]?.goal_background}
                  errorMessage={
                    errors?.goals?.[index]?.goal_background?.message
                  }
                  data-testid={`goals-${index}-goal-background`}
                />
              )}
            />

            <Controller
              name={`goals.${index}.goal_statement`}
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  labelText="Goal Statement"
                  placeholder="Enter here..."
                  isError={!!errors?.goals?.[index]?.goal_statement}
                  errorMessage={errors?.goals?.[index]?.goal_statement?.message}
                  data-testid={`goals-${index}-goal-statement`}
                />
              )}
            />

            <Controller
              name={`goals.${index}.implementation_procedure`}
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  labelText="Implementation Procedure"
                  placeholder="Enter here..."
                  isError={!!errors?.goals?.[index]?.implementation_procedure}
                  errorMessage={
                    errors?.goals?.[index]?.implementation_procedure?.message
                  }
                  data-testid={`goals-${index}-implementation-procedure`}
                />
              )}
            />

            {formType !== "iiss" && (
              <div className="flex flex-col gap-10">
                <Controller
                  name={`goals.${index}.evaluating_progress`}
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={[
                        "Direct Observation",
                        "Contact Log Reviews",
                        "Progress Report",
                      ]}
                      labelText="Evaluating Progress"
                      isError={!!errors?.goals?.[index]?.evaluating_progress}
                      errorMessage={
                        errors?.goals?.[index]?.evaluating_progress?.message
                      }
                      selected={field.value || []}
                      onChange={(selected) => field.onChange(selected)}
                      data-testid={`goals-${index}-evaluating-progress`}
                    />
                    // <FormMultiSelect
                    //   options={[
                    //     "Direct Observation",
                    //     "Contact Log Reviews",
                    //     "Progress Report",
                    //   ]}
                    //   labelText="Evaluating Progress"
                    //   isError={!!errors?.goals?.[index]?.evaluating_progress}
                    //   errorMessage={
                    //     errors?.goals?.[index]?.evaluating_progress?.message
                    //   }
                    //   defaultSelected={field.value || []}
                    //   onChange={(selected) => field.onChange(selected)}
                    // />
                  )}
                />

                <Controller
                  name={`goals.${index}.progress_monitoring`}
                  control={control}
                  render={({ field }) => (
                    <FormTextArea
                      {...field}
                      labelText="Progress Monitoring"
                      placeholder="Enter here..."
                      isError={!!errors?.goals?.[index]?.progress_monitoring}
                      errorMessage={
                        errors?.goals?.[index]?.progress_monitoring?.message
                      }
                      data-testid={`goals-${index}-progress-monitoring`}
                    />
                  )}
                />

                <Controller
                  name={`goals.${index}.mastery_towards_goal_achievement`}
                  control={control}
                  render={({ field }) => (
                    <FormTextArea
                      {...field}
                      labelText="Mastery towards goal achievement"
                      placeholder="Enter here..."
                      isError={
                        !!errors?.goals?.[index]
                          ?.mastery_towards_goal_achievement
                      }
                      errorMessage={
                        errors?.goals?.[index]?.mastery_towards_goal_achievement
                          ?.message
                      }
                      data-testid={`goals-${index}-mastery-towards-goal-achievement`}
                    />
                  )}
                />

                <Controller
                  name={`goals.${index}.reinforcers`}
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={[
                        "Saying good job",
                        "High five",
                        "Getting something they like",
                      ]}
                      labelText="Reinforcers"
                      isError={!!errors?.goals?.[index]?.reinforcers}
                      errorMessage={
                        errors?.goals?.[index]?.reinforcers?.message
                      }
                      selected={field.value || []}
                      onChange={(selected) => field.onChange(selected)}
                      data-testid={`goals-${index}-reinforcers`}
                    />
                    // <FormMultiSelect
                    //   options={[
                    //     "Saying good job",
                    //     "High five",
                    //     "Getting something they like",
                    //   ]}
                    //   labelText="Reinforcers"
                    //   isError={!!errors?.goals?.[index]?.reinforcers}
                    //   errorMessage={
                    //     errors?.goals?.[index]?.reinforcers?.message
                    //   }
                    //   defaultSelected={field.value || []}
                    //   onChange={(selected) => field.onChange(selected)}
                    // />
                  )}
                />

                <Controller
                  name={`goals.${index}.materials`}
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={[
                        "A Visual Schedule",
                        "Timer",
                        "Social Story",
                        "Feelings Chart",
                        "Token Board",
                        "Pictures",
                      ]}
                      labelText="Materials"
                      isError={!!errors?.goals?.[index]?.materials}
                      errorMessage={errors?.goals?.[index]?.materials?.message}
                      selected={field.value || []}
                      onChange={(selected) => field.onChange(selected)}
                      data-testid={`goals-${index}-materials`}
                    />
                    // <FormMultiSelect
                    //   options={[
                    //     "A Visual Schedule",
                    //     "Timer",
                    //     "Social Story",
                    //     "Feelings Chart",
                    //     "Token Board",
                    //     "Pictures",
                    //   ]}
                    //   labelText="Materials"
                    //   isError={!!errors?.goals?.[index]?.materials}
                    //   errorMessage={errors?.goals?.[index]?.materials?.message}
                    //   defaultSelected={field.value || []}
                    //   onChange={(selected) => field.onChange(selected)}
                    // />
                  )}
                />

                <Controller
                  name={`goals.${index}.expected_outcome`}
                  control={control}
                  render={({ field }) => (
                    <FormTextArea
                      {...field}
                      labelText="Expected Outcome"
                      placeholder="Enter here..."
                      isError={!!errors?.goals?.[index]?.expected_outcome}
                      errorMessage={
                        errors?.goals?.[index]?.expected_outcome?.message
                      }
                      data-testid={`goals-${index}-expected-outcome`}
                    />
                  )}
                />

                {formType === "ti" && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-[600] text-[16px] text-[#0F172A]">
                      Consequences
                    </h3>
                    <div className="flex flex-col gap-2">
                      {goalConsequencesOption.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <Controller
                            name={`goals.${index}.consequences`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={
                                  field.value?.includes(option.value) || false
                                }
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...currentValues,
                                      option.value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter(
                                        (v) => v !== option.value
                                      )
                                    );
                                  }
                                }}
                                data-testid={`goals-${index}-consequence-${optionIndex}`}
                              />
                            )}
                          />
                          <label className="text-[14px] text-[#475467]">
                            {option.label.replace(/\[client\]/g, username)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Controller
                  name={`goals.${index}.goal_comment`}
                  control={control}
                  render={({ field }) => (
                    <FormTextArea
                      {...field}
                      labelText="Goal Comment (Optional)"
                      placeholder="Enter here..."
                      isError={!!errors?.goals?.[index]?.goal_comment}
                      errorMessage={
                        errors?.goals?.[index]?.goal_comment?.message
                      }
                      data-testid={`goals-${index}-goal-comment`}
                    />
                  )}
                />
              </div>
            )}
          </div>
        ))}

        {!isFormDisabled && (
          <Button
            isLoading={isAddingNewGoal}
            disabled={isAddingNewGoal}
            onClick={handleAddNewGoal}
            type="button"
            data-testid="add-goal-button"
          >
            <PlusIcon className="w-5 h-5" />
            Add Goal
          </Button>
        )}

        <Dialog onOpenChange={setIsDeleteModalOpen} open={isDeleteModalOpen}>
          <DialogContent data-testid="delete-goal-modal">
            <DialogHeader>
              <Image
                src="/assets/images/dashboard/trashIconBg.svg"
                width={50}
                height={50}
                alt="trash icon"
                className="mx-auto pb-5"
              />
              <DialogTitle className="mx-auto">
                Delete Goal {indexOfGoalToBeDeleted! + 1}
              </DialogTitle>
              <DialogDescription className="text-[14px] font-[200] text-[#475467] text-center pt-3">
                Deleting a goal also deletes the responses in the form fields.
                This action cannot be undone
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-3 flex items-center gap-5">
              <DialogClose
                data-testid="cancel-delete-goal-button"
                disabled={isDeletingGoal}
                onClick={() => setIndexOfGoalToBeDeleted(null)}
                className="w-full h-fit p-2 rounded-[6px] bg-[#F1F5F9] text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </DialogClose>
              <button
                data-testid="confirm-delete-goal-button"
                onClick={handleDeleteGoal}
                disabled={isDeletingGoal}
                className="w-full h-fit p-2 rounded-[6px] bg-[#EF4444] text-white disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
              >
                Confirm
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
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
              onClick={handleSaveDraft}
              variant="light"
              type="button"
              disabled={isSavingDraft}
              isLoading={isSavingDraft}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}
          {isFormDisabled ? (
            <Button
              onClick={() => {
                handleChangeIndex(3);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
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

export default Goals;
