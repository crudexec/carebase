"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TrainingAssignmentReason, TrainingCategory, UserRole } from "@prisma/client";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Edit,
  FileQuestion,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DateInput,
  Input,
  Select,
} from "@/components/ui";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Lesson {
  id: string;
  title: string;
  moduleId: string | null;
  estimatedMinutes: number;
  orderIndex: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: Lesson[];
}

interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  category: TrainingCategory;
  durationMinutes: number;
  ceuCredits: number;
  contactHours: number;
  learningObjectives: string[];
  requiresAssessment: boolean;
  passingScore: number | null;
  isRecurring: boolean;
  recurrenceMonths: number | null;
  requiredForRoles: string[];
  requiredForNewHires: boolean;
  newHireDueDays: number | null;
  isActive: boolean;
  createdAt: string;
  modules: CourseModule[];
  lessons: Lesson[];
  quizzes: {
    id: string;
    title: string;
    passingScore: number;
    questions: unknown[];
  }[];
  _count: {
    assignments: number;
    lessons: number;
    modules: number;
  };
}

interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  ORIENTATION: "Orientation",
  CLINICAL_SKILLS: "Clinical Skills",
  SAFETY: "Safety",
  COMPLIANCE: "Compliance",
  INFECTION_CONTROL: "Infection Control",
  PATIENT_RIGHTS: "Patient Rights",
  DOCUMENTATION: "Documentation",
  EMERGENCY_PROCEDURES: "Emergency Procedures",
  SPECIALTY_CARE: "Specialty Care",
  PROFESSIONAL_DEVELOPMENT: "Professional Development",
  LEADERSHIP: "Leadership",
  TECHNOLOGY: "Technology",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPS_MANAGER: "Ops Manager",
  CLINICAL_DIRECTOR: "Clinical Director",
  STAFF: "Staff",
  SUPERVISOR: "Supervisor",
  CARER: "Carer",
  SPONSOR: "Sponsor",
};

const ASSIGNMENT_REASONS: { value: TrainingAssignmentReason; label: string }[] = [
  { value: "NEW_HIRE", label: "New Hire" },
  { value: "ANNUAL_REQUIREMENT", label: "Annual Requirement" },
  { value: "COMPETENCY_GAP", label: "Competency Gap" },
  { value: "POLICY_CHANGE", label: "Policy Change" },
  { value: "NEW_EQUIPMENT", label: "New Equipment" },
  { value: "REGULATORY_REQUIREMENT", label: "Regulatory Requirement" },
  { value: "PERFORMANCE_IMPROVEMENT", label: "Performance Improvement" },
  { value: "VOLUNTARY", label: "Voluntary" },
];

function dateInputValue(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assignmentReason, setAssignmentReason] = useState<TrainingAssignmentReason>("ANNUAL_REQUIREMENT");
  const [dueDate, setDueDate] = useState(dateInputValue(30));
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/training/courses/${courseId}`);
      if (!response.ok) {
        setError(response.status === 404 ? "Course not found" : "Failed to fetch course");
        return;
      }
      setCourse(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch("/api/users?active=true");
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (!isAssignOpen || users.length > 0) return;
    fetchUsers();
  }, [fetchUsers, isAssignOpen, users.length]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const unassignedLessons = useMemo(() => {
    if (!course) return [];
    const moduleLessonIds = new Set(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
    return course.lessons.filter((lesson) => !moduleLessonIds.has(lesson.id));
  }, [course]);

  const filteredUsers = useMemo(() => {
    const search = assignSearch.trim().toLowerCase();
    if (!search) return users;
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(search) || user.email.toLowerCase().includes(search);
    });
  }, [assignSearch, users]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ));
  };

  const assignCourse = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Select at least one user");
      return;
    }
    if (!dueDate) {
      toast.error("Due date is required");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch("/api/training/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          courseId,
          reason: assignmentReason,
          dueDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to assign course");
      }

      toast.success(data.message || "Training assigned");
      setSelectedUserIds([]);
      setAssignSearch("");
      setIsAssignOpen(false);
      fetchCourse();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign course");
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Training", href: "/training" }, { label: "Course" }]} />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="text-foreground-secondary">{error || "Course not found"}</p>
            <Button asChild className="mt-4">
              <Link href="/training">Back to Training</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quiz = course.quizzes[0];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Courses", href: "/training?tab=courses" },
          { label: course.title },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <Badge variant={course.isActive ? "success" : "default"}>
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-foreground-secondary">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
              {CATEGORY_LABELS[course.category]}
            </span>
            <span>Self-paced</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.durationMinutes)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAssignOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>
          <Button asChild>
            <Link href={`/training/courses/${course.id}/learn`}>
              <Play className="h-4 w-4 mr-2" />
              Start Learning
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/training/courses/${course.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Content
            </Link>
          </Button>
        </div>
      </div>

      {course.description && (
        <Card>
          <CardContent className="py-4">
            <p className="text-foreground-secondary">{course.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<Layers className="h-5 w-5 text-primary" />} value={course.modules.length} label="Modules" />
        <MetricCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} value={course._count.lessons} label="Lessons" />
        <MetricCard icon={<FileQuestion className="h-5 w-5 text-amber-600" />} value={quiz ? quiz.questions.length : 0} label="Quiz Questions" />
        <MetricCard icon={<Award className="h-5 w-5 text-green-600" />} value={course.ceuCredits} label="CEU Credits" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {course.learningObjectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Course Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.modules.length > 0 ? (
                course.modules.map((module, moduleIndex) => (
                  <div key={module.id} className="rounded-lg border">
                    <div className="border-b p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Module {moduleIndex + 1}</Badge>
                        <h3 className="font-semibold">{module.title}</h3>
                      </div>
                      {module.description && (
                        <p className="mt-1 text-sm text-foreground-secondary">{module.description}</p>
                      )}
                    </div>
                    <div className="divide-y">
                      {module.lessons.length > 0 ? module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-secondary text-xs font-medium">
                              {lessonIndex + 1}
                            </span>
                            <p className="text-sm font-medium">{lesson.title}</p>
                          </div>
                          <span className="text-xs text-foreground-tertiary">{lesson.estimatedMinutes} min</span>
                        </div>
                      )) : (
                        <p className="p-4 text-sm text-foreground-tertiary">No lessons in this module yet.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No modules have been added yet.</p>
                  <Button variant="secondary" size="sm" className="mt-3" asChild>
                    <Link href={`/training/courses/${course.id}/edit`}>Add Course Content</Link>
                  </Button>
                </div>
              )}

              {unassignedLessons.length > 0 && (
                <div className="rounded-lg border">
                  <div className="border-b p-4">
                    <h3 className="font-semibold">Additional Lessons</h3>
                  </div>
                  <div className="divide-y">
                    {unassignedLessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-secondary text-xs font-medium">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium">{lesson.title}</p>
                        </div>
                        <span className="text-xs text-foreground-tertiary">{lesson.estimatedMinutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completion Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Complete all lessons</p>
                  <p className="text-xs text-foreground-secondary">
                    {course._count.lessons} lesson{course._count.lessons === 1 ? "" : "s"} in this course
                  </p>
                </div>
              </div>

              {quiz && (
                <div className="flex items-start gap-2">
                  <FileQuestion className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pass final quiz</p>
                    <p className="text-xs text-foreground-secondary">
                      Passing score: {quiz.passingScore}%
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Certificate issued automatically</p>
                  <p className="text-xs text-foreground-secondary">
                    Available after completion
                  </p>
                </div>
              </div>

              {course.isRecurring && (
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Recurring Training</p>
                    <p className="text-xs text-foreground-secondary">
                      Every {course.recurrenceMonths} months
                    </p>
                  </div>
                </div>
              )}

              {course.requiredForNewHires && (
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">New Hire Required</p>
                    {course.newHireDueDays && (
                      <p className="text-xs text-foreground-secondary">
                        Due within {course.newHireDueDays} days of hire
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Format" value="Self-paced" />
              <InfoRow label="Assignments" value={String(course._count.assignments)} />
              <InfoRow label="Duration" value={formatDuration(course.durationMinutes)} />
              <InfoRow label="CEU Credits" value={String(course.ceuCredits)} />
              <InfoRow label="Contact Hours" value={String(course.contactHours)} />
              <InfoRow label="Created" value={format(new Date(course.createdAt), "MMM d, yyyy")} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <SheetTitle>Assign Training</SheetTitle>
            <SheetDescription>
              Assign {course.title} to active users with a due date.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-5 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Select
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value as TrainingAssignmentReason)}
                >
                  {ASSIGNMENT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <DateInput value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Users</label>
              <Input
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Search users"
              />
            </div>

            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                <span className="font-medium">{selectedUserIds.length} selected</span>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setSelectedUserIds([])}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-[420px] overflow-y-auto divide-y">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground-tertiary" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-background-secondary"
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-foreground-secondary">{user.email}</p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </label>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-foreground-secondary">
                    No users found.
                  </p>
                )}
              </div>
            </div>
          </SheetBody>
          <SheetFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignCourse} disabled={isAssigning || selectedUserIds.length === 0}>
              {isAssigning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Assign Course
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background-secondary">{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-foreground-secondary">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-foreground-secondary">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
