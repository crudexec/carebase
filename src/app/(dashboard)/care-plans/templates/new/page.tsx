"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CarePlanTemplateData } from "@/lib/care-plans/types";
import { TemplateBuilder } from "@/components/care-plans/template-builder/template-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";

export default function NewCarePlanTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = React.useState<CarePlanTemplateData>({
    id: "",
    name: "New Care Plan Template",
    description: null,
    status: "DRAFT",
    version: 1,
    isEnabled: false,
    sections: [],
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: template.name,
        description: template.description,
        status: publish ? "ACTIVE" : "DRAFT",
        isEnabled: publish ? true : false,
        sections: template.sections.map((section, sIdx) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          order: sIdx,
          fields: section.fields.map((field, fIdx) => ({
            id: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            order: fIdx,
            config: field.config,
          })),
        })),
      };

      const response = await fetch("/api/care-plans/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to save template");
      }

      toast.success(publish ? "Template created and published" : "Template created successfully");
      router.push(`/care-plans/templates/${data.template.id}/edit`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save template";
      setError(errorMessage);
      toast.error(errorMessage);
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
          <Link href="/care-plans/templates">
            <button
              type="button"
              className="rounded p-1 hover:bg-background-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Create Care Plan Template</h1>
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
        <TemplateBuilder template={template} onChange={setTemplate} />
      </div>
    </div>
  );
}
