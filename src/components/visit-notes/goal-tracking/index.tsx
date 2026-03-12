"use client";

import * as React from "react";
import { Loader2, ClipboardList, AlertCircle } from "lucide-react";
import { CarePlanGoalInfo, GoalTrackingData } from "@/lib/visit-notes/types";
import { GoalTrackingSection } from "./goal-tracking-section";

interface GoalTrackingContainerProps {
  carePlanId: string;
  data: Record<number, GoalTrackingData>;
  onChange: (data: Record<number, GoalTrackingData>) => void;
  disabled?: boolean;
}

export function GoalTrackingContainer({
  carePlanId,
  data,
  onChange,
  disabled = false,
}: GoalTrackingContainerProps) {
  const [goals, setGoals] = React.useState<CarePlanGoalInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Store onChange in a ref to avoid dependency issues
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Fetch goals from the care plan
  React.useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/visit-notes/goals?carePlanId=${carePlanId}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch goals");
        }

        setGoals(result.goals || []);

        // Initialize data for each goal if not present
        const initialData: Record<number, GoalTrackingData> = {};
        (result.goals || []).forEach((goal: CarePlanGoalInfo) => {
          initialData[goal.index] = createEmptyGoalData(goal.index);
        });
        onChangeRef.current(initialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch goals");
      } finally {
        setIsLoading(false);
      }
    };

    if (carePlanId) {
      fetchGoals();
    }
  }, [carePlanId]);

  const handleGoalDataChange = (goalIndex: number, goalData: GoalTrackingData) => {
    onChange({
      ...data,
      [goalIndex]: goalData,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-tertiary" />
        <span className="ml-2 text-foreground-secondary">Loading goals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-error">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-secondary">
        <ClipboardList className="h-8 w-8 mx-auto mb-2 text-foreground-tertiary" />
        <p>No treatment goals found in this care plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Goal Tracking</h2>
        <span className="text-sm text-foreground-secondary">
          ({goals.length} goal{goals.length !== 1 ? "s" : ""})
        </span>
      </div>

      {goals.map((goal) => (
        <GoalTrackingSection
          key={goal.index}
          goal={goal}
          data={data[goal.index] || createEmptyGoalData(goal.index)}
          onChange={(goalData) => handleGoalDataChange(goal.index, goalData)}
          disabled={disabled}
          defaultExpanded={goal.index === 1}
        />
      ))}
    </div>
  );
}

// Helper function to create empty goal tracking data
function createEmptyGoalData(goalIndex: number): GoalTrackingData {
  return {
    goalIndex,
    activityLocation: "",
    circumstanceLeadingToActivity: "",
    clientResponse: "",
    consequentlyClient: "",
    totalTimeMinutes: null,
    clientReward: "",
    taskAnalysisData: [],
    additionalComments: "",
  };
}

// Export components
export { GoalTrackingSection } from "./goal-tracking-section";
export { TaskAnalysisTable } from "./task-analysis-table";
export { GoalTrackingViewer, extractGoalsFromCarePlan } from "./goal-tracking-viewer";
