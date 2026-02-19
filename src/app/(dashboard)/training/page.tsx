"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrainingCategory, TrainingFormat, TrainingSessionStatus } from "@prisma/client";

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
  };
}

interface TrainingSession {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
  isVirtual: boolean;
  status: TrainingSessionStatus;
  capacity: number | null;
  registeredCount: number;
  course: {
    id: string;
    title: string;
    category: TrainingCategory;
  };
  instructor: {
    firstName: string;
    lastName: string;
  } | null;
  availableSpots: number | null;
  isFull: boolean;
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

const STATUS_COLORS: Record<TrainingSessionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-orange-100 text-orange-700",
};

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "sessions">("dashboard");
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    upcomingSessions: 0,
    overdueAssignments: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, sessionsRes, overdueRes] = await Promise.all([
        fetch("/api/training/courses?isActive=true"),
        fetch("/api/training/sessions?upcoming=true"),
        fetch("/api/training/assignments?overdue=true"),
      ]);

      if (!coursesRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to fetch training data");
      }

      const coursesData = await coursesRes.json();
      const sessionsData = await sessionsRes.json();
      const overdueData = overdueRes.ok ? await overdueRes.json() : [];

      setCourses(coursesData);
      setSessions(sessionsData);

      setStats({
        totalCourses: coursesData.length,
        activeCourses: coursesData.filter((c: TrainingCourse) => c.isActive).length,
        upcomingSessions: sessionsData.length,
        overdueAssignments: overdueData.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training & Education</h1>
          <p className="text-gray-600 mt-1">
            Manage training courses, sessions, and staff assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/training/courses/new"
            className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add Course
          </Link>
          <Link
            href="/training/sessions/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Session
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Courses</div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeCourses}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Upcoming Sessions</div>
          <div className="text-2xl font-bold text-blue-600">{stats.upcomingSessions}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Overdue Assignments</div>
          <div className="text-2xl font-bold text-red-600">{stats.overdueAssignments}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Courses</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "courses", label: "Courses" },
            { id: "sessions", label: "Sessions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading training data...</div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">Upcoming Sessions</h2>
                  <Link href="/training/sessions" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {session.course.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(session.scheduledDate)} at {session.startTime}
                          </div>
                          {session.instructor && (
                            <div className="text-sm text-gray-500">
                              Instructor: {session.instructor.firstName} {session.instructor.lastName}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[session.status]}`}>
                            {session.status}
                          </span>
                          {session.capacity && (
                            <div className="text-sm text-gray-500 mt-1">
                              {session.registeredCount}/{session.capacity} registered
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No upcoming sessions scheduled
                    </div>
                  )}
                </div>
              </div>

              {/* Course Categories */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-semibold text-gray-900">Courses by Category</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                      const count = courses.filter((c) => c.category === category).length;
                      if (count === 0) return null;
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-700">{label}</span>
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {courses.map((course) => (
                  <div key={course.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{course.title}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {CATEGORY_LABELS[course.category]}
                          </span>
                          {course.requiredForNewHires && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              New Hire Required
                            </span>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{FORMAT_LABELS[course.format]}</span>
                          <span>{formatDuration(course.durationMinutes)}</span>
                          {course.ceuCredits > 0 && <span>{course.ceuCredits} CEUs</span>}
                          <span>{course._count.sessions} sessions</span>
                          <span>{course._count.assignments} assignments</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/training/courses/${course.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </Link>
                        <Link
                          href={`/training/courses/${course.id}/edit`}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No courses found. Click "Add Course" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {sessions.map((session) => (
                  <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {session.course.title}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{formatDate(session.scheduledDate)}</span>
                          <span>{session.startTime} - {session.endTime}</span>
                          <span>{session.isVirtual ? "Virtual" : session.location || "Location TBD"}</span>
                        </div>
                        {session.instructor && (
                          <div className="text-sm text-gray-500 mt-1">
                            Instructor: {session.instructor.firstName} {session.instructor.lastName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[session.status]}`}>
                          {session.status}
                        </span>
                        {session.capacity && (
                          <div className="mt-2">
                            <div className="text-sm">
                              {session.registeredCount}/{session.capacity}
                            </div>
                            {session.isFull && (
                              <span className="text-xs text-red-600">Full</span>
                            )}
                          </div>
                        )}
                        <Link
                          href={`/training/sessions/${session.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm block mt-2"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No upcoming sessions. Click "Schedule Session" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
