"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  X,
} from "lucide-react";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import {
  validateTaskAlignment,
  TaskAlignmentResult,
} from "@/lib/visit-notes/diagnosis-task-mapping";
import { cn as _cn } from "@/lib/utils";

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
  { id: "client", label: "Client" },
  { id: "template", label: "Template" },
  { id: "form", label: "Complete" },
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

  // UI state - auto-expand shift section if client is pre-selected
  const [showShiftSection, setShowShiftSection] = React.useState(!!preselectedClientId);

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

  return (
    <div className="space-y-4">
      {/* Compact Header with inline step indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Breadcrumb
            items={[
              { label: "Visit Notes", href: "/visit-notes" },
              { label: "New" },
            ]}
          />
        </div>
        <StepIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStepIndex}
          onStepClick={handleStepClick}
          variant="inline"
        />
      </div>

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

      {/* Step 1: Client Selection */}
      {!isLoadingTemplates && currentStep === "client" && (
        <div className="space-y-4">
          {/* Combined client + date selection */}
          <div className="rounded-xl border bg-background p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </label>
                <ClientSearchSelect
                  value={selectedClientId}
                  onChange={(clientId, client) => {
                    setSelectedClientId(clientId);
                    setSelectedClient(client as SelectedClient | null);
                    setSelectedShift(null);
                  }}
                  label=""
                  placeholder="Search for a client..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Visit Date
                </label>
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
            </div>

            {/* Optional Shift Linking - Collapsible */}
            {selectedClientId && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowShiftSection(!showShiftSection)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground-tertiary" />
                    <span className="text-sm font-medium text-foreground-secondary">
                      Link to shift
                    </span>
                    <Badge variant="default" className="text-xs font-normal">
                      Optional
                    </Badge>
                    {selectedShift && (
                      <Badge variant="primary" className="text-xs">
                        {new Date(selectedShift.scheduledStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </Badge>
                    )}
                  </div>
                  {showShiftSection ? (
                    <ChevronUp className="h-4 w-4 text-foreground-tertiary group-hover:text-foreground-secondary transition-colors" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-foreground-tertiary group-hover:text-foreground-secondary transition-colors" />
                  )}
                </button>

                {showShiftSection && (
                  <div className="mt-3">
                    {isLoadingShifts ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-foreground-tertiary" />
                      </div>
                    ) : shifts.length === 0 ? (
                      <div className="text-center py-4 text-foreground-secondary">
                        <p className="text-sm">No recent shifts found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedShift && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSelectedShift(null)}
                              className="text-xs text-foreground-tertiary hover:text-foreground-secondary flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              Clear selection
                            </button>
                          </div>
                        )}

                        {/* Today's Shifts */}
                        {groupedShifts.today.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide">Today</span>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                            <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide">Yesterday</span>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                            <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide">Earlier</span>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-end">
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
        <div className="space-y-4">
          {/* Context bar */}
          {selectedClient && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </span>
                <span className="font-medium">
                  {selectedClient.firstName} {selectedClient.lastName}
                </span>
                <span className="text-foreground-tertiary">·</span>
                <span className="text-foreground-secondary">
                  {new Date(visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {selectedShift && (
                  <>
                    <span className="text-foreground-tertiary">·</span>
                    <span className="text-foreground-secondary text-xs">
                      Shift: {new Date(selectedShift.scheduledStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
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
            <div className="rounded-xl border bg-background p-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-foreground-tertiary mb-3" />
              <p className="text-foreground-secondary">No form templates available.</p>
              <p className="text-sm text-foreground-tertiary mt-1">
                Contact your administrator to set up templates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Template list */}
              <div className="lg:col-span-2 space-y-4">
                {/* Recommended templates */}
                {recommendedTemplates.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-success" />
                      Recommended
                    </h3>
                    <div className="space-y-2">
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
                  <h3 className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide mb-2">
                    {recommendedTemplates.length > 0 ? "All Templates" : "Available Templates"}
                  </h3>
                  <div className="space-y-2">
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
                  <div className="sticky top-4">
                    <TemplatePreview template={selectedTemplate} />
                  </div>
                ) : (
                  <div className="sticky top-4 p-6 rounded-xl border border-dashed border-border text-center bg-background-secondary/50">
                    <FileText className="h-6 w-6 mx-auto text-foreground-tertiary mb-2" />
                    <p className="text-xs text-foreground-tertiary">
                      Select a template to preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          {templates.length > 0 && (
            <div className="flex justify-between pt-2">
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
        <div className="space-y-4">
          {/* Compact header with back + context */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePrevStep}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>

            {selectedClient && (
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </span>
                <span className="font-medium text-foreground-secondary">
                  {selectedClient.firstName} {selectedClient.lastName}
                </span>
                <span className="text-foreground-tertiary">·</span>
                <span className="text-foreground-tertiary text-xs">
                  {new Date(visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            )}
          </div>

          {/* Client Context Panel - show if we have a shift linked */}
          {selectedShift && (
            <ClientContextPanel
              shift={selectedShift}
              lastVisitNote={lastVisitNote}
            />
          )}

          {/* Form */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">{selectedTemplate.name}</h2>
              </div>
              {selectedTemplate.description && (
                <p className="text-sm text-foreground-secondary mt-1">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
            <div className="p-5">
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
          </div>
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
