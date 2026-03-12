"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Target } from "lucide-react";
import { Label, Select, Input, Textarea } from "@/components/ui";
import {
  CarePlanGoalInfo,
  GoalTrackingData,
  GOAL_TRACKING_OPTIONS,
} from "@/lib/visit-notes/types";
import { TaskAnalysisTable } from "./task-analysis-table";

// Helper function to format underscore-separated values into readable text
function formatDisplayValue(value: string): string {
  if (!value) return "N/A";

  // Replace underscores with spaces and capitalize each word
  return value
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface GoalTrackingSectionProps {
  goal: CarePlanGoalInfo;
  data: GoalTrackingData;
  onChange: (data: GoalTrackingData) => void;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

export function GoalTrackingSection({
  goal,
  data,
  onChange,
  disabled = false,
  defaultExpanded = true,
}: GoalTrackingSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const updateField = <K extends keyof GoalTrackingData>(
    field: K,
    value: GoalTrackingData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Goal Header - Click to expand/collapse */}
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
                <span className="text-xs text-foreground-tertiary">Goal Statement:</span>
                <p className="text-sm mt-1">{goal.goalStatement}</p>
              </div>
            )}
          </div>

          {/* Activity Tracking Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activity Location */}
            <div className="space-y-2">
              <Label htmlFor={`activity-location-${goal.index}`}>
                Where was this activity practiced?
              </Label>
              <Select
                id={`activity-location-${goal.index}`}
                value={data.activityLocation}
                onChange={(e) => updateField("activityLocation", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {GOAL_TRACKING_OPTIONS.activityLocation.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            {/* Circumstances */}
            <div className="space-y-2">
              <Label htmlFor={`circumstances-${goal.index}`}>
                Circumstances/Antecedent leading to activity
              </Label>
              <Select
                id={`circumstances-${goal.index}`}
                value={data.circumstanceLeadingToActivity}
                onChange={(e) => updateField("circumstanceLeadingToActivity", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {GOAL_TRACKING_OPTIONS.circumstances.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            {/* Client Response */}
            <div className="space-y-2">
              <Label htmlFor={`response-${goal.index}`}>
                Client&apos;s response/reaction was
              </Label>
              <Select
                id={`response-${goal.index}`}
                value={data.clientResponse}
                onChange={(e) => updateField("clientResponse", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {GOAL_TRACKING_OPTIONS.clientResponse.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            {/* Consequently */}
            <div className="space-y-2">
              <Label htmlFor={`consequently-${goal.index}`}>
                Consequently, client
              </Label>
              <Select
                id={`consequently-${goal.index}`}
                value={data.consequentlyClient}
                onChange={(e) => updateField("consequentlyClient", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {GOAL_TRACKING_OPTIONS.consequently.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            {/* Total Time */}
            <div className="space-y-2">
              <Label htmlFor={`total-time-${goal.index}`}>
                Total time spent on activity (minutes)
              </Label>
              <Input
                id={`total-time-${goal.index}`}
                type="number"
                min={0}
                value={data.totalTimeMinutes ?? ""}
                onChange={(e) =>
                  updateField(
                    "totalTimeMinutes",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                disabled={disabled}
                placeholder="Enter time in minutes"
              />
            </div>

            {/* Client Reward */}
            <div className="space-y-2">
              <Label htmlFor={`reward-${goal.index}`}>
                Client&apos;s Reward
              </Label>
              <Select
                id={`reward-${goal.index}`}
                value={data.clientReward}
                onChange={(e) => updateField("clientReward", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {GOAL_TRACKING_OPTIONS.reward.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Task Analysis Table */}
          {goal.steps && goal.steps.length > 0 && (
            <div className="space-y-2">
              <Label>Task Analysis</Label>
              <TaskAnalysisTable
                steps={goal.steps}
                data={data.taskAnalysisData}
                onChange={(taskData) => updateField("taskAnalysisData", taskData)}
                disabled={disabled}
                goalIndex={goal.index}
              />
            </div>
          )}

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor={`comments-${goal.index}`}>
              Additional Comments (Optional)
            </Label>
            <Textarea
              id={`comments-${goal.index}`}
              value={data.additionalComments}
              onChange={(e) => updateField("additionalComments", e.target.value)}
              disabled={disabled}
              placeholder="Enter any additional observations or notes..."
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}
