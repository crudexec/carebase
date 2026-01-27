"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientStatus } from "@prisma/client";
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
  Textarea,
} from "@/components/ui";
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Activity,
  ClipboardList,
  Save,
  X,
  UserCheck,
  HeartPulse,
} from "lucide-react";

interface ClientDetails {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  phone: string | null;
  medicalNotes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  sponsor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
  assignedCarer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
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

interface VisitNote {
  id: string;
  submittedAt: string;
  templateName: string;
  templateVersion: number;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  };
}

interface Assessment {
  id: string;
  assessmentType: string;
  status: string;
  totalScore: number | null;
  startedAt: string;
  completedAt: string | null;
  template: {
    id: string;
    name: string;
    maxScore: number | null;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface CarerOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: "Prospect",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const STATUS_COLORS: Record<ClientStatus, "primary" | "success" | "warning" | "error" | "default"> = {
  PROSPECT: "default",
  ONBOARDING: "warning",
  ACTIVE: "success",
  INACTIVE: "error",
};

type TabType = "details" | "activity" | "notes" | "assessments" | "care-plans";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<ClientDetails | null>(null);
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [visitNotes, setVisitNotes] = React.useState<VisitNote[]>([]);
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [carers, setCarers] = React.useState<CarerOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>("details");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form state for editing
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    medicalNotes: "",
    status: "PROSPECT" as ClientStatus,
    assignedCarerId: "",
  });

  const fetchClient = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Client not found");
        }
        throw new Error("Failed to fetch client");
      }
      const data = await response.json();
      setClient(data.client);
      setFormData({
        firstName: data.client.firstName,
        lastName: data.client.lastName,
        dateOfBirth: data.client.dateOfBirth ? data.client.dateOfBirth.split("T")[0] : "",
        address: data.client.address || "",
        phone: data.client.phone || "",
        medicalNotes: data.client.medicalNotes || "",
        status: data.client.status,
        assignedCarerId: data.client.assignedCarer?.id || "",
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const fetchActivities = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/audit-logs?entityType=Client&entityId=${clientId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      }
    } catch {
      // Ignore errors for activity logs
    }
  }, [clientId]);

  const fetchVisitNotes = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/visit-notes?clientId=${clientId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setVisitNotes(data.visitNotes || []);
      }
    } catch {
      // Ignore errors for visit notes
    }
  }, [clientId]);

  const fetchAssessments = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments?clientId=${clientId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch {
      // Ignore errors for assessments
    }
  }, [clientId]);

  const fetchCarers = React.useCallback(async () => {
    try {
      const response = await fetch("/api/staff?role=CARER&limit=100");
      if (response.ok) {
        const data = await response.json();
        setCarers(data.staff);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  React.useEffect(() => {
    fetchClient();
    fetchActivities();
    fetchVisitNotes();
    fetchAssessments();
    fetchCarers();
  }, [fetchClient, fetchActivities, fetchVisitNotes, fetchAssessments, fetchCarers]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || null,
          address: formData.address || null,
          phone: formData.phone || null,
          medicalNotes: formData.medicalNotes || null,
          status: formData.status,
          assignedCarerId: formData.assignedCarerId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update client");
      }

      await fetchClient();
      await fetchActivities();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (client) {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split("T")[0] : "",
        address: client.address || "",
        phone: client.phone || "",
        medicalNotes: client.medicalNotes || "",
        status: client.status,
        assignedCarerId: client.assignedCarer?.id || "",
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

  const calculateAge = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CLIENT_CREATED: "Client created",
      CLIENT_UPDATED: "Client updated",
      CLIENT_DEACTIVATED: "Client deactivated",
      VISIT_NOTE_SUBMITTED: "Visit note submitted",
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

  if (error || !client) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/clients")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">{error || "Client not found"}</p>
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
          <Button variant="ghost" onClick={() => router.push("/clients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-success">
                {client.firstName[0]}
                {client.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-heading-2 text-foreground">
                  {client.firstName} {client.lastName}
                </h1>
                <Badge variant={STATUS_COLORS[client.status]}>
                  {STATUS_LABELS[client.status]}
                </Badge>
              </div>
              <p className="text-body-sm text-foreground-secondary mt-1">
                {client.dateOfBirth && `${calculateAge(client.dateOfBirth)} years old`}
                {client.dateOfBirth && client.address && " • "}
                {client.address}
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
            onClick={() => setActiveTab("activity")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Activity
            {activities.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {activities.length}
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
            {visitNotes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {visitNotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "assessments"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Assessments
            {assessments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {assessments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push(`/clients/${clientId}/care-plans`)}
            className="pb-3 text-sm font-medium border-b-2 transition-colors border-transparent text-foreground-secondary hover:text-foreground"
          >
            <HeartPulse className="w-4 h-4 inline mr-2" />
            Plans of Care
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
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                        }
                      />
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
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        id="status"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as ClientStatus,
                          }))
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-foreground-tertiary">Full Name</p>
                        <p className="font-medium">{client.firstName} {client.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Date of Birth
                        </p>
                        <p className="font-medium">
                          {client.dateOfBirth
                            ? `${formatDate(client.dateOfBirth)} (${calculateAge(client.dateOfBirth)} years)`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary">Status</p>
                        <Badge variant={STATUS_COLORS[client.status]} className="mt-1">
                          {STATUS_LABELS[client.status]}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone
                        </p>
                        <p className="font-medium">{client.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Address
                        </p>
                        <p className="font-medium">{client.address || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Client Since
                        </p>
                        <p className="font-medium">{formatDate(client.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.medicalNotes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, medicalNotes: e.target.value }))
                    }
                    rows={6}
                    placeholder="Enter medical notes, conditions, or care requirements..."
                  />
                ) : (
                  <p className="text-foreground-secondary whitespace-pre-wrap">
                    {client.medicalNotes || "No medical notes recorded."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Assigned Carer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Select
                    value={formData.assignedCarerId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedCarerId: e.target.value,
                      }))
                    }
                  >
                    <option value="">No Carer Assigned</option>
                    {carers.map((carer) => (
                      <option key={carer.id} value={carer.id}>
                        {carer.firstName} {carer.lastName}
                      </option>
                    ))}
                  </Select>
                ) : client.assignedCarer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {client.assignedCarer.firstName[0]}
                        {client.assignedCarer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {client.assignedCarer.firstName} {client.assignedCarer.lastName}
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        {client.assignedCarer.email}
                      </p>
                      {client.assignedCarer.phone && (
                        <p className="text-sm text-foreground-secondary">
                          {client.assignedCarer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground-tertiary">No carer assigned</p>
                )}
              </CardContent>
            </Card>

            {client.sponsor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sponsor / Family Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-warning">
                        {client.sponsor.firstName[0]}
                        {client.sponsor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {client.sponsor.firstName} {client.sponsor.lastName}
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        {client.sponsor.email}
                      </p>
                      {client.sponsor.phone && (
                        <p className="text-sm text-foreground-secondary">
                          {client.sponsor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{" "}
                              {typeof value === "string" ? value : JSON.stringify(value)}
                            </div>
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

      {activeTab === "notes" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visit Notes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/visit-notes/new?clientId=${clientId}`)}
            >
              <ClipboardList className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </CardHeader>
          <CardContent>
            {visitNotes.length === 0 ? (
              <p className="text-center text-foreground-secondary py-8">
                No visit notes recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {visitNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 cursor-pointer hover:bg-background-secondary/50 -mx-4 px-4 py-2 rounded transition-colors"
                    onClick={() => router.push(`/visit-notes/${note.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{note.templateName}</p>
                      <p className="text-sm text-foreground-secondary">
                        Submitted by {note.carer.firstName} {note.carer.lastName}
                      </p>
                      {note.shift && (
                        <p className="text-xs text-foreground-tertiary mt-1">
                          Shift: {formatDateTime(note.shift.scheduledStart)} -{" "}
                          {new Date(note.shift.scheduledEnd).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-foreground-tertiary whitespace-nowrap">
                      {formatDateTime(note.submittedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "assessments" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clinical Assessments</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/assessments/new?clientId=${clientId}`)}
            >
              <FileText className="w-4 h-4 mr-1" />
              New Assessment
            </Button>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  No assessments completed yet.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => router.push(`/assessments/new?clientId=${clientId}`)}
                >
                  Start First Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 cursor-pointer hover:bg-background-secondary/50 -mx-4 px-4 py-2 rounded transition-colors"
                    onClick={() => router.push(`/assessments/${assessment.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{assessment.template.name}</p>
                        <Badge
                          variant={
                            assessment.status === "COMPLETED"
                              ? "success"
                              : assessment.status === "IN_PROGRESS"
                              ? "warning"
                              : "default"
                          }
                        >
                          {assessment.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        {assessment.assessmentType.replace("_", " ")} •{" "}
                        Conducted by {assessment.assessor.firstName} {assessment.assessor.lastName}
                      </p>
                      {assessment.totalScore !== null && assessment.template.maxScore && (
                        <p className="text-xs text-foreground-tertiary mt-1">
                          Score: {assessment.totalScore} / {assessment.template.maxScore}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-foreground-tertiary whitespace-nowrap">
                      {assessment.completedAt
                        ? formatDateTime(assessment.completedAt)
                        : formatDateTime(assessment.startedAt)}
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
