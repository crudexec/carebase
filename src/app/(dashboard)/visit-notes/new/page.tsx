"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
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

type WizardStep = "shift" | "template" | "form";

const WIZARD_STEPS = [
  { id: "shift", label: "Select Shift" },
  { id: "template", label: "Choose Template" },
  { id: "form", label: "Complete Note" },
];

export default function NewVisitNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("shift");
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  // Data state
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [templates, setTemplates] = React.useState<EnabledTemplate[]>([]);
  const [lastVisitNote, setLastVisitNote] = React.useState<LastVisitNote | null>(null);

  // Selection state
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EnabledTemplate | null>(null);

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
  const clientDiagnoses = selectedShift?.client?.diagnosisCodes || [];

  // Fetch shifts
  React.useEffect(() => {
    const fetchShifts = async () => {
      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          status: "COMPLETED",
        });

        if (preselectedClientId) {
          params.set("clientId", preselectedClientId);
        }

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
  }, [preselectedClientId]);

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
    if (!selectedShift?.client?.id) {
      setLastVisitNote(null);
      return;
    }

    const fetchLastVisitNote = async () => {
      try {
        const response = await fetch(
          `/api/visit-notes?clientId=${selectedShift.client.id}&limit=1`
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
  }, [selectedShift?.client?.id]);

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
    if (currentStep === "shift" && selectedShift) {
      goToStep("template");
    } else if (currentStep === "template" && selectedTemplate) {
      goToStep("form");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "template") {
      goToStep("shift");
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
    if (!selectedShift || !selectedTemplate) return;

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
          templateId: selectedTemplate.id,
          shiftId: selectedShift.id,
          clientId: selectedShift.client.id,
          data,
        }),
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
          {currentStep === "shift" && "Select the shift you want to document"}
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

      {/* Step 1: Shift Selection */}
      {!isLoading && currentStep === "shift" && (
        <div className="space-y-6">
          {shifts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  No completed shifts available in the last 7 days.
                </p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Complete a shift first, then come back to document it.
                </p>
                <Link href="/scheduling">
                  <Button variant="secondary" className="mt-4">
                    Go to Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Today's Shifts */}
              {groupedShifts.today.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-secondary mb-3 flex items-center gap-2">
                    <Badge variant="primary">Today</Badge>
                    {groupedShifts.today[0] && formatSectionDate(groupedShifts.today[0].scheduledStart)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <h3 className="text-sm font-medium text-foreground-secondary mb-3 flex items-center gap-2">
                    <Badge variant="default">Yesterday</Badge>
                    {groupedShifts.yesterday[0] && formatSectionDate(groupedShifts.yesterday[0].scheduledStart)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <h3 className="text-sm font-medium text-foreground-secondary mb-3">
                    Earlier This Week
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Navigation */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedShift}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Template Selection */}
      {!isLoading && currentStep === "template" && (
        <div className="space-y-6">
          {/* Selected shift summary - compact */}
          {selectedShift && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                  {selectedShift.client.firstName[0]}{selectedShift.client.lastName[0]}
                </span>
                <span className="font-medium">
                  {selectedShift.client.firstName} {selectedShift.client.lastName}
                </span>
                <span className="text-foreground-tertiary">•</span>
                <span className="text-foreground-secondary">
                  {new Date(selectedShift.scheduledStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" "}
                  {new Date(selectedShift.scheduledStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
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
      {!isLoading && currentStep === "form" && selectedShift && selectedTemplate && (
        <div className="space-y-6">
          {/* Back button */}
          <Button variant="ghost" onClick={handlePrevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Template
          </Button>

          {/* Client Context Panel */}
          <ClientContextPanel
            shift={selectedShift}
            lastVisitNote={lastVisitNote}
          />

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
