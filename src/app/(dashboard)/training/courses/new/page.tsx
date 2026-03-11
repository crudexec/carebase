"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrainingCategory, TrainingFormat, UserRole } from "@prisma/client";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Select,
  Checkbox,
  Breadcrumb,
} from "@/components/ui";

const CATEGORY_OPTIONS: { value: TrainingCategory; label: string }[] = [
  { value: "ORIENTATION", label: "Orientation" },
  { value: "CLINICAL_SKILLS", label: "Clinical Skills" },
  { value: "SAFETY", label: "Safety" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "INFECTION_CONTROL", label: "Infection Control" },
  { value: "PATIENT_RIGHTS", label: "Patient Rights" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "EMERGENCY_PROCEDURES", label: "Emergency Procedures" },
  { value: "SPECIALTY_CARE", label: "Specialty Care" },
  { value: "PROFESSIONAL_DEVELOPMENT", label: "Professional Development" },
  { value: "LEADERSHIP", label: "Leadership" },
  { value: "TECHNOLOGY", label: "Technology" },
];

const FORMAT_OPTIONS: { value: TrainingFormat; label: string }[] = [
  { value: "IN_PERSON", label: "In-Person" },
  { value: "ONLINE_SELF_PACED", label: "Online (Self-Paced)" },
  { value: "ONLINE_LIVE", label: "Online (Live)" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ON_THE_JOB", label: "On-the-Job" },
  { value: "SIMULATION", label: "Simulation" },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "CARER", label: "Carer" },
  { value: "ADMIN", label: "Admin" },
  { value: "OPS_MANAGER", label: "Ops Manager" },
  { value: "CLINICAL_DIRECTOR", label: "Clinical Director" },
  { value: "STAFF", label: "Staff" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TrainingCategory>("ORIENTATION");
  const [format, setFormat] = useState<TrainingFormat>("IN_PERSON");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [ceuCredits, setCeuCredits] = useState(0);
  const [contactHours, setContactHours] = useState(0);
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [requiresAssessment, setRequiresAssessment] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceMonths, setRecurrenceMonths] = useState(12);
  const [requiredForRoles, setRequiredForRoles] = useState<UserRole[]>([]);
  const [requiredForNewHires, setRequiredForNewHires] = useState(false);
  const [newHireDueDays, setNewHireDueDays] = useState(30);

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const handleRoleToggle = (role: UserRole) => {
    if (requiredForRoles.includes(role)) {
      setRequiredForRoles(requiredForRoles.filter((r) => r !== role));
    } else {
      setRequiredForRoles([...requiredForRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/training/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          format,
          durationMinutes,
          ceuCredits,
          contactHours,
          learningObjectives,
          requiresAssessment,
          passingScore: requiresAssessment ? passingScore : undefined,
          isRecurring,
          recurrenceMonths: isRecurring ? recurrenceMonths : undefined,
          requiredForRoles,
          requiredForNewHires,
          newHireDueDays: requiredForNewHires ? newHireDueDays : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create course");
      }

      const course = await response.json();
      toast.success("Course created successfully");
      router.push(`/training/courses/${course.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Courses", href: "/training?tab=courses" },
          { label: "New Course" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Training Course</h1>
          <p className="text-foreground-secondary mt-1">
            Create a new training course for your staff
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TrainingCategory)}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format *</label>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as TrainingFormat)}
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes) *</label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CEU Credits</label>
                <Input
                  type="number"
                  value={ceuCredits}
                  onChange={(e) => setCeuCredits(Number(e.target.value))}
                  min={0}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Hours</label>
                <Input
                  type="number"
                  value={contactHours}
                  onChange={(e) => setContactHours(Number(e.target.value))}
                  min={0}
                  step={0.5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Add a learning objective"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddObjective())}
              />
              <Button type="button" variant="secondary" onClick={handleAddObjective}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {learningObjectives.length > 0 && (
              <ul className="space-y-2">
                {learningObjectives.map((obj, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-background-secondary rounded">
                    <span className="text-sm">{obj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="text-foreground-tertiary hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresAssessment"
                checked={requiresAssessment}
                onChange={(e) => setRequiresAssessment(e.target.checked)}
              />
              <label htmlFor="requiresAssessment" className="text-sm font-medium">
                Requires assessment to complete
              </label>
            </div>

            {requiresAssessment && (
              <div className="space-y-2 max-w-xs">
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recurrence */}
        <Card>
          <CardHeader>
            <CardTitle>Recurrence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                This training must be completed periodically
              </label>
            </div>

            {isRecurring && (
              <div className="space-y-2 max-w-xs">
                <label className="text-sm font-medium">Recurrence Period (months)</label>
                <Input
                  type="number"
                  value={recurrenceMonths}
                  onChange={(e) => setRecurrenceMonths(Number(e.target.value))}
                  min={1}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Required for Roles</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleToggle(role.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      requiredForRoles.includes(role.value)
                        ? "bg-primary text-white"
                        : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="requiredForNewHires"
                checked={requiredForNewHires}
                onChange={(e) => setRequiredForNewHires(e.target.checked)}
              />
              <label htmlFor="requiredForNewHires" className="text-sm font-medium">
                Required for new hires
              </label>
            </div>

            {requiredForNewHires && (
              <div className="space-y-2 max-w-xs">
                <label className="text-sm font-medium">Due within (days of hire)</label>
                <Input
                  type="number"
                  value={newHireDueDays}
                  onChange={(e) => setNewHireDueDays(Number(e.target.value))}
                  min={1}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" asChild>
            <Link href="/training">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
