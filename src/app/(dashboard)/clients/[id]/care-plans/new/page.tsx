"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RefreshCw,
  ClipboardList,
  CheckCircle,
  FileText,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { CarePlanRenderer } from "@/components/care-plans/care-plan-renderer";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Breadcrumb,
  Badge,
} from "@/components/ui";
import { FormFieldType } from "@prisma/client";
import { ICD10DiagnosisValue, BodyMapMarker } from "@/lib/visit-notes/types";
import { CascadingSelectValue } from "@/lib/care-plans/types";
import { STANDARD_CARE_PLAN_TEMPLATE } from "@/lib/care-plans/standard-template";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface TemplateField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: Record<string, unknown> | null;
}

interface TemplateSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: TemplateField[];
}

interface CarePlanTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  version: number;
  sectionCount?: number;
}

interface CarePlanTemplateDetail {
  id: string;
  name: string;
  description: string | null;
  version: number;
  sections: TemplateSection[];
}

type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | ICD10DiagnosisValue[]
  | BodyMapMarker[]
  | CascadingSelectValue
  | { fileUrl: string; fileName: string; fileType: string; fileSize: number }
  | null;

export default function NewCarePlanPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<Client | null>(null);
  const [templates, setTemplates] = React.useState<CarePlanTemplateListItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<CarePlanTemplateDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingTemplate, setIsLoadingTemplate] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"select-template" | "fill-form">("select-template");

  // Form data for care plans
  const [formData, setFormData] = React.useState<Record<string, FieldValue>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch client and templates in parallel
        const [clientRes, templatesRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch("/api/care-plans/templates?status=ACTIVE&isEnabled=true"),
        ]);

        if (!clientRes.ok) {
          throw new Error("Failed to fetch client");
        }

        const clientData = await clientRes.json();
        setClient(clientData.client);

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData.templates || []);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleSelectTemplate = async (templateId: string | null) => {
    if (!templateId) {
      // Use standard template
      setSelectedTemplate(STANDARD_CARE_PLAN_TEMPLATE as CarePlanTemplateDetail);
      setFormData({});
      setStep("fill-form");
      return;
    }

    // Fetch custom template with sections
    setIsLoadingTemplate(true);
    try {
      const response = await fetch(`/api/care-plans/templates/${templateId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      const data = await response.json();
      setSelectedTemplate(data.template);
      setFormData({});
      setStep("fill-form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!selectedTemplate || !client) return;

    setIsSaving(true);
    setError(null);

    try {
      // For standard template, we need to also save to the regular care plan fields
      const isStandardTemplate = selectedTemplate.id === "standard-care-plan";

      const payload: Record<string, unknown> = {
        clientId,
        status: "DRAFT",
        formData,
        formSchemaSnapshot: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          version: selectedTemplate.version,
          sections: selectedTemplate.sections,
        },
      };

      // For standard template, also map form data to regular fields
      if (isStandardTemplate) {
        Object.assign(payload, formData);
        // Convert diagnoses back to the API format
        if (formData.diagnoses && Array.isArray(formData.diagnoses)) {
          payload.diagnoses = (formData.diagnoses as ICD10DiagnosisValue[]).map((d) => ({
            icdCode: d.code,
            icdDescription: d.description,
            diagnosisType: d.type || "SECONDARY",
          }));
        }
      } else {
        payload.templateId = selectedTemplate.id;
      }

      const response = await fetch("/api/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save care plan");
      }

      const { carePlan } = await response.json();
      toast.success("Care plan saved as draft");
      router.push(`/clients/${clientId}/care-plans/${carePlan.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save care plan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !client) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const isStandardTemplate = selectedTemplate.id === "standard-care-plan";

      const payload: Record<string, unknown> = {
        clientId,
        status: "PENDING_CLINICAL_REVIEW",
        formData,
        formSchemaSnapshot: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          version: selectedTemplate.version,
          sections: selectedTemplate.sections,
        },
      };

      if (isStandardTemplate) {
        Object.assign(payload, formData);
        if (formData.diagnoses && Array.isArray(formData.diagnoses)) {
          payload.diagnoses = (formData.diagnoses as ICD10DiagnosisValue[]).map((d) => ({
            icdCode: d.code,
            icdDescription: d.description,
            diagnosisType: d.type || "SECONDARY",
          }));
        }
      } else {
        payload.templateId = selectedTemplate.id;
      }

      const response = await fetch("/api/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit care plan");
      }

      const { carePlan } = await response.json();
      toast.success("Care plan submitted for review");
      router.push(`/clients/${clientId}/care-plans/${carePlan.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit care plan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep("select-template");
    setSelectedTemplate(null);
    setFormData({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground-secondary">{error || "Client not found"}</p>
      </div>
    );
  }

  if (!client) return null;

  // Step 2: Fill out the care plan form
  if (step === "fill-form" && selectedTemplate) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Clients", href: "/clients" },
            { label: `${client.firstName} ${client.lastName}`, href: `/clients/${clientId}` },
            { label: "New Care Plan" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">New Plan of Care</h1>
              <Badge variant="default">Draft</Badge>
            </div>
            <p className="text-foreground-secondary mt-1">
              {client.firstName} {client.lastName} • {selectedTemplate.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={isSaving || isSubmitting}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-md bg-error/10 text-error text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Care Plan Renderer */}
        <CarePlanRenderer
          template={selectedTemplate}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          onComplete={handleSubmit}
          isSaving={isSaving}
          isCompleting={isSubmitting}
        />
      </div>
    );
  }

  // Step 1: Select template
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: `${client.firstName} ${client.lastName}`, href: `/clients/${clientId}` },
          { label: "New Care Plan" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">New Plan of Care</h1>
        <p className="text-foreground-secondary mt-1">
          Select a template to get started
        </p>
      </div>

      {/* Loading Template */}
      {isLoadingTemplate && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Standard template */}
      {!isLoadingTemplate && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standard Care Plan</CardTitle>
              <CardDescription>
                Comprehensive care plan with all standard sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => handleSelectTemplate(null)}
                className="w-full p-4 rounded-lg border text-left transition-colors bg-background border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Standard Plan of Care</h3>
                      <p className="text-sm text-foreground-secondary mt-1">
                        Includes diagnoses, medications, functional status, clinical narratives, and signatures
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                        <span>9 sections</span>
                        <span>CMS-485 compatible</span>
                      </div>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-transparent" />
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Custom Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Templates</CardTitle>
                <CardDescription>
                  Pre-configured templates with custom sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="w-full p-4 rounded-lg border text-left transition-colors bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-foreground-secondary mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                            <span>v{template.version}</span>
                            <span>{template.sectionCount} sections</span>
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-transparent" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
