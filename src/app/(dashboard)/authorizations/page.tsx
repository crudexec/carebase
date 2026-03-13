"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronUp,
  ChevronDown,
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

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  EXHAUSTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  TERMINATED: "bg-gray-100 text-gray-600",
};

type SortDirection = "asc" | "desc" | null;

// Custom Usage Cell component with progress bar
function UsageCell({ auth }: { auth: Authorization }) {
  const { unitsUsed, unitsAuthorized, usagePercentage, unitType } = auth;

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-gray-600">
          {unitsUsed} / {unitsAuthorized}
        </span>
        <span
          className={`font-medium ${
            usagePercentage >= 90
              ? "text-red-600"
              : usagePercentage >= 80
              ? "text-yellow-600"
              : "text-gray-600"
          }`}
        >
          {usagePercentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            usagePercentage >= 90
              ? "bg-red-500"
              : usagePercentage >= 80
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 mt-0.5">
        {auth.unitsRemaining} {unitType.toLowerCase()} left
      </p>
    </div>
  );
}

// Alerts Cell for showing warning badges
function AlertsCell({ auth }: { auth: Authorization }) {
  if (!auth.isExpiringSoon && !auth.isNearingLimit && !auth.isExpired && auth.status !== "EXHAUSTED") {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {auth.isExpired && (
        <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded bg-red-100 text-red-700">Expired</span>
      )}
      {auth.status === "EXHAUSTED" && (
        <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded bg-red-100 text-red-700">Exhausted</span>
      )}
      {auth.isExpiringSoon && !auth.isExpired && (
        <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded bg-yellow-100 text-yellow-700">{auth.daysRemaining}d left</span>
      )}
      {auth.isNearingLimit && auth.status !== "EXHAUSTED" && (
        <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded bg-yellow-100 text-yellow-700">≥80% used</span>
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


  // Stats calculations
  const stats = React.useMemo(() => ({
    active: authorizations.filter((a) => a.status === "ACTIVE").length,
    expiringSoon: authorizations.filter((a) => a.isExpiringSoon).length,
    nearingLimit: authorizations.filter((a) => a.isNearingLimit).length,
    exhaustedOrExpired: authorizations.filter((a) => a.status === "EXHAUSTED" || a.status === "EXPIRED").length,
  }), [authorizations]);

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Sort header click handler
  const handleHeaderClick = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-0.5" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Authorizations</h1>
          <span className="text-xs text-gray-500">{authorizations.length} total</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 border border-gray-300 rounded px-2 py-1 pl-7 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="EXHAUSTED">Exhausted</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchData()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Alerts */}
          {alertSummary && alertSummary.total > 0 && (
            <Link
              href="/authorizations/alerts"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200"
            >
              <AlertTriangle className="h-3 w-3" />
              {alertSummary.total} Alerts
            </Link>
          )}

          {/* New Authorization */}
          <Link
            href="/authorizations/new"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Authorization
          </Link>
        </div>
      </div>

      {/* Authorization Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("client")}
                >
                  Client {renderSortIndicator("client")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("authNumber")}
                >
                  Auth # {renderSortIndicator("authNumber")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("service")}
                >
                  Service {renderSortIndicator("service")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("usage")}
                >
                  Usage {renderSortIndicator("usage")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  onClick={() => handleHeaderClick("dateRange")}
                >
                  Period {renderSortIndicator("dateRange")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("status")}
                >
                  Status {renderSortIndicator("status")}
                </th>
                <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">
                  Alerts
                </th>
                <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 w-10">
                  {/* Actions */}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                    <p className="text-[11px] text-gray-500 mt-1">Loading...</p>
                  </td>
                </tr>
              ) : processedAuthorizations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <ShieldCheck className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-[11px] text-gray-500">
                      {search || statusFilter
                        ? "No authorizations match your filters"
                        : "No authorizations found. Add one to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                processedAuthorizations.map((auth, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  return (
                    <tr
                      key={auth.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                      onClick={() => router.push(`/authorizations/${auth.id}`)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700">
                            {auth.client.firstName[0]}{auth.client.lastName[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">
                              {auth.client.firstName} {auth.client.lastName}
                            </p>
                            {auth.client.medicaidId && (
                              <p className="text-[10px] text-gray-500">{auth.client.medicaidId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[11px] text-gray-700">{auth.authorizationNumber}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[11px] text-gray-700">{auth.serviceCode}</span>
                      </td>
                      <td className="px-3 py-2">
                        <UsageCell auth={auth} />
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <div className="text-[10px] text-gray-600">
                          <p>{formatDate(auth.startDate)}</p>
                          <p className="text-gray-400">to {formatDate(auth.endDate)}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${STATUS_COLORS[auth.status] || "bg-gray-100 text-gray-600"}`}>
                          {auth.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <AlertsCell auth={auth} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === auth.id ? null : auth.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                          {actionMenuOpen === auth.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded shadow-lg bg-white border border-gray-200 z-50">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/authorizations/${auth.id}`);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <Eye className="mr-2 h-3 w-3" />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/authorizations/${auth.id}/edit`);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/authorizations/new?renew=${auth.id}`);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <RefreshCw className="mr-2 h-3 w-3" />
                                  Renew
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-100"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
          Showing {processedAuthorizations.length} authorization{processedAuthorizations.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
