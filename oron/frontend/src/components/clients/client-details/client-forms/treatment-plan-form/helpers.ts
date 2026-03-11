import fcGoalsData from "@/data/fc-goals.json";
import iissGoalsData from "@/data/iiss-goals.json";
import tiGoalsData from "@/data/ti-goals.json";

import { TreatmentPlanType } from "./TreatmentPlanWrapper";

export interface TaskAnalysis {
  sto: string;
  taskAnalysis: string[];
}

export interface ShortTermObjective {
  targetSkill: string;
  shortTermObjectives: TaskAnalysis[];
}

export interface GoalArea {
  goalArea: string;
  targetSkills: ShortTermObjective[];
}

export const getGoalAreas = (formType: TreatmentPlanType): string[] => {
  switch (formType) {
    case "fc":
      return [...new Set(fcGoalsData.map((item) => item.goalArea))];

    case "iiss":
      return [...new Set(iissGoalsData.map((item) => item.goalArea))];

    case "ti":
      return [...new Set(tiGoalsData.map((item) => item.goalArea))];

    default:
      return [];
  }
};

export const getTargetSkills = (
  selectedGoalArea: string,
  formType: TreatmentPlanType
): ShortTermObjective[] => {
  switch (formType) {
    case "fc":
      const fcGoal = fcGoalsData.find(
        (item) => item.goalArea === selectedGoalArea
      );
      return fcGoal?.targetSkills || [];

    case "iiss":
      const iissGoal = iissGoalsData.find(
        (item) => item.goalArea === selectedGoalArea
      );
      return iissGoal?.targetSkills || [];

    case "ti":
      const tiGoal = tiGoalsData.find(
        (item) => item.goalArea === selectedGoalArea
      );
      return tiGoal?.targetSkills || [];

    default:
      return [];
  }
};

export const getShortTermObjectives = (
  targetSkills: ShortTermObjective[],
  selectedTargetSkill: string
): TaskAnalysis[] => {
  const skill = targetSkills.find(
    (item) => item.targetSkill === selectedTargetSkill
  );
  return skill?.shortTermObjectives || [];
};

export const getTaskAnalysis = (
  shortTermObjectives: TaskAnalysis[],
  selectedSTO: string
): string[] => {
  const sto = shortTermObjectives.find((item) => item.sto === selectedSTO);
  return (
    sto?.taskAnalysis.map((task) =>
      task.startsWith("·") ? task.slice(1).trim() : task
    ) || []
  );
};
