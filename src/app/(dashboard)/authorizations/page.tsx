"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Badge,
} from "@/components/ui";
import {
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  BarChart3,
} from "lucide-react";

interface Authorization {
  id: string;
  authorizationNumber: string;
  serviceCode: string;
  startDate: string;
  endDate: string;
  unitsAuthorized: number;
  unitsUsed: number;
  unitsRemaining: number;
  usagePercentage: number;
  daysRemaining: number;
  status: string;
  unitType: string;
  isExpiringSoon: boolean;
  isExpired: boolean;
  isNearingLimit: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    medicaidId: string | null;
  };
}

interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  warning: number;
  expiring: number;
  lowUnits: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-warning/10 text-warning", icon: Clock },
  ACTIVE: { label: "Active", color: "bg-success/10 text-success", icon: CheckCircle },
  EXHAUSTED: { label: "Exhausted", color: "bg-error/10 text-error", icon: XCircle },
  EXPIRED: { label: "Expired", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
  TERMINATED: { label: "Terminated", color: "bg-foreground/10 text-foreground-secondary", icon: XCircle },
};

export default function AuthorizationsPage() {
  const [authorizations, setAuthorizations] = React.useState<Authorization[]>([]);
  const [alertSummary, setAlertSummary] = React.useState<AlertSummary | null>(null);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ACTIVE");

  React.useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [authRes, alertsRes] = await Promise.all([
        fetch(`/api/authorizations?status=${statusFilter}&limit=50`),
        fetch("/api/authorizations/alerts"),
      ]);

      const [authData, alertsData] = await Promise.all([
        authRes.json(),
        alertsRes.json(),
      ]);

      if (authRes.ok) {
        setAuthorizations(authData.authorizations || []);
        setTotal(authData.total || 0);
      }

      if (alertsRes.ok) {
        setAlertSummary(alertsData.summary);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAuthorizations = authorizations.filter((auth) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      auth.client.firstName.toLowerCase().includes(searchLower) ||
      auth.client.lastName.toLowerCase().includes(searchLower) ||
      auth.authorizationNumber.toLowerCase().includes(searchLower) ||
      auth.client.medicaidId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Authorization Tracking</h1>
          <p className="text-foreground-secondary">
            Monitor Medicaid authorizations and service limits
          </p>
        </div>
        <Link href="/authorizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Authorization
          </Button>
        </Link>
      </div>

      {/* Alert Summary */}
      {alertSummary && alertSummary.total > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-medium">
                    {alertSummary.total} Authorization Alert{alertSummary.total !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    {alertSummary.critical > 0 && `${alertSummary.critical} critical, `}
                    {alertSummary.high > 0 && `${alertSummary.high} high priority, `}
                    {alertSummary.warning > 0 && `${alertSummary.warning} warnings`}
                  </p>
                </div>
              </div>
              <Link href="/authorizations/alerts">
                <Button variant="secondary" size="sm">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {authorizations.filter((a) => a.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-foreground-secondary">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {authorizations.filter((a) => a.isExpiringSoon).length}
                </p>
                <p className="text-sm text-foreground-secondary">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/10">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {authorizations.filter((a) => a.isNearingLimit).length}
                </p>
                <p className="text-sm text-foreground-secondary">Near Limit (≥80%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-error/10">
                <XCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {authorizations.filter((a) => a.status === "EXHAUSTED" || a.status === "EXPIRED").length}
                </p>
                <p className="text-sm text-foreground-secondary">Exhausted/Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  placeholder="Search by client, auth number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="EXHAUSTED">Exhausted</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Authorization List */}
      <Card>
        <CardHeader>
          <CardTitle>Authorizations ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredAuthorizations.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-foreground-secondary/50" />
              <h3 className="mt-4 text-lg font-medium">No authorizations found</h3>
              <p className="mt-2 text-sm text-foreground-secondary">
                {search || statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by adding an authorization"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAuthorizations.map((auth) => {
                const statusConfig = STATUS_CONFIG[auth.status] || STATUS_CONFIG.ACTIVE;
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={auth.id}
                    href={`/authorizations/${auth.id}`}
                    className="block"
                  >
                    <div
                      className={`p-4 rounded-lg border hover:border-primary/50 transition-colors ${
                        auth.isExpired || auth.status === "EXHAUSTED"
                          ? "bg-error/5 border-error/30"
                          : auth.isExpiringSoon || auth.isNearingLimit
                          ? "bg-warning/5 border-warning/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {auth.client.firstName} {auth.client.lastName}
                            </h3>
                            <p className="text-sm text-foreground-secondary">
                              Auth #: {auth.authorizationNumber}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              Service: {auth.serviceCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          {(auth.isExpiringSoon || auth.isExpired) && (
                            <Badge className="bg-error/10 text-error">
                              {auth.isExpired
                                ? "Expired"
                                : `${auth.daysRemaining} days left`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Usage Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground-secondary">
                            Units: {auth.unitsUsed} / {auth.unitsAuthorized} {auth.unitType.toLowerCase()}
                          </span>
                          <span
                            className={`font-medium ${
                              auth.usagePercentage >= 90
                                ? "text-error"
                                : auth.usagePercentage >= 80
                                ? "text-warning"
                                : ""
                            }`}
                          >
                            {auth.usagePercentage.toFixed(0)}% used
                          </span>
                        </div>
                        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              auth.usagePercentage >= 90
                                ? "bg-error"
                                : auth.usagePercentage >= 80
                                ? "bg-warning"
                                : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(auth.usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(auth.startDate).toLocaleDateString()} - {new Date(auth.endDate).toLocaleDateString()}
                        </span>
                        <span>
                          {auth.unitsRemaining} {auth.unitType.toLowerCase()} remaining
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
