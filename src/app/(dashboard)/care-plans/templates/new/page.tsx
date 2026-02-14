"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { TemplateBuilder } from "@/components/care-plans/template-builder";
import { FormTemplateStatus } from "@prisma/client";
import { CarePlanTemplateSectionData } from "@/lib/care-plans/types";

export default function NewCarePlanTemplatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
      const response = await fetch("/api/care-plans/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      const result = await response.json();
      router.push(`/care-plans/templates/${result.template.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Care Plans", href: "/care-plans" },
          { label: "Templates", href: "/care-plans/templates" },
          { label: "New Template" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Create Care Plan Template</h1>
        <p className="text-foreground-secondary mt-1">
          Design a custom template for creating care plans
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <TemplateBuilder
        onSave={handleSave}
        onCancel={() => router.push("/care-plans/templates")}
        isSaving={isSaving}
      />
    </div>
  );
}
