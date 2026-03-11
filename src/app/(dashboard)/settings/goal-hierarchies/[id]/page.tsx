"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Loader2,
  Edit2,
  Trash2,
  Check,
  X,
  Target,
  Flag,
  ListChecks,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface TaskAnalysisStep {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

interface ShortTermObjective {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  steps: TaskAnalysisStep[];
}

interface TargetSkill {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  objectives: ShortTermObjective[];
}

interface GoalArea {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  targetSkills: TargetSkill[];
}

interface GoalHierarchy {
  id: string;
  name: string;
  description: string | null;
  templateTypes: string[];
  isActive: boolean;
  goalAreas: GoalArea[];
}

// Inline edit component
function InlineEdit({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}) {
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editValue.trim()) {
        onSave(editValue.trim());
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (editValue.trim() && editValue.trim() !== value) {
            onSave(editValue.trim());
          } else {
            onCancel();
          }
        }}
        className="h-8"
      />
    </div>
  );
}

// Expandable tree item component
function TreeItem({
  item,
  level,
  type,
  icon: Icon,
  children,
  onEdit,
  onDelete,
  onAdd,
  addLabel,
}: {
  item: { id: string; name: string; isActive: boolean };
  level: number;
  type: "goalArea" | "targetSkill" | "objective" | "step";
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  onEdit: (name: string) => void;
  onDelete: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className={cn("border-l-2 border-border", level > 0 && "ml-4 pl-4")}>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-lg -ml-2 group",
          "hover:bg-muted/50 transition-colors",
          !item.isActive && "opacity-50"
        )}
      >
        {/* Expand/collapse button */}
        {hasChildren || type !== "step" ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon */}
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />

        {/* Name */}
        {editing ? (
          <InlineEdit
            value={item.name}
            onSave={(name) => {
              onEdit(name);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{item.name}</span>
        )}

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary"
              title={addLabel}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && children}
    </div>
  );
}

export default function GoalHierarchyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hierarchy, setHierarchy] = React.useState<GoalHierarchy | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // For creating new hierarchy
  const [newHierarchyName, setNewHierarchyName] = React.useState("");
  const [newHierarchyDescription, setNewHierarchyDescription] = React.useState("");
  const [newHierarchyTemplateTypes, setNewHierarchyTemplateTypes] = React.useState("");

  // For adding new items
  const [addingTo, setAddingTo] = React.useState<{
    type: "goalArea" | "targetSkill" | "objective" | "step";
    parentId?: string;
  } | null>(null);
  const [newItemName, setNewItemName] = React.useState("");

  const fetchHierarchy = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/goal-hierarchies/${id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setHierarchy(data.hierarchy);
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
      toast.error("Failed to load goal hierarchy");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (id !== "new") {
      fetchHierarchy();
    } else {
      setLoading(false);
    }
  }, [id, fetchHierarchy]);

  const createHierarchy = async () => {
    if (!newHierarchyName.trim()) {
      toast.error("Please enter a name for the hierarchy");
      return;
    }

    setSaving(true);
    try {
      const templateTypes = newHierarchyTemplateTypes
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await fetch("/api/goal-hierarchies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHierarchyName.trim(),
          description: newHierarchyDescription.trim() || undefined,
          templateTypes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create hierarchy");
      }

      const data = await response.json();
      toast.success("Hierarchy created successfully");

      // Navigate to the new hierarchy
      router.replace(`/settings/goal-hierarchies/${data.hierarchy.id}`);
    } catch (error) {
      console.error("Error creating hierarchy:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create hierarchy");
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (
    itemType: "goalArea" | "targetSkill" | "objective" | "step",
    itemId: string,
    name: string
  ) => {
    setSaving(true);
    try {
      const response = await fetch("/api/goal-hierarchies/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, name }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast.success("Updated successfully");
      fetchHierarchy();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (
    itemType: "goalArea" | "targetSkill" | "objective" | "step",
    itemId: string,
    name: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setSaving(true);
    try {
      const response = await fetch("/api/goal-hierarchies/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId }),
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      fetchHierarchy();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!addingTo || !newItemName.trim()) return;
    if (id === "new") {
      toast.error("Please save the hierarchy first before adding items");
      return;
    }

    setSaving(true);
    try {
      let body: Record<string, string>;
      let response: Response;

      if (addingTo.type === "goalArea") {
        response = await fetch(`/api/goal-hierarchies/${id}/goal-areas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newItemName.trim() }),
        });
      } else {
        if (addingTo.type === "targetSkill") {
          body = { type: "targetSkill", goalAreaId: addingTo.parentId!, name: newItemName.trim() };
        } else if (addingTo.type === "objective") {
          body = { type: "objective", targetSkillId: addingTo.parentId!, name: newItemName.trim() };
        } else {
          body = { type: "step", objectiveId: addingTo.parentId!, name: newItemName.trim() };
        }

        response = await fetch("/api/goal-hierarchies/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add");
      }

      toast.success("Added successfully");
      setAddingTo(null);
      setNewItemName("");
      fetchHierarchy();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hierarchy && id !== "new") {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Goal hierarchy not found</h2>
        <Button variant="link" onClick={() => router.push("/settings/goal-hierarchies")}>
          Back to list
        </Button>
      </div>
    );
  }

  // Show create form for new hierarchy
  if (id === "new") {
    return (
      <div className="space-y-6">
        <div>
          <Breadcrumb
            items={[
              { label: "Settings", href: "/settings" },
              { label: "Goal Hierarchies", href: "/settings/goal-hierarchies" },
              { label: "New Hierarchy" },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Create Goal Hierarchy</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hierarchy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={newHierarchyName}
                onChange={(e) => setNewHierarchyName(e.target.value)}
                placeholder="e.g., IISS Goals, Custom Goals"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newHierarchyDescription}
                onChange={(e) => setNewHierarchyDescription(e.target.value)}
                placeholder="Describe the purpose of this goal hierarchy..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Template Types</label>
              <Input
                value={newHierarchyTemplateTypes}
                onChange={(e) => setNewHierarchyTemplateTypes(e.target.value)}
                placeholder="e.g., IISS, FC, ITI (comma-separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the template types this hierarchy should be available for (comma-separated)
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createHierarchy} disabled={saving || !newHierarchyName.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Hierarchy
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Settings", href: "/settings" },
              { label: "Goal Hierarchies", href: "/settings/goal-hierarchies" },
              { label: hierarchy?.name || "New Hierarchy" },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{hierarchy?.name || "New Hierarchy"}</h1>
            {hierarchy && !hierarchy.isActive && (
              <Badge variant="warning">Archived</Badge>
            )}
          </div>
          {hierarchy?.description && (
            <p className="text-muted-foreground mt-1 ml-12">{hierarchy.description}</p>
          )}
        </div>
      </div>

      {/* Template types */}
      {hierarchy && (
        <div className="flex items-center gap-2 ml-12">
          <span className="text-sm text-muted-foreground">Used for:</span>
          {hierarchy.templateTypes.map((type) => (
            <Badge key={type} variant="info">
              {type}
            </Badge>
          ))}
        </div>
      )}

      {/* Add goal area button */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAddingTo({ type: "goalArea" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal Area
        </Button>
        {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Add new item input */}
      {addingTo && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`New ${addingTo.type.replace(/([A-Z])/g, " $1").toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                  if (e.key === "Escape") {
                    setAddingTo(null);
                    setNewItemName("");
                  }
                }}
                autoFocus
              />
              <Button onClick={addItem} disabled={!newItemName.trim() || saving}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setAddingTo(null);
                  setNewItemName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal hierarchy tree */}
      {hierarchy && hierarchy.goalAreas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Goal Areas ({hierarchy.goalAreas.filter((a) => a.isActive).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {hierarchy.goalAreas
                .filter((area) => area.isActive)
                .map((area) => (
                  <TreeItem
                    key={area.id}
                    item={area}
                    level={0}
                    type="goalArea"
                    icon={GitBranch}
                    onEdit={(name) => updateItem("goalArea", area.id, name)}
                    onDelete={() => deleteItem("goalArea", area.id, area.name)}
                    onAdd={() => setAddingTo({ type: "targetSkill", parentId: area.id })}
                    addLabel="Add Target Skill"
                  >
                    {area.targetSkills
                      .filter((skill) => skill.isActive)
                      .map((skill) => (
                        <TreeItem
                          key={skill.id}
                          item={skill}
                          level={1}
                          type="targetSkill"
                          icon={Target}
                          onEdit={(name) => updateItem("targetSkill", skill.id, name)}
                          onDelete={() => deleteItem("targetSkill", skill.id, skill.name)}
                          onAdd={() => setAddingTo({ type: "objective", parentId: skill.id })}
                          addLabel="Add Objective"
                        >
                          {skill.objectives
                            .filter((obj) => obj.isActive)
                            .map((obj) => (
                              <TreeItem
                                key={obj.id}
                                item={obj}
                                level={2}
                                type="objective"
                                icon={Flag}
                                onEdit={(name) => updateItem("objective", obj.id, name)}
                                onDelete={() => deleteItem("objective", obj.id, obj.name)}
                                onAdd={() => setAddingTo({ type: "step", parentId: obj.id })}
                                addLabel="Add Step"
                              >
                                {obj.steps
                                  .filter((step) => step.isActive)
                                  .map((step) => (
                                    <TreeItem
                                      key={step.id}
                                      item={step}
                                      level={3}
                                      type="step"
                                      icon={ListChecks}
                                      onEdit={(name) => updateItem("step", step.id, name)}
                                      onDelete={() => deleteItem("step", step.id, step.name)}
                                    />
                                  ))}
                              </TreeItem>
                            ))}
                        </TreeItem>
                      ))}
                  </TreeItem>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">No goal areas yet</h3>
            <p className="text-muted-foreground text-sm">
              Add your first goal area to start building the hierarchy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
