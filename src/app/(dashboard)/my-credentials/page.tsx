"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
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
  Award,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  X,
} from "lucide-react";

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
  documentUrls: string[];
  notes: string | null;
  credentialType: CredentialType;
  verifiedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

const STATUS_CONFIG: Record<CredentialStatus, { variant: "default" | "success" | "warning" | "error"; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ACTIVE: { variant: "success", label: "Active", icon: CheckCircle },
  EXPIRING_SOON: { variant: "warning", label: "Expiring Soon", icon: Clock },
  EXPIRED: { variant: "error", label: "Expired", icon: XCircle },
  PENDING_VERIFICATION: { variant: "default", label: "Pending Verification", icon: Clock },
  REVOKED: { variant: "error", label: "Revoked", icon: XCircle },
};

const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  LICENSE: "License",
  CERTIFICATION: "Certification",
  HEALTH: "Health",
  TRAINING: "Training",
  COMPLIANCE: "Compliance",
  OTHER: "Other",
};

export default function MyCredentialsPage() {
  const { data: session } = useSession();
  const [credentials, setCredentials] = React.useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = React.useState<CredentialType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    credentialTypeId: "",
    licenseNumber: "",
    issuingAuthority: "",
    issuingState: "",
    issueDate: "",
    expirationDate: "",
    notes: "",
  });

  const fetchCredentials = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/credentials");
      if (!response.ok) throw new Error("Failed to fetch credentials");
      const data = await response.json();
      setCredentials(data.credentials);
      setError(null);
    } catch {
      setError("Failed to load your credentials");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCredentialTypes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/credentials/types");
      if (!response.ok) throw new Error("Failed to fetch credential types");
      const data = await response.json();
      setCredentialTypes(data.credentialTypes.filter((t: CredentialType & { isActive?: boolean }) => t.isActive !== false));
    } catch {
      console.error("Failed to load credential types");
    }
  }, []);

  React.useEffect(() => {
    fetchCredentials();
    fetchCredentialTypes();
  }, [fetchCredentials, fetchCredentialTypes]);

  const resetForm = () => {
    setFormData({
      credentialTypeId: "",
      licenseNumber: "",
      issuingAuthority: "",
      issuingState: "",
      issueDate: "",
      expirationDate: "",
      notes: "",
    });
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get caregiver profile ID - the API will use the current user's profile
      const profileResponse = await fetch("/api/staff/me");
      if (!profileResponse.ok) throw new Error("Failed to get profile");
      const profileData = await profileResponse.json();

      if (!profileData.user?.caregiverProfile?.id) {
        throw new Error("Caregiver profile not found");
      }

      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caregiverProfileId: profileData.user.caregiverProfile.id,
          credentialTypeId: formData.credentialTypeId,
          licenseNumber: formData.licenseNumber || undefined,
          issuingAuthority: formData.issuingAuthority || undefined,
          issuingState: formData.issuingState || undefined,
          issueDate: formData.issueDate,
          expirationDate: formData.expirationDate,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add credential");
      }

      setShowAddModal(false);
      resetForm();
      await fetchCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
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

  // Group credentials by status
  const groupedCredentials = React.useMemo(() => {
    const expiredOrExpiring = credentials.filter(
      (c) => c.status === "EXPIRED" || c.status === "EXPIRING_SOON"
    );
    const active = credentials.filter((c) => c.status === "ACTIVE");
    const pending = credentials.filter((c) => c.status === "PENDING_VERIFICATION");
    const revoked = credentials.filter((c) => c.status === "REVOKED");

    return { expiredOrExpiring, active, pending, revoked };
  }, [credentials]);

  // Get missing required credentials
  const missingRequired = React.useMemo(() => {
    const userCredentialTypeIds = credentials.map((c) => c.credentialType.id);
    return credentialTypes.filter(
      (t) => t.isRequired && !userCredentialTypeIds.includes(t.id)
    );
  }, [credentials, credentialTypes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">My Credentials</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage your licenses, certifications, and required documents
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Missing Required Credentials Alert */}
      {missingRequired.length > 0 && (
        <Card className="border-error bg-error/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-error">Missing Required Credentials</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  The following credentials are required but not on file:
                </p>
                <ul className="mt-2 space-y-1">
                  {missingRequired.map((type) => (
                    <li key={type.id} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      {type.name}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Missing Credentials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring/Expired Credentials */}
      {groupedCredentials.expiredOrExpiring.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupedCredentials.expiredOrExpiring.map((credential) => {
                const daysUntil = getDaysUntilExpiration(credential.expirationDate);
                const StatusIcon = STATUS_CONFIG[credential.status].icon;
                return (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`w-5 h-5 ${
                          credential.status === "EXPIRED" ? "text-error" : "text-warning"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{credential.credentialType.name}</p>
                        <p className="text-sm text-foreground-secondary">
                          {credential.status === "EXPIRED"
                            ? `Expired ${Math.abs(daysUntil)} days ago`
                            : `Expires in ${daysUntil} days (${formatDate(credential.expirationDate)})`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_CONFIG[credential.status].variant}>
                      {STATUS_CONFIG[credential.status].label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : credentials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">You haven't added any credentials yet</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Credential
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Credentials */}
          {groupedCredentials.active.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Active Credentials ({groupedCredentials.active.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {groupedCredentials.active.map((credential) => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            </div>
          )}

          {/* Pending Verification */}
          {groupedCredentials.pending.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-foreground-secondary" />
                Pending Verification ({groupedCredentials.pending.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {groupedCredentials.pending.map((credential) => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            </div>
          )}
        </div>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Credential"}
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

// Credential Card Component
function CredentialCard({ credential }: { credential: Credential }) {
  const daysUntil = React.useMemo(() => {
    const now = new Date();
    const expDate = new Date(credential.expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [credential.expirationDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{credential.credentialType.name}</p>
              <p className="text-xs text-foreground-secondary">
                {CATEGORY_LABELS[credential.credentialType.category]}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_CONFIG[credential.status].variant}>
            {STATUS_CONFIG[credential.status].label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          {credential.licenseNumber && (
            <div className="flex items-center gap-2 text-foreground-secondary">
              <FileText className="w-4 h-4" />
              <span>#{credential.licenseNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-foreground-secondary">
            <Calendar className="w-4 h-4" />
            <span>
              Expires {formatDate(credential.expirationDate)}
              {daysUntil > 0 && daysUntil <= 90 && (
                <span className={daysUntil <= 30 ? "text-warning ml-1" : "text-foreground-tertiary ml-1"}>
                  ({daysUntil} days)
                </span>
              )}
            </span>
          </div>

          {credential.issuingAuthority && (
            <div className="text-foreground-secondary">
              Issued by: {credential.issuingAuthority}
              {credential.issuingState && ` (${credential.issuingState})`}
            </div>
          )}
        </div>

        {credential.isVerified && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-success">
            <CheckCircle className="w-4 h-4" />
            <span>
              Verified by {credential.verifiedBy?.firstName} {credential.verifiedBy?.lastName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
