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
  Copy,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  isEnabled: boolean;
  version: number;
  sectionsCount: number;
  fieldsCount: number;
  updatedAt: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  } | null;
  settings?: {
    access?: {
      isPublic?: boolean;
    };
  } | null;
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  ARCHIVED: "default",
};

export default function ClientFormTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<TemplateItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [accessFilter, setAccessFilter] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("updatedAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/visit-notes/templates?type=CLIENT_FORM");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load templates");
      }
      setTemplates(data.templates || []);
      setTotal(data.pagination?.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  const copyTemplateLink = async (templateId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/templates/${templateId}`);
      toast.success("Public template link copied");
      setActionMenuOpen(null);
    } catch {
      toast.error("Failed to copy public template link");
    }
  };

  const processedTemplates = React.useMemo(() => {
    let filtered = templates;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((template) => {
        const creatorName = template.createdBy
          ? `${template.createdBy.firstName || ""} ${template.createdBy.lastName || ""}`.trim()
          : "";

        return (
          template.name.toLowerCase().includes(searchLower) ||
          (template.description || "").toLowerCase().includes(searchLower) ||
          creatorName.toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((template) => template.status === statusFilter);
    }

    if (accessFilter) {
      filtered = filtered.filter((template) =>
        accessFilter === "PUBLIC"
          ? Boolean(template.settings?.access?.isPublic)
          : !template.settings?.access?.isPublic
      );
    }

    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortColumn) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          case "access":
            aVal = a.settings?.access?.isPublic ? "public" : "private";
            bVal = b.settings?.access?.isPublic ? "public" : "private";
            break;
          case "version":
            aVal = a.version;
            bVal = b.version;
            break;
          case "structure":
            aVal = a.fieldsCount;
            bVal = b.fieldsCount;
            break;
          case "updatedAt":
            aVal = new Date(a.updatedAt).getTime();
            bVal = new Date(b.updatedAt).getTime();
            break;
          case "createdBy":
            aVal = `${a.createdBy?.firstName || ""} ${a.createdBy?.lastName || ""}`.trim().toLowerCase();
            bVal = `${b.createdBy?.firstName || ""} ${b.createdBy?.lastName || ""}`.trim().toLowerCase();
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
  }, [accessFilter, search, sortColumn, sortDirection, statusFilter, templates]);

  const columns: ColumnDef<TemplateItem>[] = [
    {
      id: "name",
      header: "Template",
      sortable: true,
      minWidth: "240px",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.description && (
            <p className="max-w-[240px] truncate text-xs text-foreground-secondary">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      minWidth: "130px",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusCell
            status={row.status}
            label={row.status.charAt(0) + row.status.slice(1).toLowerCase()}
            variant={STATUS_VARIANTS[row.status] || "default"}
          />
          <Badge variant={row.isEnabled ? "success" : "default"}>
            {row.isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      ),
    },
    {
      id: "access",
      header: "Access",
      sortable: true,
      minWidth: "120px",
      align: "center",
      cell: (row) => (
        <Badge variant={row.settings?.access?.isPublic ? "warning" : "default"}>
          {row.settings?.access?.isPublic ? "Public" : "Private"}
        </Badge>
      ),
    },
    {
      id: "version",
      header: "Version",
      sortable: true,
      minWidth: "80px",
      align: "center",
      cell: (row) => <span className="font-medium">v{row.version}</span>,
    },
    {
      id: "structure",
      header: "Structure",
      sortable: true,
      minWidth: "120px",
      align: "center",
      cell: (row) => (
        <span className="text-sm text-foreground-secondary">
          {row.sectionsCount} sections / {row.fieldsCount} fields
        </span>
      ),
    },
    {
      id: "createdBy",
      header: "Created By",
      sortable: true,
      hideOnMobile: true,
      minWidth: "170px",
      cell: (row) =>
        row.createdBy ? (
          <UserCell
            firstName={row.createdBy.firstName}
            lastName={row.createdBy.lastName}
          />
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      sortable: true,
      hideOnMobile: true,
      minWidth: "140px",
      cell: (row) => <DateCell date={row.updatedAt} showTime />,
    },
  ];

  const rowActions = (row: TemplateItem) => {
    const canCopyPublicLink =
      row.status === "ACTIVE" && row.isEnabled && Boolean(row.settings?.access?.isPublic);

    return (
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
                  router.push(`/client-forms/templates/${row.id}/edit`);
                }}
                className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </button>
              {canCopyPublicLink && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTemplateLink(row.id);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Public Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Client Form Templates</h1>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Access</option>
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>

          <button
            onClick={() => fetchTemplates()}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <Link
            href="/client-forms"
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            <FileText className="h-3 w-3" />
            Submissions
          </Link>

          <Link
            href="/client-forms/templates/new"
            className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Template
          </Link>
        </div>
      </div>

      {error && <div className="rounded-md bg-error/10 p-4 text-sm text-error">{error}</div>}

      <DataTable
        data={processedTemplates}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/client-forms/templates/${row.id}/edit`)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={(column, direction) => {
          setSortColumn(direction ? column : null);
          setSortDirection(direction);
        }}
        rowActions={rowActions}
        emptyIcon={<ClipboardList className="h-8 w-8" />}
        emptyMessage={
          search || statusFilter || accessFilter
            ? "No client form templates match your filters"
            : "No client form templates found. Create one to get started."
        }
      />

    </div>
  );
}
