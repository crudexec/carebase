"use client";

import * as React from "react";
import { Select } from "@/components/ui";
import {
  TaskAnalysisStepData,
  GOAL_TRACKING_OPTIONS,
} from "@/lib/visit-notes/types";

interface TaskAnalysisTableProps {
  steps: Array<{ id: string; name: string }>;
  data: TaskAnalysisStepData[];
  onChange: (data: TaskAnalysisStepData[]) => void;
  disabled?: boolean;
  goalIndex: number;
}

export function TaskAnalysisTable({
  steps,
  data,
  onChange,
  disabled = false,
  goalIndex,
}: TaskAnalysisTableProps) {
  // Initialize data for steps if not present
  React.useEffect(() => {
    if (data.length === 0 && steps.length > 0) {
      const initialData: TaskAnalysisStepData[] = steps.map((step) => ({
        stepId: step.id,
        stepName: step.name,
        response: "",
        promptUsed: "",
        opportunities: "",
        success: "",
      }));
      onChange(initialData);
    }
  }, [steps, data.length, onChange]);

  const updateStepData = (
    stepId: string,
    field: keyof TaskAnalysisStepData,
    value: string
  ) => {
    const newData = data.map((item) =>
      item.stepId === stepId ? { ...item, [field]: value } : item
    );
    onChange(newData);
  };

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
                  <Select
                    value={stepData?.response || ""}
                    onChange={(e) =>
                      updateStepData(step.id, "response", e.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-xs"
                    data-testid={`response-goal${goalIndex}-step${index + 1}`}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={stepData?.promptUsed || ""}
                    onChange={(e) =>
                      updateStepData(step.id, "promptUsed", e.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-xs"
                    data-testid={`prompt-goal${goalIndex}-step${index + 1}`}
                  >
                    <option value="">Select</option>
                    {GOAL_TRACKING_OPTIONS.promptUsed.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={stepData?.opportunities || ""}
                    onChange={(e) =>
                      updateStepData(step.id, "opportunities", e.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-xs"
                    data-testid={`opportunities-goal${goalIndex}-step${index + 1}`}
                  >
                    <option value="">Select</option>
                    {GOAL_TRACKING_OPTIONS.opportunities.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={stepData?.success || ""}
                    onChange={(e) =>
                      updateStepData(step.id, "success", e.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-xs"
                    data-testid={`success-goal${goalIndex}-step${index + 1}`}
                  >
                    <option value="">Select</option>
                    {GOAL_TRACKING_OPTIONS.success.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
