"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { TemplateBuilder } from "@/components/care-plans/template-builder";
import { FormTemplateStatus } from "@prisma/client";
import { CarePlanTemplateSectionData } from "@/lib/care-plans/types";
import { RefreshCw } from "lucide-react";

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  includesDiagnoses: boolean;
  includesGoals: boolean;
  includesInterventions: boolean;
  includesMedications: boolean;
  includesOrders: boolean;
  sections: CarePlanTemplateSectionData[];
}

export default function EditCarePlanTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = React.useState<TemplateData | null>(null);
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

  const handleSave = async (data: {
    name: string;
    description: string | null;
    status: FormTemplateStatus;
    isEnabled: boolean;
    includesDiagnoses: boolean;
    includesGoals: boolean;
    includesInterventions: boolean;
    includesMedications: boolean;
    includesOrders: boolean;
    sections: CarePlanTemplateSectionData[];
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/care-plans/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update template");
      }

      const result = await response.json();
      setTemplate(result.template);
      router.push("/care-plans/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update template");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Care Plans", href: "/care-plans" },
            { label: "Templates", href: "/care-plans/templates" },
            { label: "Error" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-foreground-secondary">{error}</p>
          <button
            onClick={() => router.push("/care-plans/templates")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Care Plans", href: "/care-plans" },
          { label: "Templates", href: "/care-plans/templates" },
          { label: template.name },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Edit Template</h1>
        <p className="text-foreground-secondary mt-1">
          Update the care plan template configuration
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <TemplateBuilder
        initialData={template}
        onSave={handleSave}
        onCancel={() => router.push("/care-plans/templates")}
        isSaving={isSaving}
      />
    </div>
  );
}
