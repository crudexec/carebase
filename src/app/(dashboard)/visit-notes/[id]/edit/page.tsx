"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import { FormSchemaSnapshot, VisitNoteData, GoalTrackingData, CarePlanGoalInfo } from "@/lib/visit-notes/types";
import { GoalTrackingContainer } from "@/components/visit-notes/goal-tracking";
import { extractGoalsFromCarePlan } from "@/components/visit-notes/goal-tracking/goal-tracking-viewer";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  ClipboardList,
} from "lucide-react";

interface VisitNoteDetail {
  id: string;
  formSchemaSnapshot: FormSchemaSnapshot;
  data: VisitNoteData & { goalTracking?: Record<number, GoalTrackingData> };
  visitDate: string;
  submittedAt: string;
  qaStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  qaComment: string | null;
  templateName: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  } | null;
  carePlanId?: string | null;
  carePlan?: {
    id: string;
    planNumber: string;
    status: string;
    formData: Record<string, unknown>;
  } | null;
}

export default function EditVisitNotePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const noteId = params.id as string;

  const [visitNote, setVisitNote] = React.useState<VisitNoteDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resubmitForReview, setResubmitForReview] = React.useState(false);
  const [goalTrackingData, setGoalTrackingData] = React.useState<Record<number, GoalTrackingData>>({});
  const [carePlanGoals, setCarePlanGoals] = React.useState<CarePlanGoalInfo[]>([]);

  // Redirect sponsors away from edit page
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SPONSOR") {
      router.replace("/visit-notes");
    }
  }, [session, status, router]);

  // Fetch visit note
  React.useEffect(() => {
    const fetchVisitNote = async () => {
      try {
        const response = await fetch(`/api/visit-notes/${noteId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch visit note");
        }

        setVisitNote(data.visitNote);

        // Initialize goal tracking data from visit note
        if (data.visitNote.data?.goalTracking) {
          setGoalTrackingData(data.visitNote.data.goalTracking);
        }

        // Extract goals from care plan if available
        if (data.visitNote.carePlan?.formData) {
          const goals = extractGoalsFromCarePlan(data.visitNote.carePlan.formData);
          setCarePlanGoals(goals);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load visit note";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitNote();
  }, [noteId]);

  // Show nothing while checking auth or if sponsor
  if (status === "loading" || session?.user?.role === "SPONSOR") {
    return null;
  }

  const handleSubmit = async (data: VisitNoteData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Merge goal tracking data if present
      const mergedData = {
        ...data,
        ...(visitNote?.carePlan && Object.keys(goalTrackingData).length > 0
          ? { goalTracking: goalTrackingData }
          : {}),
      };

      const response = await fetch(`/api/visit-notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: mergedData,
          resubmit: resubmitForReview,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update visit note");
      }

      toast.success(
        resubmitForReview
          ? "Visit note updated and resubmitted for review"
          : "Visit note updated successfully"
      );
      router.push(`/visit-notes/${noteId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update visit note";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getQAStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="error" className="gap-1">
            <XCircle className="h-3 w-3" />
            Needs Revision
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  // Error state
  if (error && !visitNote) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Visit Notes", href: "/visit-notes" },
            { label: "Edit" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="text-foreground-secondary">{error}</p>
            <Link href="/visit-notes">
              <Button variant="secondary" className="mt-4">
                Back to Visit Notes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!visitNote) return null;

  // Check if editable - approved notes cannot be edited
  const isApproved = visitNote.qaStatus === "APPROVED";
  const isRejected = visitNote.qaStatus === "REJECTED";

  // Build template from schema snapshot
  const template = {
    name: visitNote.formSchemaSnapshot.templateName || visitNote.templateName || "Visit Note",
    description: "",
    status: "ACTIVE" as const,
    version: visitNote.formSchemaSnapshot.version || 1,
    isEnabled: true,
    sections: visitNote.formSchemaSnapshot.sections || [],
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Visit Notes", href: "/visit-notes" },
          {
            label: `${visitNote.client.firstName} ${visitNote.client.lastName}`,
            href: `/visit-notes/${noteId}`,
          },
          { label: "Edit" },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Visit Note</h1>
          <p className="text-foreground-secondary">
            Update the visit note for {visitNote.client.firstName}{" "}
            {visitNote.client.lastName}
          </p>
        </div>
        <Link href={`/visit-notes/${noteId}`}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </Link>
      </div>

      {/* Approved warning */}
      {isApproved && (
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">
                This visit note has been approved
              </p>
              <p className="text-sm text-foreground-secondary mt-1">
                Approved visit notes cannot be edited. If you need to make
                changes, please contact your supervisor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejected with feedback */}
      {isRejected && visitNote.qaComment && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-error mt-0.5" />
            <div>
              <p className="font-medium text-error">Revision Requested</p>
              <p className="text-sm text-foreground-secondary mt-1">
                {visitNote.qaComment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visit Summary Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-foreground-tertiary" />
              <span className="text-foreground-secondary">Client:</span>
              <span className="font-medium">
                {visitNote.client.firstName} {visitNote.client.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-foreground-tertiary" />
              <span className="text-foreground-secondary">Visit Date:</span>
              <span className="font-medium">
                {formatDate(visitNote.visitDate)}
                {visitNote.shift && (
                  <span className="text-foreground-secondary ml-2">
                    ({formatTime(visitNote.shift.scheduledStart)} - {formatTime(visitNote.shift.scheduledEnd)})
                  </span>
                )}
                {!visitNote.shift && (
                  <span className="text-foreground-tertiary ml-2">(Manual Entry)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground-secondary">Status:</span>
              {getQAStatusBadge(visitNote.qaStatus)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Error */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Form */}
      {!isApproved && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {template.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormRenderer
              template={template}
              initialValues={visitNote.data}
              onSubmit={handleSubmit}
              disabled={isSubmitting}
              submitLabel={
                resubmitForReview
                  ? "Save & Resubmit for Review"
                  : "Save Changes"
              }
            />

            {/* Goal Tracking Section */}
            {visitNote.carePlan && carePlanGoals.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Goal Tracking</h3>
                  <span className="text-sm text-foreground-secondary">
                    (Care Plan #{visitNote.carePlan.planNumber})
                  </span>
                </div>
                <GoalTrackingContainer
                  carePlanId={visitNote.carePlan.id}
                  data={goalTrackingData}
                  onChange={setGoalTrackingData}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Resubmit option for rejected notes */}
            {isRejected && (
              <div className="mt-6 pt-6 border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resubmitForReview}
                    onChange={(e) => setResubmitForReview(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-primary" />
                      <span className="font-medium">Resubmit for QA Review</span>
                    </div>
                    <p className="text-sm text-foreground-secondary mt-0.5">
                      Check this box to send the note back for review after
                      making your changes.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
