"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TrainingCategory } from "@prisma/client";
import { Loader2, Video, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Breadcrumb,
  DatePicker,
} from "@/components/ui";

interface Course {
  id: string;
  title: string;
  category: TrainingCategory;
  durationMinutes: number;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Form state
  const [courseId, setCourseId] = useState(preselectedCourseId || "");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isVirtual, setIsVirtual] = useState(false);
  const [location, setLocation] = useState("");
  const [virtualMeetingUrl, setVirtualMeetingUrl] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [externalInstructor, setExternalInstructor] = useState("");
  const [capacity, setCapacity] = useState<number | "">(20);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  // Update end time based on course duration
  useEffect(() => {
    if (courseId && startTime) {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + course.durationMinutes;
        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMins = endMinutes % 60;
        setEndTime(`${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`);
      }
    }
  }, [courseId, startTime, courses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/training/courses?isActive=true");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch("/api/users?role=ADMIN,MANAGER,COORDINATOR");
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Please select a course");
      return;
    }

    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          scheduledDate: scheduledDate.toISOString(),
          startTime,
          endTime,
          isVirtual,
          location: !isVirtual ? location : undefined,
          virtualMeetingUrl: isVirtual ? virtualMeetingUrl : undefined,
          instructorId: instructorId || undefined,
          externalInstructor: !instructorId && externalInstructor ? externalInstructor : undefined,
          capacity: capacity || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create session");
      }

      const session = await response.json();
      toast.success("Session scheduled successfully");
      router.push(`/training/sessions/${session.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  const instructorOptions = [
    { value: "", label: "Select instructor..." },
    ...instructors.map((i) => ({
      value: i.id,
      label: `${i.firstName} ${i.lastName}`,
    })),
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Sessions", href: "/training?tab=sessions" },
          { label: "Schedule Session" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Schedule Training Session</h1>
        <p className="text-foreground-secondary mt-1">
          Schedule a new training session for a course
        </p>
      </div>

      {isLoadingCourses ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary mb-4">
              No active courses available. Create a course first.
            </p>
            <Button asChild>
              <Link href="/training/courses/new">Create Course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course *</label>
                <Select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <option value="">Select a course...</option>
                  {courseOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                {courseId && (
                  <p className="text-sm text-foreground-secondary">
                    Duration: {courses.find((c) => c.id === courseId)?.durationMinutes} minutes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <DatePicker
                  value={scheduledDate}
                  onChange={(date) => setScheduledDate(date ?? null)}
                  placeholder="Select date"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time *</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time *</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsVirtual(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    !isVirtual
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <MapPin className={`h-5 w-5 mx-auto mb-2 ${!isVirtual ? "text-primary" : "text-foreground-tertiary"}`} />
                  <p className={`text-sm font-medium ${!isVirtual ? "text-primary" : "text-foreground-secondary"}`}>
                    In-Person
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVirtual(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    isVirtual
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Video className={`h-5 w-5 mx-auto mb-2 ${isVirtual ? "text-primary" : "text-foreground-tertiary"}`} />
                  <p className={`text-sm font-medium ${isVirtual ? "text-primary" : "text-foreground-secondary"}`}>
                    Virtual
                  </p>
                </button>
              </div>

              {!isVirtual ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location (room, building, address)"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting URL</label>
                  <Input
                    type="url"
                    value={virtualMeetingUrl}
                    onChange={(e) => setVirtualMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Instructor</label>
                <Select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                >
                  {instructorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              {!instructorId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">External Instructor</label>
                  <Input
                    value={externalInstructor}
                    onChange={(e) => setExternalInstructor(e.target.value)}
                    placeholder="Enter external instructor name"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs">
                <label className="text-sm font-medium">Maximum Attendees</label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
                  min={1}
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-xs text-foreground-tertiary">
                  Leave empty for unlimited capacity
                </p>
              </div>
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
                  Scheduling...
                </>
              ) : (
                "Schedule Session"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
