"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import { AssessmentRenderer } from "@/components/assessments/assessment-renderer";
import {
  Loader2,
  User,
  Calendar,
  CheckCircle,
  Printer,
  Trash2,
  Send,
  FileDown,
} from "lucide-react";

interface Assessment {
  id: string;
  status: string;
  assessmentType: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  percentageScore: number | null;
  interpretation: string | null;
  notes: string | null;
  template: {
    id: string;
    name: string;
    description: string | null;
    code?: string;
    maxScore: number | null;
    sections: {
      id: string;
      title: string;
      name?: string;
      description: string | null;
      sectionType: string;
      displayOrder: number;
      items: {
        id: string;
        code: string;
        question: string;
        label?: string;
        description: string | null;
        responseType: string;
        responseOptions: unknown;
        options?: unknown;
        minValue: number | null;
        maxValue: number | null;
        isRequired: boolean;
        displayOrder: number;
      }[];
    }[];
  };
  responses: {
    itemId: string;
    numericValue: number | null;
    textValue: string | null;
    notes: string | null;
  }[];
  client: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    physicianName: string | null;
    physicianFax: string | null;
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  intake: {
    id: string;
    status: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  IN_PROGRESS: { label: "In Progress", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Completed", color: "bg-success/10 text-success" },
  CANCELLED: { label: "Cancelled", color: "bg-error/10 text-error" },
};

export default function AssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isSendingFax, setIsSendingFax] = React.useState(false);
  const [showFaxModal, setShowFaxModal] = React.useState(false);
  const [faxNumber, setFaxNumber] = React.useState("");
  const [faxRecipientName, setFaxRecipientName] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);

  // Local responses state for optimistic updates
  const [localResponses, setLocalResponses] = React.useState<
    { itemId: string; numericValue: number | null; textValue: string | null; notes: string | null }[]
  >([]);

  const fetchAssessment = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assessment");
      }

      setAssessment(data.assessment);
      setLocalResponses(data.assessment.responses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assessment");
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  React.useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleResponseChange = (itemId: string, value: string | number, notes?: string) => {
    setLocalResponses((prev) => {
      const existing = prev.find((r) => r.itemId === itemId);
      const numericValue = typeof value === "number" ? value : null;
      const textValue = typeof value === "string" ? value : null;

      if (existing) {
        return prev.map((r) =>
          r.itemId === itemId
            ? { ...r, numericValue, textValue, notes: notes ?? r.notes }
            : r
        );
      }

      return [...prev, { itemId, numericValue, textValue, notes: notes ?? null }];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const responses = localResponses
        .filter((r) => r.numericValue !== null || r.textValue !== null)
        .map((r) => ({
          itemId: r.itemId,
          value: r.numericValue ?? r.textValue ?? "",
          ...(r.notes ? { notes: r.notes } : {}),
        }));

      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save assessment");
      }

      setAssessment(data.assessment);
      setSuccess("Progress saved successfully");
      toast.success("Progress saved successfully");

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save assessment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      // First save any pending responses
      await handleSave();

      // Then complete the assessment
      const response = await fetch(`/api/assessments/${assessmentId}/complete`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete assessment");
      }

      toast.success("Assessment completed successfully");

      // If this assessment is part of an intake, redirect back to intake
      if (assessment?.intake?.id) {
        router.push(`/intake/${assessment.intake.id}`);
      } else {
        setAssessment(data.assessment);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete assessment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      });

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { error: "Unexpected response format" };
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete assessment (${response.status})`);
      }

      toast.success("Assessment deleted successfully");
      router.push("/assessments");
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete assessment";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSendFax = async () => {
    if (!faxNumber) {
      toast.error("Please enter a fax number");
      return;
    }

    setIsSendingFax(true);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/fax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: faxNumber,
          recipientName: faxRecipientName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send fax");
      }

      toast.success("Fax queued successfully!");
      setShowFaxModal(false);
      setFaxNumber("");
      setFaxRecipientName("");
    } catch (err) {
      console.error("Failed to send fax:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send fax");
    } finally {
      setIsSendingFax(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/export`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Assessment-${assessment?.template.name.replace(/\s+/g, "-")}-${assessment?.client.firstName}-${assessment?.client.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export PDF");
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

  if (error && !assessment) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Assessments", href: "/assessments" },
            { label: "Error" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-error">
              <p>{error}</p>
              <Button
                variant="secondary"
                onClick={() => router.push("/assessments")}
                className="mt-4"
              >
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) return null;

  const statusConfig = STATUS_CONFIG[assessment.status] || STATUS_CONFIG.IN_PROGRESS;
  const isCompleted = assessment.status === "COMPLETED";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Assessments", href: "/assessments" },
          { label: `${assessment.client.firstName} ${assessment.client.lastName}`, href: `/clients/${assessment.client.id}` },
          { label: assessment.template.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assessment.template.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            <span className="text-foreground-secondary">•</span>
            <span className="text-sm text-foreground-secondary">
              {assessment.assessmentType.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Pre-fill from client's physician info
              setFaxNumber(assessment.client.physicianFax || "");
              setFaxRecipientName(assessment.client.physicianName || "");
              setShowFaxModal(true);
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Fax
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-error hover:bg-error/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Assessment</h3>
            <p className="text-foreground-secondary mb-4">
              Are you sure you want to delete this assessment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="error"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Fax Modal */}
      {showFaxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Send Assessment as Fax</h3>
            <p className="text-foreground-secondary mb-4">
              Enter the recipient&apos;s fax number to send this assessment.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fax Number <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={faxNumber}
                  onChange={(e) => setFaxNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-foreground-tertiary mt-1">
                  E.164 format: +[country code][number]
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recipient Name (optional)
                </label>
                <input
                  type="text"
                  value={faxRecipientName}
                  onChange={(e) => setFaxRecipientName(e.target.value)}
                  placeholder="Dr. Smith"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowFaxModal(false);
                  setFaxNumber("");
                  setFaxRecipientName("");
                }}
                disabled={isSendingFax}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendFax}
                disabled={isSendingFax || !faxNumber}
              >
                {isSendingFax ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Fax
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-md bg-success/10 text-success text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Client & Assessment Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {assessment.client.firstName} {assessment.client.lastName}
                </p>
                {assessment.client.dateOfBirth && (
                  <p className="text-sm text-foreground-secondary">
                    DOB: {new Date(assessment.client.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Link href={`/clients/${assessment.client.id}`}>
              <Button variant="secondary" size="sm" className="w-full">
                View Client Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-foreground-secondary" />
              <span>Started: {new Date(assessment.startedAt).toLocaleString()}</span>
            </div>
            {assessment.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Completed: {new Date(assessment.completedAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-foreground-secondary" />
              <span>
                Assessor: {assessment.assessor.firstName} {assessment.assessor.lastName}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Questions</CardTitle>
          {assessment.template.description && (
            <p className="text-sm text-foreground-secondary">
              {assessment.template.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <AssessmentRenderer
            template={assessment.template}
            responses={localResponses}
            isReadOnly={isCompleted}
            onResponseChange={handleResponseChange}
            onSave={handleSave}
            onComplete={handleComplete}
            isSaving={isSaving}
            isCompleting={isCompleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
