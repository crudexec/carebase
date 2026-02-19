"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RefreshCw,
  ArrowLeft,
  Loader2,
  Save,
  FileDown,
  Send,
} from "lucide-react";
import { CarePlanRenderer } from "@/components/care-plans/care-plan-renderer";
import { Button, Breadcrumb, Badge } from "@/components/ui";
import { FormFieldType } from "@prisma/client";
import { ICD10DiagnosisValue, BodyMapMarker } from "@/lib/visit-notes/types";
import { STANDARD_CARE_PLAN_TEMPLATE, convertLegacyCarePlanToFormData } from "@/lib/care-plans/standard-template";

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

interface FormSchemaSnapshot {
  templateId: string;
  templateName: string;
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
  | { fileUrl: string; fileName: string; fileType: string; fileSize: number }
  | null;

interface CarePlanData {
  id: string;
  status: string;
  effectiveDate: string | null;
  endDate: string | null;
  certStartDate: string | null;
  certEndDate: string | null;
  signatureSentDate: string | null;
  signatureReceivedDate: string | null;
  verbalSOCDate: string | null;
  summary: string | null;
  goals: Record<string, unknown> | null;
  interventions: Record<string, unknown> | null;
  frequency: Record<string, unknown> | null;
  internalNotes: string | null;
  medications: string | null;
  dmeSupplies: string | null;
  safetyMeasures: string | null;
  nutritionalRequirements: string | null;
  allergies: string | null;
  functionalLimitations: string[];
  otherFunctionalLimit: string | null;
  activitiesPermitted: string[];
  otherActivitiesPermit: string | null;
  mentalStatus: string[];
  otherMentalStatus: string | null;
  prognosis: string | null;
  cognitiveStatus: string | null;
  rehabPotential: string | null;
  dischargePlan: string | null;
  riskIntervention: string | null;
  advancedDirectives: string | null;
  caregiverNeeds: string | null;
  homeboundStatus: string | null;
  carePreferences: string | null;
  careLevel: string | null;
  recommendedHours: number | null;
  physicianId: string | null;
  caseManagerId: string | null;
  physicianCertStatement: string | null;
  physicianName: string | null;
  physicianNpi: string | null;
  physicianPhone: string | null;
  physicianFax: string | null;
  qaStatus: string | null;
  qaNotes: string | null;
  nurseSignature: string | null;
  nurseSignedAt: string | null;
  clinicalNotes: string | null;
  clientSignature: string | null;
  clientSignedAt: string | null;
  clientSignerName: string | null;
  clientSignerRelation: string | null;
  // Template fields
  templateId: string | null;
  templateVersion: number | null;
  formSchemaSnapshot: FormSchemaSnapshot | null;
  formData: Record<string, FieldValue> | null;
  // Relations
  client: Client;
  intake: {
    id: string;
  } | null;
  physician: {
    id: string;
    firstName: string;
    lastName: string;
    npi: string | null;
    specialty: string | null;
    phone: string | null;
    fax: string | null;
  } | null;
  caseManager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  diagnoses: Array<{
    id: string;
    icdCode: string;
    icdDescription: string;
    diagnosisType: string;
    onsetDate: string | null;
    notes: string | null;
    isActive: boolean;
  }>;
  orders: Array<{
    id: string;
    disciplineType: string;
    bodySystem: string | null;
    orderText: string;
    orderExplanation: string | null;
    goals: string | null;
    goalsExplanation: string | null;
    orderStatus: string;
    isFrequencyOrder: boolean;
    effectiveDate: string | null;
    isActive: boolean;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" }> = {
  DRAFT: { label: "Draft", variant: "default" },
  PENDING_CLINICAL_REVIEW: { label: "Pending Review", variant: "warning" },
  CLINICAL_APPROVED: { label: "Approved", variant: "success" },
  PENDING_CLIENT_SIGNATURE: { label: "Pending Signature", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  REVISED: { label: "Revised", variant: "default" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "error" },
};

export default function CarePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const carePlanId = params.carePlanId as string;

  const [carePlan, setCarePlan] = React.useState<CarePlanData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form data for template-based care plans
  const [formData, setFormData] = React.useState<Record<string, FieldValue>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchCarePlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/care-plans/${carePlanId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch care plan");
        }
        const data = await response.json();
        setCarePlan(data.carePlan);
        // Initialize form data from saved data or convert legacy data
        if (data.carePlan.formData) {
          setFormData(data.carePlan.formData);
        } else if (!data.carePlan.formSchemaSnapshot) {
          // Legacy care plan - convert to form data format
          const convertedData = convertLegacyCarePlanToFormData(data.carePlan);
          setFormData(convertedData as Record<string, FieldValue>);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load care plan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarePlan();
  }, [carePlanId]);

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!carePlan) return;

    setIsSaving(true);
    setError(null);

    try {
      // Check if this is using standard template (no custom template)
      const isStandardTemplate = !carePlan.formSchemaSnapshot ||
        carePlan.formSchemaSnapshot.templateId === "standard-care-plan";

      const payload: Record<string, unknown> = { formData };

      // For standard template, also map form data to regular fields for backward compatibility
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
      }

      const response = await fetch(`/api/care-plans/${carePlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save care plan");
      }

      const { carePlan: updatedCarePlan } = await response.json();
      setCarePlan(updatedCarePlan);
      toast.success("Care plan saved successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save care plan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!carePlan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if this is using standard template (no custom template)
      const isStandardTemplate = !carePlan.formSchemaSnapshot ||
        carePlan.formSchemaSnapshot.templateId === "standard-care-plan";

      const payload: Record<string, unknown> = {
        formData,
        status: "PENDING_CLINICAL_REVIEW",
      };

      // For standard template, also map form data to regular fields for backward compatibility
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
      }

      const response = await fetch(`/api/care-plans/${carePlanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit care plan");
      }

      const { carePlan: updatedCarePlan } = await response.json();
      setCarePlan(updatedCarePlan);
      toast.success("Care plan submitted for review");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit care plan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !carePlan) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground-secondary">{error || "Care plan not found"}</p>
      </div>
    );
  }

  if (!carePlan) return null;

  const clientName = `${carePlan.client.firstName} ${carePlan.client.lastName}`;
  const statusConfig = STATUS_CONFIG[carePlan.status] || STATUS_CONFIG.DRAFT;
  const isReadOnly = carePlan.status === "COMPLETED" || carePlan.status === "CANCELLED";

  // If care plan has a template schema, use the new renderer
  if (carePlan.formSchemaSnapshot) {
    const template = {
      id: carePlan.formSchemaSnapshot.templateId,
      name: carePlan.formSchemaSnapshot.templateName,
      description: null,
      version: carePlan.formSchemaSnapshot.version,
      sections: carePlan.formSchemaSnapshot.sections,
    };

    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Clients", href: "/clients" },
            { label: clientName, href: `/clients/${clientId}` },
            { label: "Plans of Care", href: `/clients/${clientId}` },
            { label: template.name },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Plan of Care</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <p className="text-foreground-secondary mt-1">
              {clientName} • {template.name} v{template.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {!isReadOnly && (
              <Button variant="secondary" onClick={handleSave} disabled={isSaving || isSubmitting}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
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
          template={template}
          formData={formData}
          isReadOnly={isReadOnly}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          onComplete={handleSubmit}
          isSaving={isSaving}
          isCompleting={isSubmitting}
        />
      </div>
    );
  }

  // Legacy care plan without template - use standard template with new UI
  const template = {
    id: STANDARD_CARE_PLAN_TEMPLATE.id,
    name: STANDARD_CARE_PLAN_TEMPLATE.name,
    description: STANDARD_CARE_PLAN_TEMPLATE.description,
    version: STANDARD_CARE_PLAN_TEMPLATE.version,
    sections: STANDARD_CARE_PLAN_TEMPLATE.sections,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Clients", href: "/clients" },
          { label: clientName, href: `/clients/${clientId}` },
          { label: "Plans of Care", href: `/clients/${clientId}` },
          { label: template.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Plan of Care</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <p className="text-foreground-secondary mt-1">
            {clientName} • {template.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {!isReadOnly && (
            <Button variant="secondary" onClick={handleSave} disabled={isSaving || isSubmitting}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}
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
        template={template}
        formData={formData}
        isReadOnly={isReadOnly}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
        onComplete={handleSubmit}
        isSaving={isSaving}
        isCompleting={isSubmitting}
      />
    </div>
  );
}
