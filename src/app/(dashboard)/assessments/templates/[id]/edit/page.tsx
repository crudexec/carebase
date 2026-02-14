"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessmentTemplateData } from "@/lib/assessments/types";
import { TemplateBuilder } from "@/components/assessments/template-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye, Power, PowerOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditAssessmentTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = React.useState<AssessmentTemplateData | null>(null);
  const [isActive, setIsActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  const fetchTemplate = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/templates/${templateId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch template");
      }

      const fetchedTemplate: AssessmentTemplateData = {
        id: data.template.id,
        name: data.template.name,
        description: data.template.description,
        status: data.template.isActive ? "ACTIVE" : "DRAFT",
        version: data.template.version,
        isRequired: data.template.isRequired,
        scoringConfig: {
          method: data.template.scoringMethod,
          maxScore: data.template.maxScore ? parseFloat(data.template.maxScore) : undefined,
          passingScore: data.template.passingScore ? parseFloat(data.template.passingScore) : undefined,
          thresholds: data.template.scoringThresholds || undefined,
        },
        sections: data.template.sections.map((section: any) => ({
          id: section.id,
          sectionType: section.sectionType,
          title: section.title,
          description: section.description,
          instructions: section.instructions,
          order: section.displayOrder,
          scoringConfig: section.scoringMethod ? {
            method: section.scoringMethod,
            maxScore: section.maxScore ? parseFloat(section.maxScore) : undefined,
            weight: section.weight ? parseFloat(section.weight) : undefined,
          } : undefined,
          items: section.items.map((item: any) => ({
            id: item.id,
            code: item.code,
            questionText: item.question,
            description: item.description,
            responseType: item.responseType,
            required: item.isRequired,
            order: item.displayOrder,
            responseOptions: item.responseOptions,
            minValue: item.minValue,
            maxValue: item.maxValue,
            scoreMapping: item.scoreMapping,
            showIf: item.showIf,
          })),
        })),
      };

      setTemplate(fetchedTemplate);
      setIsActive(data.template.isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  React.useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleChange = (updatedTemplate: AssessmentTemplateData) => {
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
        isRequired: template.isRequired,
        isActive: publish ? true : isActive,
        scoringConfig: template.scoringConfig,
        sections: template.sections.map((section) => ({
          id: section.id,
          sectionType: section.sectionType,
          title: section.title,
          description: section.description || null,
          instructions: section.instructions || null,
          order: section.order,
          scoringConfig: section.scoringConfig || null,
          items: section.items.map((item) => ({
            id: item.id,
            code: item.code,
            questionText: item.questionText,
            description: item.description || null,
            responseType: item.responseType,
            required: item.required,
            order: item.order,
            responseOptions: item.responseOptions || null,
            minValue: item.minValue ?? null,
            maxValue: item.maxValue ?? null,
            scoreMapping: item.scoreMapping || null,
            showIf: item.showIf || null,
          })),
        })),
      };

      const response = await fetch(`/api/assessments/templates/${templateId}`, {
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
              status: data.template.isActive ? "ACTIVE" : "DRAFT",
            }
          : null
      );
      setIsActive(data.template.isActive);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/assessments/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setIsActive(!isActive);
        setTemplate((prev) =>
          prev ? { ...prev, status: !isActive ? "ACTIVE" : "DRAFT" } : null
        );
      }
    } catch (err) {
      console.error("Failed to toggle active:", err);
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
        <Link href="/assessments/templates" className="mt-4">
          <Button variant="ghost">Back to Templates</Button>
        </Link>
      </div>
    );
  }

  if (!template) return null;

  const isValid = template.name.trim().length > 0;
  const isDraft = !isActive;

  const getStatusBadge = () => {
    if (template.isRequired) {
      return <Badge variant="info">Required</Badge>;
    }
    if (isActive) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="warning">Draft</Badge>;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/assessments/templates">
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

          <Button
            variant="ghost"
            onClick={toggleActive}
            disabled={isSaving}
          >
            {isActive ? (
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
          </Button>

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
        <TemplateBuilder template={template} onChange={handleChange} />
      </div>
    </div>
  );
}
