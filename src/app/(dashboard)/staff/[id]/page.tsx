"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  Award,
  Plus,
  AlertTriangle,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { ROLE_LABELS } from "@/lib/permissions";
import { ProfileFieldsRenderer } from "@/components/profile-fields/profile-fields-renderer";
import { FieldValue } from "@/lib/visit-notes/types";

interface Credential {
  id: string;
  licenseNumber: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  status: string;
  documentUrls: string[];
  notes: string | null;
  remindersSentDays: number[];
  createdAt: string;
  updatedAt: string;
  credentialType: {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
  };
}

interface CredentialType {
  id: string;
  name: string;
  category: string;
  isRequired: boolean;
  defaultValidityMonths: number | null;
}

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
  caregiverProfileId: string | null;
  credentials: Credential[];
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

type TabType = "details" | "activity" | "shifts" | "notes" | "certifications";

const CREDENTIAL_STATUS_CONFIG: Record<string, { variant: "default" | "success" | "warning" | "error"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  EXPIRING_SOON: { variant: "warning", label: "Expiring Soon" },
  EXPIRED: { variant: "error", label: "Expired" },
  PENDING_VERIFICATION: { variant: "default", label: "Pending" },
  REVOKED: { variant: "error", label: "Revoked" },
};

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffId = params.id as string;

  const [staff, setStaff] = React.useState<StaffDetails | null>(null);
  const [stats, setStats] = React.useState<StaffStats | null>(null);
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>(() => {
    const tab = searchParams.get("tab");
    if (tab && ["details", "activity", "shifts", "notes", "certifications"].includes(tab)) {
      return tab as TabType;
    }
    return "details";
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Credential state
  const [credentialTypes, setCredentialTypes] = React.useState<CredentialType[]>([]);
  const [showCredentialModal, setShowCredentialModal] = React.useState(false);
  const [editingCredential, setEditingCredential] = React.useState<Credential | null>(null);
  const [credentialForm, setCredentialForm] = React.useState({
    credentialTypeId: "",
    licenseNumber: "",
    issuedDate: "",
    expirationDate: "",
    notes: "",
  });
  const [isCredentialSaving, setIsCredentialSaving] = React.useState(false);

  // File upload state for credentials
  const [uploadedDocumentUrls, setUploadedDocumentUrls] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "CARER" as UserRole,
    isActive: true,
    profileData: {} as Record<string, FieldValue>,
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
        profileData: (data.staff.profileData as Record<string, FieldValue>) || {},
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

  const fetchCredentialTypes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/credentials/types?isActive=true");
      if (response.ok) {
        const data = await response.json();
        setCredentialTypes(data.credentialTypes || []);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
    fetchActivities();
    fetchCredentialTypes();
  }, [fetchStaff, fetchActivities, fetchCredentialTypes]);

  const openAddCredentialModal = () => {
    setEditingCredential(null);
    setCredentialForm({
      credentialTypeId: "",
      licenseNumber: "",
      issuedDate: "",
      expirationDate: "",
      notes: "",
    });
    setUploadedDocumentUrls([]);
    setUploadError(null);
    setShowCredentialModal(true);
  };

  const openEditCredentialModal = (credential: Credential) => {
    setEditingCredential(credential);
    setCredentialForm({
      credentialTypeId: credential.credentialType.id,
      licenseNumber: credential.licenseNumber || "",
      issuedDate: credential.issueDate ? credential.issueDate.split("T")[0] : "",
      expirationDate: credential.expirationDate ? credential.expirationDate.split("T")[0] : "",
      notes: credential.notes || "",
    });
    setUploadedDocumentUrls(credential.documentUrls || []);
    setUploadError(null);
    setShowCredentialModal(true);
  };

  const handleFileUpload = async (file: File | File[] | null) => {
    if (!file || Array.isArray(file)) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "credentials");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload file");
      }

      const data = await response.json();
      setUploadedDocumentUrls((prev) => [...prev, data.fileUrl]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedDocument = (index: number) => {
    setUploadedDocumentUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCredentialSave = async () => {
    if (!credentialForm.credentialTypeId) {
      setError("Please select a credential type");
      return;
    }

    setIsCredentialSaving(true);
    try {
      const url = editingCredential
        ? `/api/credentials/${editingCredential.id}`
        : "/api/credentials";

      const method = editingCredential ? "PATCH" : "POST";

      // Use caregiverProfileId if available, otherwise use staff ID (API will create profile)
      const profileId = staff?.caregiverProfileId || staffId;

      // Build the request body, only including date fields if they have values
      const body = editingCredential
        ? {
            licenseNumber: credentialForm.licenseNumber || null,
            ...(credentialForm.issuedDate && { issueDate: credentialForm.issuedDate }),
            ...(credentialForm.expirationDate && { expirationDate: credentialForm.expirationDate }),
            notes: credentialForm.notes || null,
            documentUrls: uploadedDocumentUrls,
          }
        : {
            caregiverProfileId: profileId,
            credentialTypeId: credentialForm.credentialTypeId,
            licenseNumber: credentialForm.licenseNumber || null,
            issueDate: credentialForm.issuedDate,
            expirationDate: credentialForm.expirationDate,
            notes: credentialForm.notes || null,
            documentUrls: uploadedDocumentUrls,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save credential");
      }

      await fetchStaff();
      setShowCredentialModal(false);
      setEditingCredential(null);
      setUploadedDocumentUrls([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credential");
    } finally {
      setIsCredentialSaving(false);
    }
  };

  const handleCredentialDelete = async (credentialId: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) return;

    try {
      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete credential");
      }

      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credential");
    }
  };

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
          profileData: Object.keys(formData.profileData).length > 0 ? formData.profileData : null,
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
        profileData: (staff.profileData as Record<string, FieldValue>) || {},
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
          <button
            onClick={() => setActiveTab("certifications")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "certifications"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Certifications
            {staff.credentials.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-background-secondary text-xs">
                {staff.credentials.length}
              </span>
            )}
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

            {/* Custom Profile Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileFieldsRenderer
                  type="STAFF_PROFILE"
                  data={formData.profileData}
                  onChange={(data) =>
                    setFormData((prev) => ({ ...prev, profileData: data }))
                  }
                  disabled={!isEditing}
                />
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
                          {Object.entries(activity.changes)
                            .filter(([, value]) => value != null)
                            .map(([key, value]) => (
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

      {activeTab === "certifications" && (
        <div className="space-y-6">
          {/* Credentials Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications & Licenses
              </CardTitle>
              <Button onClick={openAddCredentialModal} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Credential
              </Button>
            </CardHeader>
            <CardContent>
              {staff.credentials.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
                  <p className="text-foreground-secondary">
                    No credentials on file. Click &quot;Add Credential&quot; to add one.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {staff.credentials.map((credential) => {
                    const statusConfig = CREDENTIAL_STATUS_CONFIG[credential.status] || { variant: "default" as const, label: credential.status };
                    const isExpiringSoon = credential.status === "EXPIRING_SOON";
                    const isExpired = credential.status === "EXPIRED";

                    return (
                      <div
                        key={credential.id}
                        className={`p-4 rounded-lg border ${
                          isExpired
                            ? "border-error/30 bg-error/5"
                            : isExpiringSoon
                            ? "border-warning/30 bg-warning/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${
                              isExpired
                                ? "bg-error/10"
                                : isExpiringSoon
                                ? "bg-warning/10"
                                : "bg-primary/10"
                            }`}>
                              <Award className={`w-5 h-5 ${
                                isExpired
                                  ? "text-error"
                                  : isExpiringSoon
                                  ? "text-warning"
                                  : "text-primary"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{credential.credentialType.name}</h4>
                                <Badge variant={statusConfig.variant}>
                                  {statusConfig.label}
                                </Badge>
                                {credential.credentialType.isRequired && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground-secondary mt-1">
                                {credential.credentialType.category}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                {credential.licenseNumber && (
                                  <div>
                                    <p className="text-foreground-tertiary">License #</p>
                                    <p className="font-medium">{credential.licenseNumber}</p>
                                  </div>
                                )}
                                {credential.issueDate && (
                                  <div>
                                    <p className="text-foreground-tertiary">Issued</p>
                                    <p className="font-medium">{formatDate(credential.issueDate)}</p>
                                  </div>
                                )}
                                {credential.expirationDate && (
                                  <div>
                                    <p className="text-foreground-tertiary">Expires</p>
                                    <p className={`font-medium ${isExpired ? "text-error" : isExpiringSoon ? "text-warning" : ""}`}>
                                      {formatDate(credential.expirationDate)}
                                    </p>
                                  </div>
                                )}
                                {credential.notes && (
                                  <div className="col-span-2 md:col-span-4">
                                    <p className="text-foreground-tertiary">Notes</p>
                                    <p className="font-medium">{credential.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {credential.documentUrls.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(credential.documentUrls[0], "_blank")}
                                title={`${credential.documentUrls.length} document(s)`}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditCredentialModal(credential)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCredentialDelete(credential.id)}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credential Modal */}
      {showCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCredentialModal(false)}
          />
          <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {editingCredential ? "Edit Credential" : "Add Credential"}
                </h2>
                <button
                  onClick={() => setShowCredentialModal(false)}
                  className="text-foreground-secondary hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {!editingCredential && (
                  <div className="space-y-2">
                    <Label htmlFor="credentialType" required>Credential Type</Label>
                    <Select
                      id="credentialType"
                      value={credentialForm.credentialTypeId}
                      onChange={(e) =>
                        setCredentialForm((prev) => ({
                          ...prev,
                          credentialTypeId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a credential type</option>
                      {credentialTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.category})
                          {type.isRequired ? " - Required" : ""}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {editingCredential && (
                  <div className="p-3 rounded-lg bg-background-secondary">
                    <p className="text-sm text-foreground-tertiary">Credential Type</p>
                    <p className="font-medium">{editingCredential.credentialType.name}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License/Certificate Number</Label>
                  <Input
                    id="licenseNumber"
                    value={credentialForm.licenseNumber}
                    onChange={(e) =>
                      setCredentialForm((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g., RN-123456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issuedDate">Issue Date</Label>
                    <Input
                      id="issuedDate"
                      type="date"
                      value={credentialForm.issuedDate}
                      onChange={(e) =>
                        setCredentialForm((prev) => ({
                          ...prev,
                          issuedDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={credentialForm.expirationDate}
                      onChange={(e) =>
                        setCredentialForm((prev) => ({
                          ...prev,
                          expirationDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={credentialForm.notes}
                    onChange={(e) =>
                      setCredentialForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Document Upload */}
                <div className="space-y-2">
                  <Label>Proof Document</Label>
                  <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={10 * 1024 * 1024}
                    onChange={handleFileUpload}
                    onError={setUploadError}
                    placeholder="Upload certificate or license (PDF, JPG, PNG)"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-foreground-secondary">Uploading...</p>
                  )}
                  {uploadError && (
                    <p className="text-sm text-error">{uploadError}</p>
                  )}
                  {/* Show uploaded documents */}
                  {uploadedDocumentUrls.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedDocumentUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-md bg-background-secondary border border-border"
                        >
                          <FileText className="w-4 h-4 text-foreground-tertiary" />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm truncate text-primary hover:underline"
                          >
                            {url.split("/").pop()}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeUploadedDocument(index)}
                            className="text-foreground-tertiary hover:text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowCredentialModal(false)}
                  disabled={isCredentialSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleCredentialSave} disabled={isCredentialSaving}>
                  {isCredentialSaving ? "Saving..." : editingCredential ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
