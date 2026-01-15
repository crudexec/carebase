"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Label } from "@/components/ui";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import { FormTemplateData, VisitNoteData } from "@/lib/visit-notes/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface EnabledTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  sections: FormTemplateData["sections"];
}

export default function NewVisitNotePage() {
  const router = useRouter();
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [templates, setTemplates] = React.useState<EnabledTemplate[]>([]);
  const [selectedShiftId, setSelectedShiftId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [isLoadingShifts, setIsLoadingShifts] = React.useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  React.useEffect(() => {
    fetchShifts();
    fetchTemplates();
  }, []);

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

  const handleSubmit = async (data: VisitNoteData) => {
    if (!selectedShift || !selectedTemplate) return;

    setIsSubmitting(true);
    setError(null);

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

  const isLoading = isLoadingShifts || isLoadingTemplates;
  const canShowForm = selectedShiftId && selectedTemplateId && selectedTemplate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/visit-notes">
          <button
            type="button"
            className="rounded p-1 hover:bg-background-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Visit Note</h1>
          <p className="text-foreground-secondary">
            Select a shift and form to submit your visit note
          </p>
        </div>
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
                <div className="mb-4 p-4 rounded-lg bg-background-secondary">
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
    </div>
  );
}
