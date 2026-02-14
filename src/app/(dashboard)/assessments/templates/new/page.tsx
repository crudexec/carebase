"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScoringMethod } from "@prisma/client";
import { AssessmentTemplateData } from "@/lib/assessments/types";
import { TemplateBuilder } from "@/components/assessments/template-builder";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";

export default function NewAssessmentTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = React.useState<AssessmentTemplateData>({
    name: "New Assessment Template",
    status: "DRAFT",
    version: 1,
    isRequired: false,
    scoringConfig: {
      method: ScoringMethod.SUM,
    },
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
        description: template.description || null,
        isRequired: template.isRequired,
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

      const response = await fetch("/api/assessments/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      // Activate template if publishing
      if (publish && data.template?.id) {
        await fetch(`/api/assessments/templates/${data.template.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
      }

      router.push(`/assessments/templates/${data.template.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = template.name.trim().length > 0 && template.sections.length > 0;

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
            <h1 className="text-lg font-semibold">Create Assessment Template</h1>
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
