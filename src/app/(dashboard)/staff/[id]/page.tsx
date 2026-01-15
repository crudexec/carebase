"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Select,
} from "@/components/ui";
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Activity,
  ClipboardList,
  Save,
  X,
  Users,
  CheckCircle,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";

interface StaffDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  profileData: Record<string, unknown> | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  carerClients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    status: string;
  }>;
  shifts: Array<{
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  carerVisitNotes: Array<{
    id: string;
    submittedAt: string;
    template: {
      id: string;
      name: string;
    };
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface StaffStats {
  totalShifts: number;
  completedShifts: number;
  completionRate: number;
  totalVisitNotes: number;
  assignedClients: number;
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  SCHEDULED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  OPS_MANAGER: "bg-blue-100 text-blue-800",
  CLINICAL_DIRECTOR: "bg-green-100 text-green-800",
  STAFF: "bg-gray-100 text-gray-800",
  SUPERVISOR: "bg-orange-100 text-orange-800",
  CARER: "bg-teal-100 text-teal-800",
};

type TabType = "details" | "activity" | "shifts" | "notes";

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [staff, setStaff] = React.useState<StaffDetails | null>(null);
  const [stats, setStats] = React.useState<StaffStats | null>(null);
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>("details");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form state for editing
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "CARER" as UserRole,
    isActive: true,
  });

  const fetchStaff = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/staff/${staffId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Staff member not found");
        }
        throw new Error("Failed to fetch staff member");
      }
      const data = await response.json();
      setStaff(data.staff);
      setStats(data.stats);
      setFormData({
        firstName: data.staff.firstName,
        lastName: data.staff.lastName,
        phone: data.staff.phone || "",
        role: data.staff.role,
        isActive: data.staff.isActive,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff member");
    } finally {
      setIsLoading(false);
    }
  }, [staffId]);

  const fetchActivities = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/audit-logs?entityType=User&entityId=${staffId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      }
    } catch {
      // Ignore errors for activity logs
    }
  }, [staffId]);

  React.useEffect(() => {
    fetchStaff();
    fetchActivities();
  }, [fetchStaff, fetchActivities]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
          role: formData.role,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update staff member");
      }

      await fetchStaff();
      await fetchActivities();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff member");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone || "",
        role: staff.role,
        isActive: staff.isActive,
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      STAFF_CREATED: "Account created",
      STAFF_UPDATED: "Profile updated",
      STAFF_DEACTIVATED: "Account deactivated",
      LOGIN: "Logged in",
      PASSWORD_CHANGED: "Password changed",
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/staff")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Staff
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">{error || "Staff member not found"}</p>
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
          <Button variant="ghost" onClick={() => router.push("/staff")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">
                {staff.firstName[0]}
                {staff.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-heading-2 text-foreground">
                  {staff.firstName} {staff.lastName}
                </h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[staff.role] || "bg-gray-100 text-gray-800"}`}>
                  {ROLE_LABELS[staff.role] || staff.role}
                </span>
                {!staff.isActive && (
                  <Badge variant="error">Inactive</Badge>
                )}
              </div>
              <p className="text-body-sm text-foreground-secondary mt-1">
                {staff.email}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={cancelEdit} disabled={isSaving}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.totalShifts}</p>
                  <p className="text-xs text-foreground-secondary">Total Shifts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.completionRate}%</p>
                  <p className="text-xs text-foreground-secondary">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.totalVisitNotes}</p>
                  <p className="text-xs text-foreground-secondary">Visit Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.assignedClients}</p>
                  <p className="text-xs text-foreground-secondary">Assigned Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "shifts"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Shifts
            {staff.shifts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {staff.shifts.length}
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
            Visit Notes
            {staff.carerVisitNotes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {staff.carerVisitNotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Activity
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" required>First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" required>Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        id="role"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            role: e.target.value as UserRole,
                          }))
                        }
                      >
                        {Object.entries(ROLE_LABELS).filter(([key]) => key !== "SPONSOR").map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                        }
                        className="rounded border-border"
                      />
                      <Label htmlFor="isActive">Active Account</Label>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-foreground-tertiary">Full Name</p>
                        <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </p>
                        <p className="font-medium">{staff.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Role
                        </p>
                        <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[staff.role] || "bg-gray-100 text-gray-800"}`}>
                          {ROLE_LABELS[staff.role] || staff.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone
                        </p>
                        <p className="font-medium">{staff.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Last Login
                        </p>
                        <p className="font-medium">{staff.lastLogin ? formatDateTime(staff.lastLogin) : "Never"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Member Since
                        </p>
                        <p className="font-medium">{formatDate(staff.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Assigned Clients */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assigned Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staff.carerClients.length === 0 ? (
                  <p className="text-foreground-tertiary text-sm">No clients assigned</p>
                ) : (
                  <div className="space-y-3">
                    {staff.carerClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary cursor-pointer"
                        onClick={() => router.push(`/clients/${client.id}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-success">
                            {client.firstName[0]}{client.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-xs text-foreground-secondary">{client.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "shifts" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            {staff.shifts.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No shifts recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {staff.shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
                    onClick={() => router.push("/scheduling")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {shift.client.firstName} {shift.client.lastName}
                        </p>
                        <p className="text-sm text-foreground-secondary">
                          {formatDate(shift.scheduledStart)} &bull; {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
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
            <CardTitle>Recent Visit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {staff.carerVisitNotes.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No visit notes submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {staff.carerVisitNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
                    onClick={() => router.push(`/visit-notes/${note.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{note.template.name}</p>
                        <p className="text-sm text-foreground-secondary">
                          {note.client.firstName} {note.client.lastName} &bull; {formatDateTime(note.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No activity recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-foreground-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{getActionLabel(activity.action)}</p>
                      <p className="text-sm text-foreground-secondary">
                        by {activity.user.firstName} {activity.user.lastName}
                      </p>
                      {activity.changes && Object.keys(activity.changes).length > 0 && (
                        <div className="mt-2 text-xs text-foreground-tertiary bg-background-secondary rounded p-2">
                          {Object.entries(activity.changes).map(([key, value]) => (
                            value && (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {typeof value === "string" ? value : JSON.stringify(value)}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-foreground-tertiary whitespace-nowrap">
                      {formatDateTime(activity.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
