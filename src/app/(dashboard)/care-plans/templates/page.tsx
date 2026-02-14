"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormTemplateStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  Breadcrumb,
} from "@/components/ui";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  FileText,
  MoreVertical,
  CheckCircle,
  XCircle,
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

const STATUS_COLORS: Record<FormTemplateStatus, "default" | "success" | "warning" | "error"> = {
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
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/care-plans/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      setTemplates(data.templates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/care-plans/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete template");
      }

      fetchTemplates();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete template");
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
      alert(err instanceof Error ? err.message : "Failed to update template");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Care Plans", href: "/care-plans" },
          { label: "Templates" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Care Plan Templates</h1>
          <p className="text-foreground-secondary mt-1">
            Create and manage templates for care plans
          </p>
        </div>
        <Button onClick={() => router.push("/care-plans/templates/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FormTemplateStatus | "")}
              className="w-40"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Button variant="secondary" onClick={fetchTemplates}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchTemplates}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No templates found.</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => router.push("/care-plans/templates/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/care-plans/templates/${template.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant={STATUS_COLORS[template.status]}>
                          {STATUS_LABELS[template.status]}
                        </Badge>
                        {template.isEnabled && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-foreground-secondary mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                        <span>v{template.version}</span>
                        <span>{template.sectionCount} sections</span>
                        <span>{template.carePlanCount} care plans</span>
                        <span>
                          Created by {template.createdBy.firstName} {template.createdBy.lastName}
                        </span>
                        <span>Updated {formatDate(template.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === template.id ? null : template.id);
                      }}
                      className="p-2 hover:bg-background-secondary rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenu === template.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(null);
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/care-plans/templates/${template.id}`);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEnabled(template);
                              setActiveMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                          >
                            {template.isEnabled ? (
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2 text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
