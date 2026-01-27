"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Select,
} from "@/components/ui";
import {
  RefreshCw,
  Send,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Submission {
  id: string;
  submissionType: string;
  status: string;
  clearinghouse: string;
  ediFileName: string | null;
  submittedAt: string;
  responseReceivedAt: string | null;
  claim: {
    id: string;
    claimNumber: string;
    status: string;
    totalAmount: number;
    patientFirstName: string;
    patientLastName: string;
  };
}

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  PENDING: "warning",
  TRANSMITTED: "primary",
  ACKNOWLEDGED: "primary",
  ACCEPTED: "success",
  REJECTED: "error",
  ERROR: "error",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  TRANSMITTED: Send,
  ACKNOWLEDGED: CheckCircle,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
  ERROR: XCircle,
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState("");
  const [clearinghouseFilter, setClearinghouseFilter] = React.useState("");

  const fetchSubmissions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (clearinghouseFilter) params.set("clearinghouse", clearinghouseFilter);
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      const response = await fetch(`/api/billing/submissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
      setError(null);
    } catch {
      setError("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, clearinghouseFilter, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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

  if (isLoading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Submissions</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Track claim submission history
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="TRANSMITTED">Transmitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="ERROR">Error</option>
            </Select>
            <Select
              value={clearinghouseFilter}
              onChange={(e) => setClearinghouseFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Clearinghouses</option>
              <option value="GENERIC">Generic</option>
              <option value="AVAILITY">Availity</option>
              <option value="OFFICE_ALLY">Office Ally</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No submissions found</p>
            <p className="text-sm text-foreground-tertiary mt-1">
              Submit claims to see them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Claim
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Client
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Clearinghouse
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Type
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Submitted
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Amount
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Status
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const StatusIcon = STATUS_ICONS[sub.status] || FileText;
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-border hover:bg-background-secondary/50 transition-colors"
                    >
                      <td className="p-3">
                        <Link
                          href={`/billing/claims/${sub.claim.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          {sub.claim.claimNumber}
                        </Link>
                      </td>
                      <td className="p-3">
                        {sub.claim.patientFirstName} {sub.claim.patientLastName}
                      </td>
                      <td className="p-3">
                        <Badge variant="default">{sub.clearinghouse}</Badge>
                      </td>
                      <td className="p-3 text-sm text-foreground-secondary">
                        {sub.submissionType}
                      </td>
                      <td className="p-3 text-sm text-foreground-secondary">
                        {formatDateTime(sub.submittedAt)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(sub.claim.totalAmount)}
                      </td>
                      <td className="p-3">
                        <Badge variant={STATUS_COLORS[sub.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {sub.ediFileName && (
                          <Link href={`/api/billing/submissions/${sub.id}/download`}>
                            <Button variant="ghost" size="sm" title="Download EDI">
                              <Download className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-foreground-secondary">
            <span>
              Showing {submissions.length} of {pagination.total} submissions
            </span>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
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
