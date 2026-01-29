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
} from "lucide-react";

interface FaxRecord {
  id: string;
  sinchFaxId: string | null;
  toNumber: string;
  fromNumber: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  documentType: string;
  documentId: string | null;
  documentName: string | null;
  numberOfPages: number | null;
  recipientName: string | null;
  recipientType: string | null;
  errorCode: number | null;
  errorMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

export default function FaxHistoryPage() {
  const [faxRecords, setFaxRecords] = React.useState<FaxRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
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
      const response = await fetch(`/api/fax?page=${page}&limit=20`);
      const data = await response.json();

      if (response.ok) {
        setFaxRecords(data.faxRecords || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch fax records:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFaxRecords();
  }, [fetchFaxRecords]);

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
    // Format E.164 to readable format
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
            View and track all sent faxes
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
      <div className="grid gap-4 md:grid-cols-4">
        {(["QUEUED", "IN_PROGRESS", "COMPLETED", "FAILED"] as const).map((status) => {
          const config = STATUS_CONFIG[status];
          const count = faxRecords.filter((f) => f.status === status).length;
          const Icon = config.icon;

          return (
            <Card key={status}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fax Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Faxes</CardTitle>
        </CardHeader>
        <CardContent>
          {faxRecords.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
              <p className="text-foreground-secondary">No faxes sent yet.</p>
              <p className="text-sm text-foreground-tertiary mt-1">
                Faxes will appear here when you send care plans to physicians.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faxRecords.map((fax) => {
                const statusConfig = STATUS_CONFIG[fax.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={fax.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-background-secondary/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${statusConfig.color}`}>
                      <StatusIcon
                        className={`w-5 h-5 ${fax.status === "IN_PROGRESS" ? "animate-spin" : ""}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{fax.documentName || "Document"}</span>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>

                      <div className="grid gap-1 text-sm text-foreground-secondary">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>To: {formatPhoneNumber(fax.toNumber)}</span>
                          {fax.recipientName && (
                            <span className="text-foreground-tertiary">
                              ({fax.recipientName})
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

                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>
                            Sent by {fax.sentBy.firstName} {fax.sentBy.lastName}
                          </span>
                        </div>

                        {fax.numberOfPages && (
                          <span>{fax.numberOfPages} page(s)</span>
                        )}

                        {fax.errorMessage && (
                          <div className="text-error mt-1">
                            Error: {fax.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-foreground-tertiary whitespace-nowrap">
                      <div>{formatDate(fax.createdAt)}</div>
                      {fax.completedAt && (
                        <div className="text-success">
                          Delivered: {formatDate(fax.completedAt)}
                        </div>
                      )}
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
