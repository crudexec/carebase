"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Trash2,
  Download,
  Send,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface OasisAssessment {
  id: string;
  status: string;
  timePoint: string;
  assessorDiscipline: string;
  assessmentDate: string;
  completedAt: string | null;
  exportedAt: string | null;
  template: {
    id: string;
    name: string;
    version: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    medicareNumber: string | null;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    responses: number;
  };
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "default" | "primary"> = {
  DRAFT: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  SUBMITTED_TO_QA: "primary",
  QA_APPROVED: "success",
  QA_REJECTED: "error",
  EXPORTED: "success",
  CORRECTED: "warning",
};

const TIME_POINT_LABELS: Record<string, string> = {
  SOC: "Start of Care",
  ROC: "Resumption of Care",
  FU: "Follow-up",
  TRN: "Transfer",
  DC: "Discharge",
  DAH: "Death at Home",
};

const _DISCIPLINE_LABELS: Record<string, string> = {
  RN: "Registered Nurse",
  PT: "Physical Therapist",
  OT: "Occupational Therapist",
  ST: "Speech Therapist",
};

export default function OasisPage() {
  const router = useRouter();
  const [assessments, setAssessments] = React.useState<OasisAssessment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [timePointFilter, setTimePointFilter] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("assessmentDate");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<OasisAssessment | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/oasis/assessments/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete assessment");
      }

      toast.success("OASIS assessment deleted successfully");
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
      if (timePointFilter) params.set("timePoint", timePointFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/oasis/assessments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAssessments(data.assessments || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch OASIS assessments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, timePointFilter]);

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
          assessment.client.medicareNumber?.toLowerCase().includes(searchLower) ||
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
          case "client":
            aVal = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
            bVal = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
            break;
          case "timePoint":
            aVal = a.timePoint;
            bVal = b.timePoint;
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          case "assessmentDate":
            aVal = new Date(a.assessmentDate).getTime();
            bVal = new Date(b.assessmentDate).getTime();
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
      draft: assessments.filter((a) => a.status === "DRAFT" || a.status === "IN_PROGRESS").length,
      pendingQA: assessments.filter((a) => a.status === "SUBMITTED_TO_QA").length,
      approved: assessments.filter((a) => a.status === "QA_APPROVED").length,
      exported: assessments.filter((a) => a.status === "EXPORTED").length,
      total: total,
    }),
    [assessments, total]
  );

  const columns: ColumnDef<OasisAssessment>[] = [
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <div>
          <UserCell firstName={row.client.firstName} lastName={row.client.lastName} />
          {row.client.medicareNumber && (
            <p className="text-xs text-foreground-tertiary font-mono">
              MBI: {row.client.medicareNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "timePoint",
      header: "Time Point",
      sortable: true,
      minWidth: "140px",
      cell: (row) => (
        <Badge variant="primary">
          {row.timePoint} - {TIME_POINT_LABELS[row.timePoint]?.split(" ").slice(0, 2).join(" ")}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      minWidth: "140px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          label={row.status.replace(/_/g, " ")}
          variant={STATUS_VARIANTS[row.status] || "default"}
        />
      ),
    },
    {
      id: "discipline",
      header: "Discipline",
      minWidth: "80px",
      cell: (row) => (
        <span className="text-sm">{row.assessorDiscipline}</span>
      ),
    },
    {
      id: "responses",
      header: "Items",
      minWidth: "80px",
      cell: (row) => (
        <span className="text-sm text-foreground-secondary">
          {row._count.responses} responses
        </span>
      ),
    },
    {
      id: "assessmentDate",
      header: "Date",
      sortable: true,
      minWidth: "120px",
      cell: (row) => <DateCell date={row.assessmentDate} />,
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

  const rowActions = (row: OasisAssessment) => (
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
                router.push(`/oasis/${row.id}`);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </button>
            {(row.status === "DRAFT" || row.status === "IN_PROGRESS") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/oasis/${row.id}/edit`);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Continue
              </button>
            )}
            {(row.status === "DRAFT" || row.status === "IN_PROGRESS" || row.status === "COMPLETED") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Submit to QA
                  setActionMenuOpen(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit to QA
              </button>
            )}
            {(row.status === "QA_APPROVED" || row.status === "COMPLETED") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Export
                  setActionMenuOpen(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Generate report
                setActionMenuOpen(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Report
            </button>
            {row.status === "DRAFT" && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "OASIS Assessments" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">OASIS Assessments</h1>
          <p className="text-foreground-secondary">
            OASIS-E2 home health assessment management
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/oasis/templates">
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/oasis/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <span className="font-semibold">{stats.draft}</span>
          <span className="text-foreground-secondary">in progress</span>
        </div>
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <span className="font-semibold">{stats.pendingQA}</span>
          <span className="text-foreground-secondary">pending QA</span>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-success" />
          <span className="font-semibold">{stats.approved}</span>
          <span className="text-foreground-secondary">approved</span>
        </div>
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-success" />
          <span className="font-semibold">{stats.exported}</span>
          <span className="text-foreground-secondary">exported</span>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-foreground-tertiary" />
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
              placeholder="Search by client name or Medicare number..."
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
          <option value="DRAFT">Draft</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED_TO_QA">Pending QA</option>
          <option value="QA_APPROVED">QA Approved</option>
          <option value="QA_REJECTED">QA Rejected</option>
          <option value="EXPORTED">Exported</option>
        </Select>
        <Select
          value={timePointFilter}
          onChange={(e) => setTimePointFilter(e.target.value)}
          className="w-[180px]"
        >
          <option value="">All Time Points</option>
          <option value="SOC">Start of Care</option>
          <option value="ROC">Resumption of Care</option>
          <option value="FU">Follow-up</option>
          <option value="TRN">Transfer</option>
          <option value="DC">Discharge</option>
          <option value="DAH">Death at Home</option>
        </Select>
      </div>

      {/* Assessments Table */}
      <DataTable
        data={processedAssessments}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/oasis/${row.id}`)}
        emptyIcon={<ClipboardList className="h-12 w-12" />}
        emptyMessage={
          search || statusFilter || timePointFilter
            ? "No assessments match your filters"
            : "No OASIS assessments found. Create one to get started."
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
            <h3 className="text-lg font-semibold mb-2">Delete OASIS Assessment</h3>
            <p className="text-foreground-secondary mb-4">
              Are you sure you want to delete the {deleteTarget.timePoint} assessment for {deleteTarget.client.firstName} {deleteTarget.client.lastName}? This action cannot be undone.
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
