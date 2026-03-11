"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Breadcrumb } from "@/components/ui";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { OasisAssessmentRenderer } from "@/components/oasis";
import type { OasisTimePoint, OasisAssessorDiscipline, OasisResponseValue } from "@/lib/oasis/types";

interface Assessment {
  id: string;
  status: string;
  timePoint: OasisTimePoint;
  assessorDiscipline: OasisAssessorDiscipline;
  assessmentDate: string;
  template: {
    id: string;
    name: string;
    version: string;
    sections: Array<{
      id: string;
      code: string;
      label: string;
      description: string | null;
      displayOrder: number;
      items: Array<{
        id: string;
        code: string;
        label: string;
        description: string | null;
        helpText: string | null;
        fieldType: string;
        required: boolean;
        visibleAt: string[];
        config: Record<string, unknown>;
        validation: Record<string, unknown> | null;
        skipLogic: unknown[];
        displayOrder: number;
      }>;
    }>;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    medicareNumber: string | null;
  };
  responsesMap: Record<string, OasisResponseValue>;
}

export default function EditOasisAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [_isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/oasis/assessments/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assessment");
      }

      // Check if editable
      if (!["DRAFT", "IN_PROGRESS", "QA_REJECTED"].includes(data.assessment.status)) {
        toast.error("This assessment cannot be edited");
        router.push(`/oasis/${id}`);
        return;
      }

      setAssessment(data.assessment);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (responses: Map<string, OasisResponseValue>, isDraft: boolean) => {
    setIsSaving(true);
    try {
      // Convert Map to object
      const responsesObj: Record<string, OasisResponseValue> = {};
      responses.forEach((value, key) => {
        responsesObj[key] = value;
      });

      const response = await fetch(`/api/oasis/assessments/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: responsesObj,
          isDraft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      toast.success(isDraft ? "Draft saved" : "Progress saved");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (responses: Map<string, OasisResponseValue>) => {
    try {
      // First save all responses
      await handleSave(responses, false);

      // Then submit to QA
      const response = await fetch(`/api/oasis/assessments/${id}/submit-qa`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validationErrors) {
          toast.error(`Validation failed: ${data.validationErrors.length} errors`);
          // Show first few errors
          data.validationErrors.slice(0, 3).forEach((error: string) => {
            toast.error(error);
          });
          return;
        }
        throw new Error(data.error || "Failed to submit");
      }

      toast.success("Assessment submitted for QA review");
      router.push(`/oasis/${id}`);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
        <p className="text-foreground-secondary mb-4">
          The requested OASIS assessment could not be found.
        </p>
        <Link href="/oasis">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Breadcrumb */}
      <div className="px-4 py-3 border-b bg-background">
        <Breadcrumb
          items={[
            { label: "OASIS Assessments", href: "/oasis" },
            { label: `${assessment.timePoint} - ${assessment.client.firstName} ${assessment.client.lastName}`, href: `/oasis/${id}` },
            { label: "Edit" },
          ]}
        />
      </div>

      {/* Assessment Renderer */}
      <div className="flex-1 overflow-hidden">
        <OasisAssessmentRenderer
          template={{
            id: assessment.template.id,
            name: assessment.template.name,
            version: assessment.template.version,
            sections: assessment.template.sections.map((section) => {
              const { displayOrder: sectionDisplayOrder, label, ...sectionRest } = section;
              return {
                ...sectionRest,
                order: sectionDisplayOrder,
                name: label,
                items: section.items.map((item) => {
                  const { displayOrder: itemDisplayOrder, ...itemRest } = item;
                  return {
                    ...itemRest,
                    order: itemDisplayOrder,
                    visibleAt: item.visibleAt as OasisTimePoint[],
                    fieldType: item.fieldType as import("@prisma/client").FormFieldType,
                  };
                }),
              };
            }),
          }}
          initialResponses={new Map(Object.entries(assessment.responsesMap))}
          currentTimePoint={assessment.timePoint}
          assessorDiscipline={assessment.assessorDiscipline}
          mode="wizard"
          onSave={handleSave}
          onSubmit={handleSubmit}
          showProgress={true}
        />
      </div>
    </div>
  );
}
