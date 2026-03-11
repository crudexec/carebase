"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormTemplateStatus } from "@prisma/client";
import {
  Button,
  Badge,
  Input,
  Select,
  Breadcrumb,
  DataTable,
  StatusCell,
  DateCell,
  UserCell,
  ConfirmActionModal,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  FileText,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

interface CarePlanTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  sectionCount: number;
  carePlanCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const STATUS_LABELS: Record<FormTemplateStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

const STATUS_VARIANTS: Record<FormTemplateStatus, "default" | "success" | "warning" | "error" | "primary"> = {
  DRAFT: "warning",
  ACTIVE: "success",
  ARCHIVED: "default",
};

export default function CarePlanTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<CarePlanTemplateListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<FormTemplateStatus | "">("");

  // Sorting state
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  // Actions dropdown
  const [openActionId, setOpenActionId] = React.useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    templateId: string | null;
    templateName: string | null;
  }>({ isOpen: false, templateId: null, templateName: null });

  // Track which item is being deleted for fade animation
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/care-plans/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      setTemplates(data.templates || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = () => setOpenActionId(null);
    if (openActionId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openActionId]);

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setOpenActionId(null);
    setDeleteModal({ isOpen: true, templateId, templateName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.templateId) return;

    const templateId = deleteModal.templateId;

    try {
      const response = await fetch(`/api/care-plans/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete template");
      }

      // Start fade-out animation
      setDeletingId(templateId);
      // Wait for animation to complete, then remove from state
      setTimeout(() => {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        setDeletingId(null);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template");
      throw err;
    }
  };

  const handleToggleEnabled = async (template: CarePlanTemplateListItem) => {
    try {
      const response = await fetch(`/api/care-plans/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !template.isEnabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      fetchTemplates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update template";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Filter and sort templates
  const processedTemplates = React.useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.createdBy.firstName.toLowerCase().includes(searchLower) ||
          t.createdBy.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aVal: string | number | null = null;
        let bVal: string | number | null = null;

        switch (sortColumn) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          case "version":
            aVal = a.version;
            bVal = b.version;
            break;
          case "sectionCount":
            aVal = a.sectionCount;
            bVal = b.sectionCount;
            break;
          case "carePlanCount":
            aVal = a.carePlanCount;
            bVal = b.carePlanCount;
            break;
          case "createdBy":
            aVal = `${a.createdBy.firstName} ${a.createdBy.lastName}`.toLowerCase();
            bVal = `${b.createdBy.firstName} ${b.createdBy.lastName}`.toLowerCase();
            break;
          case "updatedAt":
            aVal = a.updatedAt;
            bVal = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (aVal === null || aVal === "") return 1;
        if (bVal === null || bVal === "") return -1;

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [templates, search, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const handleRowClick = (template: CarePlanTemplateListItem) => {
    router.push(`/care-plans/templates/${template.id}`);
  };

  // Column definitions
  const columns: ColumnDef<CarePlanTemplateListItem>[] = [
    {
      id: "name",
      header: "Template Name",
      sortable: true,
      minWidth: "250px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{row.name}</span>
              {row.isEnabled && (
                <Badge variant="success" className="text-xs flex-shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
            {row.description && (
              <p className="text-xs text-foreground-secondary truncate max-w-xs">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      width: "120px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          label={STATUS_LABELS[row.status]}
          variant={STATUS_VARIANTS[row.status]}
        />
      ),
    },
    {
      id: "version",
      header: "Version",
      sortable: true,
      width: "90px",
      align: "center",
      cell: (row) => (
        <span className="text-foreground-secondary">v{row.version}</span>
      ),
    },
    {
      id: "sectionCount",
      header: "Sections",
      sortable: true,
      width: "100px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-foreground-secondary">{row.sectionCount}</span>
      ),
    },
    {
      id: "carePlanCount",
      header: "Used In",
      sortable: true,
      width: "100px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-foreground-secondary">
          {row.carePlanCount} {row.carePlanCount === 1 ? "plan" : "plans"}
        </span>
      ),
    },
    {
      id: "createdBy",
      header: "Created By",
      sortable: true,
      hideOnMobile: true,
      minWidth: "150px",
      cell: (row) => (
        <UserCell
          firstName={row.createdBy.firstName}
          lastName={row.createdBy.lastName}
        />
      ),
    },
    {
      id: "updatedAt",
      header: "Last Updated",
      sortable: true,
      hideOnMobile: true,
      width: "130px",
      cell: (row) => <DateCell date={row.updatedAt} />,
    },
  ];

  // Row actions
  const renderRowActions = (row: CarePlanTemplateListItem) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenActionId(openActionId === row.id ? null : row.id);
        }}
        className="p-1.5 rounded-md hover:bg-background-secondary transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
      </button>

      {openActionId === row.id && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded-lg shadow-lg py-1 z-20">
          <button
            onClick={() => router.push(`/care-plans/templates/${row.id}`)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Eye className="w-4 h-4" />
            View / Edit
          </button>
          <button
            onClick={() => {
              handleToggleEnabled(row);
              setOpenActionId(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            {row.isEnabled ? (
              <>
                <XCircle className="w-4 h-4" />
                Disable
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Enable
              </>
            )}
          </button>
          <div className="border-t border-border my-1" />
          <button
            onClick={() => handleDeleteClick(row.id, row.name)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Care Plans", href: "/care-plans" },
          { label: "Templates" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Care Plan Templates</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Create and manage templates for care plans
          </p>
        </div>
        <Button onClick={() => router.push("/care-plans/templates/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FormTemplateStatus | "")}
          className="sm:w-40"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Button variant="ghost" onClick={fetchTemplates} className="sm:w-auto">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/10 border border-error/20 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={processedTemplates}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={handleRowClick}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        rowActions={renderRowActions}
        getRowClassName={(row) =>
          deletingId === row.id ? "opacity-0 scale-95" : ""
        }
        emptyIcon={<FileText className="w-12 h-12" />}
        emptyMessage={
          search || statusFilter
            ? "No templates match your filters."
            : "No templates have been created yet."
        }
      />

      {/* Delete Template Modal */}
      <ConfirmActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, templateId: null, templateName: null })}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="Delete Template"
        description="Are you sure you want to delete this template?"
        itemName={deleteModal.templateName || undefined}
        confirmText="Delete"
      />
    </div>
  );
}
