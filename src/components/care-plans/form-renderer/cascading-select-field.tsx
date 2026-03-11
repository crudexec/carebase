"use client";

import * as React from "react";
import { Select, Label } from "@/components/ui";
import { Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CascadingSelectValue, TaskAnalysisStepValue, TASK_ANALYSIS_BASELINE_OPTIONS } from "@/lib/care-plans/types";

// Re-export for consumers
export type { CascadingSelectValue } from "@/lib/care-plans/types";

interface TaskAnalysisStep {
  id: string;
  name: string;
  displayOrder: number;
}

interface ShortTermObjective {
  id: string;
  name: string;
  displayOrder: number;
  steps: TaskAnalysisStep[];
}

interface TargetSkill {
  id: string;
  name: string;
  displayOrder: number;
  objectives: ShortTermObjective[];
}

interface GoalArea {
  id: string;
  name: string;
  displayOrder: number;
  targetSkills: TargetSkill[];
}

interface GoalHierarchy {
  id: string;
  name: string;
  description: string | null;
  templateTypes: string[];
  goalAreas: GoalArea[];
}

interface CascadingSelectFieldProps {
  value: CascadingSelectValue | null;
  onChange: (value: CascadingSelectValue | null) => void;
  config: {
    hierarchyId?: string;
    templateType?: string;
    allowMultipleSteps?: boolean;
    showSteps?: boolean;
  };
  disabled?: boolean;
}

export function CascadingSelectField({
  value,
  onChange,
  config,
  disabled = false,
}: CascadingSelectFieldProps) {
  const [hierarchies, setHierarchies] = React.useState<GoalHierarchy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Current selections derived from value or local state
  const [selectedHierarchyId, setSelectedHierarchyId] = React.useState<string>(
    value?.hierarchyId || config.hierarchyId || ""
  );
  const [selectedGoalAreaId, setSelectedGoalAreaId] = React.useState<string>(
    value?.goalAreaId || ""
  );
  const [selectedTargetSkillId, setSelectedTargetSkillId] = React.useState<string>(
    value?.targetSkillId || ""
  );
  const [selectedObjectiveId, setSelectedObjectiveId] = React.useState<string>(
    value?.objectiveId || ""
  );
  const [selectedStepIds, setSelectedStepIds] = React.useState<string[]>(
    value?.selectedStepIds || []
  );
  const [taskAnalysisSteps, setTaskAnalysisSteps] = React.useState<TaskAnalysisStepValue[]>(
    value?.taskAnalysisSteps || []
  );

  // Fetch hierarchies on mount
  React.useEffect(() => {
    async function fetchHierarchies() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("includeData", "true");
        if (config.templateType) {
          params.set("templateType", config.templateType);
        }

        const url = `/api/goal-hierarchies?${params.toString()}`;
        console.log("[CascadingSelect] Fetching hierarchies:", url);

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[CascadingSelect] API error:", response.status, errorData);
          throw new Error(errorData.error || "Failed to fetch goal hierarchies");
        }

        const data = await response.json();
        console.log("[CascadingSelect] Loaded hierarchies:", data.hierarchies?.length || 0, "hierarchies");
        if (data.hierarchies?.[0]) {
          console.log("[CascadingSelect] First hierarchy:", data.hierarchies[0].name, "with", data.hierarchies[0].goalAreas?.length || 0, "goal areas");
        }
        setHierarchies(data.hierarchies || []);

        // If hierarchyId is specified in config and not yet selected, auto-select it
        if (config.hierarchyId && !selectedHierarchyId) {
          setSelectedHierarchyId(config.hierarchyId);
        }
        // If only one hierarchy matches, auto-select it
        else if (data.hierarchies?.length === 1 && !selectedHierarchyId) {
          console.log("[CascadingSelect] Auto-selecting single hierarchy:", data.hierarchies[0].name);
          setSelectedHierarchyId(data.hierarchies[0].id);
        }
      } catch (err) {
        console.error("Error fetching hierarchies:", err);
        setError("Failed to load goal options");
      } finally {
        setLoading(false);
      }
    }

    fetchHierarchies();
  }, [config.hierarchyId, config.templateType, selectedHierarchyId]);

  // Get current hierarchy data
  const currentHierarchy = hierarchies.find((h) => h.id === selectedHierarchyId);
  const currentGoalArea = currentHierarchy?.goalAreas.find((a) => a.id === selectedGoalAreaId);
  const currentTargetSkill = currentGoalArea?.targetSkills.find(
    (s) => s.id === selectedTargetSkillId
  );
  const currentObjective = currentTargetSkill?.objectives.find(
    (o) => o.id === selectedObjectiveId
  );

  // Update parent value when selections change
  const updateValue = React.useCallback(
    (updates: Partial<{
      hierarchyId: string;
      goalAreaId: string;
      targetSkillId: string;
      objectiveId: string;
      stepIds: string[];
      steps: TaskAnalysisStepValue[];
    }>) => {
      const newHierarchyId = updates.hierarchyId ?? selectedHierarchyId;
      const newGoalAreaId = updates.goalAreaId ?? selectedGoalAreaId;
      const newTargetSkillId = updates.targetSkillId ?? selectedTargetSkillId;
      const newObjectiveId = updates.objectiveId ?? selectedObjectiveId;
      const newStepIds = updates.stepIds ?? selectedStepIds;
      const newSteps = updates.steps ?? taskAnalysisSteps;

      // Get the names for each selection
      const hierarchy = hierarchies.find((h) => h.id === newHierarchyId);
      const goalArea = hierarchy?.goalAreas.find((a) => a.id === newGoalAreaId);
      const targetSkill = goalArea?.targetSkills.find((s) => s.id === newTargetSkillId);
      const objective = targetSkill?.objectives.find((o) => o.id === newObjectiveId);
      const stepNames = objective?.steps
        .filter((s) => newStepIds.includes(s.id))
        .map((s) => s.name) || [];

      const newValue: CascadingSelectValue = {
        hierarchyId: newHierarchyId || undefined,
        hierarchyName: hierarchy?.name,
        goalAreaId: newGoalAreaId || undefined,
        goalAreaName: goalArea?.name,
        targetSkillId: newTargetSkillId || undefined,
        targetSkillName: targetSkill?.name,
        objectiveId: newObjectiveId || undefined,
        objectiveName: objective?.name,
        selectedStepIds: newStepIds.length > 0 ? newStepIds : undefined,
        selectedStepNames: stepNames.length > 0 ? stepNames : undefined,
        taskAnalysisSteps: newSteps.length > 0 ? newSteps : undefined,
      };

      // Only emit if we have at least a goal area selected
      if (newGoalAreaId) {
        onChange(newValue);
      } else {
        onChange(null);
      }
    },
    [
      hierarchies,
      selectedHierarchyId,
      selectedGoalAreaId,
      selectedTargetSkillId,
      selectedObjectiveId,
      selectedStepIds,
      taskAnalysisSteps,
      onChange,
    ]
  );

  // Handle hierarchy change
  const handleHierarchyChange = (id: string) => {
    setSelectedHierarchyId(id);
    setSelectedGoalAreaId("");
    setSelectedTargetSkillId("");
    setSelectedObjectiveId("");
    setSelectedStepIds([]);
    updateValue({ hierarchyId: id, goalAreaId: "", targetSkillId: "", objectiveId: "", stepIds: [] });
  };

  // Handle goal area change
  const handleGoalAreaChange = (id: string) => {
    setSelectedGoalAreaId(id);
    setSelectedTargetSkillId("");
    setSelectedObjectiveId("");
    setSelectedStepIds([]);
    updateValue({ goalAreaId: id, targetSkillId: "", objectiveId: "", stepIds: [] });
  };

  // Handle target skill change
  const handleTargetSkillChange = (id: string) => {
    setSelectedTargetSkillId(id);
    setSelectedObjectiveId("");
    setSelectedStepIds([]);
    updateValue({ targetSkillId: id, objectiveId: "", stepIds: [] });
  };

  // Handle objective change
  const handleObjectiveChange = (id: string) => {
    setSelectedObjectiveId(id);
    setSelectedStepIds([]);
    setTaskAnalysisSteps([]);
    updateValue({ objectiveId: id, stepIds: [], steps: [] });
  };

  // Handle step toggle with baseline
  const handleStepToggle = (stepId: string, stepName: string) => {
    const isCurrentlySelected = taskAnalysisSteps.some((s) => s.stepId === stepId);

    let newSteps: TaskAnalysisStepValue[];
    let newStepIds: string[];

    if (isCurrentlySelected) {
      // Remove the step
      newSteps = taskAnalysisSteps.filter((s) => s.stepId !== stepId);
      newStepIds = selectedStepIds.filter((id) => id !== stepId);
    } else {
      // Add the step with default baseline
      newSteps = [...taskAnalysisSteps, { stepId, stepName, baseline: "Not Assessed" }];
      newStepIds = [...selectedStepIds, stepId];
    }

    setTaskAnalysisSteps(newSteps);
    setSelectedStepIds(newStepIds);
    updateValue({ stepIds: newStepIds, steps: newSteps });
  };

  // Handle baseline change for a step
  const handleBaselineChange = (stepId: string, baseline: string) => {
    const newSteps = taskAnalysisSteps.map((s) =>
      s.stepId === stepId ? { ...s, baseline } : s
    );
    setTaskAnalysisSteps(newSteps);
    updateValue({ steps: newSteps });
  };

  // Clear all selections
  const handleClear = () => {
    setSelectedGoalAreaId("");
    setSelectedTargetSkillId("");
    setSelectedObjectiveId("");
    setSelectedStepIds([]);
    setTaskAnalysisSteps([]);
    onChange(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading goal options...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive py-4">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (hierarchies.length === 0) {
    console.log("[CascadingSelect] No hierarchies found for templateType:", config.templateType);
    return (
      <div className="text-sm text-muted-foreground py-4">
        No goal hierarchies available for template type &quot;{config.templateType || "any"}&quot;.
        <br />
        <span className="text-xs">Please ensure goal hierarchies are set up in Settings → Goal Hierarchies.</span>
      </div>
    );
  }

  const showHierarchySelector = !config.hierarchyId && hierarchies.length > 1;
  const showSteps = config.showSteps !== false;

  return (
    <div className="space-y-4">
      {/* Clear button if has value */}
      {value && value.goalAreaId && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear selection
          </button>
        </div>
      )}

      {/* Hierarchy selector (if multiple hierarchies and not pre-configured) */}
      {showHierarchySelector && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Goal Set</Label>
          <Select
            value={selectedHierarchyId}
            onChange={(e) => handleHierarchyChange(e.target.value)}
            disabled={disabled}
            className="w-full"
          >
            <option value="">Select a goal set...</option>
            {hierarchies.map((hierarchy) => (
              <option key={hierarchy.id} value={hierarchy.id}>
                {hierarchy.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Goal Area selector */}
      {(selectedHierarchyId || config.hierarchyId) && currentHierarchy && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Goal Area</Label>
          <Select
            value={selectedGoalAreaId}
            onChange={(e) => handleGoalAreaChange(e.target.value)}
            disabled={disabled}
            className="w-full"
          >
            <option value="">Select a goal area...</option>
            {currentHierarchy.goalAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Target Skill selector */}
      {selectedGoalAreaId && currentGoalArea && currentGoalArea.targetSkills.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Target Skill</Label>
          <Select
            value={selectedTargetSkillId}
            onChange={(e) => handleTargetSkillChange(e.target.value)}
            disabled={disabled}
            className="w-full"
          >
            <option value="">Select a target skill...</option>
            {currentGoalArea.targetSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Short Term Objective selector */}
      {selectedTargetSkillId && currentTargetSkill && currentTargetSkill.objectives.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Short Term Objective</Label>
          <Select
            value={selectedObjectiveId}
            onChange={(e) => handleObjectiveChange(e.target.value)}
            disabled={disabled}
            className="w-full"
          >
            <option value="">Select an objective...</option>
            {currentTargetSkill.objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Task Analysis Steps (table with checkboxes and baseline dropdowns) */}
      {showSteps && selectedObjectiveId && currentObjective && currentObjective.steps.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Task Analysis Steps
          </Label>
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_200px] gap-4 px-4 py-3 bg-background-secondary/50 border-b border-border">
              <span className="text-sm font-medium text-primary">Select Step</span>
              <span className="text-sm font-medium text-primary">Task Analysis</span>
              <span className="text-sm font-medium text-primary">Baseline</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {currentObjective.steps.map((step) => {
                const stepData = taskAnalysisSteps.find((s) => s.stepId === step.id);
                const isSelected = !!stepData;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_200px] gap-4 px-4 py-3 items-center transition-colors",
                      isSelected ? "bg-primary/5" : "hover:bg-background-secondary/50"
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleStepToggle(step.id, step.name)}
                      disabled={disabled}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border bg-white hover:border-primary/50",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>

                    {/* Task Analysis Name */}
                    <span className={cn("text-sm", isSelected && "font-medium text-foreground")}>
                      {step.name}
                    </span>

                    {/* Baseline Dropdown */}
                    <Select
                      value={stepData?.baseline || ""}
                      onChange={(e) => {
                        if (!isSelected) {
                          // Auto-select the step when changing baseline
                          const newSteps = [...taskAnalysisSteps, { stepId: step.id, stepName: step.name, baseline: e.target.value }];
                          const newStepIds = [...selectedStepIds, step.id];
                          setTaskAnalysisSteps(newSteps);
                          setSelectedStepIds(newStepIds);
                          updateValue({ stepIds: newStepIds, steps: newSteps });
                        } else {
                          handleBaselineChange(step.id, e.target.value);
                        }
                      }}
                      disabled={disabled}
                      className={cn(
                        "h-9 text-sm",
                        !isSelected && "opacity-60"
                      )}
                    >
                      <option value="">Select an option</option>
                      {TASK_ANALYSIS_BASELINE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected count */}
          {taskAnalysisSteps.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {taskAnalysisSteps.length} step{taskAnalysisSteps.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      )}

      {/* Selection summary */}
      {value && value.goalAreaName && (
        <div className="rounded-lg border border-border bg-background-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Current Selection:</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Goal Area:</span> {value.goalAreaName}
            </p>
            {value.targetSkillName && (
              <p>
                <span className="font-medium">Target Skill:</span> {value.targetSkillName}
              </p>
            )}
            {value.objectiveName && (
              <p>
                <span className="font-medium">Objective:</span> {value.objectiveName}
              </p>
            )}
            {value.taskAnalysisSteps && value.taskAnalysisSteps.length > 0 && (
              <div>
                <span className="font-medium">Task Analysis Steps:</span>
                <ul className="ml-4 mt-1 space-y-0.5 text-muted-foreground">
                  {value.taskAnalysisSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{step.stepName}</span>
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {step.baseline}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
