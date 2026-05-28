"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import type { ClientFormSchemaSnapshot, ClientFormTemplateSettings } from "@/lib/client-forms/types";

interface PublicTemplatePayload {
  template: ClientFormSchemaSnapshot;
  settings: ClientFormTemplateSettings;
}

export default function PublicClientFormTemplatePage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const [payload, setPayload] = React.useState<PublicTemplatePayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitterName, setSubmitterName] = React.useState("");
  const [submitterEmail, setSubmitterEmail] = React.useState("");

  React.useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/public/client-form-templates/${templateId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load form");
        }
        setPayload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      }
    };

    fetchForm();
  }, [templateId]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/public/client-form-templates/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
        data,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to submit form");
    }
    setSubmitted(true);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="py-10 text-center text-error">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!payload) {
    return <div className="mx-auto max-w-2xl p-6 text-sm text-foreground-secondary">Loading form...</div>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="py-10 text-center">
            {payload.settings.display.successMessage || "Form submitted successfully."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{payload.settings.display.publicTitle || payload.template.templateName}</CardTitle>
        </CardHeader>
        {payload.settings.display.publicDescription && (
          <CardContent className="text-sm text-foreground-secondary">
            <p>{payload.settings.display.publicDescription}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payload.settings.collection.collectSubmitterName && (
            <div className="space-y-2">
              <Label htmlFor="submitter-name">Your name</Label>
              <Input id="submitter-name" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} />
            </div>
          )}
          {payload.settings.collection.collectSubmitterEmail && (
            <div className="space-y-2">
              <Label htmlFor="submitter-email">Your email</Label>
              <Input id="submitter-email" type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent>
          <FormRenderer
            template={{
              id: payload.template.templateId,
              name: payload.template.templateName,
              description: payload.template.description || undefined,
              status: "ACTIVE",
              version: payload.template.version,
              isEnabled: true,
              settings: payload.template.settings,
              sections: payload.template.sections,
            }}
            onSubmit={handleSubmit}
            submitLabel="Submit Form"
          />
        </CardContent>
      </Card>
    </div>
  );
}
