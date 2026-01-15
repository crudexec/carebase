"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormTemplateData } from "@/lib/visit-notes/types";
import { FormBuilder } from "@/components/visit-notes/form-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye, Power, PowerOff } from "lucide-react";
import Link from "next/link";

export default function NewTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = React.useState<FormTemplateData>({
    name: "New Form Template",
    status: "DRAFT",
    version: 1,
    isEnabled: false,
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

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    setError(null);

    try {
      // Construct payload without the template id (it's a new template)
      const payload = {
        name: template.name,
        description: template.description || null,
        status: publish ? "ACTIVE" : "DRAFT",
        isEnabled: publish ? template.isEnabled : false,
        sections: template.sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description || null,
          order: section.order,
          fields: section.fields.map((field) => ({
            id: field.id,
            label: field.label,
            description: field.description || null,
            type: field.type,
            required: field.required,
            order: field.order,
            config: field.config,
          })),
        })),
      };

      const response = await fetch("/api/visit-notes/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      router.push(`/visit-notes/templates/${data.template.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = template.name.trim().length > 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/visit-notes/templates">
            <button
              type="button"
              className="rounded p-1 hover:bg-background-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Create Template</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="warning">Draft</Badge>
              <span className="text-xs text-foreground-tertiary">v1</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-error mr-2">{error}</span>
          )}
          <Button
            variant="ghost"
            onClick={() => handleSave(false)}
            disabled={!isValid || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={!isValid || isSaving}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <FormBuilder template={template} onChange={setTemplate} />
      </div>
    </div>
  );
}
