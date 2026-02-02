"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Select,
  Label,
  Breadcrumb,
} from "@/components/ui";
import { ArrowLeft, Loader2, ClipboardList, CheckCircle } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
  maxScore: number | null;
  isRequired: boolean;
  sections: {
    id: string;
    title: string;
    items: { id: string }[];
  }[];
}

export default function NewAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const preselectedTemplateId = searchParams.get("templateId");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [templates, setTemplates] = React.useState<AssessmentTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    clientId: preselectedClientId || "",
    templateId: preselectedTemplateId || "",
    assessmentType: "INITIAL" as "INITIAL" | "REASSESSMENT" | "DISCHARGE",
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, templatesRes] = await Promise.all([
        fetch("/api/clients?limit=100"),
        fetch("/api/assessments/templates"),
      ]);

      const [clientsData, templatesData] = await Promise.all([
        clientsRes.json(),
        templatesRes.json(),
      ]);

      if (clientsRes.ok) {
        setClients(clientsData.clients || []);
      }

      if (templatesRes.ok) {
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create assessment");
      }

      router.push(`/assessments/${data.assessment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assessment");
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === formData.templateId);

  // Find preselected client for breadcrumb
  const preselectedClient = preselectedClientId
    ? clients.find((c) => c.id === preselectedClientId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb - different path if coming from client */}
      <Breadcrumb
        items={
          preselectedClient
            ? [
                { label: "Clients", href: "/clients" },
                { label: `${preselectedClient.firstName} ${preselectedClient.lastName}`, href: `/clients/${preselectedClient.id}` },
                { label: "New Assessment" },
              ]
            : [
                { label: "Assessments", href: "/assessments" },
                { label: "New Assessment" },
              ]
        }
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Assessment</h1>
        <p className="text-foreground-secondary">
          Start a clinical assessment for a client
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-md bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
            <CardDescription>
              Choose the client to assess
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" required>
                Client
              </Label>
              <Select
                id="clientId"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                }
                required
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Type */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Type</CardTitle>
            <CardDescription>
              Select the type of assessment being conducted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "INITIAL", label: "Initial Assessment", desc: "First assessment for a new client" },
                { value: "REASSESSMENT", label: "Reassessment", desc: "Periodic follow-up assessment" },
                { value: "DISCHARGE", label: "Discharge Assessment", desc: "Final assessment at discharge" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      assessmentType: type.value as typeof formData.assessmentType,
                    }))
                  }
                  className={`flex-1 min-w-[150px] p-4 rounded-lg border text-left transition-colors ${
                    formData.assessmentType === type.value
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    {type.desc}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Template</CardTitle>
            <CardDescription>
              Choose the assessment instrument to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-foreground-secondary">
                <ClipboardList className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p>No assessment templates available.</p>
                <p className="text-sm mt-1">
                  Please configure your state settings first.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {templates.map((template) => {
                  const totalItems = template.sections.reduce(
                    (sum, s) => sum + s.items.length,
                    0
                  );

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, templateId: template.id }))
                      }
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        formData.templateId === template.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isRequired && (
                              <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs">
                                Required
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-foreground-secondary mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-foreground-secondary">
                            <span>{template.sections.length} sections</span>
                            <span>{totalItems} items</span>
                            {template.maxScore && (
                              <span>Max score: {template.maxScore}</span>
                            )}
                          </div>
                        </div>
                        {formData.templateId === template.id && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedTemplate.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-foreground-secondary">
                        {section.items.length} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/assessments">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.clientId || !formData.templateId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <ClipboardList className="mr-2 h-4 w-4" />
                Start Assessment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
