"use client";

import * as React from "react";
import Link from "next/link";
import { FormTemplateStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  Edit2,
  Users,
  User,
  FileEdit,
  Power,
  PowerOff,
} from "lucide-react";

interface ProfileTemplate {
  id: string;
  name: string;
  description: string | null;
  type: "STAFF_PROFILE" | "CLIENT_PROFILE";
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  sectionsCount: number;
  fieldsCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

const TYPE_LABELS = {
  STAFF_PROFILE: "Staff Profile",
  CLIENT_PROFILE: "Client Profile",
};

const TYPE_ICONS = {
  STAFF_PROFILE: Users,
  CLIENT_PROFILE: User,
};

const STATUS_COLORS: Record<FormTemplateStatus, "primary" | "success" | "warning" | "error" | "default"> = {
  DRAFT: "warning",
  ACTIVE: "success",
  ARCHIVED: "error",
};

export default function ProfileTemplatesPage() {
  const [templates, setTemplates] = React.useState<ProfileTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch both staff and client profile templates
      const [staffRes, clientRes] = await Promise.all([
        fetch("/api/visit-notes/templates?type=STAFF_PROFILE"),
        fetch("/api/visit-notes/templates?type=CLIENT_PROFILE"),
      ]);

      if (!staffRes.ok || !clientRes.ok) {
        throw new Error("Failed to fetch templates");
      }

      const [staffData, clientData] = await Promise.all([
        staffRes.json(),
        clientRes.json(),
      ]);

      setTemplates([...staffData.templates, ...clientData.templates]);
      setError(null);
    } catch {
      setError("Failed to load profile templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleToggleEnabled = async (template: ProfileTemplate) => {
    try {
      const response = await fetch(`/api/visit-notes/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !template.isEnabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      await fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update template");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const staffTemplates = templates.filter((t) => t.type === "STAFF_PROFILE");
  const clientTemplates = templates.filter((t) => t.type === "CLIENT_PROFILE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Profile Templates</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Configure custom fields for staff and client profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchTemplates()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Staff Profile Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle>Staff Profile Fields</CardTitle>
                </div>
                <Link href="/settings/profile-templates/new?type=STAFF_PROFILE">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Template
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Define custom fields collected when adding or editing staff members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {staffTemplates.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <FileEdit className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No staff profile templates yet</p>
                  <Link href="/settings/profile-templates/new?type=STAFF_PROFILE">
                    <Button variant="ghost" size="sm" className="mt-2">
                      Create your first template
                    </Button>
                  </Link>
                </div>
              ) : (
                staffTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onToggleEnabled={handleToggleEnabled}
                    formatDate={formatDate}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Client Profile Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-success" />
                  <CardTitle>Client Profile Fields</CardTitle>
                </div>
                <Link href="/settings/profile-templates/new?type=CLIENT_PROFILE">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Template
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Define custom fields collected when adding or editing clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientTemplates.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <FileEdit className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No client profile templates yet</p>
                  <Link href="/settings/profile-templates/new?type=CLIENT_PROFILE">
                    <Button variant="ghost" size="sm" className="mt-2">
                      Create your first template
                    </Button>
                  </Link>
                </div>
              ) : (
                clientTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onToggleEnabled={handleToggleEnabled}
                    formatDate={formatDate}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onToggleEnabled,
  formatDate,
}: {
  template: ProfileTemplate;
  onToggleEnabled: (template: ProfileTemplate) => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background-secondary transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{template.name}</span>
          <Badge variant={STATUS_COLORS[template.status]}>
            {template.status}
          </Badge>
          {template.isEnabled && (
            <Badge variant="success">Active</Badge>
          )}
        </div>
        <div className="text-xs text-foreground-tertiary mt-1">
          {template.sectionsCount} sections, {template.fieldsCount} fields
          <span className="mx-2">|</span>
          Updated {formatDate(template.updatedAt)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleEnabled(template)}
          title={template.isEnabled ? "Disable" : "Enable"}
        >
          {template.isEnabled ? (
            <PowerOff className="w-4 h-4 text-error" />
          ) : (
            <Power className="w-4 h-4 text-success" />
          )}
        </Button>
        <Link href={`/settings/profile-templates/${template.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
