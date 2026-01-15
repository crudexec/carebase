"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { FormTemplateData, FormTemplateDetail } from "@/lib/visit-notes/types";
import { FormBuilder } from "@/components/visit-notes/form-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye, Power, PowerOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = React.useState<FormTemplateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/visit-notes/templates/${templateId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch template");
      }

      const fetchedTemplate: FormTemplateData = {
        id: data.template.id,
        name: data.template.name,
        description: data.template.description,
        status: data.template.status,
        version: data.template.version,
        isEnabled: data.template.isEnabled,
        sections: data.template.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          fields: section.fields.map((field: any) => ({
            id: field.id,
            label: field.label,
            description: field.description,
            type: field.type,
            required: field.required,
            order: field.order,
            config: field.config,
          })),
        })),
      };

      setTemplate(fetchedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (updatedTemplate: FormTemplateData) => {
    setTemplate(updatedTemplate);
    setHasChanges(true);
  };

  const handleSave = async (publish = false) => {
    if (!template) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: template.name,
        description: template.description,
        status: publish ? "ACTIVE" : template.status,
        isEnabled: template.isEnabled,
        sections: template.sections,
      };

      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              version: data.template.version,
              status: data.template.status,
            }
          : null
      );
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !template.isEnabled }),
      });

      if (response.ok) {
        setTemplate((prev) =>
          prev ? { ...prev, isEnabled: !prev.isEnabled } : null
        );
      }
    } catch (err) {
      console.error("Failed to toggle enabled:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <p className="text-error">{error}</p>
        <Link href="/visit-notes/templates" className="mt-4">
          <Button variant="ghost">Back to Templates</Button>
        </Link>
      </div>
    );
  }

  if (!template) return null;

  const isValid = template.name.trim().length > 0;
  const isDraft = template.status === "DRAFT";

  const getStatusBadge = () => {
    if (template.status === "ARCHIVED") {
      return <Badge variant="default">Archived</Badge>;
    }
    if (template.status === "DRAFT") {
      return <Badge variant="warning">Draft</Badge>;
    }
    if (template.isEnabled) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="default">Disabled</Badge>;
  };

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
            <h1 className="text-lg font-semibold">{template.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {getStatusBadge()}
              <span className="text-xs text-foreground-tertiary">
                v{template.version}
              </span>
              {hasChanges && (
                <span className="text-xs text-warning">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-error mr-2">{error}</span>}

          {!isDraft && (
            <Button
              variant="ghost"
              onClick={toggleEnabled}
              disabled={isSaving}
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
          )}

          <Button
            variant="ghost"
            onClick={() => handleSave(false)}
            disabled={!isValid || isSaving || !hasChanges}
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
        <FormBuilder template={template} onChange={handleChange} />
      </div>
    </div>
  );
}
