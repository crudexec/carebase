"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  DataTable,
  StatusCell,
  DateCell,
  UserCell,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardList,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Trash2,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Assessment {
  id: string;
  status: string;
  assessmentType: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  interpretation: string | null;
  template: {
    id: string;
    name: string;
    description: string | null;
    maxScore: number | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "default"> = {
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

const TYPE_VARIANTS: Record<string, "primary" | "default"> = {
  INITIAL: "primary",
  REASSESSMENT: "default",
  DISCHARGE: "default",
};

// Score Cell with progress visualization
function ScoreCell({ assessment }: { assessment: Assessment }) {
  if (assessment.status !== "COMPLETED" || assessment.totalScore === null) {
    return <span className="text-foreground-tertiary">-</span>;
  }

  const maxScore = assessment.template.maxScore;
  const percentage = maxScore ? (assessment.totalScore / maxScore) * 100 : null;

  return (
    <div className="min-w-[80px]">
      <span className="font-medium">
        {assessment.totalScore}
        {maxScore && <span className="text-foreground-secondary"> / {maxScore}</span>}
      </span>
      {percentage !== null && (
        <div className="mt-1">
          <div className="h-1.5 w-full bg-background-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                percentage >= 80
                  ? "bg-success"
                  : percentage >= 60
                  ? "bg-warning"
                  : "bg-error"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("startedAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Assessment | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/assessments/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete assessment");
      }

      toast.success("Assessment deleted successfully");
      setDeleteTarget(null);
      fetchAssessments();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAssessments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/assessments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAssessments(data.assessments || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  // Filter and sort assessments
  const processedAssessments = React.useMemo(() => {
    let filtered = assessments;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (assessment) =>
          assessment.client.firstName.toLowerCase().includes(searchLower) ||
          assessment.client.lastName.toLowerCase().includes(searchLower) ||
          assessment.template.name.toLowerCase().includes(searchLower) ||
          assessment.assessor.firstName.toLowerCase().includes(searchLower) ||
          assessment.assessor.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sortColumn) {
          case "template":
            aVal = a.template.name.toLowerCase();
            bVal = b.template.name.toLowerCase();
            break;
          case "client":
            aVal = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
            bVal = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
            break;
          case "type":
            aVal = a.assessmentType;
            bVal = b.assessmentType;
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          case "score":
            aVal = a.totalScore ?? -1;
            bVal = b.totalScore ?? -1;
            break;
          case "startedAt":
            aVal = new Date(a.startedAt).getTime();
            bVal = new Date(b.startedAt).getTime();
            break;
          case "assessor":
            aVal = `${a.assessor.firstName} ${a.assessor.lastName}`.toLowerCase();
            bVal = `${b.assessor.firstName} ${b.assessor.lastName}`.toLowerCase();
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
  }, [assessments, search, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  // Stats calculations
  const stats = React.useMemo(
    () => ({
      inProgress: assessments.filter((a) => a.status === "IN_PROGRESS").length,
      completed: assessments.filter((a) => a.status === "COMPLETED").length,
      total: total,
    }),
    [assessments, total]
  );

  const columns: ColumnDef<Assessment>[] = [
    {
      id: "template",
      header: "Assessment",
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.template.name}</p>
          {row.template.description && (
            <p className="text-xs text-foreground-secondary truncate max-w-[200px]">
              {row.template.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "160px",
      cell: (row) => (
        <UserCell firstName={row.client.firstName} lastName={row.client.lastName} />
      ),
    },
    {
      id: "type",
      header: "Type",
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <Badge variant={TYPE_VARIANTS[row.assessmentType] || "default"}>
          {row.assessmentType.charAt(0) + row.assessmentType.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          label={row.status.replace("_", " ").charAt(0) + row.status.replace("_", " ").slice(1).toLowerCase()}
          variant={STATUS_VARIANTS[row.status] || "default"}
        />
      ),
    },
    {
      id: "score",
      header: "Score",
      sortable: true,
      minWidth: "100px",
      cell: (row) => <ScoreCell assessment={row} />,
    },
    {
      id: "startedAt",
      header: "Started",
      sortable: true,
      hideOnMobile: true,
      minWidth: "120px",
      cell: (row) => <DateCell date={row.startedAt} />,
    },
    {
      id: "assessor",
      header: "Assessor",
      sortable: true,
      hideOnMobile: true,
      minWidth: "140px",
      cell: (row) => (
        <span className="text-sm text-foreground-secondary">
          {row.assessor.firstName} {row.assessor.lastName}
        </span>
      ),
    },
  ];

  const rowActions = (row: Assessment) => (
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
                router.push(`/assessments/${row.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </button>
            {row.status === "IN_PROGRESS" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/assessments/${row.id}`);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Continue
              </button>
            )}
            {row.status === "COMPLETED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Generate report
                  setActionMenuOpen(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/assessments/new?client=${row.client.id}&template=${row.template.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Copy className="mr-2 h-4 w-4" />
              Reassess
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
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
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Assessments</h1>
          <span className="text-xs text-gray-500">{stats.total} total</span>
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
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchAssessments()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Templates */}
          <Link
            href="/assessments/templates"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            <FileText className="h-3 w-3" />
            Templates
          </Link>

          {/* New Assessment */}
          <Link
            href="/assessments/new"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Assessments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : processedAssessments.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 px-3 py-8 text-center">
          <ClipboardList className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">
            {search || statusFilter
              ? "No assessments match your filters"
              : "No assessments found. Create one to get started."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Assessment</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Client</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Type</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Status</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Score</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Started</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Assessor</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600 w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedAssessments.map((assessment, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  const maxScore = assessment.template.maxScore;
                  const percentage = maxScore && assessment.totalScore !== null
                    ? (assessment.totalScore / maxScore) * 100
                    : null;

                  return (
                    <tr
                      key={assessment.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                      onClick={() => router.push(`/assessments/${assessment.id}`)}
                    >
                      {/* Assessment Name */}
                      <td className="px-3 py-1.5">
                        <div>
                          <span className="text-xs font-medium text-gray-900">{assessment.template.name}</span>
                          {assessment.template.description && (
                            <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                              {assessment.template.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-blue-700">
                              {assessment.client.firstName[0]}{assessment.client.lastName[0]}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {assessment.client.firstName} {assessment.client.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          assessment.assessmentType === "INITIAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {assessment.assessmentType.charAt(0) + assessment.assessmentType.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          assessment.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          assessment.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {assessment.status.replace("_", " ").charAt(0) + assessment.status.replace("_", " ").slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-1.5 text-center">
                        {assessment.status === "COMPLETED" && assessment.totalScore !== null ? (
                          <div className="min-w-[60px]">
                            <span className="text-[11px] font-medium text-gray-900">
                              {assessment.totalScore}
                              {maxScore && <span className="text-gray-500">/{maxScore}</span>}
                            </span>
                            {percentage !== null && (
                              <div className="mt-0.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    percentage >= 80 ? "bg-green-500" :
                                    percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Started */}
                      <td className="px-3 py-1.5 text-[10px] text-gray-500">
                        {new Date(assessment.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Assessor */}
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">
                        {assessment.assessor.firstName} {assessment.assessor.lastName[0]}.
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === assessment.id ? null : assessment.id);
                            }}
                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {actionMenuOpen === assessment.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 rounded shadow-lg bg-white border border-gray-200 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => router.push(`/assessments/${assessment.id}`)}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-50"
                                >
                                  <Eye className="mr-2 h-3 w-3" /> View
                                </button>
                                {assessment.status === "IN_PROGRESS" && (
                                  <button
                                    onClick={() => router.push(`/assessments/${assessment.id}`)}
                                    className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-50"
                                  >
                                    <Edit className="mr-2 h-3 w-3" /> Continue
                                  </button>
                                )}
                                <button
                                  onClick={() => router.push(`/assessments/new?client=${assessment.client.id}&template=${assessment.template.id}`)}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-50"
                                >
                                  <Copy className="mr-2 h-3 w-3" /> Reassess
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button
                                  onClick={() => {
                                    setDeleteTarget(assessment);
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
            Showing {processedAssessments.length} assessment{processedAssessments.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Assessment</h3>
            <p className="text-foreground-secondary mb-4">
              Are you sure you want to delete the assessment &quot;{deleteTarget.template.name}&quot; for {deleteTarget.client.firstName} {deleteTarget.client.lastName}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="error"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
