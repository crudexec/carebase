"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
} from "@/components/ui";
import {
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  User,
  Phone,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  CheckSquare,
  AlertCircle,
} from "lucide-react";

interface FaxRecord {
  id: string;
  sinchFaxId: string | null;
  direction: "INBOUND" | "OUTBOUND";
  toNumber: string;
  fromNumber: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  documentType: string;
  documentId: string | null;
  documentName: string | null;
  documentUrl: string | null;
  numberOfPages: number | null;
  recipientName: string | null;
  recipientType: string | null;
  errorCode: number | null;
  errorMessage: string | null;
  completedAt: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  carePlan: {
    id: string;
    planNumber: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
}

interface FaxStats {
  inbound: {
    total: number;
    unprocessed: number;
    completed: number;
    failed: number;
  };
  outbound: {
    total: number;
    queued: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
}

const STATUS_CONFIG = {
  QUEUED: {
    label: "Queued",
    color: "bg-warning/10 text-warning",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-primary/10 text-primary",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Delivered",
    color: "bg-success/10 text-success",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    color: "bg-error/10 text-error",
    icon: XCircle,
  },
};

type DirectionFilter = "all" | "INBOUND" | "OUTBOUND";

export default function FaxHistoryPage() {
  const [faxRecords, setFaxRecords] = React.useState<FaxRecord[]>([]);
  const [stats, setStats] = React.useState<FaxStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshingFaxId, setRefreshingFaxId] = React.useState<string | null>(null);
  const [processingFaxId, setProcessingFaxId] = React.useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = React.useState<DirectionFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchFaxRecords = React.useCallback(async (page = 1, showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (directionFilter !== "all") {
        params.set("direction", directionFilter);
      }
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/fax?${params}`);
      const data = await response.json();

      if (response.ok) {
        setFaxRecords(data.faxRecords || []);
        setPagination(data.pagination);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch fax records:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [directionFilter, statusFilter]);

  React.useEffect(() => {
    fetchFaxRecords();
  }, [fetchFaxRecords]);

  // Refresh a single fax status from Sinch API
  const refreshFaxStatus = async (faxId: string) => {
    setRefreshingFaxId(faxId);
    try {
      const response = await fetch(`/api/fax/${faxId}/refresh`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.faxRecord) {
        setFaxRecords((prev) =>
          prev.map((fax) =>
            fax.id === faxId
              ? {
                  ...fax,
                  status: data.faxRecord.status,
                  numberOfPages: data.faxRecord.numberOfPages,
                  completedAt: data.faxRecord.completedAt,
                  errorCode: data.faxRecord.errorCode,
                  errorMessage: data.faxRecord.errorMessage,
                }
              : fax
          )
        );
      }
    } catch (error) {
      console.error("Error refreshing fax status:", error);
    } finally {
      setRefreshingFaxId(null);
    }
  };

  // Mark inbound fax as processed
  const markAsProcessed = async (faxId: string) => {
    setProcessingFaxId(faxId);
    try {
      const response = await fetch(`/api/fax/${faxId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processedAt: true }),
      });

      if (response.ok) {
        setFaxRecords((prev) =>
          prev.map((fax) =>
            fax.id === faxId
              ? { ...fax, processedAt: new Date().toISOString() }
              : fax
          )
        );
      }
    } catch (error) {
      console.error("Error marking fax as processed:", error);
    } finally {
      setProcessingFaxId(null);
    }
  };

  // Download fax document
  const downloadFax = async (faxId: string) => {
    try {
      const response = await fetch(`/api/fax/${faxId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || "fax.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading fax:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+1") && phone.length === 12) {
      return `(${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fax History</h1>
          <p className="text-foreground-secondary">
            View and manage all faxes
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchFaxRecords(pagination.page, true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Inbound Stats */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownLeft className="w-5 h-5 text-primary" />
                <span className="font-semibold">Received</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">{stats.inbound.total}</p>
                  <p className="text-xs text-foreground-secondary">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.inbound.unprocessed}</p>
                  <p className="text-xs text-foreground-secondary">Unprocessed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{stats.inbound.completed}</p>
                  <p className="text-xs text-foreground-secondary">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outbound Stats */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpRight className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Sent</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold">{stats.outbound.total}</p>
                  <p className="text-xs text-foreground-secondary">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.outbound.queued + stats.outbound.inProgress}</p>
                  <p className="text-xs text-foreground-secondary">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{stats.outbound.completed}</p>
                  <p className="text-xs text-foreground-secondary">Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-error">{stats.outbound.failed}</p>
                  <p className="text-xs text-foreground-secondary">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 flex-wrap">
            <Select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              className="w-[160px]"
            >
              <option value="all">All Faxes</option>
              <option value="INBOUND">Received</option>
              <option value="OUTBOUND">Sent</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fax Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Fax Records</CardTitle>
        </CardHeader>
        <CardContent>
          {faxRecords.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
              <p className="text-foreground-secondary">No faxes found.</p>
              <p className="text-sm text-foreground-tertiary mt-1">
                {directionFilter === "INBOUND"
                  ? "Incoming faxes will appear here."
                  : directionFilter === "OUTBOUND"
                  ? "Sent faxes will appear here when you send care plans to physicians."
                  : "Faxes will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faxRecords.map((fax) => {
                const statusConfig = STATUS_CONFIG[fax.status];
                const StatusIcon = statusConfig.icon;
                const isInbound = fax.direction === "INBOUND";
                const isUnprocessed = isInbound && !fax.processedAt && fax.status === "COMPLETED";

                return (
                  <div
                    key={fax.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      isUnprocessed
                        ? "border-warning/50 bg-warning/5"
                        : "border-border hover:bg-background-secondary/50"
                    }`}
                  >
                    {/* Direction & Status Icon */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`p-2 rounded-full ${isInbound ? "bg-primary/10" : "bg-secondary/10"}`}>
                        {isInbound ? (
                          <ArrowDownLeft className="w-5 h-5 text-primary" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div className={`p-1 rounded-full ${statusConfig.color}`}>
                        <StatusIcon
                          className={`w-3 h-3 ${fax.status === "IN_PROGRESS" ? "animate-spin" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium">
                          {fax.documentName || (isInbound ? "Incoming Fax" : "Document")}
                        </span>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        {isUnprocessed && (
                          <Badge className="bg-warning/10 text-warning">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Needs Review
                          </Badge>
                        )}
                        {fax.processedAt && (
                          <Badge className="bg-success/10 text-success">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Processed
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-1 text-sm text-foreground-secondary">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {isInbound ? (
                            <span>
                              From: {formatPhoneNumber(fax.fromNumber)}
                              {fax.recipientName && (
                                <span className="text-foreground-tertiary ml-1">
                                  ({fax.recipientName})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span>
                              To: {formatPhoneNumber(fax.toNumber)}
                              {fax.recipientName && (
                                <span className="text-foreground-tertiary ml-1">
                                  ({fax.recipientName})
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {fax.carePlan && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <Link
                              href={`/clients/${fax.carePlan.client.id}/care-plans/${fax.carePlan.id}`}
                              className="hover:underline text-primary"
                            >
                              {fax.carePlan.planNumber} - {fax.carePlan.client.firstName}{" "}
                              {fax.carePlan.client.lastName}
                            </Link>
                          </div>
                        )}

                        {fax.client && !fax.carePlan && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <Link
                              href={`/clients/${fax.client.id}`}
                              className="hover:underline text-primary"
                            >
                              {fax.client.firstName} {fax.client.lastName}
                            </Link>
                          </div>
                        )}

                        {fax.sentBy && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>
                              Sent by {fax.sentBy.firstName} {fax.sentBy.lastName}
                            </span>
                          </div>
                        )}

                        {fax.assignedTo && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>
                              Assigned to {fax.assignedTo.firstName} {fax.assignedTo.lastName}
                            </span>
                          </div>
                        )}

                        {fax.numberOfPages && (
                          <span>{fax.numberOfPages} page(s)</span>
                        )}

                        {fax.notes && (
                          <div className="text-foreground-tertiary italic mt-1">
                            Note: {fax.notes}
                          </div>
                        )}

                        {fax.errorMessage && (
                          <div className="text-error mt-1">
                            Error: {fax.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-foreground-tertiary whitespace-nowrap flex flex-col items-end gap-2">
                      <div>{formatDate(fax.createdAt)}</div>
                      {fax.completedAt && !isInbound && (
                        <div className="text-success">
                          Delivered: {formatDate(fax.completedAt)}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        {/* Download button for inbound faxes */}
                        {isInbound && fax.sinchFaxId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadFax(fax.id)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}

                        {/* Mark as processed button for unprocessed inbound faxes */}
                        {isUnprocessed && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markAsProcessed(fax.id)}
                            disabled={processingFaxId === fax.id}
                          >
                            {processingFaxId === fax.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CheckSquare className="w-3 h-3 mr-1" />
                            )}
                            Mark Processed
                          </Button>
                        )}

                        {/* Refresh button for pending outbound faxes */}
                        {!isInbound && (fax.status === "QUEUED" || fax.status === "IN_PROGRESS") && fax.sinchFaxId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => refreshFaxStatus(fax.id)}
                            disabled={refreshingFaxId === fax.id}
                          >
                            {refreshingFaxId === fax.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3 mr-1" />
                            )}
                            Check Status
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <p className="text-sm text-foreground-secondary">
                Showing {faxRecords.length} of {pagination.total} faxes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchFaxRecords(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchFaxRecords(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
