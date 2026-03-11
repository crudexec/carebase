"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  FileText,
  Loader2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { OasisAssessmentRenderer } from "@/components/oasis";
import type { OasisTimePoint, OasisAssessorDiscipline, OasisResponseValue } from "@/lib/oasis/types";

interface Assessment {
  id: string;
  status: string;
  timePoint: OasisTimePoint;
  assessorDiscipline: OasisAssessorDiscipline;
  assessmentDate: string;
  completedAt: string | null;
  exportedAt: string | null;
  qaReviewedAt: string | null;
  qaComments: string | null;
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
    dateOfBirth: string | null;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  qaReviewer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  responsesMap: Record<string, OasisResponseValue>;
}

const STATUS_INFO: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" | "primary"; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: { label: "Draft", variant: "default", icon: Clock },
  IN_PROGRESS: { label: "In Progress", variant: "warning", icon: Clock },
  COMPLETED: { label: "Completed", variant: "success", icon: CheckCircle },
  SUBMITTED_TO_QA: { label: "Pending QA", variant: "primary", icon: Send },
  QA_APPROVED: { label: "QA Approved", variant: "success", icon: CheckCircle },
  QA_REJECTED: { label: "QA Rejected", variant: "error", icon: AlertCircle },
  EXPORTED: { label: "Exported", variant: "success", icon: Download },
  CORRECTED: { label: "Corrected", variant: "warning", icon: Edit },
};

const TIME_POINT_LABELS: Record<string, string> = {
  SOC: "Start of Care",
  ROC: "Resumption of Care",
  FU: "Follow-up/Recertification",
  TRN: "Transfer to Inpatient",
  DC: "Discharge from Agency",
  DAH: "Death at Home",
};

export default function OasisAssessmentPage() {
  const _router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

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

      setAssessment(data.assessment);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToQA = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/oasis/assessments/${id}/submit-qa`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validationErrors) {
          toast.error(`Validation failed: ${data.validationErrors.length} errors`);
          return;
        }
        throw new Error(data.error || "Failed to submit");
      }

      toast.success("Assessment submitted for QA review");
      fetchAssessment();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: "FLAT_FILE" | "XML" | "JSON") => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/oasis/assessments/${id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export");
      }

      // Download the file
      const blob = await response.blob();
      const filename = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || `oasis_export.${format.toLowerCase()}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Export downloaded successfully");
      fetchAssessment();
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export");
    } finally {
      setIsExporting(false);
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

  const statusInfo = STATUS_INFO[assessment.status] || STATUS_INFO.DRAFT;
  const StatusIcon = statusInfo.icon;
  const canEdit = ["DRAFT", "IN_PROGRESS", "QA_REJECTED"].includes(assessment.status);
  const canSubmitToQA = ["DRAFT", "IN_PROGRESS", "COMPLETED", "QA_REJECTED"].includes(assessment.status);
  const canExport = ["QA_APPROVED", "COMPLETED"].includes(assessment.status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "OASIS Assessments", href: "/oasis" },
          { label: `${assessment.timePoint} - ${assessment.client.firstName} ${assessment.client.lastName}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">
              {assessment.timePoint} Assessment
            </h1>
            <Badge variant={statusInfo.variant}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-foreground-secondary">
            {TIME_POINT_LABELS[assessment.timePoint]} for {assessment.client.firstName} {assessment.client.lastName}
          </p>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/oasis/${id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Assessment
              </Button>
            </Link>
          )}
          {canSubmitToQA && (
            <Button
              variant="secondary"
              onClick={handleSubmitToQA}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit to QA
            </Button>
          )}
          {canExport && (
            <div className="relative group">
              <Button variant="secondary" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-background border border-border z-50 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => handleExport("FLAT_FILE")}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
                  >
                    OASIS Flat File
                  </button>
                  <button
                    onClick={() => handleExport("XML")}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
                  >
                    XML Format
                  </button>
                  <button
                    onClick={() => handleExport("JSON")}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-background-secondary"
                  >
                    JSON Format
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground-tertiary">Client</p>
                <p className="font-medium">
                  {assessment.client.firstName} {assessment.client.lastName}
                </p>
                {assessment.client.medicareNumber && (
                  <p className="text-xs text-foreground-tertiary font-mono">
                    MBI: {assessment.client.medicareNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground-tertiary">Assessment Date</p>
                <p className="font-medium">
                  {new Date(assessment.assessmentDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-foreground-tertiary">
                  {assessment.assessorDiscipline} Assessment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessor Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground-tertiary">Assessor</p>
                <p className="font-medium">
                  {assessment.assessor.firstName} {assessment.assessor.lastName}
                </p>
                <p className="text-xs text-foreground-tertiary">
                  {assessment.template.name} v{assessment.template.version}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QA Comments (if rejected) */}
      {assessment.status === "QA_REJECTED" && assessment.qaComments && (
        <Card className="border-error">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-error">QA Review Comments</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  {assessment.qaComments}
                </p>
                {assessment.qaReviewer && (
                  <p className="text-xs text-foreground-tertiary mt-2">
                    Reviewed by {assessment.qaReviewer.firstName} {assessment.qaReviewer.lastName}
                    {assessment.qaReviewedAt && ` on ${new Date(assessment.qaReviewedAt).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Content (Read-only view) */}
      <Card>
        <CardContent className="p-0">
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
            mode="all-sections"
            disabled={true}
            showProgress={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
