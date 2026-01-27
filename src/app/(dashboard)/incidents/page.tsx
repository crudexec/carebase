"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

interface IncidentData {
  id: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
  sponsorNotified: boolean;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
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

const SEVERITY_COLORS: Record<IncidentSeverity, "default" | "warning" | "error" | "primary"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "error",
  CRITICAL: "error",
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<IncidentStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const STATUS_ICONS: Record<IncidentStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
};

type SortField = "date" | "severity" | "status" | "client" | "category";
type SortDirection = "asc" | "desc";

export default function IncidentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = React.useState<IncidentData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [severityFilter, setSeverityFilter] = React.useState<string>("");
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  // Pagination
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const canCreate = session?.user
    ? hasPermission(session.user.role, PERMISSIONS.INCIDENT_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  const canApprove = session?.user
    ? hasPermission(session.user.role, PERMISSIONS.INCIDENT_APPROVE) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  const fetchIncidents = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);
      if (severityFilter) params.set("severity", severityFilter);

      const response = await fetch(`/api/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      const data = await response.json();
      setIncidents(data.incidents);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setError(null);
    } catch {
      setError("Failed to load incidents");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  React.useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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

  const handleApprove = async (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!response.ok) throw new Error("Failed to approve incident");
      await fetchIncidents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve incident");
    }
  };

  const handleReject = async (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!response.ok) throw new Error("Failed to reject incident");
      await fetchIncidents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject incident");
    }
  };

  const filteredAndSortedIncidents = React.useMemo(() => {
    const result = incidents.filter((incident) => {
      const matchesSearch =
        !searchQuery ||
        `${incident.client.firstName} ${incident.client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime();
          break;
        case "severity": {
          const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        }
        case "status":
          comparison = STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
          break;
        case "client":
          comparison = `${a.client.firstName} ${a.client.lastName}`.localeCompare(
            `${b.client.firstName} ${b.client.lastName}`
          );
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [incidents, searchQuery, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Incident Reports</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Track and manage incident reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchIncidents()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => router.push("/incidents/new")}>
              <Plus className="w-4 h-4 mr-1" />
              Report Incident
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
              <Input
                placeholder="Search by client, category, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40"
            >
              <option value="">All Severities</option>
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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

      {/* Incidents Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedIncidents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No incidents found</p>
            {canCreate && (
              <Button className="mt-4" onClick={() => router.push("/incidents/new")}>
                <Plus className="w-4 h-4 mr-1" />
                Report Incident
              </Button>
            )}
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
                    onClick={() => handleSort("date")}
                  >
                    Date <SortIcon field="date" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("client")}
                  >
                    Client <SortIcon field="client" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("category")}
                  >
                    Category <SortIcon field="category" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("severity")}
                  >
                    Severity <SortIcon field="severity" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Reporter
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedIncidents.map((incident) => {
                  const StatusIcon = STATUS_ICONS[incident.status];
                  return (
                    <tr
                      key={incident.id}
                      className="border-b border-border hover:bg-background-secondary/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/incidents/${incident.id}`)}
                    >
                      <td className="p-4">
                        <div>
                          <span className="font-medium">{formatDate(incident.incidentDate)}</span>
                          <div className="text-xs text-foreground-tertiary">
                            {formatTime(incident.incidentDate)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-error">
                              {incident.client.firstName[0]}
                              {incident.client.lastName[0]}
                            </span>
                          </div>
                          <span>
                            {incident.client.firstName} {incident.client.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground-secondary">{incident.category}</td>
                      <td className="p-4">
                        <Badge
                          variant={SEVERITY_COLORS[incident.severity]}
                          className={
                            incident.severity === "CRITICAL"
                              ? "bg-error text-white animate-pulse"
                              : ""
                          }
                        >
                          {SEVERITY_LABELS[incident.severity]}
                        </Badge>
                      </td>
                      <td className="p-4 text-foreground-secondary">
                        {incident.reporter.firstName} {incident.reporter.lastName}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 text-${STATUS_COLORS[incident.status]}`} />
                          <Badge variant={STATUS_COLORS[incident.status]}>
                            {STATUS_LABELS[incident.status]}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/incidents/${incident.id}`)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canApprove && incident.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleApprove(e, incident.id)}
                                title="Approve"
                                className="text-success hover:text-success hover:bg-success/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleReject(e, incident.id)}
                                title="Reject"
                                className="text-error hover:text-error hover:bg-error/10"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">
              Showing {filteredAndSortedIncidents.length} of {total} incidents
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-foreground-secondary">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
