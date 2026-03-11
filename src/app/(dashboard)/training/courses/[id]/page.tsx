"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TrainingCategory, TrainingFormat, TrainingSessionStatus } from "@prisma/client";
import {
  Loader2,
  Edit,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
  BookOpen,
  Target,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";

interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  category: TrainingCategory;
  format: TrainingFormat;
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
  sessions: {
    id: string;
    scheduledDate: string;
    startTime: string;
    status: TrainingSessionStatus;
    registeredCount: number;
    capacity: number | null;
  }[];
  _count: {
    sessions: number;
    assignments: number;
  };
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

const FORMAT_LABELS: Record<TrainingFormat, string> = {
  IN_PERSON: "In-Person",
  ONLINE_SELF_PACED: "Online (Self-Paced)",
  ONLINE_LIVE: "Online (Live)",
  HYBRID: "Hybrid",
  ON_THE_JOB: "On-the-Job",
  SIMULATION: "Simulation",
};

const STATUS_STYLES: Record<TrainingSessionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-orange-100 text-orange-700",
};

export default function CourseDetailPage() {
  const params = useParams();
  const _router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/training/courses/${courseId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Course not found");
        } else {
          throw new Error("Failed to fetch course");
        }
        return;
      }
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
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
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: "Course" },
          ]}
        />
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

  const upcomingSessions = course.sessions
    .filter((s) => s.status === "SCHEDULED" && new Date(s.scheduledDate) >= new Date())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Courses", href: "/training?tab=courses" },
          { label: course.title },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
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
            <span>{FORMAT_LABELS[course.format]}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.durationMinutes)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/training/sessions/new?courseId=${course.id}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/training/courses/${course.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <Card>
          <CardContent className="py-4">
            <p className="text-foreground-secondary">{course.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course._count.sessions}</p>
                <p className="text-sm text-foreground-secondary">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course._count.assignments}</p>
                <p className="text-sm text-foreground-secondary">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.ceuCredits}</p>
                <p className="text-sm text-foreground-secondary">CEU Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.contactHours}</p>
                <p className="text-sm text-foreground-secondary">Contact Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Course Details */}
        <div className="col-span-2 space-y-6">
          {/* Learning Objectives */}
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

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/training/sessions/new?courseId=${course.id}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/training/sessions/${session.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-background-secondary transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(session.scheduledDate), "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-foreground-secondary">
                          {session.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={STATUS_STYLES[session.status]}>
                          {session.status}
                        </Badge>
                        {session.capacity && (
                          <p className="text-sm text-foreground-secondary mt-1">
                            {session.registeredCount}/{session.capacity} registered
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-foreground-secondary">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming sessions scheduled</p>
                  <Button variant="secondary" size="sm" className="mt-3" asChild>
                    <Link href={`/training/sessions/new?courseId=${course.id}`}>
                      Schedule a Session
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.requiresAssessment && (
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Assessment Required</p>
                    {course.passingScore && (
                      <p className="text-xs text-foreground-secondary">
                        Passing score: {course.passingScore}%
                      </p>
                    )}
                  </div>
                </div>
              )}

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

              {course.requiredForRoles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Required for Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {course.requiredForRoles.map((role) => (
                      <Badge key={role} variant="default" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!course.requiresAssessment &&
                !course.isRecurring &&
                !course.requiredForNewHires &&
                course.requiredForRoles.length === 0 && (
                  <p className="text-sm text-foreground-tertiary">
                    No special requirements
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Format</span>
                <span className="font-medium">{FORMAT_LABELS[course.format]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Duration</span>
                <span className="font-medium">{formatDuration(course.durationMinutes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">CEU Credits</span>
                <span className="font-medium">{course.ceuCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Contact Hours</span>
                <span className="font-medium">{course.contactHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Created</span>
                <span className="font-medium">
                  {format(new Date(course.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
