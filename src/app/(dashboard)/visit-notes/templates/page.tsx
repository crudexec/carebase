"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Card, CardContent, Input } from "@/components/ui";
import { Plus, Search, FileText, MoreVertical, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { FormTemplateListItem } from "@/lib/visit-notes/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<FormTemplateListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/visit-notes/templates");
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
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
    setActionMenuOpen(null);
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
    setActionMenuOpen(null);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string, isEnabled: boolean) => {
    if (status === "ARCHIVED") {
      return <Badge variant="default">Archived</Badge>;
    }
    if (status === "DRAFT") {
      return <Badge variant="warning">Draft</Badge>;
    }
    if (isEnabled) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="default">Disabled</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Templates</h1>
          <p className="text-foreground-secondary">
            Create and manage visit note form templates
          </p>
        </div>
        <Link href="/visit-notes/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="pl-10"
        />
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 rounded bg-background-secondary" />
                <div className="mt-2 h-4 w-1/2 rounded bg-background-secondary" />
                <div className="mt-4 h-4 w-full rounded bg-background-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-foreground-tertiary" />
            <h3 className="mt-4 text-lg font-medium">No templates yet</h3>
            <p className="mt-1 text-foreground-secondary">
              Create your first form template to get started
            </p>
            <Link href="/visit-notes/templates/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    {template.description && (
                      <p className="mt-1 text-sm text-foreground-secondary line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="relative ml-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActionMenuOpen(
                          actionMenuOpen === template.id ? null : template.id
                        )
                      }
                      className="rounded p-1 hover:bg-background-secondary"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {actionMenuOpen === template.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActionMenuOpen(null)}
                        />
                        <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border border-border bg-background py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/visit-notes/templates/${template.id}/edit`)
                            }
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleEnabled(template.id, template.isEnabled)
                            }
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
                          >
                            {template.isEnabled ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Enable
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTemplate(template.id)}
                            className="flex w-full items-center px-4 py-2 text-sm text-error hover:bg-background-secondary"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {getStatusBadge(template.status, template.isEnabled)}
                  <span className="text-xs text-foreground-tertiary">
                    v{template.version}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-foreground-tertiary">
                  <span>
                    {template.sectionsCount} section
                    {template.sectionsCount !== 1 ? "s" : ""} &middot;{" "}
                    {template.fieldsCount} field
                    {template.fieldsCount !== 1 ? "s" : ""}
                  </span>
                  <span>
                    by {template.createdBy.firstName} {template.createdBy.lastName}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
