"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TrainingSessionStatus, TrainingAttendanceStatus } from "@prisma/client";
import {
  Loader2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";

interface SessionDetails {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
  isVirtual: boolean;
  virtualMeetingUrl: string | null;
  status: TrainingSessionStatus;
  capacity: number | null;
  registeredCount: number;
  cancelledReason: string | null;
  course: {
    id: string;
    title: string;
    category: string;
    format: string;
    durationMinutes: number;
    ceuCredits: number;
  };
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  externalInstructor: string | null;
  attendances: {
    id: string;
    status: TrainingAttendanceStatus;
    completedSuccessfully: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
}

const STATUS_STYLES: Record<TrainingSessionStatus, { bg: string; text: string }> = {
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700" },
  IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
  RESCHEDULED: { bg: "bg-orange-100", text: "text-orange-700" },
};

const ATTENDANCE_STATUS_STYLES: Record<TrainingAttendanceStatus, { bg: string; text: string; label: string }> = {
  REGISTERED: { bg: "bg-gray-100", text: "text-gray-700", label: "Registered" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  ATTENDED: { bg: "bg-green-100", text: "text-green-700", label: "Attended" },
  PARTIALLY_ATTENDED: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Partial" },
  ABSENT: { bg: "bg-red-100", text: "text-red-700", label: "Absent" },
  EXCUSED: { bg: "bg-orange-100", text: "text-orange-700", label: "Excused" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};

export default function SessionDetailPage() {
  const params = useParams();
  const _router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/training/sessions/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Session not found");
        } else {
          throw new Error("Failed to fetch session");
        }
        return;
      }
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendanceStatus = async (attendanceId: string, status: TrainingAttendanceStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/training/sessions/${sessionId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      toast.success("Attendance updated");
      fetchSession();
    } catch {
      toast.error("Failed to update attendance");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSessionStatus = async (status: TrainingSessionStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/training/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      toast.success("Session status updated");
      fetchSession();
    } catch {
      toast.error("Failed to update session status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: "Session" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="text-foreground-secondary">{error || "Session not found"}</p>
            <Button asChild className="mt-4">
              <Link href="/training">Back to Training</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const _availableSpots = session.capacity ? session.capacity - session.registeredCount : null;
  const isFull = session.capacity ? session.registeredCount >= session.capacity : false;
  const _isPast = new Date(session.scheduledDate) < new Date();
  const statusStyle = STATUS_STYLES[session.status];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Sessions", href: "/training?tab=sessions" },
          { label: session.course.title },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{session.course.title}</h1>
            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
              {session.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-foreground-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.scheduledDate), "EEEE, MMMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {session.startTime} - {session.endTime}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {session.status === "SCHEDULED" && (
            <>
              <Button
                variant="secondary"
                onClick={() => updateSessionStatus("IN_PROGRESS")}
                disabled={isUpdating}
              >
                Start Session
              </Button>
              <Button
                variant="ghost"
                onClick={() => updateSessionStatus("CANCELLED")}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </>
          )}
          {session.status === "IN_PROGRESS" && (
            <Button
              onClick={() => updateSessionStatus("COMPLETED")}
              disabled={isUpdating}
            >
              Complete Session
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Attendees */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees
                {session.capacity && (
                  <span className="text-sm font-normal text-foreground-secondary">
                    ({session.registeredCount}/{session.capacity})
                  </span>
                )}
              </CardTitle>
              {session.status === "SCHEDULED" && !isFull && (
                <Button variant="secondary" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Attendee
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {session.attendances.length > 0 ? (
                <div className="space-y-2">
                  {session.attendances.map((attendance) => {
                    const attStyle = ATTENDANCE_STATUS_STYLES[attendance.status];
                    return (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {attendance.user.firstName[0]}
                              {attendance.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {attendance.user.firstName} {attendance.user.lastName}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              {attendance.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${attStyle.bg} ${attStyle.text}`}>
                            {attStyle.label}
                          </Badge>
                          {session.status === "IN_PROGRESS" || session.status === "COMPLETED" ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateAttendanceStatus(attendance.id, "ATTENDED")}
                                disabled={isUpdating}
                                className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
                                title="Mark as Attended"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(attendance.id, "ABSENT")}
                                disabled={isUpdating}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                                title="Mark as Absent"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No attendees registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                {session.isVirtual ? (
                  <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {session.isVirtual ? "Virtual Session" : "In-Person"}
                  </p>
                  {session.isVirtual && session.virtualMeetingUrl ? (
                    <a
                      href={session.virtualMeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Join Meeting
                    </a>
                  ) : session.location ? (
                    <p className="text-sm text-foreground-secondary">{session.location}</p>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">Location TBD</p>
                  )}
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-foreground-tertiary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Instructor</p>
                  {session.instructor ? (
                    <p className="text-sm text-foreground-secondary">
                      {session.instructor.firstName} {session.instructor.lastName}
                    </p>
                  ) : session.externalInstructor ? (
                    <p className="text-sm text-foreground-secondary">
                      {session.externalInstructor} (External)
                    </p>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">Not assigned</p>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-foreground-tertiary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  {session.capacity ? (
                    <p className="text-sm text-foreground-secondary">
                      {session.registeredCount} / {session.capacity} registered
                      {isFull && <span className="text-error ml-1">(Full)</span>}
                    </p>
                  ) : (
                    <p className="text-sm text-foreground-secondary">Unlimited</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Category</span>
                <span className="font-medium">{session.course.category.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Format</span>
                <span className="font-medium">{session.course.format.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Duration</span>
                <span className="font-medium">{session.course.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">CEU Credits</span>
                <span className="font-medium">{session.course.ceuCredits}</span>
              </div>
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href={`/training/courses/${session.course.id}`}>
                    View Course Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
