"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { AssessmentRenderer } from "@/components/assessments/assessment-renderer";
import { AssessmentScoreDisplay } from "@/components/assessments/assessment-score-display";
import {
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Printer,
  Trash2,
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
  };
  assessor: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

  // Local responses state for optimistic updates
  const [localResponses, setLocalResponses] = React.useState<
    { itemId: string; numericValue: number | null; textValue: string | null; notes: string | null }[]
  >([]);

  React.useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
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
  };

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

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assessment");
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

      setAssessment(data.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete assessment");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete assessment");
      }

      router.push("/assessments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assessment");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <button
              type="button"
              className="rounded p-1 hover:bg-background-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Assessment</h1>
        </div>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <button
              type="button"
              className="rounded p-1 hover:bg-background-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
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
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
          <Button
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
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
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

      {/* Completed Assessment Score */}
      {isCompleted && assessment.totalScore !== null && (
        <AssessmentScoreDisplay
          templateName={assessment.template.name}
          templateCode={assessment.template.code || ""}
          totalScore={assessment.totalScore}
          maxScore={assessment.template.maxScore}
          percentageScore={assessment.percentageScore}
          interpretation={assessment.interpretation}
          completedAt={assessment.completedAt!}
        />
      )}

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
