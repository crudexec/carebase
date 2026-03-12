"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import {
  CarePlanGoalInfo,
  GoalTrackingData,
  TaskAnalysisStepData,
} from "@/lib/visit-notes/types";

// Helper function to format underscore-separated values into readable text
function formatDisplayValue(value: string): string {
  if (!value) return "N/A";

  // Replace underscores with spaces and capitalize each word
  return value
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface GoalTrackingViewerProps {
  goals: CarePlanGoalInfo[];
  data: Record<number, GoalTrackingData>;
}

export function GoalTrackingViewer({ goals, data }: GoalTrackingViewerProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalTrackingViewerSection
          key={goal.index}
          goal={goal}
          data={data[goal.index]}
        />
      ))}
    </div>
  );
}

interface GoalTrackingViewerSectionProps {
  goal: CarePlanGoalInfo;
  data?: GoalTrackingData;
}

function GoalTrackingViewerSection({ goal, data }: GoalTrackingViewerSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Goal Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-background-secondary/30 hover:bg-background-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">
              Goal {goal.index}: {goal.goalAreaName || "Untitled Goal"}
            </h3>
            <p className="text-sm text-foreground-secondary">
              {goal.targetSkillName || goal.shortTermObjective}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-foreground-tertiary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-foreground-tertiary" />
        )}
      </button>

      {/* Goal Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Goal Info Display */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-foreground-tertiary">Target Skill:</span>{" "}
                <span className="font-medium">{goal.targetSkillName || "N/A"}</span>
              </div>
              <div>
                <span className="text-foreground-tertiary">Current Level:</span>{" "}
                <span className="font-medium">{formatDisplayValue(goal.currentSkillLevel)}</span>
              </div>
              <div>
                <span className="text-foreground-tertiary">Target Level:</span>{" "}
                <span className="font-medium">{formatDisplayValue(goal.targetPerformanceLevel)}</span>
              </div>
              <div>
                <span className="text-foreground-tertiary">Trials:</span>{" "}
                <span className="font-medium">{formatDisplayValue(goal.numberOfTrials)}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-foreground-tertiary">Frequency:</span>{" "}
                <span className="font-medium">{formatDisplayValue(goal.frequency)}</span>
              </div>
            </div>
            {goal.goalStatement && (
              <div className="pt-2 border-t border-primary/10">
                <span className="text-foreground-tertiary text-xs">Goal Statement:</span>
                <p className="text-sm mt-1">{goal.goalStatement}</p>
              </div>
            )}
          </div>

          {/* Activity Tracking Data */}
          {data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField
                  label="Where was this activity practiced?"
                  value={data.activityLocation}
                />
                <DataField
                  label="Circumstances/Antecedent leading to activity"
                  value={data.circumstanceLeadingToActivity}
                />
                <DataField
                  label="Client's response/reaction was"
                  value={data.clientResponse}
                />
                <DataField
                  label="Consequently, client"
                  value={data.consequentlyClient}
                />
                <DataField
                  label="Total time spent on activity (minutes)"
                  value={data.totalTimeMinutes?.toString() || ""}
                />
                <DataField
                  label="Client's Reward"
                  value={data.clientReward}
                />
              </div>

              {/* Task Analysis Table (Read-only) */}
              {goal.steps && goal.steps.length > 0 && data.taskAnalysisData && data.taskAnalysisData.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Analysis</label>
                  <TaskAnalysisViewer
                    steps={goal.steps}
                    data={data.taskAnalysisData}
                  />
                </div>
              )}

              {/* Additional Comments */}
              {data.additionalComments && (
                <DataField
                  label="Additional Comments"
                  value={data.additionalComments}
                />
              )}
            </>
          ) : (
            <p className="text-foreground-tertiary italic text-sm">
              No tracking data recorded for this goal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-foreground-secondary">{label}</label>
      <p className={cn("text-sm", value ? "text-foreground" : "text-foreground-tertiary italic")}>
        {value || "No response"}
      </p>
    </div>
  );
}

interface TaskAnalysisViewerProps {
  steps: Array<{ id: string; name: string }>;
  data: TaskAnalysisStepData[];
}

function TaskAnalysisViewer({ steps, data }: TaskAnalysisViewerProps) {
  const getStepData = (stepId: string): TaskAnalysisStepData | undefined => {
    return data.find((d) => d.stepId === stepId);
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-background-secondary/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary w-12">
              Steps
            </th>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary">
              Task Analysis
            </th>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary w-24">
              Response?
            </th>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary w-36">
              Prompt Used
            </th>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary w-28">
              Opportunities
            </th>
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary w-24">
              Success
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {steps.map((step, index) => {
            const stepData = getStepData(step.id);
            return (
              <tr key={step.id} className="hover:bg-background-secondary/30">
                <td className="px-3 py-2 text-center font-medium text-foreground-tertiary">
                  {index + 1}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {step.name}
                </td>
                <td className="px-3 py-2">
                  {stepData?.response ? (
                    <Badge variant={stepData.response === "Yes" ? "success" : "error"}>
                      {stepData.response}
                    </Badge>
                  ) : (
                    <span className="text-foreground-tertiary">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {stepData?.promptUsed || <span className="text-foreground-tertiary">-</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {stepData?.opportunities || <span className="text-foreground-tertiary">-</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {stepData?.success || <span className="text-foreground-tertiary">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to extract goals from care plan formData
export function extractGoalsFromCarePlan(formData: Record<string, unknown>): CarePlanGoalInfo[] {
  const goals: CarePlanGoalInfo[] = [];

  if (!formData) return goals;

  for (const [, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      const firstItem = value[0] as Record<string, unknown> | undefined;
      if (firstItem && (firstItem.goalSelection || firstItem.goalStatement)) {
        value.forEach((goalData: Record<string, unknown>, index: number) => {
          const goalSelection = goalData.goalSelection as Record<string, unknown> | undefined;
          const taskAnalysisSteps = goalSelection?.taskAnalysisSteps as Array<{
            stepId: string;
            stepName: string;
            baseline: string;
          }> | undefined;

          const steps: Array<{ id: string; name: string }> = [];
          if (taskAnalysisSteps) {
            taskAnalysisSteps.forEach((step) => {
              steps.push({
                id: step.stepId,
                name: step.stepName,
              });
            });
          }

          const goal: CarePlanGoalInfo = {
            index: index + 1,
            goalAreaName: (goalSelection?.goalAreaName as string) || "",
            targetSkillName: (goalSelection?.targetSkillName as string) || "",
            shortTermObjective: (goalSelection?.objectiveName as string) || (goalSelection?.targetSkillName as string) || "",
            currentSkillLevel: (goalData.baseline as string) || "",
            targetPerformanceLevel: (goalData.target as string) || "",
            numberOfTrials: (goalData.numberOfTrials as string) || "",
            frequency: (goalData.frequency as string) || "",
            goalBackground: (goalData.goalBackground as string) || "",
            goalStatement: (goalData.goalStatement as string) || "",
            implementationProcedure: (goalData.implementationProcedure as string) || "",
            steps,
          };
          goals.push(goal);
        });
      }
    }
  }

  return goals;
}
