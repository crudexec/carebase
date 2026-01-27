"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  RefreshCw,
  Search,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Download,
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  totalAmount: number;
  serviceStartDate: string;
  serviceEndDate: string;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  billingPeriod: {
    id: string;
    name: string;
  };
  _count: {
    claimLines: number;
    submissions: number;
  };
}

interface ClaimsSummary {
  [status: string]: {
    count: number;
    amount: number;
  };
}

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  DRAFT: "default",
  READY: "primary",
  SUBMITTED: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  DENIED: "error",
  PAID: "success",
  PARTIALLY_PAID: "warning",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  READY: CheckCircle,
  SUBMITTED: Send,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
  DENIED: XCircle,
  PAID: DollarSign,
  PARTIALLY_PAID: DollarSign,
};

const STATUSES = [
  "DRAFT",
  "READY",
  "SUBMITTED",
  "ACCEPTED",
  "REJECTED",
  "DENIED",
  "PAID",
  "PARTIALLY_PAID",
];

export default function ClaimsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const initialPeriodId = searchParams.get("billingPeriodId") || "";

  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [summary, setSummary] = React.useState<ClaimsSummary>({});
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Export state
  const [selectedClaims, setSelectedClaims] = React.useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = React.useState(false);

  const fetchClaims = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (initialPeriodId) params.set("billingPeriodId", initialPeriodId);
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      const response = await fetch(`/api/billing/claims?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
        setSummary(data.summary || {});
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
      setError(null);
    } catch {
      setError("Failed to load claims");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, initialPeriodId, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleExport = async () => {
    if (selectedClaims.size === 0) {
      setError("Please select claims to export");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/export/837p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimIds: Array.from(selectedClaims),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export");
      }

      // Download the file
      const blob = await response.blob();
      const filename = response.headers.get("X-Filename") || "837P_export.edi";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSelectedClaims(new Set());
      await fetchClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedClaims.size === claims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(claims.map((c) => c.id)));
    }
  };

  const toggleSelectClaim = (claimId: string) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
  };

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

  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(query) ||
      `${claim.client.firstName} ${claim.client.lastName}`.toLowerCase().includes(query)
    );
  });

  if (isLoading && claims.length === 0) {
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
          <h1 className="text-heading-2 text-foreground">Claims</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage and submit Medicaid claims
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchClaims}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {selectedClaims.size > 0 && (
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  Export 837P ({selectedClaims.size})
                </>
              )}
            </Button>
          )}
        </div>
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

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => {
          const data = summary[status];
          if (!data?.count) return null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-background-secondary hover:bg-background-secondary/80"
              }`}
            >
              <span>{status}</span>
              <span className="font-semibold">{data.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
              <Input
                placeholder="Search by claim # or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No claims found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedClaims.size === claims.length && claims.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Claim #
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Client
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Period
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Service Dates
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Lines
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Amount
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const StatusIcon = STATUS_ICONS[claim.status] || FileText;
                  return (
                    <tr
                      key={claim.id}
                      className="border-b border-border hover:bg-background-secondary/50 transition-colors"
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedClaims.has(claim.id)}
                          onChange={() => toggleSelectClaim(claim.id)}
                          className="rounded"
                        />
                      </td>
                      <td
                        className="p-3 cursor-pointer"
                        onClick={() => router.push(`/billing/claims/${claim.id}`)}
                      >
                        <span className="font-mono text-sm font-medium">
                          {claim.claimNumber}
                        </span>
                      </td>
                      <td
                        className="p-3 cursor-pointer"
                        onClick={() => router.push(`/billing/claims/${claim.id}`)}
                      >
                        {claim.client.firstName} {claim.client.lastName}
                      </td>
                      <td className="p-3 text-sm text-foreground-secondary">
                        {claim.billingPeriod?.name || "-"}
                      </td>
                      <td className="p-3 text-sm text-foreground-secondary">
                        {formatDate(claim.serviceStartDate)} -{" "}
                        {formatDate(claim.serviceEndDate)}
                      </td>
                      <td className="p-3 text-foreground-secondary">
                        {claim._count.claimLines}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(claim.totalAmount)}
                      </td>
                      <td className="p-3">
                        <Badge variant={STATUS_COLORS[claim.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {claim.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-foreground-secondary">
            <span>
              Showing {filteredClaims.length} of {pagination.total} claims
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
