"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FormTemplateData, FormSectionData } from "@/lib/visit-notes/types";
import { FormBuilder } from "@/components/visit-notes/form-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye, Power, PowerOff, Loader2, Users, User } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  STAFF_PROFILE: "Staff Profile",
  CLIENT_PROFILE: "Client Profile",
  VISIT_NOTE: "Visit Note",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  STAFF_PROFILE: Users,
  CLIENT_PROFILE: User,
  VISIT_NOTE: Save,
};

export default function EditProfileTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = React.useState<FormTemplateData | null>(null);
  const [templateType, setTemplateType] = React.useState<string>("STAFF_PROFILE");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/visit-notes/templates/${templateId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch template");
      }

      const t = data.template;
      setTemplateType(t.type || "STAFF_PROFILE");
      setTemplate({
        id: t.id,
        name: t.name,
        description: t.description || undefined,
        status: t.status,
        version: t.version,
        isEnabled: t.isEnabled,
        sections: t.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description || undefined,
          order: section.order,
          fields: section.fields.map((field: any) => ({
            id: field.id,
            label: field.label,
            description: field.description || undefined,
            type: field.type,
            required: field.required,
            order: field.order,
            config: field.config,
          })),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!template) return;
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: template.name,
        description: template.description || null,
        status: publish ? "ACTIVE" : template.status,
        isEnabled: publish ? true : template.isEnabled,
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

      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      // Update local state with saved data
      await fetchTemplate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/visit-notes/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !template.isEnabled }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update template");
      }

      setTemplate({ ...template, isEnabled: !template.isEnabled });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-error">{error || "Template not found"}</p>
        <Link href="/settings/profile-templates" className="mt-4">
          <Button variant="ghost">Back to Profile Templates</Button>
        </Link>
      </div>
    );
  }

  const isValid = template.name.trim().length > 0;
  const Icon = TYPE_ICONS[templateType] || Users;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/settings/profile-templates">
            <button
              type="button"
              className="rounded p-1 hover:bg-background-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">
                Edit {TYPE_LABELS[templateType]} Template
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={template.status === "ACTIVE" ? "success" : "warning"}>
                {template.status}
              </Badge>
              {template.isEnabled && (
                <Badge variant="success">Enabled</Badge>
              )}
              <span className="text-xs text-foreground-tertiary">
                v{template.version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-error mr-2">{error}</span>
          )}
          <Button
            variant="ghost"
            onClick={handleToggleEnabled}
            title={template.isEnabled ? "Disable template" : "Enable template"}
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
