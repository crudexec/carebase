"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  FileText,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Activity,
  DollarSign,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  Bell,
  Users,
} from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  phone: string | null;
  status: string;
  assignedCarer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface VisitNote {
  id: string;
  templateName: string;
  submittedAt: string;
  shift: {
    scheduledStart: string;
    scheduledEnd: string;
  };
  carer: {
    firstName: string;
    lastName: string;
  };
}

interface UpcomingShift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  carer: {
    firstName: string;
    lastName: string;
  } | null;
  client: {
    firstName: string;
    lastName: string;
  };
}

interface SponsorDashboardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

type TabType = "overview" | "visits" | "notes" | "invoices";

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  SCHEDULED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

// Format helpers
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return formatDate(dateString);
}

export function SponsorDashboard({ user }: SponsorDashboardProps) {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [visitNotes, setVisitNotes] = React.useState<VisitNote[]>([]);
  const [upcomingShifts, setUpcomingShifts] = React.useState<UpcomingShift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = today.toISOString();

        const [clientsRes, notesRes, shiftsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/visit-notes?limit=10"),
          fetch(`/api/scheduling?startDate=${startDate}`),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
        }

        if (notesRes.ok) {
          const data = await notesRes.json();
          setVisitNotes(data.visitNotes || []);
        }

        if (shiftsRes.ok) {
          const data = await shiftsRes.json();
          setUpcomingShifts((data.shifts || []).slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const client = clients[0];
  const age = client ? calculateAge(client.dateOfBirth) : null;

  // Stats
  const stats = {
    totalNotes: visitNotes.length,
    upcomingVisits: upcomingShifts.filter(s => s.status === "SCHEDULED").length,
    completedVisits: upcomingShifts.filter(s => s.status === "COMPLETED").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading-2 text-foreground">Welcome, {user.firstName}</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">Family Member Dashboard</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No clients associated with your account yet.</p>
            <p className="text-sm text-foreground-tertiary mt-2">Please contact your care agency.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">
              {client.firstName[0]}{client.lastName[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-heading-2 text-foreground">
                {client.firstName} {client.lastName}
              </h1>
              <Badge variant={client.status === "ACTIVE" ? "success" : "default"}>
                {client.status === "ACTIVE" ? "Receiving Care" : client.status}
              </Badge>
            </div>
            <p className="text-body-sm text-foreground-secondary mt-1">
              {age ? `${age} years old` : "Your loved one"} {client.assignedCarer && `• Caregiver: ${client.assignedCarer.firstName} ${client.assignedCarer.lastName}`}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push(`/clients/${client.id}`)}>
          View Profile
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.upcomingVisits}</p>
                <p className="text-xs text-foreground-secondary">Upcoming Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ClipboardList className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalNotes}</p>
                <p className="text-xs text-foreground-secondary">Care Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-foreground-secondary">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">$0</p>
                <p className="text-xs text-foreground-secondary">Balance Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("visits")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "visits"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Visits
            {upcomingShifts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {upcomingShifts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Care Reports
            {visitNotes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {visitNotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Invoices
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <User className="w-3 h-3" /> Full Name
                      </p>
                      <p className="font-medium">{client.firstName} {client.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </p>
                      <p className="font-medium">{client.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Age
                      </p>
                      <p className="font-medium">{age ? `${age} years` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </p>
                      <p className="font-medium">{client.address || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Care Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Care Reports</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("notes")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {visitNotes.length === 0 ? (
                  <p className="text-center text-foreground-secondary py-8">
                    No care reports yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {visitNotes.slice(0, 5).map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
                        onClick={() => router.push(`/visit-notes/${note.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{note.templateName}</p>
                            <p className="text-sm text-foreground-secondary">
                              by {note.carer.firstName} {note.carer.lastName} &bull; {getRelativeTime(note.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Caregiver Card */}
            {client.assignedCarer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-error" />
                    Caregiver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-700">
                        {client.assignedCarer.firstName[0]}{client.assignedCarer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {client.assignedCarer.firstName} {client.assignedCarer.lastName}
                      </p>
                      <p className="text-sm text-foreground-secondary">Primary Caregiver</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full mt-4" onClick={() => router.push("/chat")}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingShifts.length === 0 ? (
                  <p className="text-foreground-tertiary text-sm">No upcoming visits</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-blue-700">
                            {new Date(shift.scheduledStart).getDate()}
                          </span>
                          <span className="text-[10px] text-blue-600 uppercase">
                            {new Date(shift.scheduledStart).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            {shift.carer ? `${shift.carer.firstName} ${shift.carer.lastName}` : "Unassigned"}
                          </p>
                        </div>
                        <Badge variant={STATUS_COLORS[shift.status] || "default"} className="text-[10px]">
                          {shift.status}
                        </Badge>
                      </div>
                    ))}
                    {upcomingShifts.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab("visits")}>
                        View all {upcomingShifts.length} visits
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/visit-notes")}>
                  <FileText className="w-4 h-4 mr-2" />
                  View All Reports
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/scheduling")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/invoices")}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "visits" && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No visits scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(shift.scheduledStart)}</p>
                        <p className="text-sm text-foreground-secondary">
                          {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                          {shift.carer && ` • ${shift.carer.firstName} ${shift.carer.lastName}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_COLORS[shift.status] || "default"}>
                      {shift.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardHeader>
            <CardTitle>Care Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {visitNotes.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No care reports submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {visitNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
                    onClick={() => router.push(`/visit-notes/${note.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{note.templateName}</p>
                        <p className="text-sm text-foreground-secondary">
                          {note.carer.firstName} {note.carer.lastName} &bull; {formatDateTime(note.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-foreground-secondary py-8">
              No invoices yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
