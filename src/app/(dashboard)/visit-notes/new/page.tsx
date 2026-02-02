"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Label, Badge, Breadcrumb } from "@/components/ui";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import { FormTemplateData, VisitNoteData } from "@/lib/visit-notes/types";
import { ArrowLeft, Loader2, AlertTriangle, Info, Stethoscope } from "lucide-react";
import Link from "next/link";
import {
  validateTaskAlignment,
  getICD10Description,
  TaskAlignmentResult,
} from "@/lib/visit-notes/diagnosis-task-mapping";

interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    diagnosisCodes?: string[];
    primaryDiagnosis?: string;
  };
}

interface EnabledTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  sections: FormTemplateData["sections"];
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewVisitNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [templates, setTemplates] = React.useState<EnabledTemplate[]>([]);
  const [preselectedClient, setPreselectedClient] = React.useState<Client | null>(null);
  const [selectedShiftId, setSelectedShiftId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [isLoadingShifts, setIsLoadingShifts] = React.useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationResult, setValidationResult] = React.useState<TaskAlignmentResult | null>(null);
  const [showValidationWarning, setShowValidationWarning] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<VisitNoteData | null>(null);

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const clientDiagnoses = selectedShift?.client?.diagnosisCodes || [];

  React.useEffect(() => {
    fetchShifts();
    fetchTemplates();
    if (preselectedClientId) {
      fetchClient();
    }
  }, [preselectedClientId]);

  const fetchClient = async () => {
    if (!preselectedClientId) return;
    try {
      const response = await fetch(`/api/clients/${preselectedClientId}`);
      const data = await response.json();
      if (response.ok) {
        setPreselectedClient(data.client);
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      // Get today's and recent shifts
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `/api/scheduling?startDate=${startDate.toISOString()}&status=COMPLETED`
      );
      const data = await response.json();
      if (response.ok) {
        setShifts(data.shifts || []);
      }
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setIsLoadingShifts(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/visit-notes/templates/enabled");
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract documented tasks from form data for validation
  const extractDocumentedTasks = (data: VisitNoteData): string[] => {
    const tasks: string[] = [];

    for (const [, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        // Multiple choice fields
        tasks.push(...value.map((v) => String(v)));
      } else if (typeof value === "string" && value.length > 0) {
        // Text fields
        tasks.push(value);
      }
    }

    return tasks;
  };

  const handleSubmit = async (data: VisitNoteData) => {
    if (!selectedShift || !selectedTemplate) return;

    // Validate task alignment with diagnoses
    if (clientDiagnoses.length > 0) {
      const documentedTasks = extractDocumentedTasks(data);
      const result = validateTaskAlignment(clientDiagnoses, documentedTasks);
      setValidationResult(result);

      // If there are warnings and user hasn't acknowledged them, show warning dialog
      if (!result.isAligned && !showValidationWarning) {
        setPendingData(data);
        setShowValidationWarning(true);
        return;
      }
    }

    await submitVisitNote(data);
  };

  const submitVisitNote = async (data: VisitNoteData) => {
    if (!selectedShift || !selectedTemplate) return;

    setIsSubmitting(true);
    setError(null);
    setShowValidationWarning(false);
    setPendingData(null);

    try {
      const response = await fetch("/api/visit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          shiftId: selectedShiftId,
          clientId: selectedShift.client.id,
          data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit visit note");
      }

      router.push(`/visit-notes/${result.visitNote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit visit note");
      setIsSubmitting(false);
    }
  };

  const handleProceedAnyway = () => {
    if (pendingData) {
      submitVisitNote(pendingData);
    }
  };

  const handleCancelSubmit = () => {
    setShowValidationWarning(false);
    setPendingData(null);
  };

  const isLoading = isLoadingShifts || isLoadingTemplates;
  const canShowForm = selectedShiftId && selectedTemplateId && selectedTemplate;

  return (
    <div className="space-y-6">
      {/* Breadcrumb - different path if coming from client */}
      <Breadcrumb
        items={
          preselectedClient
            ? [
                { label: "Clients", href: "/clients" },
                { label: `${preselectedClient.firstName} ${preselectedClient.lastName}`, href: `/clients/${preselectedClient.id}` },
                { label: "New Visit Note" },
              ]
            : [
                { label: "Visit Notes", href: "/visit-notes" },
                { label: "New Note" },
              ]
        }
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Visit Note</h1>
        <p className="text-foreground-secondary">
          Select a shift and form to submit your visit note
        </p>
      </div>

      {/* Selection cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Shift selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Shift</CardTitle>
              </CardHeader>
              <CardContent>
                {shifts.length === 0 ? (
                  <p className="text-sm text-foreground-secondary">
                    No completed shifts available. Complete a shift first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="shift-select">Shift</Label>
                    <Select
                      id="shift-select"
                      value={selectedShiftId}
                      onChange={(e) => setSelectedShiftId(e.target.value)}
                    >
                      <option value="">Select a shift...</option>
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.client.firstName} {shift.client.lastName} -{" "}
                          {formatDateTime(shift.scheduledStart)}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Form</CardTitle>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <p className="text-sm text-foreground-secondary">
                    No forms available. Contact your administrator.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="template-select">Form Template</Label>
                    <Select
                      id="template-select"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    >
                      <option value="">Select a form...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                    {selectedTemplate?.description && (
                      <p className="text-xs text-foreground-tertiary">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          {canShowForm && (
            <div className="pt-4">
              {selectedShift && (
                <div className="mb-4 space-y-3">
                  {/* Client and Shift Info */}
                  <div className="p-4 rounded-lg bg-background-secondary">
                    <p className="text-sm">
                      <span className="font-medium">Client:</span>{" "}
                      {selectedShift.client.firstName} {selectedShift.client.lastName}
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      <span className="font-medium">Shift:</span>{" "}
                      {formatDateTime(selectedShift.scheduledStart)} -{" "}
                      {new Date(selectedShift.scheduledEnd).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Client Diagnoses (Read-only Reference) */}
                  {clientDiagnoses.length > 0 && (
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Client Diagnoses (Reference)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {clientDiagnoses.map((code) => {
                          const description = getICD10Description(code);
                          const isPrimary = code === selectedShift.client.primaryDiagnosis;
                          return (
                            <div
                              key={code}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs"
                              title={description}
                            >
                              <span className="font-mono font-medium">{code}</span>
                              {description && (
                                <span className="text-foreground-secondary">
                                  - {description}
                                </span>
                              )}
                              {isPrimary && (
                                <Badge variant="default" className="text-[10px] px-1 py-0">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-foreground-tertiary">
                        <Info className="inline h-3 w-3 mr-1" />
                        Document tasks that support these diagnoses for billing compliance
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-md bg-error/10 p-4 text-sm text-error">
                  {error}
                </div>
              )}

              <FormRenderer
                template={{
                  name: selectedTemplate.name,
                  description: selectedTemplate.description,
                  status: "ACTIVE",
                  version: selectedTemplate.version,
                  isEnabled: true,
                  sections: selectedTemplate.sections,
                }}
                onSubmit={handleSubmit}
                disabled={isSubmitting}
                submitLabel="Submit Visit Note"
              />
            </div>
          )}
        </>
      )}

      {/* Validation Warning Modal */}
      {showValidationWarning && validationResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Task Alignment Warning</CardTitle>
                  <p className="text-sm text-foreground-secondary mt-0.5">
                    Review before submitting
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-warning mb-2">Warnings:</p>
                  <ul className="text-sm text-foreground-secondary space-y-1">
                    {validationResult.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {validationResult.suggestions.length > 0 && (
                <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-2">Suggestions:</p>
                  <ul className="text-sm text-foreground-secondary space-y-1">
                    {validationResult.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expected vs Found */}
              {validationResult.matchedCategories.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Client's care categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {validationResult.matchedCategories.map((cat) => (
                      <Badge key={cat} variant="default">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-foreground-secondary">
                You can still submit, but the visit note may not fully support billing
                requirements. Consider updating your documentation.
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={handleCancelSubmit}>
                  Go Back & Edit
                </Button>
                <Button
                  variant="default"
                  onClick={handleProceedAnyway}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Anyway"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
