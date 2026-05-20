"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Plus, RefreshCw } from "lucide-react";

interface SubmissionItem {
  id: string;
  submittedAt: string;
  isPublicSubmission: boolean;
  submittedByName: string | null;
  submittedByEmail: string | null;
  template: { id: string; name: string };
  client: { id: string; firstName: string; lastName: string };
}

export default function ClientFormsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = React.useState<SubmissionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSubmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/client-forms");
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data.submissions || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Forms</h1>
          <p className="text-foreground-secondary">Private and public client form submissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchSubmissions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/client-forms/templates">
            <Button variant="ghost">Templates</Button>
          </Link>
          <Link href="/client-forms/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Submission
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-foreground-secondary">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-foreground-secondary">
            No client form submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="cursor-pointer transition-colors hover:border-primary/40"
              onClick={() => router.push(`/client-forms/${submission.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{submission.template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-foreground-secondary">
                <div>Client: {submission.client.firstName} {submission.client.lastName}</div>
                <div>Submitted: {new Date(submission.submittedAt).toLocaleString()}</div>
                <div>{submission.isPublicSubmission ? "Public submission" : "Dashboard submission"}</div>
                {(submission.submittedByName || submission.submittedByEmail) && (
                  <div>
                    Submitter: {submission.submittedByName || "Unknown"}
                    {submission.submittedByEmail ? ` (${submission.submittedByEmail})` : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
