"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Save } from "lucide-react";
import { Button } from "@/components/ui";
import { FormBuilder } from "@/components/visit-notes/form-builder";
import type { FormTemplateData } from "@/lib/visit-notes/types";
import { DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS } from "@/lib/client-forms/types";
import { TemplateSettingsPanel } from "@/components/client-forms/template-settings-panel";
import { toast } from "sonner";

function normalizeTemplate(data: Record<string, unknown>): FormTemplateData {
  return {
    id: data.id as string | undefined,
    name: data.name as string,
    description: (data.description as string | null) || undefined,
    status: data.status as FormTemplateData["status"],
    version: data.version as number,
    isEnabled: Boolean(data.isEnabled),
    settings: (data.settings as unknown) || DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS,
    sections: (data.sections as FormTemplateData["sections"]) || [],
  };
}

export default function EditClientFormTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const [template, setTemplate] = React.useState<FormTemplateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/visit-notes/templates/${templateId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load template");
        }
        setTemplate(normalizeTemplate(data.template));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const save = async (publish: boolean) => {
    if (!template) return;

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          status: publish ? "ACTIVE" : template.status,
          isEnabled: publish ? true : template.isEnabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }
      setTemplate(normalizeTemplate(data.template));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-foreground-secondary">Loading template...</div>;
  }

  if (!template) {
    return <div className="text-sm text-error">{error || "Template not found"}</div>;
  }

  const clientFormSettings =
    ((template.settings as unknown) as typeof DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS) ||
    DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS;
  const canGeneratePublicLink =
    template.status === "ACTIVE" && template.isEnabled && clientFormSettings.access.isPublic;

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/templates/${templateId}`);
      toast.success("Public template link copied");
    } catch {
      toast.error("Failed to copy public template link");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/client-forms/templates">
            <button type="button" className="rounded p-1 hover:bg-background-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{template.name}</h1>
            <p className="text-sm text-foreground-secondary">Client form template editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-error">{error}</span>}
          {canGeneratePublicLink ? (
            <Button variant="ghost" onClick={copyPublicLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Public Link
            </Button>
          ) : (
            <Button variant="ghost" disabled>
              <Copy className="mr-2 h-4 w-4" />
              Copy Public Link
            </Button>
          )}
          <Button variant="ghost" onClick={() => save(false)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={() => save(true)} disabled={isSaving}>
            Publish & Enable
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <FormBuilder template={template} onChange={setTemplate} />
        </div>
        <div className="w-[380px] bg-background">
          <TemplateSettingsPanel
            settings={clientFormSettings}
            onChange={(settings) => setTemplate((current) => (current ? { ...current, settings } : current))}
          />
        </div>
      </div>
    </div>
  );
}
