"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  DataTable,
  DateCell,
  StatusCell,
  UserCell,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  ClipboardList,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  status: string;
  submittedAt: string;
  isPublicSubmission: boolean;
  submittedByName: string | null;
  submittedByEmail: string | null;
  template: { id: string; name: string };
  client: { id: string; firstName: string; lastName: string } | null;
  submittedBy?: { id: string; firstName: string; lastName: string } | null;
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "default"> = {
  SUBMITTED: "success",
};

export default function ClientFormsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = React.useState<SubmissionItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("submittedAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  const fetchSubmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/client-forms");
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data.submissions || []);
        setTotal(data.pagination?.total || 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  const processedSubmissions = React.useMemo(() => {
    let filtered = submissions;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((submission) => {
        const submitterName = submission.submittedBy
          ? `${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`
          : submission.submittedByName || "";

        return (
          submission.template.name.toLowerCase().includes(searchLower) ||
          (submission.client?.firstName || "").toLowerCase().includes(searchLower) ||
          (submission.client?.lastName || "").toLowerCase().includes(searchLower) ||
          submitterName.toLowerCase().includes(searchLower) ||
          (submission.submittedByEmail || "").toLowerCase().includes(searchLower)
        );
      });
    }

    if (sourceFilter) {
      filtered = filtered.filter((submission) =>
        sourceFilter === "PUBLIC" ? submission.isPublicSubmission : !submission.isPublicSubmission
      );
    }

    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortColumn) {
          case "template":
            aVal = a.template.name.toLowerCase();
            bVal = b.template.name.toLowerCase();
            break;
          case "client":
            aVal = a.client
              ? `${a.client.firstName} ${a.client.lastName}`.toLowerCase()
              : "";
            bVal = b.client
              ? `${b.client.firstName} ${b.client.lastName}`.toLowerCase()
              : "";
            break;
          case "source":
            aVal = a.isPublicSubmission ? "public" : "dashboard";
            bVal = b.isPublicSubmission ? "public" : "dashboard";
            break;
          case "submittedBy":
            aVal = a.submittedBy
              ? `${a.submittedBy.firstName} ${a.submittedBy.lastName}`.toLowerCase()
              : (a.submittedByName || a.submittedByEmail || "").toLowerCase();
            bVal = b.submittedBy
              ? `${b.submittedBy.firstName} ${b.submittedBy.lastName}`.toLowerCase()
              : (b.submittedByName || b.submittedByEmail || "").toLowerCase();
            break;
          case "submittedAt":
            aVal = new Date(a.submittedAt).getTime();
            bVal = new Date(b.submittedAt).getTime();
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
  }, [search, sourceFilter, sortColumn, sortDirection, submissions]);

  const columns: ColumnDef<SubmissionItem>[] = [
    {
      id: "template",
      header: "Form",
      sortable: true,
      minWidth: "220px",
      cell: (row) => <p className="font-medium text-gray-900">{row.template.name}</p>,
    },
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "170px",
      cell: (row) => (
        row.client ? (
          <UserCell firstName={row.client.firstName} lastName={row.client.lastName} />
        ) : (
          <span className="text-gray-400">Any client</span>
        )
      ),
    },
    {
      id: "status",
      header: "Status",
      minWidth: "110px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          label={row.status.charAt(0) + row.status.slice(1).toLowerCase()}
          variant={STATUS_VARIANTS[row.status] || "default"}
        />
      ),
    },
    {
      id: "source",
      header: "Source",
      sortable: true,
      minWidth: "120px",
      align: "center",
      cell: (row) => (
        <Badge variant={row.isPublicSubmission ? "warning" : "default"}>
          {row.isPublicSubmission ? "Public" : "Dashboard"}
        </Badge>
      ),
    },
    {
      id: "submittedBy",
      header: "Submitter",
      sortable: true,
      hideOnMobile: true,
      minWidth: "180px",
      cell: (row) => {
        if (row.submittedBy) {
          return (
            <UserCell
              firstName={row.submittedBy.firstName}
              lastName={row.submittedBy.lastName}
              subtitle="Staff submission"
            />
          );
        }

        if (row.submittedByName || row.submittedByEmail) {
          const [firstName, ...lastParts] = (row.submittedByName || "").split(" ");
          return (
            <UserCell
              firstName={firstName}
              lastName={lastParts.join(" ") || undefined}
              email={row.submittedByEmail || undefined}
              subtitle="Public submitter"
            />
          );
        }

        return <span className="text-gray-400">-</span>;
      },
    },
    {
      id: "submittedAt",
      header: "Submitted",
      sortable: true,
      hideOnMobile: true,
      minWidth: "150px",
      cell: (row) => <DateCell date={row.submittedAt} showTime />,
    },
  ];

  const rowActions = (row: SubmissionItem) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActionMenuOpen(actionMenuOpen === row.id ? null : row.id);
        }}
        className="rounded p-1 hover:bg-background-secondary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {actionMenuOpen === row.id && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-background shadow-lg">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/client-forms/${row.id}`);
              }}
              className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Submission
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Client Forms</h1>
          <span className="text-xs text-gray-500">{total} total</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded border border-gray-300 px-2 py-1 pl-7 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="DASHBOARD">Dashboard</option>
            <option value="PUBLIC">Public</option>
          </select>

          <button
            onClick={() => fetchSubmissions()}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <Link
            href="/client-forms/templates"
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            <FileText className="h-3 w-3" />
            Templates
          </Link>

          <Link
            href="/client-forms/new"
            className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Submission
          </Link>
        </div>
      </div>

      <DataTable
        data={processedSubmissions}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/client-forms/${row.id}`)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={(column, direction) => {
          setSortColumn(direction ? column : null);
          setSortDirection(direction);
        }}
        rowActions={rowActions}
        emptyIcon={<ClipboardList className="h-8 w-8" />}
        emptyMessage={
          search || sourceFilter
            ? "No client form submissions match your filters"
            : "No client form submissions found. Create one to get started."
        }
      />
    </div>
  );
}
