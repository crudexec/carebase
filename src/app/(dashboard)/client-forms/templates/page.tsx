"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FileText, Plus, RefreshCw } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  isEnabled: boolean;
  version: number;
  settings?: {
    access?: {
      isPublic?: boolean;
    };
  } | null;
}

export default function ClientFormTemplatesPage() {
  const [templates, setTemplates] = React.useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/visit-notes/templates?type=CLIENT_FORM");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load templates");
      }
      setTemplates(data.templates || []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Form Templates</h1>
          <p className="text-foreground-secondary">
            Create reusable private and public client forms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchTemplates}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/client-forms/templates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {error && <div className="rounded-md bg-error/10 p-4 text-sm text-error">{error}</div>}

      {isLoading ? (
        <div className="text-sm text-foreground-secondary">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-foreground-secondary">
            No client form templates yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Link key={template.id} href={`/client-forms/templates/${template.id}/edit`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground-secondary">
                  {template.description && <p>{template.description}</p>}
                  <div className="flex flex-wrap gap-4">
                    <span>Status: {template.status}</span>
                    <span>Version: v{template.version}</span>
                    <span>{template.isEnabled ? "Enabled" : "Disabled"}</span>
                    <span>{template.settings?.access?.isPublic ? "Public-capable" : "Private only"}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
