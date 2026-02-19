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
  DateCell,
  UserCell,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardList,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Trash2,
  Copy,
  Loader2,
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Assessments" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-foreground-secondary">
            Clinical assessments and evaluations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/assessments/templates">
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/assessments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - Compact inline */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <span className="font-semibold">{stats.inProgress}</span>
          <span className="text-foreground-secondary">in progress</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="font-semibold">{stats.completed}</span>
          <span className="text-foreground-secondary">completed</span>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span className="font-semibold">{stats.total}</span>
          <span className="text-foreground-secondary">total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              placeholder="Search by client, template, or assessor..."
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
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {/* Assessments Table */}
      <DataTable
        data={processedAssessments}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/assessments/${row.id}`)}
        emptyIcon={<ClipboardList className="h-12 w-12" />}
        emptyMessage={
          search || statusFilter
            ? "No assessments match your filters"
            : "No assessments found. Create one to get started."
        }
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        rowActions={rowActions}
        stickyHeader
      />

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
