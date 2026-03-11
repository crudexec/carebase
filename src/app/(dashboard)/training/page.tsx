"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrainingCategory, TrainingFormat } from "@prisma/client";
import {
  Plus,
  Loader2,
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  GraduationCap,
  Trophy,
  Target,
  FileText,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  category: TrainingCategory;
  format: TrainingFormat;
  durationMinutes: number;
  ceuCredits: number;
  contactHours: number;
  isRecurring: boolean;
  recurrenceMonths: number | null;
  requiredForNewHires: boolean;
  isActive: boolean;
  _count: {
    sessions: number;
    assignments: number;
    lessons: number;
  };
  // E-learning progress
  totalLessons: number;
  lessonsCompleted: number;
  hasQuiz: boolean;
  quizPassed: boolean;
  bestQuizScore: number | null;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
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

const CATEGORY_COLORS: Record<TrainingCategory, string> = {
  ORIENTATION: "bg-blue-100 text-blue-700",
  CLINICAL_SKILLS: "bg-purple-100 text-purple-700",
  SAFETY: "bg-orange-100 text-orange-700",
  COMPLIANCE: "bg-red-100 text-red-700",
  INFECTION_CONTROL: "bg-green-100 text-green-700",
  PATIENT_RIGHTS: "bg-pink-100 text-pink-700",
  DOCUMENTATION: "bg-slate-100 text-slate-700",
  EMERGENCY_PROCEDURES: "bg-amber-100 text-amber-700",
  SPECIALTY_CARE: "bg-cyan-100 text-cyan-700",
  PROFESSIONAL_DEVELOPMENT: "bg-indigo-100 text-indigo-700",
  LEADERSHIP: "bg-violet-100 text-violet-700",
  TECHNOLOGY: "bg-teal-100 text-teal-700",
};

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<"my-learning" | "all-courses">("my-learning");
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/training/courses?isActive=true");
      if (!response.ok) {
        throw new Error("Failed to fetch training data");
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter((c) => c.status === "in_progress").length,
    completed: courses.filter((c) => c.status === "completed").length,
    totalCEUs: courses
      .filter((c) => c.status === "completed")
      .reduce((sum, c) => sum + c.ceuCredits, 0),
  };

  // Filter courses based on tab
  const filteredCourses =
    activeTab === "my-learning"
      ? courses.filter((c) => c.status === "in_progress" || c.status === "completed")
      : courses;

  // Sort courses - in progress first, then not started, then completed
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const statusOrder = { in_progress: 0, not_started: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Training" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training & Learning</h1>
          <p className="text-foreground-secondary mt-1">
            Complete courses and quizzes to earn certifications
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/training/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Link>
        </Button>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-foreground-secondary">Available Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-foreground-secondary">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-foreground-secondary">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCEUs}</p>
                <p className="text-sm text-foreground-secondary">CEUs Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-1">
          {[
            { id: "my-learning", label: "My Learning", count: stats.inProgress + stats.completed },
            { id: "all-courses", label: "All Courses", count: stats.totalCourses },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
              <Badge variant="default" className="text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 text-error p-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      ) : sortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} formatDuration={formatDuration} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-foreground-tertiary mb-4" />
            {activeTab === "my-learning" ? (
              <>
                <p className="text-foreground-secondary">You haven&apos;t started any courses yet</p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setActiveTab("all-courses")}
                >
                  Browse All Courses
                </Button>
              </>
            ) : (
              <>
                <p className="text-foreground-secondary">No courses available</p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Click &quot;Add Course&quot; to create one
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CourseCard({
  course,
  formatDuration,
}: {
  course: TrainingCourse;
  formatDuration: (minutes: number) => string;
}) {
  const getStatusBadge = () => {
    switch (course.status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-100 text-amber-700">
            <Circle className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCTAButton = () => {
    if (course.totalLessons === 0) {
      return (
        <Button variant="secondary" size="sm" disabled>
          No Content
        </Button>
      );
    }

    switch (course.status) {
      case "completed":
        return (
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/training/courses/${course.id}`}>
              Review
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        );
      case "in_progress":
        return (
          <Button size="sm" asChild>
            <Link href={`/training/courses/${course.id}/learn`}>
              Continue
              <Play className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        );
      default:
        return (
          <Button size="sm" asChild>
            <Link href={`/training/courses/${course.id}/learn`}>
              Start Learning
              <Play className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        );
    }
  };

  return (
    <Card className="flex flex-col group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={cn("text-xs", CATEGORY_COLORS[course.category])}>
            {CATEGORY_LABELS[course.category]}
          </Badge>
          {getStatusBadge()}
        </div>
        <Link href={`/training/courses/${course.id}`} className="block group-hover:text-primary transition-colors">
          <CardTitle className="text-base mt-2 line-clamp-2">{course.title}</CardTitle>
        </Link>
        {course.description && (
          <p className="text-sm text-foreground-secondary line-clamp-2 mt-1">
            {course.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end pt-0">
        {/* Course Info */}
        <div className="flex items-center gap-3 text-xs text-foreground-tertiary mb-3">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {course.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.durationMinutes)}
          </span>
          {course.ceuCredits > 0 && (
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {course.ceuCredits} CEUs
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {course.totalLessons > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground-secondary">
                {course.lessonsCompleted}/{course.totalLessons} lessons
              </span>
              {course.hasQuiz && (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    course.quizPassed ? "text-green-600" : "text-foreground-tertiary"
                  )}
                >
                  {course.quizPassed ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Quiz Passed
                    </>
                  ) : course.bestQuizScore !== null ? (
                    `Best: ${course.bestQuizScore}%`
                  ) : (
                    "Quiz Required"
                  )}
                </span>
              )}
            </div>
            <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  course.status === "completed" ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Required Badge & CTA */}
        <div className="flex items-center justify-between">
          {course.requiredForNewHires ? (
            <Badge variant="warning" className="text-xs">
              Required
            </Badge>
          ) : (
            <span />
          )}
          {getCTAButton()}
        </div>
      </CardContent>
    </Card>
  );
}
