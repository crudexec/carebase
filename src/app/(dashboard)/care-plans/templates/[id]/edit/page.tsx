"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { CarePlanTemplateData } from "@/lib/care-plans/types";
import { TemplateBuilder } from "@/components/care-plans/template-builder/template-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye, RefreshCw, Power, PowerOff } from "lucide-react";
import Link from "next/link";

export default function EditCarePlanTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = React.useState<CarePlanTemplateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/care-plans/templates/${templateId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Template not found");
          }
          throw new Error("Failed to fetch template");
        }
        const data = await response.json();
        setTemplate(data.template);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleSave = async (publish = false) => {
    if (!template) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: template.name,
        description: template.description,
        status: publish ? "ACTIVE" : template.status,
        isEnabled: publish ? true : template.isEnabled,
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

      const response = await fetch(`/api/care-plans/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      setTemplate(data.template);
      toast.success(publish ? "Template saved and published" : "Template saved successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save template";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = async () => {
    if (!template) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/care-plans/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !template.isEnabled }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update template");
      }

      setTemplate(data.template);
      toast.success(data.template.isEnabled ? "Template enabled" : "Template disabled");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update template";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <p className="text-foreground-secondary mb-4">{error}</p>
        <Link href="/care-plans/templates">
          <Button variant="ghost">Back to Templates</Button>
        </Link>
      </div>
    );
  }

  if (!template) return null;

  const isValid = template.name.trim().length > 0;
  const isDraft = template.status === "DRAFT";
  const statusVariant = isDraft ? "warning" : template.status === "ACTIVE" ? "success" : "default";

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
            <h1 className="text-lg font-semibold">Edit Care Plan Template</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={statusVariant}>{template.status}</Badge>
              <span className="text-xs text-foreground-tertiary">v{template.version}</span>
              {template.isEnabled ? (
                <Badge variant="success" className="text-xs">Enabled</Badge>
              ) : (
                <Badge variant="default" className="text-xs">Disabled</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-error mr-2">{error}</span>
          )}

          <Button
            variant="ghost"
            onClick={toggleEnabled}
            disabled={isSaving}
            className="text-foreground-secondary"
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
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleSave(false)}
            disabled={!isValid || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>

          {isDraft && (
            <Button
              onClick={() => handleSave(true)}
              disabled={!isValid || isSaving}
            >
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <TemplateBuilder template={template} onChange={setTemplate} />
      </div>
    </div>
  );
}
