"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Label,
  Textarea,
} from "@/components/ui";
import {
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Bell,
} from "lucide-react";
import { hasPermission, PERMISSIONS, ROLE_LABELS } from "@/lib/permissions";

interface IncidentDetail {
  id: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  description: string;
  actionsTaken: string;
  witnesses: string | null;
  attachments: string[];
  status: IncidentStatus;
  sponsorNotified: boolean;
  createdAt: string;
  updatedAt: string;
  reporterId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    sponsor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  approvedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  approvedAt: string | null;
}

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const SEVERITY_COLORS: Record<IncidentSeverity, "default" | "warning" | "error"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "error",
  CRITICAL: "error",
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<IncidentStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

export default function IncidentDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = React.useState<IncidentDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Permissions
  const canApprove = session?.user
    ? hasPermission(session.user.role, PERMISSIONS.INCIDENT_APPROVE) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  const canDelete = session?.user
    ? hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  const canEdit = session?.user
    ? (incident?.reporterId === session.user.id && incident?.status === "PENDING") ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  const fetchIncident = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/incidents/${incidentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Incident not found");
        }
        throw new Error("Failed to fetch incident");
      }
      const data = await response.json();
      setIncident(data.incident);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incident");
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  React.useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
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

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!response.ok) throw new Error("Failed to approve incident");
      await fetchIncident();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve incident");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!response.ok) throw new Error("Failed to reject incident");
      await fetchIncident();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject incident");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete incident");
      router.push("/incidents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete incident");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-error mb-4" />
            <h2 className="text-heading-3 text-foreground mb-2">
              {error || "Incident not found"}
            </h2>
            <Button className="mt-4" onClick={() => router.push("/incidents")}>
              Back to Incidents
            </Button>
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
          <Button variant="ghost" onClick={() => router.push("/incidents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-heading-2 text-foreground">Incident Report</h1>
              <Badge
                variant={SEVERITY_COLORS[incident.severity]}
                className={
                  incident.severity === "CRITICAL" ? "bg-error text-white animate-pulse" : ""
                }
              >
                {SEVERITY_LABELS[incident.severity]}
              </Badge>
              <Badge variant={STATUS_COLORS[incident.status]}>
                {STATUS_LABELS[incident.status]}
              </Badge>
            </div>
            <p className="text-body-sm text-foreground-secondary mt-1">
              {incident.category} - {formatDate(incident.incidentDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && incident.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                onClick={handleApprove}
                disabled={isProcessing}
                className="text-success hover:text-success hover:bg-success/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="ghost"
                onClick={handleReject}
                disabled={isProcessing}
                className="text-error hover:text-error hover:bg-error/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-error hover:text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-error">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-error/10">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Delete Incident Report</h3>
                <p className="text-sm text-foreground-secondary mt-1">
                  Are you sure you want to delete this incident report? This action cannot be
                  undone.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="error"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Deleting..." : "Delete"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background-secondary">
                    <Calendar className="w-4 h-4 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-tertiary">Date</p>
                    <p className="font-medium">{formatDate(incident.incidentDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background-secondary">
                    <Clock className="w-4 h-4 text-foreground-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-tertiary">Time</p>
                    <p className="font-medium">{formatTime(incident.incidentDate)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-background-secondary">
                  <MapPin className="w-4 h-4 text-foreground-secondary" />
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Location</p>
                  <p className="font-medium">{incident.location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <div className="p-4 rounded-md bg-background-secondary whitespace-pre-wrap">
                  {incident.description}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Actions Taken</Label>
                <div className="p-4 rounded-md bg-background-secondary whitespace-pre-wrap">
                  {incident.actionsTaken}
                </div>
              </div>

              {incident.witnesses && (
                <div className="space-y-2">
                  <Label>Witnesses</Label>
                  <div className="p-4 rounded-md bg-background-secondary">
                    {incident.witnesses}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Status */}
          {incident.status !== "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {incident.status === "APPROVED" ? "Approval Details" : "Rejection Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      incident.status === "APPROVED" ? "bg-success/10" : "bg-error/10"
                    }`}
                  >
                    {incident.status === "APPROVED" ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <XCircle className="w-6 h-6 text-error" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {incident.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
                      {incident.approvedBy?.firstName} {incident.approvedBy?.lastName}
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      {incident.approvedAt && formatDateTime(incident.approvedAt)}
                    </p>
                  </div>
                </div>

                {incident.status === "APPROVED" && incident.client.sponsor && (
                  <div className="mt-4 p-3 rounded-md bg-background-secondary flex items-center gap-3">
                    <Bell
                      className={`w-4 h-4 ${
                        incident.sponsorNotified ? "text-success" : "text-foreground-tertiary"
                      }`}
                    />
                    <span className="text-sm">
                      {incident.sponsorNotified
                        ? `Sponsor (${incident.client.sponsor.firstName} ${incident.client.sponsor.lastName}) has been notified`
                        : "Sponsor notification pending"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="font-medium text-error">
                    {incident.client.firstName[0]}
                    {incident.client.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {incident.client.firstName} {incident.client.lastName}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => router.push(`/clients/${incident.client.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              {incident.client.phone && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Phone</p>
                  <p className="text-sm">{incident.client.phone}</p>
                </div>
              )}

              {incident.client.address && (
                <div>
                  <p className="text-xs text-foreground-tertiary">Address</p>
                  <p className="text-sm">{incident.client.address}</p>
                </div>
              )}

              {incident.client.sponsor && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-foreground-tertiary mb-2">Sponsor</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {incident.client.sponsor.firstName[0]}
                        {incident.client.sponsor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {incident.client.sponsor.firstName} {incident.client.sponsor.lastName}
                      </p>
                      <p className="text-xs text-foreground-tertiary">
                        {incident.client.sponsor.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle>Reported By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-primary">
                    {incident.reporter.firstName[0]}
                    {incident.reporter.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {incident.reporter.firstName} {incident.reporter.lastName}
                  </p>
                  <Badge variant="default" className="mt-1">
                    {ROLE_LABELS[incident.reporter.role as keyof typeof ROLE_LABELS] ||
                      incident.reporter.role}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-foreground-tertiary">Email</p>
                <p className="text-sm">{incident.reporter.email}</p>
              </div>

              <div>
                <p className="text-xs text-foreground-tertiary">Reported On</p>
                <p className="text-sm">{formatDateTime(incident.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-0.5 h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Incident Occurred</p>
                    <p className="text-xs text-foreground-tertiary">
                      {formatDateTime(incident.incidentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {incident.status !== "PENDING" && (
                      <div className="w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Report Submitted</p>
                    <p className="text-xs text-foreground-tertiary">
                      {formatDateTime(incident.createdAt)}
                    </p>
                  </div>
                </div>

                {incident.status !== "PENDING" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          incident.status === "APPROVED" ? "bg-success" : "bg-error"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {incident.status === "APPROVED" ? "Approved" : "Rejected"}
                      </p>
                      <p className="text-xs text-foreground-tertiary">
                        {incident.approvedAt && formatDateTime(incident.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
