"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Breadcrumb,
  DataTable,
  StatusCell,
  DateRangeCell,
  UserCell,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
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

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  PENDING: "warning",
  EXHAUSTED: "error",
  EXPIRED: "default",
  TERMINATED: "default",
};

// Custom Usage Cell component with progress bar
function UsageCell({ auth }: { auth: Authorization }) {
  const { unitsUsed, unitsAuthorized, usagePercentage, unitType } = auth;

  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-foreground-secondary">
          {unitsUsed} / {unitsAuthorized}
        </span>
        <span
          className={`font-medium ${
            usagePercentage >= 90
              ? "text-error"
              : usagePercentage >= 80
              ? "text-warning"
              : "text-foreground-secondary"
          }`}
        >
          {usagePercentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            usagePercentage >= 90
              ? "bg-error"
              : usagePercentage >= 80
              ? "bg-warning"
              : "bg-primary"
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-foreground-tertiary mt-0.5">
        {auth.unitsRemaining} {unitType.toLowerCase()} left
      </p>
    </div>
  );
}

// Alerts Cell for showing warning badges
function AlertsCell({ auth }: { auth: Authorization }) {
  if (!auth.isExpiringSoon && !auth.isNearingLimit && !auth.isExpired && auth.status !== "EXHAUSTED") {
    return <span className="text-foreground-tertiary">-</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {auth.isExpired && (
        <Badge variant="error" className="text-xs">Expired</Badge>
      )}
      {auth.status === "EXHAUSTED" && (
        <Badge variant="error" className="text-xs">Exhausted</Badge>
      )}
      {auth.isExpiringSoon && !auth.isExpired && (
        <Badge variant="warning" className="text-xs">{auth.daysRemaining}d left</Badge>
      )}
      {auth.isNearingLimit && auth.status !== "EXHAUSTED" && (
        <Badge variant="warning" className="text-xs">≥80% used</Badge>
      )}
    </div>
  );
}

export default function AuthorizationsPage() {
  const router = useRouter();
  const [authorizations, setAuthorizations] = React.useState<Authorization[]>([]);
  const [alertSummary, setAlertSummary] = React.useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ACTIVE");
  const [sortColumn, setSortColumn] = React.useState<string | null>("client");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
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
      }

      if (alertsRes.ok) {
        setAlertSummary(alertsData.summary);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  // Filter and sort authorizations
  const processedAuthorizations = React.useMemo(() => {
    let filtered = authorizations;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((auth) =>
        auth.client.firstName.toLowerCase().includes(searchLower) ||
        auth.client.lastName.toLowerCase().includes(searchLower) ||
        auth.authorizationNumber.toLowerCase().includes(searchLower) ||
        auth.client.medicaidId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sortColumn) {
          case "client":
            aVal = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
            bVal = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
            break;
          case "authNumber":
            aVal = a.authorizationNumber.toLowerCase();
            bVal = b.authorizationNumber.toLowerCase();
            break;
          case "service":
            aVal = a.serviceCode.toLowerCase();
            bVal = b.serviceCode.toLowerCase();
            break;
          case "usage":
            aVal = a.usagePercentage;
            bVal = b.usagePercentage;
            break;
          case "dateRange":
            aVal = new Date(a.endDate).getTime();
            bVal = new Date(b.endDate).getTime();
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [authorizations, search, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  // Stats calculations
  const stats = React.useMemo(() => ({
    active: authorizations.filter((a) => a.status === "ACTIVE").length,
    expiringSoon: authorizations.filter((a) => a.isExpiringSoon).length,
    nearingLimit: authorizations.filter((a) => a.isNearingLimit).length,
    exhaustedOrExpired: authorizations.filter((a) => a.status === "EXHAUSTED" || a.status === "EXPIRED").length,
  }), [authorizations]);

  const columns: ColumnDef<Authorization>[] = [
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <UserCell
          firstName={row.client.firstName}
          lastName={row.client.lastName}
          subtitle={row.client.medicaidId || undefined}
        />
      ),
    },
    {
      id: "authNumber",
      header: "Auth #",
      sortable: true,
      minWidth: "130px",
      cell: (row) => (
        <span className="font-mono text-sm">{row.authorizationNumber}</span>
      ),
    },
    {
      id: "service",
      header: "Service",
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <span className="text-sm">{row.serviceCode}</span>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      sortable: true,
      minWidth: "160px",
      cell: (row) => <UsageCell auth={row} />,
    },
    {
      id: "dateRange",
      header: "Period",
      sortable: true,
      hideOnMobile: true,
      minWidth: "180px",
      cell: (row) => <DateRangeCell startDate={row.startDate} endDate={row.endDate} />,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          variant={STATUS_VARIANTS[row.status] || "default"}
        />
      ),
    },
    {
      id: "alerts",
      header: "Alerts",
      minWidth: "100px",
      cell: (row) => <AlertsCell auth={row} />,
    },
  ];

  const rowActions = (row: Authorization) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActionMenuOpen(actionMenuOpen === row.id ? null : row.id);
        }}
        className="p-1 rounded hover:bg-background-secondary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {actionMenuOpen === row.id && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-background border border-border z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/authorizations/${row.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/authorizations/${row.id}/edit`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/authorizations/new?renew=${row.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
                setActionMenuOpen(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-background-secondary"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Authorizations" }]} />

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

      {/* Stats - Compact inline */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="font-semibold">{stats.active}</span>
          <span className="text-foreground-secondary">active</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <span className="font-semibold">{stats.expiringSoon}</span>
          <span className="text-foreground-secondary">expiring soon</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-secondary" />
          <span className="font-semibold">{stats.nearingLimit}</span>
          <span className="text-foreground-secondary">near limit</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-error" />
          <span className="font-semibold">{stats.exhaustedOrExpired}</span>
          <span className="text-foreground-secondary">exhausted/expired</span>
        </div>
      </div>

      {/* Filters */}
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

      {/* Authorization Table */}
      <DataTable
        data={processedAuthorizations}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/authorizations/${row.id}`)}
        emptyIcon={<ShieldCheck className="h-12 w-12" />}
        emptyMessage={
          search || statusFilter
            ? "No authorizations match your filters"
            : "No authorizations found. Add one to get started."
        }
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        rowActions={rowActions}
        stickyHeader
      />
    </div>
  );
}
