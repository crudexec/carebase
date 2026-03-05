"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  DatePicker,
} from "@/components/ui";
import { StepIndicator } from "@/components/ui/step-indicator";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import {
  ShiftSelectionCard,
  groupShiftsByDay,
} from "@/components/visit-notes/shift-selection-card";
import {
  TemplateSelectionCard,
  TemplatePreview,
} from "@/components/visit-notes/template-selection-card";
import { ClientContextPanel } from "@/components/visit-notes/client-context-panel";
import { FormTemplateData, VisitNoteData } from "@/lib/visit-notes/types";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  Sparkles,
  ClipboardEdit,
  Clock,
} from "lucide-react";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import {
  validateTaskAlignment,
  TaskAlignmentResult,
} from "@/lib/visit-notes/diagnosis-task-mapping";

// Types
interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  hasVisitNote?: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string;
    diagnosisCodes?: string[];
    primaryDiagnosis?: string;
  };
}

interface EnabledTemplate extends FormTemplateData {
  id: string;
}

interface LastVisitNote {
  id: string;
  submittedAt: string;
  templateName: string;
}

type WizardStep = "client" | "template" | "form";

const WIZARD_STEPS = [
  { id: "client", label: "Select Client" },
  { id: "template", label: "Choose Template" },
  { id: "form", label: "Complete Note" },
];

interface SelectedClient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  diagnosisCodes?: string[];
}

export default function NewVisitNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const preselectedClientId = searchParams.get("clientId");

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("client");
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  // Data state
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [templates, setTemplates] = React.useState<EnabledTemplate[]>([]);
  const [lastVisitNote, setLastVisitNote] = React.useState<LastVisitNote | null>(null);

  // Selection state - shift is now optional
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EnabledTemplate | null>(null);

  // Client selection state
  const [selectedClientId, setSelectedClientId] = React.useState<string>(preselectedClientId || "");
  const [selectedClient, setSelectedClient] = React.useState<SelectedClient | null>(null);
  const [visitDate, setVisitDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Loading/error state
  const [isLoadingShifts, setIsLoadingShifts] = React.useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Validation state
  const [validationResult, setValidationResult] = React.useState<TaskAlignmentResult | null>(null);
  const [showValidationWarning, setShowValidationWarning] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<VisitNoteData | null>(null);

  // Derived state
  const groupedShifts = React.useMemo(() => groupShiftsByDay(shifts), [shifts]);
  const clientDiagnoses = selectedShift?.client?.diagnosisCodes || selectedClient?.diagnosisCodes || [];
  const effectiveClientId = selectedClientId;

  // Redirect sponsors away from new note page
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SPONSOR") {
      router.replace("/visit-notes");
    }
  }, [session, status, router]);

  // Fetch shifts for selected client (optional linking)
  React.useEffect(() => {
    if (!selectedClientId) {
      setShifts([]);
      setIsLoadingShifts(false);
      return;
    }

    const fetchShifts = async () => {
      try {
        setIsLoadingShifts(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          clientId: selectedClientId,
        });

        const response = await fetch(`/api/scheduling?${params}`);
        const data = await response.json();
        if (response.ok) {
          setShifts(data.shifts || []);
        }
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      } finally {
        setIsLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [selectedClientId]);

  // Fetch templates
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/visit-notes/templates/enabled");
        const data = await response.json();
        if (response.ok) {
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch last visit note for selected client
  React.useEffect(() => {
    if (!effectiveClientId) {
      setLastVisitNote(null);
      return;
    }

    const fetchLastVisitNote = async () => {
      try {
        const response = await fetch(
          `/api/visit-notes?clientId=${effectiveClientId}&limit=1`
        );
        const data = await response.json();
        if (response.ok && data.visitNotes?.length > 0) {
          const note = data.visitNotes[0];
          setLastVisitNote({
            id: note.id,
            submittedAt: note.submittedAt,
            templateName: note.templateName,
          });
        } else {
          setLastVisitNote(null);
        }
      } catch (err) {
        console.error("Failed to fetch last visit note:", err);
      }
    };

    fetchLastVisitNote();
  }, [effectiveClientId]);

  // Show nothing while checking auth or if sponsor
  if (status === "loading" || session?.user?.role === "SPONSOR") {
    return null;
  }

  // Navigation handlers
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
    setError(null);
  };

  const handleStepClick = (stepIndex: number) => {
    const step = WIZARD_STEPS[stepIndex].id as WizardStep;
    // Only allow going back or to completed steps
    if (stepIndex < currentStepIndex) {
      goToStep(step);
    }
  };

  const handleShiftSelect = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleTemplateSelect = (template: EnabledTemplate) => {
    setSelectedTemplate(template);
  };

  const handleNextStep = () => {
    if (currentStep === "client") {
      // Client is required to proceed
      if (selectedClientId) {
        goToStep("template");
      }
    } else if (currentStep === "template" && selectedTemplate) {
      goToStep("form");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "template") {
      goToStep("client");
    } else if (currentStep === "form") {
      goToStep("template");
    }
  };

  // Form submission
  const extractDocumentedTasks = (data: VisitNoteData): string[] => {
    const tasks: string[] = [];
    for (const [, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        tasks.push(...value.map((v) => String(v)));
      } else if (typeof value === "string" && value.length > 0) {
        tasks.push(value);
      }
    }
    return tasks;
  };

  const handleSubmit = async (data: VisitNoteData) => {
    // Client and template are required
    if (!selectedClientId) return;
    if (!selectedTemplate) return;

    // Validate task alignment with diagnoses
    if (clientDiagnoses.length > 0) {
      const documentedTasks = extractDocumentedTasks(data);
      const result = validateTaskAlignment(clientDiagnoses, documentedTasks);
      setValidationResult(result);

      if (!result.isAligned && !showValidationWarning) {
        setPendingData(data);
        setShowValidationWarning(true);
        return;
      }
    }

    await submitVisitNote(data);
  };

  const submitVisitNote = async (data: VisitNoteData) => {
    if (!selectedClientId) return;
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    setError(null);
    setShowValidationWarning(false);
    setPendingData(null);

    try {
      // Build request body - shift is optional
      const requestBody: {
        templateId: string;
        clientId: string;
        visitDate: string;
        data: VisitNoteData;
        shiftId?: string;
      } = {
        templateId: selectedTemplate.id,
        clientId: selectedClientId,
        visitDate: visitDate,
        data,
      };

      // Optionally include shift if one is selected
      if (selectedShift) {
        requestBody.shiftId = selectedShift.id;
      }

      const response = await fetch("/api/visit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit visit note");
      }

      toast.success("Visit note submitted successfully");
      router.push(`/visit-notes/${result.visitNote.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit visit note";
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Check if templates are recommended based on diagnoses
  const getRecommendedTemplates = () => {
    // For now, just return the first template as recommended if client has diagnoses
    // In a real implementation, this would match template fields to diagnosis codes
    if (clientDiagnoses.length > 0 && templates.length > 0) {
      return templates.slice(0, 1);
    }
    return [];
  };

  const recommendedTemplates = getRecommendedTemplates();
  const otherTemplates = templates.filter(
    (t) => !recommendedTemplates.find((r) => r.id === t.id)
  );

  // Loading state
  const isLoading = isLoadingShifts || isLoadingTemplates;

  // Format date for section headers
  const formatSectionDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Visit Notes", href: "/visit-notes" },
          { label: "New Note" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Visit Note</h1>
        <p className="text-foreground-secondary">
          {currentStep === "client" && "Select the client and optionally link to a shift"}
          {currentStep === "template" && "Choose a form template for your note"}
          {currentStep === "form" && "Complete the visit note form"}
        </p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="py-6">
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStepIndex}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Step 1: Client Selection (with optional shift linking) */}
      {!isLoadingTemplates && currentStep === "client" && (
        <div className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md">
                <ClientSearchSelect
                  value={selectedClientId}
                  onChange={(clientId, client) => {
                    setSelectedClientId(clientId);
                    setSelectedClient(client as SelectedClient | null);
                    // Reset shift selection when client changes
                    setSelectedShift(null);
                  }}
                  label=""
                  placeholder="Search for a client..."
                  required
                />
              </div>

              <div className="max-w-md space-y-2">
                <label className="text-sm font-medium">Visit Date</label>
                <DatePicker
                  value={visitDate ? new Date(visitDate + "T00:00:00") : null}
                  onChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      setVisitDate(`${year}-${month}-${day}`);
                    }
                  }}
                  placeholder="Select visit date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Optional Shift Linking */}
          {selectedClientId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Link to Shift
                    <Badge variant="default" className="text-xs font-normal">Optional</Badge>
                  </CardTitle>
                  {selectedShift && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedShift(null)}
                      className="text-xs"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingShifts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-foreground-tertiary" />
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="text-center py-6 text-foreground-secondary">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent shifts found for this client</p>
                    <p className="text-xs text-foreground-tertiary mt-1">
                      You can still create a visit note without linking to a shift
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Today's Shifts */}
                    {groupedShifts.today.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-foreground-secondary mb-2 flex items-center gap-2">
                          <Badge variant="primary" className="text-xs">Today</Badge>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupedShifts.today.map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={handleShiftSelect}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Yesterday's Shifts */}
                    {groupedShifts.yesterday.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-foreground-secondary mb-2 flex items-center gap-2">
                          <Badge variant="default" className="text-xs">Yesterday</Badge>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupedShifts.yesterday.map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={handleShiftSelect}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Earlier Shifts */}
                    {groupedShifts.earlier.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-foreground-secondary mb-2">
                          Earlier
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupedShifts.earlier.map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={handleShiftSelect}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNextStep}
              disabled={!selectedClientId}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {!isLoadingTemplates && currentStep === "template" && (
        <div className="space-y-6">
          {/* Selected client summary - compact */}
          {selectedClient && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </span>
                <span className="font-medium">
                  {selectedClient.firstName} {selectedClient.lastName}
                </span>
                <span className="text-foreground-tertiary">•</span>
                <span className="text-foreground-secondary">
                  {new Date(visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {selectedShift && (
                  <>
                    <span className="text-foreground-tertiary">•</span>
                    <Badge variant="primary" className="text-xs">
                      Linked to shift: {new Date(selectedShift.scheduledStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </Badge>
                  </>
                )}
              </div>
              <button
                onClick={handlePrevStep}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  No form templates available.
                </p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Contact your administrator to set up visit note templates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template list */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recommended templates */}
                {recommendedTemplates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground-secondary mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-success" />
                      Recommended for this client
                    </h3>
                    <div className="space-y-3">
                      {recommendedTemplates.map((template) => (
                        <TemplateSelectionCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate?.id === template.id}
                          onSelect={handleTemplateSelect}
                          isRecommended
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All templates */}
                <div>
                  <h3 className="text-sm font-medium text-foreground-secondary mb-3">
                    {recommendedTemplates.length > 0 ? "All Templates" : "Available Templates"}
                  </h3>
                  <div className="space-y-3">
                    {(recommendedTemplates.length > 0 ? otherTemplates : templates).map((template) => (
                      <TemplateSelectionCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={handleTemplateSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview panel */}
              <div className="hidden lg:block">
                {selectedTemplate ? (
                  <div className="sticky top-6">
                    <h3 className="text-sm font-medium text-foreground-secondary mb-3">
                      Template Preview
                    </h3>
                    <TemplatePreview template={selectedTemplate} />
                  </div>
                ) : (
                  <div className="sticky top-6 p-6 rounded-lg border border-dashed border-border text-center">
                    <FileText className="h-8 w-8 mx-auto text-foreground-tertiary mb-2" />
                    <p className="text-sm text-foreground-tertiary">
                      Select a template to see preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          {templates.length > 0 && (
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handlePrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!selectedTemplate}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Form */}
      {!isLoadingTemplates && currentStep === "form" && selectedTemplate && selectedClientId && (
        <div className="space-y-6">
          {/* Back button */}
          <Button variant="ghost" onClick={handlePrevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Template
          </Button>

          {/* Client Context Panel - show if we have a shift linked */}
          {selectedShift && (
            <ClientContextPanel
              shift={selectedShift}
              lastVisitNote={lastVisitNote}
            />
          )}

          {/* Client summary - show if no shift linked */}
          {!selectedShift && selectedClient && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-medium">
                    {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</p>
                    <p className="text-sm text-foreground-secondary">
                      Visit Date: {new Date(visitDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedTemplate.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
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
                  <p className="font-medium mb-1">Client&apos;s care categories:</p>
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
