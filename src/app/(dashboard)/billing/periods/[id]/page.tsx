"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  FileText,
  DollarSign,
  Play,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  totalAmount: number;
  patientFirstName: string;
  patientLastName: string;
  serviceStartDate: string;
  serviceEndDate: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    claimLines: number;
    submissions: number;
  };
}

interface BillingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  closedAt: string | null;
  claims: Claim[];
  stats: {
    totalClaims: number;
    totalAmount: number;
    byStatus: Record<string, number>;
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

export default function BillingPeriodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const periodId = params.id as string;

  const [period, setPeriod] = React.useState<BillingPeriod | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [generateResult, setGenerateResult] = React.useState<{
    claimsCreated: number;
    claimsSkipped: number;
    errors: string[];
  } | null>(null);

  const fetchPeriod = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/billing/periods/${periodId}`);
      if (response.ok) {
        const data = await response.json();
        setPeriod(data.period);
      } else {
        throw new Error("Failed to load billing period");
      }
      setError(null);
    } catch {
      setError("Failed to load billing period");
    } finally {
      setIsLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    fetchPeriod();
  }, [fetchPeriod]);

  const handleGenerateClaims = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerateResult(null);

    try {
      const response = await fetch(`/api/billing/periods/${periodId}/generate-claims`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate claims");
      }

      setGenerateResult({
        claimsCreated: data.claimsCreated,
        claimsSkipped: data.claimsSkipped,
        errors: data.errors || [],
      });

      await fetchPeriod();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate claims");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePeriod = async () => {
    if (!confirm("Are you sure you want to close this billing period? This cannot be undone.")) {
      return;
    }

    setIsClosing(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/periods/${periodId}/close`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to close period");
      }

      await fetchPeriod();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close period");
    } finally {
      setIsClosing(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!period) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary">Billing period not found</p>
        <Link href="/billing/periods">
          <Button className="mt-4">Back to Periods</Button>
        </Link>
      </div>
    );
  }

  const draftCount = period.stats.byStatus.DRAFT || 0;
  const readyCount = period.stats.byStatus.READY || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/billing/periods">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-2 text-foreground">{period.name}</h1>
              <Badge variant={period.status === "OPEN" ? "success" : "default"}>
                {period.status}
              </Badge>
            </div>
            <p className="text-body-sm text-foreground-secondary mt-1">
              {formatDate(period.startDate)} - {formatDate(period.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchPeriod}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {period.status === "OPEN" && (
            <>
              <Button
                variant="secondary"
                onClick={handleGenerateClaims}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Generate Claims
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClosePeriod}
                disabled={isClosing || draftCount > 0}
                title={draftCount > 0 ? "Cannot close with draft claims" : "Close period"}
              >
                {isClosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    Close Period
                  </>
                )}
              </Button>
            </>
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

      {generateResult && (
        <div className="p-4 rounded-md bg-success/20">
          <p className="font-medium">Claims Generated</p>
          <p className="text-sm mt-1">
            Created: {generateResult.claimsCreated} | Skipped: {generateResult.claimsSkipped}
          </p>
          {generateResult.errors.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="font-medium text-error">Issues:</p>
              <ul className="list-disc list-inside">
                {generateResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {generateResult.errors.length > 5 && (
                  <li>...and {generateResult.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}
          <button
            onClick={() => setGenerateResult(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Claims</p>
                <p className="text-2xl font-semibold">{period.stats.totalClaims}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Amount</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(period.stats.totalAmount)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Drafts</p>
                <p className="text-2xl font-semibold">{draftCount}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Ready</p>
                <p className="text-2xl font-semibold">{readyCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Claims</CardTitle>
          {period.claims.length > 0 && (
            <Link href={`/billing/claims?billingPeriodId=${periodId}`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {period.claims.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
              <p className="text-foreground-secondary">No claims in this period</p>
              {period.status === "OPEN" && (
                <Button className="mt-4" onClick={handleGenerateClaims} disabled={isGenerating}>
                  <Play className="w-4 h-4 mr-1" />
                  Generate Claims
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-secondary">
                    <th className="text-left p-3 font-medium text-foreground-secondary">
                      Claim #
                    </th>
                    <th className="text-left p-3 font-medium text-foreground-secondary">
                      Client
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
                  {period.claims.map((claim) => {
                    const StatusIcon = STATUS_ICONS[claim.status] || FileText;
                    return (
                      <tr
                        key={claim.id}
                        className="border-b border-border hover:bg-background-secondary/50 cursor-pointer"
                        onClick={() => router.push(`/billing/claims/${claim.id}`)}
                      >
                        <td className="p-3">
                          <span className="font-mono text-sm">{claim.claimNumber}</span>
                        </td>
                        <td className="p-3">
                          {claim.patientFirstName} {claim.patientLastName}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
