"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui";
import { FormBuilder } from "@/components/visit-notes/form-builder";
import type { FormTemplateData } from "@/lib/visit-notes/types";
import { DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS } from "@/lib/client-forms/types";
import { TemplateSettingsPanel } from "@/components/client-forms/template-settings-panel";

export default function NewClientFormTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = React.useState<FormTemplateData>({
    name: "New Client Form Template",
    status: "DRAFT",
    version: 1,
    isEnabled: false,
    settings: DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS,
    sections: [
      {
        id: `section-${Date.now()}`,
        title: "Section 1",
        order: 0,
        fields: [],
      },
    ],
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async (publish: boolean) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch("/api/visit-notes/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          type: "CLIENT_FORM",
          status: publish ? "ACTIVE" : template.status,
          isEnabled: publish ? true : template.isEnabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }
      router.push(`/client-forms/templates/${data.template.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
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
            <h1 className="text-lg font-semibold">Create Client Form Template</h1>
            <p className="text-sm text-foreground-secondary">Build a reusable form for client-specific collection.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-error">{error}</span>}
          <Button variant="ghost" onClick={() => save(false)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => save(true)} disabled={isSaving}>
            Publish
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <FormBuilder template={template} onChange={setTemplate} />
        </div>
        <div className="w-[380px] bg-background">
          <TemplateSettingsPanel
            settings={((template.settings as unknown) as typeof DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS) || DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS}
            onChange={(settings) => setTemplate((current) => ({ ...current, settings }))}
          />
        </div>
      </div>
    </div>
  );
}
