"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Input,
  Breadcrumb,
  DataTable,
  StatusCell,
  UserCell,
  ConfirmActionModal,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Download,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { FormTemplateListItem } from "@/lib/visit-notes/types";

interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  sectionsCount: number;
  fieldsCount: number;
}

const _STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "error" | "primary"> = {
  DRAFT: "warning",
  ACTIVE: "success",
  ARCHIVED: "default",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [templates, setTemplates] = React.useState<FormTemplateListItem[]>([]);
  const [starterTemplates, setStarterTemplates] = React.useState<StarterTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openActionId, setOpenActionId] = React.useState<string | null>(null);
  const [showStarters, setShowStarters] = React.useState(false);
  const [cloningId, setCloningId] = React.useState<string | null>(null);
  const [cloneSuccess, setCloneSuccess] = React.useState<string | null>(null);

  // Sorting state
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    templateId: string | null;
    templateName: string | null;
  }>({ isOpen: false, templateId: null, templateName: null });

  // Track which item is being deleted for fade animation
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Redirect sponsors away from templates page
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SPONSOR") {
      router.replace("/visit-notes");
    }
  }, [session, status, router]);

  React.useEffect(() => {
    fetchTemplates();
    fetchStarterTemplates();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = () => setOpenActionId(null);
    if (openActionId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openActionId]);

  // Filter and sort templates
  const processedTemplates = React.useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
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
        let aVal: string | number | boolean | null = null;
        let bVal: string | number | boolean | null = null;

        switch (sortColumn) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "status":
            aVal = a.isEnabled ? 1 : 0;
            bVal = b.isEnabled ? 1 : 0;
            break;
          case "version":
            aVal = a.version;
            bVal = b.version;
            break;
          case "sections":
            aVal = a.sectionsCount;
            bVal = b.sectionsCount;
            break;
          case "fields":
            aVal = a.fieldsCount;
            bVal = b.fieldsCount;
            break;
          case "createdBy":
            aVal = `${a.createdBy.firstName} ${a.createdBy.lastName}`.toLowerCase();
            bVal = `${b.createdBy.firstName} ${b.createdBy.lastName}`.toLowerCase();
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

  // Show nothing while checking auth or if sponsor
  if (status === "loading" || session?.user?.role === "SPONSOR") {
    return null;
  }

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/visit-notes/templates");
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

  const fetchStarterTemplates = async () => {
    try {
      const response = await fetch("/api/visit-notes/templates/starters");
      const data = await response.json();
      if (response.ok) {
        setStarterTemplates(data.starters || []);
      }
    } catch (error) {
      console.error("Failed to fetch starter templates:", error);
    }
  };

  const cloneStarterTemplate = async (starterId: string) => {
    setCloningId(starterId);
    setCloneSuccess(null);

    try {
      const response = await fetch("/api/visit-notes/templates/starters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starterId }),
      });

      const data = await response.json();

      if (response.ok) {
        setCloneSuccess(starterId);
        fetchTemplates();
        // Navigate to edit the new template
        setTimeout(() => {
          router.push(`/visit-notes/templates/${data.template.id}/edit`);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to clone template:", error);
    } finally {
      setCloningId(null);
    }
  };

  const toggleEnabled = async (templateId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
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
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
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

  // Get status display
  const getStatusLabel = (status: string, isEnabled: boolean) => {
    if (status === "ARCHIVED") return "Archived";
    if (status === "DRAFT") return "Draft";
    if (isEnabled) return "Active";
    return "Disabled";
  };

  const getStatusVariant = (status: string, isEnabled: boolean) => {
    if (status === "ARCHIVED") return "default";
    if (status === "DRAFT") return "warning";
    if (isEnabled) return "success";
    return "default";
  };

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const handleRowClick = (template: FormTemplateListItem) => {
    router.push(`/visit-notes/templates/${template.id}/edit`);
  };

  // Column definitions
  const columns: ColumnDef<FormTemplateListItem>[] = [
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
          status={row.status}
          label={getStatusLabel(row.status, row.isEnabled)}
          variant={getStatusVariant(row.status, row.isEnabled)}
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
      id: "fields",
      header: "Fields",
      sortable: true,
      width: "100px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-foreground-secondary">{row.fieldsCount}</span>
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
  ];

  // Row actions
  const renderRowActions = (row: FormTemplateListItem) => (
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
            onClick={() => router.push(`/visit-notes/templates/${row.id}/edit`)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Template
          </button>
          <button
            onClick={() => {
              toggleEnabled(row.id, row.isEnabled);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            {row.isEnabled ? (
              <>
                <PowerOff className="w-4 h-4" />
                Disable
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
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
          { label: "Visit Notes", href: "/visit-notes" },
          { label: "Form Templates" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Form Templates</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Create and manage visit note form templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowStarters(!showStarters)}
          >
            <Download className="w-4 h-4 mr-2" />
            {showStarters ? "Hide Starters" : "Starter Templates"}
          </Button>
          <Link href="/visit-notes/templates/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Starter Templates Section */}
      {showStarters && starterTemplates.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Starter Templates</h2>
                <p className="text-sm text-foreground-secondary">
                  Pre-built templates to help you get started quickly
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {starterTemplates.map((starter) => (
                <div
                  key={starter.id}
                  className="relative rounded-lg border border-border bg-background p-4"
                >
                  <h3 className="font-medium">{starter.name}</h3>
                  <p className="mt-1 text-sm text-foreground-secondary line-clamp-2">
                    {starter.description}
                  </p>
                  <p className="mt-2 text-xs text-foreground-tertiary">
                    {starter.sectionsCount} sections · {starter.fieldsCount} fields
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => cloneStarterTemplate(starter.id)}
                    disabled={cloningId === starter.id || cloneSuccess === starter.id}
                  >
                    {cloningId === starter.id ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Creating...
                      </>
                    ) : cloneSuccess === starter.id ? (
                      <>
                        <CheckCircle className="mr-2 h-3 w-3" />
                        Created!
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-3 w-3" />
                        Use Template
                      </>
                    )}
                  </Button>
                  {starter.id === "medicaid-compliant" && (
                    <Badge variant="success" className="absolute -top-2 -right-2">
                      Recommended
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
        emptyIcon={<FileText className="w-12 h-12" />}
        emptyMessage={
          searchQuery
            ? "No templates match your search."
            : "No form templates yet. Create your first template to get started."
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
