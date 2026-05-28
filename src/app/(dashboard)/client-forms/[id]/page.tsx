"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import type { ClientFormSchemaSnapshot } from "@/lib/client-forms/types";
import type { VisitNoteData } from "@/lib/visit-notes/types";

interface SubmissionDetail {
  id: string;
  submittedAt: string;
  isPublicSubmission: boolean;
  submittedByName: string | null;
  submittedByEmail: string | null;
  formSchemaSnapshot: ClientFormSchemaSnapshot;
  data: Record<string, unknown>;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
  } | null;
  template: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export default function ClientFormDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = React.useState<SubmissionDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/client-forms/${submissionId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load submission");
        }
        setSubmission(data.submission);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submission");
      }
    };

    fetchSubmission();
  }, [submissionId]);

  if (error) {
    return <div className="text-sm text-error">{error}</div>;
  }

  if (!submission) {
    return <div className="text-sm text-foreground-secondary">Loading submission...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{submission.template.name}</h1>
        <p className="text-foreground-secondary">
          {submission.client
            ? `${submission.client.firstName} ${submission.client.lastName}`
            : "Template-only public submission"}{" "}
          • {new Date(submission.submittedAt).toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground-secondary">
          <div>{submission.isPublicSubmission ? "Public submission" : "Dashboard submission"}</div>
          {submission.submittedByName && <div>Submitter: {submission.submittedByName}</div>}
          {submission.submittedByEmail && <div>Email: {submission.submittedByEmail}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Form</CardTitle>
        </CardHeader>
        <CardContent>
          <FormRenderer
            template={{
              id: submission.formSchemaSnapshot.templateId,
              name: submission.formSchemaSnapshot.templateName,
              description: submission.formSchemaSnapshot.description || undefined,
              status: "ACTIVE",
              version: submission.formSchemaSnapshot.version,
              isEnabled: true,
              settings: submission.formSchemaSnapshot.settings,
              sections: submission.formSchemaSnapshot.sections,
            }}
            initialValues={submission.data as VisitNoteData}
            onSubmit={async () => undefined}
            disabled
            hideSubmitButton
          />
        </CardContent>
      </Card>
    </div>
  );
}
