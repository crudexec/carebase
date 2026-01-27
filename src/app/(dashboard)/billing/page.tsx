"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Settings,
  Calendar,
  Send,
} from "lucide-react";

interface BillingStats {
  totalClaims: number;
  totalAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
}

interface RecentClaim {
  id: string;
  claimNumber: string;
  status: string;
  totalAmount: number;
  patientFirstName: string;
  patientLastName: string;
  serviceStartDate: string;
  serviceEndDate: string;
}

interface BillingPeriod {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  _count: {
    claims: number;
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

export default function BillingPage() {
  const [stats, setStats] = React.useState<BillingStats | null>(null);
  const [recentClaims, setRecentClaims] = React.useState<RecentClaim[]>([]);
  const [periods, setPeriods] = React.useState<BillingPeriod[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [claimsRes, periodsRes] = await Promise.all([
        fetch("/api/billing/claims?limit=5"),
        fetch("/api/billing/periods?limit=5"),
      ]);

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setRecentClaims(claimsData.claims || []);
        setStats({
          totalClaims: claimsData.pagination?.total || 0,
          totalAmount: (Object.values(claimsData.summary || {}) as { count: number; amount: number }[]).reduce(
            (sum, s) => sum + (s.amount || 0),
            0
          ),
          byStatus: claimsData.summary || {},
        });
      }

      if (periodsRes.ok) {
        const periodsData = await periodsRes.json();
        setPeriods(periodsData.periods || []);
      }

      setError(null);
    } catch {
      setError("Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Billing</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage claims, billing periods, and submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Link href="/billing/settings">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </Link>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Claims</p>
                <p className="text-2xl font-semibold">{stats?.totalClaims || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Billed</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(stats?.totalAmount || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Pending</p>
                <p className="text-2xl font-semibold">
                  {(stats?.byStatus?.DRAFT?.count || 0) +
                    (stats?.byStatus?.READY?.count || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Issues</p>
                <p className="text-2xl font-semibold">
                  {(stats?.byStatus?.REJECTED?.count || 0) +
                    (stats?.byStatus?.DENIED?.count || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/billing/periods">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Billing Periods</p>
                  <p className="text-sm text-foreground-secondary">
                    Manage billing cycles
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-foreground-tertiary" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/billing/claims">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Claims</p>
                  <p className="text-sm text-foreground-secondary">
                    View and manage claims
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-foreground-tertiary" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/billing/submissions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Submissions</p>
                  <p className="text-sm text-foreground-secondary">
                    Track claim submissions
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-foreground-tertiary" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Claims</CardTitle>
            <Link href="/billing/claims">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentClaims.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">
                No claims yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentClaims.map((claim) => {
                  const StatusIcon = STATUS_ICONS[claim.status] || FileText;
                  return (
                    <Link
                      key={claim.id}
                      href={`/billing/claims/${claim.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center">
                          <StatusIcon className="w-4 h-4 text-foreground-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{claim.claimNumber}</p>
                          <p className="text-xs text-foreground-secondary">
                            {claim.patientFirstName} {claim.patientLastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(claim.totalAmount)}
                        </p>
                        <Badge variant={STATUS_COLORS[claim.status]} className="text-xs">
                          {claim.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Periods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Billing Periods</CardTitle>
            <Link href="/billing/periods">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {periods.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">
                No billing periods yet
              </p>
            ) : (
              <div className="space-y-3">
                {periods.map((period) => (
                  <Link
                    key={period.id}
                    href={`/billing/periods/${period.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-foreground-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{period.name}</p>
                        <p className="text-xs text-foreground-secondary">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground-secondary">
                        {period._count?.claims || 0} claims
                      </p>
                      <Badge
                        variant={period.status === "OPEN" ? "success" : "default"}
                        className="text-xs"
                      >
                        {period.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
