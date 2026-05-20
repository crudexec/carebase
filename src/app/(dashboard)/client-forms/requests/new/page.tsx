"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import type { FormTemplateData } from "@/lib/visit-notes/types";

interface ClientInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewClientFormRequestPage() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const [selectedClient, setSelectedClient] = React.useState<ClientInfo | null>(null);
  const [templates, setTemplates] = React.useState<FormTemplateData[]>([]);
  const [templateId, setTemplateId] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [maxSubmissions, setMaxSubmissions] = React.useState("1");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [publicUrl, setPublicUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      const response = await fetch("/api/client-forms/templates/enabled");
      const data = await response.json();
      if (response.ok) {
        const publicTemplates = (data.templates || []).filter(
          (template: FormTemplateData) =>
            (template.settings as { access?: { isPublic?: boolean } } | undefined)?.access?.isPublic
        );
        setTemplates(publicTemplates);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreate = async () => {
    if (!(selectedClient?.id || preselectedClientId) || !templateId) {
      setError("Client and template are required");
      return;
    }

    const response = await fetch("/api/client-forms/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient?.id || preselectedClientId,
        templateId,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        expiresAt: expiresAt || null,
        maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to create request");
      return;
    }

    setPublicUrl(data.publicUrl);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Public Client Form Link</h1>
        <p className="text-foreground-secondary">Generate a per-client public link for a client form template.</p>
      </div>

      {error && <div className="rounded-md bg-error/10 p-4 text-sm text-error">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <ClientSearchSelect
              value={selectedClient?.id || preselectedClientId || ""}
              onChange={(clientId, client) =>
                setSelectedClient(clientId && client ? (client as ClientInfo) : null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id || "")}
                  className={`rounded-lg border p-3 text-left ${
                    templateId === template.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-foreground-secondary">{template.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input id="recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input id="recipient-email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-submissions">Max submissions</Label>
              <Input id="max-submissions" type="number" min={1} value={maxSubmissions} onChange={(e) => setMaxSubmissions(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires-at">Expires at</Label>
              <Input id="expires-at" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleCreate}>Generate Link</Button>
        </CardContent>
      </Card>

      {publicUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Public Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={publicUrl} readOnly />
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(publicUrl)}>
              Copy Link
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
