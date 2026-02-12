"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CredentialStatus, CredentialCategory } from "@prisma/client";
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
  Plus,
  RefreshCw,
  Search,
  Edit2,
  X,
  Award,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Upload,
  Trash2,
  Bell,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface CredentialType {
  id: string;
  name: string;
  category: CredentialCategory;
  isRequired: boolean;
}

interface Credential {
  id: string;
  licenseNumber: string | null;
  issuingAuthority: string | null;
  issuingState: string | null;
  issueDate: string;
  expirationDate: string;
  status: CredentialStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  credentialType: CredentialType;
  caregiverProfile: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  verifiedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface CredentialSummary {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

interface AlertSummary {
  critical: number;
  high: number;
  warning: number;
  info: number;
  total: number;
  unread: number;
}

const STATUS_CONFIG: Record<CredentialStatus, { variant: "default" | "success" | "warning" | "error"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  EXPIRING_SOON: { variant: "warning", label: "Expiring Soon" },
  EXPIRED: { variant: "error", label: "Expired" },
  PENDING_VERIFICATION: { variant: "default", label: "Pending" },
  REVOKED: { variant: "error", label: "Revoked" },
};

const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  LICENSE: "License",
  CERTIFICATION: "Certification",
  HEALTH: "Health",
  TRAINING: "Training",
  COMPLIANCE: "Compliance",
  OTHER: "Other",
};

type SortField = "caregiver" | "type" | "expiration" | "status";
type SortDirection = "asc" | "desc";

export default function CredentialsPage() {
  const router = useRouter();
  const [credentials, setCredentials] = React.useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = React.useState<CredentialType[]>([]);
  const [summary, setSummary] = React.useState<CredentialSummary | null>(null);
  const [alertSummary, setAlertSummary] = React.useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");

  // Sorting
  const [sortField, setSortField] = React.useState<SortField>("expiration");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedCredential, setSelectedCredential] = React.useState<Credential | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Caregiver search for add modal
  const [caregiverSearch, setCaregiverSearch] = React.useState("");
  const [caregiverResults, setCaregiverResults] = React.useState<Array<{ id: string; name: string; profileId: string }>>([]);
  const [showCaregiverDropdown, setShowCaregiverDropdown] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    caregiverProfileId: "",
    caregiverName: "",
    credentialTypeId: "",
    licenseNumber: "",
    issuingAuthority: "",
    issuingState: "",
    issueDate: "",
    expirationDate: "",
    notes: "",
  });

  // File upload state
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [uploadedDocumentUrls, setUploadedDocumentUrls] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const fetchCredentials = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/credentials?${params}`);
      if (!response.ok) throw new Error("Failed to fetch credentials");
      const data = await response.json();
      setCredentials(data.credentials);
      setSummary(data.summary);
      setError(null);
    } catch {
      setError("Failed to load credentials");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const fetchCredentialTypes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/credentials/types");
      if (!response.ok) throw new Error("Failed to fetch credential types");
      const data = await response.json();
      setCredentialTypes(data.credentialTypes);
    } catch {
      console.error("Failed to load credential types");
    }
  }, []);

  const fetchAlertSummary = React.useCallback(async () => {
    try {
      const response = await fetch("/api/credentials/alerts?limit=1");
      if (!response.ok) return;
      const data = await response.json();
      setAlertSummary(data.summary);
    } catch {
      console.error("Failed to load alert summary");
    }
  }, []);

  React.useEffect(() => {
    fetchCredentials();
    fetchCredentialTypes();
    fetchAlertSummary();
  }, [fetchCredentials, fetchCredentialTypes, fetchAlertSummary]);

  // Search caregivers
  const searchCaregivers = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setCaregiverResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/staff?search=${encodeURIComponent(query)}&role=CARER`);
      if (!response.ok) return;
      const data = await response.json();
      const results = data.staff
        .filter((s: { caregiverProfile?: { id: string } }) => s.caregiverProfile)
        .map((s: { id: string; firstName: string; lastName: string; caregiverProfile: { id: string } }) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          profileId: s.caregiverProfile.id,
        }));
      setCaregiverResults(results);
    } catch {
      console.error("Failed to search caregivers");
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (caregiverSearch) {
        searchCaregivers(caregiverSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [caregiverSearch, searchCaregivers]);

  const resetForm = () => {
    setFormData({
      caregiverProfileId: "",
      caregiverName: "",
      credentialTypeId: "",
      licenseNumber: "",
      issuingAuthority: "",
      issuingState: "",
      issueDate: "",
      expirationDate: "",
      notes: "",
    });
    setCaregiverSearch("");
    setCaregiverResults([]);
    setDocumentFile(null);
    setUploadedDocumentUrls([]);
    setUploadError(null);
  };

  const handleFileUpload = async (file: File | File[] | null) => {
    if (!file || Array.isArray(file)) {
      setDocumentFile(null);
      return;
    }

    setDocumentFile(file);
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
      setDocumentFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedDocument = (index: number) => {
    setUploadedDocumentUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caregiverProfileId: formData.caregiverProfileId,
          credentialTypeId: formData.credentialTypeId,
          licenseNumber: formData.licenseNumber || undefined,
          issuingAuthority: formData.issuingAuthority || undefined,
          issuingState: formData.issuingState || undefined,
          issueDate: formData.issueDate,
          expirationDate: formData.expirationDate,
          notes: formData.notes || undefined,
          documentUrls: uploadedDocumentUrls.length > 0 ? uploadedDocumentUrls : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add credential");
      }

      setShowAddModal(false);
      resetForm();
      await fetchCredentials();
      await fetchAlertSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredential) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/credentials/${selectedCredential.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: formData.licenseNumber || null,
          issuingAuthority: formData.issuingAuthority || null,
          issuingState: formData.issuingState || null,
          issueDate: formData.issueDate,
          expirationDate: formData.expirationDate,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update credential");
      }

      setShowEditModal(false);
      setSelectedCredential(null);
      resetForm();
      await fetchCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (credential: Credential) => {
    try {
      const response = await fetch(`/api/credentials/${credential.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !credential.isVerified }),
      });

      if (!response.ok) throw new Error("Failed to update verification");
      await fetchCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update verification");
    }
  };

  const openEditModal = (credential: Credential) => {
    setSelectedCredential(credential);
    setFormData({
      caregiverProfileId: credential.caregiverProfile.id,
      caregiverName: `${credential.caregiverProfile.user.firstName} ${credential.caregiverProfile.user.lastName}`,
      credentialTypeId: credential.credentialType.id,
      licenseNumber: credential.licenseNumber || "",
      issuingAuthority: credential.issuingAuthority || "",
      issuingState: credential.issuingState || "",
      issueDate: credential.issueDate.split("T")[0],
      expirationDate: credential.expirationDate.split("T")[0],
      notes: "",
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const filteredAndSortedCredentials = React.useMemo(() => {
    const result = credentials.filter((cred) => {
      const caregiverName = `${cred.caregiverProfile.user.firstName} ${cred.caregiverProfile.user.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        caregiverName.includes(searchQuery.toLowerCase()) ||
        cred.credentialType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cred.licenseNumber && cred.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !statusFilter || cred.status === statusFilter;
      const matchesCategory = !categoryFilter || cred.credentialType.category === categoryFilter;
      const matchesType = !typeFilter || cred.credentialType.id === typeFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "caregiver": {
          const nameA = `${a.caregiverProfile.user.firstName} ${a.caregiverProfile.user.lastName}`;
          const nameB = `${b.caregiverProfile.user.firstName} ${b.caregiverProfile.user.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "type":
          comparison = a.credentialType.name.localeCompare(b.credentialType.name);
          break;
        case "expiration": {
          const dateA = new Date(a.expirationDate).getTime();
          const dateB = new Date(b.expirationDate).getTime();
          comparison = dateA - dateB;
          break;
        }
        case "status": {
          const statusOrder = { EXPIRED: 0, EXPIRING_SOON: 1, PENDING_VERIFICATION: 2, ACTIVE: 3, REVOKED: 4 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [credentials, searchQuery, statusFilter, categoryFilter, typeFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Credential Management</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Track and manage caregiver credentials, licenses, and certifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/credentials/alerts")}
            className="relative"
          >
            <Bell className="w-4 h-4 mr-1" />
            Alerts
            {alertSummary && alertSummary.total > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium bg-error text-white rounded-full">
                {alertSummary.total > 99 ? "99+" : alertSummary.total}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/credentials/types")}>
            <Settings className="w-4 h-4 mr-1" />
            Manage Types
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fetchCredentials()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Total</p>
                  <p className="text-2xl font-semibold">{summary.total}</p>
                </div>
                <Award className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Active</p>
                  <p className="text-2xl font-semibold text-success">{summary.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Expiring Soon</p>
                  <p className="text-2xl font-semibold text-warning">{summary.expiringSoon}</p>
                </div>
                <Clock className="w-8 h-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Expired</p>
                  <p className="text-2xl font-semibold text-error">{summary.expired}</p>
                </div>
                <XCircle className="w-8 h-8 text-error opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Banner */}
      {alertSummary && alertSummary.total > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium">
                    {alertSummary.total} credential alert{alertSummary.total !== 1 ? "s" : ""} require attention
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    {alertSummary.critical > 0 && <span className="text-error">{alertSummary.critical} critical</span>}
                    {alertSummary.critical > 0 && alertSummary.high > 0 && ", "}
                    {alertSummary.high > 0 && <span className="text-warning">{alertSummary.high} high priority</span>}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/credentials/alerts")}>
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
              <Input
                placeholder="Search by caregiver, credential type, or license number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-40"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full lg:w-40"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full lg:w-48"
            >
              <option value="">All Types</option>
              {credentialTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

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

      {/* Credentials Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedCredentials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No credentials found</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Credential
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("caregiver")}
                  >
                    Caregiver <SortIcon field="caregiver" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("type")}
                  >
                    Credential <SortIcon field="type" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">License #</th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("expiration")}
                  >
                    Expiration <SortIcon field="expiration" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Verified</th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCredentials.map((credential) => {
                  const daysUntil = getDaysUntilExpiration(credential.expirationDate);
                  return (
                    <tr
                      key={credential.id}
                      className="border-b border-border hover:bg-background-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">
                              {credential.caregiverProfile.user.firstName[0]}
                              {credential.caregiverProfile.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {credential.caregiverProfile.user.firstName} {credential.caregiverProfile.user.lastName}
                            </p>
                            <p className="text-xs text-foreground-secondary">
                              {credential.caregiverProfile.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{credential.credentialType.name}</p>
                          <p className="text-xs text-foreground-secondary">
                            {CATEGORY_LABELS[credential.credentialType.category]}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-foreground-secondary">
                        {credential.licenseNumber || "-"}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className={daysUntil < 0 ? "text-error" : daysUntil <= 30 ? "text-warning" : ""}>
                            {formatDate(credential.expirationDate)}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            {daysUntil < 0
                              ? `${Math.abs(daysUntil)} days overdue`
                              : daysUntil === 0
                              ? "Expires today"
                              : `${daysUntil} days remaining`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={STATUS_CONFIG[credential.status].variant}>
                          {STATUS_CONFIG[credential.status].label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleVerify(credential)}
                          className={`p-1 rounded ${
                            credential.isVerified
                              ? "text-success hover:text-success/80"
                              : "text-foreground-tertiary hover:text-foreground"
                          }`}
                          title={credential.isVerified ? "Verified - Click to unverify" : "Click to verify"}
                        >
                          {credential.isVerified ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(credential)}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border text-sm text-foreground-secondary">
            Showing {filteredAndSortedCredentials.length} of {credentials.length} credentials
          </div>
        </Card>
      )}

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Add Credential</CardTitle>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCredential} className="space-y-4">
                {/* Caregiver Selection */}
                <div className="space-y-2">
                  <Label htmlFor="caregiver" required>
                    Caregiver
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
                    <Input
                      id="caregiver"
                      placeholder="Search for a caregiver..."
                      value={formData.caregiverName || caregiverSearch}
                      onChange={(e) => {
                        setCaregiverSearch(e.target.value);
                        setFormData((prev) => ({ ...prev, caregiverName: "", caregiverProfileId: "" }));
                        setShowCaregiverDropdown(true);
                      }}
                      onFocus={() => setShowCaregiverDropdown(true)}
                      className="pl-10"
                      required
                    />
                    {showCaregiverDropdown && caregiverResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {caregiverResults.map((cg) => (
                          <button
                            key={cg.id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-background-secondary"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                caregiverProfileId: cg.profileId,
                                caregiverName: cg.name,
                              }));
                              setCaregiverSearch("");
                              setShowCaregiverDropdown(false);
                            }}
                          >
                            {cg.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Credential Type */}
                <div className="space-y-2">
                  <Label htmlFor="credentialType" required>
                    Credential Type
                  </Label>
                  <Select
                    id="credentialType"
                    value={formData.credentialTypeId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, credentialTypeId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select a credential type...</option>
                    {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                      const typesInCategory = credentialTypes.filter((t) => t.category === category);
                      if (typesInCategory.length === 0) return null;
                      return (
                        <optgroup key={category} label={label}>
                          {typesInCategory.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name} {type.isRequired && "(Required)"}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </Select>
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License/Certificate Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder="e.g., CNA-12345"
                  />
                </div>

                {/* Issuing Authority and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                    <Input
                      id="issuingAuthority"
                      value={formData.issuingAuthority}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issuingAuthority: e.target.value }))
                      }
                      placeholder="e.g., Maryland Board"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuingState">Issuing State</Label>
                    <Input
                      id="issuingState"
                      value={formData.issuingState}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issuingState: e.target.value }))
                      }
                      placeholder="e.g., MD"
                    />
                  </div>
                </div>

                {/* Issue and Expiration Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate" required>
                      Issue Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
                      <Input
                        id="issueDate"
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate" required>
                      Expiration Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
                      <Input
                        id="expirationDate"
                        type="date"
                        value={formData.expirationDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
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
                          <span className="flex-1 text-sm truncate">
                            {url.split("/").pop()}
                          </span>
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.caregiverProfileId}>
                    {isSubmitting ? "Adding..." : "Add Credential"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Credential Modal */}
      {showEditModal && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Edit Credential</CardTitle>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCredential(null);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditCredential} className="space-y-4">
                {/* Caregiver (read-only) */}
                <div className="space-y-2">
                  <Label>Caregiver</Label>
                  <Input
                    value={formData.caregiverName}
                    disabled
                    className="bg-background-tertiary"
                  />
                </div>

                {/* Credential Type (read-only) */}
                <div className="space-y-2">
                  <Label>Credential Type</Label>
                  <Input
                    value={selectedCredential.credentialType.name}
                    disabled
                    className="bg-background-tertiary"
                  />
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="editLicenseNumber">License/Certificate Number</Label>
                  <Input
                    id="editLicenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder="e.g., CNA-12345"
                  />
                </div>

                {/* Issuing Authority and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editIssuingAuthority">Issuing Authority</Label>
                    <Input
                      id="editIssuingAuthority"
                      value={formData.issuingAuthority}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issuingAuthority: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editIssuingState">Issuing State</Label>
                    <Input
                      id="editIssuingState"
                      value={formData.issuingState}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issuingState: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Issue and Expiration Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editIssueDate" required>
                      Issue Date
                    </Label>
                    <Input
                      id="editIssueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editExpirationDate" required>
                      Expiration Date
                    </Label>
                    <Input
                      id="editExpirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCredential(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
