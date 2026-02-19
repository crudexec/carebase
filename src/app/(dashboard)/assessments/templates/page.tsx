"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Badge,
  Input,
  Breadcrumb,
  DataTable,
  StatusCell,
  ConfirmActionModal,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardList,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Eye,
  RefreshCw,
} from "lucide-react";
import { AssessmentTemplateListItem, SCORING_METHOD_LABELS } from "@/lib/assessments/types";

export default function AssessmentTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<AssessmentTemplateListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

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

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = () => setOpenActionId(null);
    if (openActionId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openActionId]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      // Include inactive templates so admins can re-enable them
      const response = await fetch("/api/assessments/templates?includeInactive=true");
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (templateId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/assessments/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to toggle template:", error);
    }
    setOpenActionId(null);
  };

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setOpenActionId(null);
    setDeleteModal({ isOpen: true, templateId, templateName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.templateId) return;

    const templateId = deleteModal.templateId;

    try {
      const response = await fetch(`/api/assessments/templates/${templateId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Start fade-out animation
        setDeletingId(templateId);
        // Wait for animation to complete, then remove from state
        setTimeout(() => {
          setTemplates((prev) => prev.filter((t) => t.id !== templateId));
          setDeletingId(null);
        }, 300);
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error;
    }
  };

  // Filter and sort templates
  const processedTemplates = React.useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aVal: string | number | boolean | null = null;
        let bVal: string | number | boolean | null = null;

        switch (sortColumn) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "status":
            aVal = a.isActive ? 1 : 0;
            bVal = b.isActive ? 1 : 0;
            break;
          case "version":
            aVal = a.version;
            bVal = b.version;
            break;
          case "sections":
            aVal = a.sectionsCount;
            bVal = b.sectionsCount;
            break;
          case "items":
            aVal = a.itemsCount;
            bVal = b.itemsCount;
            break;
          case "scoringMethod":
            aVal = a.scoringMethod;
            bVal = b.scoringMethod;
            break;
          default:
            return 0;
        }

        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [templates, searchQuery, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const handleRowClick = (template: AssessmentTemplateListItem) => {
    router.push(`/assessments/templates/${template.id}/edit`);
  };

  // Column definitions
  const columns: ColumnDef<AssessmentTemplateListItem>[] = [
    {
      id: "name",
      header: "Template Name",
      sortable: true,
      minWidth: "250px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{row.name}</span>
              {row.isRequired && (
                <Badge variant="info" className="text-xs flex-shrink-0">
                  Required
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
      width: "110px",
      cell: (row) => (
        <StatusCell
          status={row.isActive ? "Active" : "Inactive"}
          label={row.isActive ? "Active" : "Inactive"}
          variant={row.isActive ? "success" : "default"}
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
      id: "sections",
      header: "Sections",
      sortable: true,
      width: "100px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-foreground-secondary">{row.sectionsCount}</span>
      ),
    },
    {
      id: "items",
      header: "Questions",
      sortable: true,
      width: "110px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-foreground-secondary">{row.itemsCount}</span>
      ),
    },
    {
      id: "scoringMethod",
      header: "Scoring",
      sortable: true,
      hideOnMobile: true,
      minWidth: "130px",
      cell: (row) => (
        <span className="text-foreground-secondary text-sm">
          {SCORING_METHOD_LABELS[row.scoringMethod]}
        </span>
      ),
    },
  ];

  // Row actions
  const renderRowActions = (row: AssessmentTemplateListItem) => (
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
            onClick={() => router.push(`/assessments/templates/${row.id}/edit`)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Template
          </button>
          <button
            onClick={() => {
              toggleActive(row.id, row.isActive);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            {row.isActive ? (
              <>
                <PowerOff className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                Activate
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
          { label: "Assessments", href: "/assessments" },
          { label: "Templates" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Assessment Templates</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Create and manage assessment templates for client evaluations
          </p>
        </div>
        <Link href="/assessments/templates/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" onClick={fetchTemplates} className="sm:w-auto">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

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
        emptyIcon={<ClipboardList className="w-12 h-12" />}
        emptyMessage={
          searchQuery
            ? "No templates match your search."
            : "No assessment templates yet. Create your first template to get started."
        }
      />

      {/* Delete Template Modal */}
      <ConfirmActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, templateId: null, templateName: null })}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="Delete Assessment Template"
        description="Are you sure you want to delete this assessment template?"
        itemName={deleteModal.templateName || undefined}
        confirmText="Delete"
      />
    </div>
  );
}
