"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import type { FormTemplateData } from "@/lib/visit-notes/types";

interface ClientInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewClientFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const [selectedClient, setSelectedClient] = React.useState<ClientInfo | null>(null);
  const [templates, setTemplates] = React.useState<FormTemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<FormTemplateData | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch("/api/client-forms/templates/enabled");
        const data = await response.json();
        if (response.ok) {
          setTemplates(data.templates || []);
        }
      } catch {
        setError("Failed to load templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const clientId = selectedClient?.id || preselectedClientId;
    if (!clientId || !selectedTemplate?.id) return;

    const response = await fetch("/api/client-forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        templateId: selectedTemplate.id,
        data,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to submit form");
    }

    router.push(`/client-forms/${result.submission.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Client Form</h1>
        <p className="text-foreground-secondary">Select a client and complete an enabled client form.</p>
      </div>

      {error && <div className="rounded-md bg-error/10 p-4 text-sm text-error">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientSearchSelect
            value={selectedClient?.id || preselectedClientId || ""}
            onChange={(clientId, client) =>
              setSelectedClient(clientId && client ? (client as ClientInfo) : null)
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingTemplates ? (
            <div className="text-sm text-foreground-secondary">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-foreground-secondary">No enabled client form templates found.</div>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template)}
                className={`w-full rounded-lg border p-4 text-left ${
                  selectedTemplate?.id === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="font-medium">{template.name}</div>
                {template.description && (
                  <div className="text-sm text-foreground-secondary">{template.description}</div>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {(selectedClient || preselectedClientId) && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTemplate.name}
              {selectedClient ? ` for ${selectedClient.firstName} ${selectedClient.lastName}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormRenderer template={selectedTemplate} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
