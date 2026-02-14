"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Card, CardContent, Input } from "@/components/ui";
import {
  Plus,
  Search,
  ClipboardList,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { AssessmentTemplateListItem, SCORING_METHOD_LABELS } from "@/lib/assessments/types";

export default function AssessmentTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<AssessmentTemplateListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
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
    setActionMenuOpen(null);
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this assessment template?")) return;

    try {
      const response = await fetch(`/api/assessments/templates/${templateId}`, {
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

  const getStatusBadge = (isActive: boolean, isRequired: boolean) => {
    if (isRequired) {
      return <Badge variant="info">Required</Badge>;
    }
    if (isActive) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="default">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Templates</h1>
          <p className="text-foreground-secondary">
            Create and manage assessment templates for client evaluations
          </p>
        </div>
        <Link href="/assessments/templates/new">
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
            <ClipboardList className="h-12 w-12 text-foreground-tertiary" />
            <h3 className="mt-4 text-lg font-medium">No assessment templates yet</h3>
            <p className="mt-1 text-foreground-secondary">
              Create your first assessment template to get started
            </p>
            <Link href="/assessments/templates/new" className="mt-4">
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
                              router.push(`/assessments/templates/${template.id}/edit`)
                            }
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(template.id, template.isActive)}
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-background-secondary"
                          >
                            {template.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
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
                  {getStatusBadge(template.isActive, template.isRequired)}
                  <span className="text-xs text-foreground-tertiary">
                    v{template.version}
                  </span>
                </div>

                <div className="mt-2 text-xs text-foreground-tertiary">
                  Scoring: {SCORING_METHOD_LABELS[template.scoringMethod]}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-foreground-tertiary">
                  <span>
                    {template.sectionsCount} section
                    {template.sectionsCount !== 1 ? "s" : ""} &middot;{" "}
                    {template.itemsCount} question
                    {template.itemsCount !== 1 ? "s" : ""}
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
