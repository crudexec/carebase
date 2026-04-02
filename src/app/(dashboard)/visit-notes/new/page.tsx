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
import { FormRenderer, FormRendererHandle } from "@/components/visit-notes/form-renderer";
import { SaveStateFooter, useSaveState } from "@/components/visit-notes/save-state-footer";
import {
  ShiftSelectionCard,
  groupShiftsByDay,
} from "@/components/visit-notes/shift-selection-card";
import { FormTemplateData, VisitNoteData } from "@/lib/visit-notes/types";
import {
  Loader2,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  Clock,
  X,
  ClipboardList,
  Check,
  Settings,
  Link as LinkIcon,
} from "lucide-react";
import {
  validateTaskAlignment,
  TaskAlignmentResult,
} from "@/lib/visit-notes/diagnosis-task-mapping";
import { GoalTrackingContainer } from "@/components/visit-notes/goal-tracking";
import { GoalTrackingData } from "@/lib/visit-notes/types";

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

interface CarePlanOption {
  id: string;
  planNumber: string;
  status: string;
  templateName?: string;
  effectiveDate?: string;
  endDate?: string;
}

interface ClientInfo {
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
  const clientId = searchParams.get("clientId");

  // Data state
  const [client, setClient] = React.useState<ClientInfo | null>(null);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [templates, setTemplates] = React.useState<EnabledTemplate[]>([]);

  // Selection state
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EnabledTemplate | null>(null);
  const [visitDate, setVisitDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Care plan state
  const [selectedCarePlan, setSelectedCarePlan] = React.useState<CarePlanOption | null>(null);
  const [isLoadingCarePlans, setIsLoadingCarePlans] = React.useState(false);
  const [goalTrackingData, setGoalTrackingData] = React.useState<Record<number, GoalTrackingData>>({});

  // UI state
  const [showOptionsModal, setShowOptionsModal] = React.useState(false);

  // Loading/error state
  const [isLoadingClient, setIsLoadingClient] = React.useState(true);
  const [isLoadingShifts, setIsLoadingShifts] = React.useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Validation state
  const [validationResult, setValidationResult] = React.useState<TaskAlignmentResult | null>(null);
  const [showValidationWarning, setShowValidationWarning] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<VisitNoteData | null>(null);

  // Form ref and save state for sticky footer
  const formRef = React.useRef<FormRendererHandle | null>(null);
  const { saveState, markDirty, markSaving, markError, reset: resetSaveState } = useSaveState();

  // Derived state
  const groupedShifts = React.useMemo(() => groupShiftsByDay(shifts), [shifts]);
  const clientDiagnoses = client?.diagnosisCodes || [];

  // Redirect if no clientId
  React.useEffect(() => {
    if (!clientId) {
      router.replace("/visit-notes");
    }
  }, [clientId, router]);

  // Redirect sponsors away
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SPONSOR") {
      router.replace("/visit-notes");
    }
  }, [session, status, router]);

  // Fetch client info
  React.useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        setIsLoadingClient(true);
        const response = await fetch(`/api/clients/${clientId}`);
        const data = await response.json();
        if (response.ok) {
          setClient({
            id: data.client.id,
            firstName: data.client.firstName,
            lastName: data.client.lastName,
            dateOfBirth: data.client.dateOfBirth,
            diagnosisCodes: data.client.diagnosisCodes || [],
          });
        } else {
          setError("Client not found");
          router.replace("/visit-notes");
        }
      } catch (err) {
        console.error("Failed to fetch client:", err);
        setError("Failed to load client");
      } finally {
        setIsLoadingClient(false);
      }
    };

    fetchClient();
  }, [clientId, router]);

  // Fetch care plans and auto-select active one
  React.useEffect(() => {
    if (!clientId) return;

    const fetchCarePlans = async () => {
      try {
        setIsLoadingCarePlans(true);
        const response = await fetch(`/api/care-plans?clientId=${clientId}&status=ACTIVE`);
        const data = await response.json();
        if (response.ok) {
          const plans: CarePlanOption[] = (data.carePlans || []).map((cp: {
            id: string;
            planNumber: string;
            status: string;
            template?: { name: string };
            effectiveDate?: string;
            endDate?: string;
          }) => ({
            id: cp.id,
            planNumber: cp.planNumber,
            status: cp.status,
            templateName: cp.template?.name,
            effectiveDate: cp.effectiveDate,
            endDate: cp.endDate,
          }));

          // Auto-select the active care plan
          if (plans.length > 0) {
            setSelectedCarePlan(plans[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch care plans:", err);
      } finally {
        setIsLoadingCarePlans(false);
      }
    };

    fetchCarePlans();
  }, [clientId]);

  // Fetch shifts for optional linking
  React.useEffect(() => {
    if (!clientId) return;

    const fetchShifts = async () => {
      try {
        setIsLoadingShifts(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          clientId: clientId,
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
  }, [clientId]);

  // Fetch templates and auto-select the active one
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/visit-notes/templates/enabled");
        const data = await response.json();
        if (response.ok) {
          const enabledTemplates = data.templates || [];
          setTemplates(enabledTemplates);

          // Always auto-select the first (active) template
          if (enabledTemplates.length > 0) {
            setSelectedTemplate(enabledTemplates[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Show nothing while checking auth or if sponsor
  if (status === "loading" || session?.user?.role === "SPONSOR" || !clientId) {
    return null;
  }

  // Loading state
  const isLoading = isLoadingClient || isLoadingTemplates;

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
    if (!clientId || !selectedTemplate) return;

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
    if (!clientId || !selectedTemplate) return;

    setIsSubmitting(true);
    setError(null);
    setShowValidationWarning(false);
    setPendingData(null);
    markSaving();

    try {
      // Merge goal tracking data into form data if care plan is selected
      const mergedData = {
        ...data,
        ...(selectedCarePlan && Object.keys(goalTrackingData).length > 0
          ? { goalTracking: goalTrackingData }
          : {}),
      };

      const requestBody: {
        templateId: string;
        clientId: string;
        visitDate: string;
        data: Record<string, unknown>;
        shiftId?: string;
        carePlanId?: string;
      } = {
        templateId: selectedTemplate.id,
        clientId: clientId,
        visitDate: visitDate,
        data: mergedData,
      };

      if (selectedShift) {
        requestBody.shiftId = selectedShift.id;
      }

      if (selectedCarePlan) {
        requestBody.carePlanId = selectedCarePlan.id;
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
      markError();
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

  // Handle dirty state from form
  const handleDirtyChange = (isDirty: boolean) => {
    if (isDirty) {
      markDirty();
    } else {
      resetSaveState();
    }
  };

  // Handle save from sticky footer
  const handleStickyFooterSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: "Visit Notes", href: "/visit-notes" },
            { label: "New" },
          ]}
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

      {/* Main Content */}
      {!isLoading && client && (
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header Bar - Client Info, Date, Care Plan, Options */}
          <div className="rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Client Info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold">{client.firstName} {client.lastName}</p>
                  <p className="text-xs text-foreground-secondary">Client</p>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Visit Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-foreground-tertiary" />
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
                    placeholder="Select date"
                  />
                </div>

                {/* Care Plan Badge */}
                {isLoadingCarePlans ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background-secondary/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-tertiary" />
                    <span className="text-xs text-foreground-tertiary">Loading...</span>
                  </div>
                ) : selectedCarePlan ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
                    <ClipboardList className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">{selectedCarePlan.planNumber}</span>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Active</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background-secondary/50">
                    <ClipboardList className="h-3.5 w-3.5 text-foreground-tertiary" />
                    <span className="text-xs text-foreground-tertiary">No care plan</span>
                  </div>
                )}

                {/* Linked Shift Badge (if selected) */}
                {selectedShift && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
                    <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">
                      {new Date(selectedShift.scheduledStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <button
                      onClick={() => setSelectedShift(null)}
                      className="text-foreground-tertiary hover:text-foreground-secondary ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Options Button */}
                <button
                  type="button"
                  onClick={() => setShowOptionsModal(true)}
                  className="p-2 rounded-lg border border-border hover:bg-background-secondary transition-colors"
                  title="Options"
                >
                  <Settings className="h-4 w-4 text-foreground-secondary" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="space-y-4">
            {/* Goal Tracking Section - Show if care plan is selected */}
            {selectedCarePlan && (
              <div className="rounded-xl border bg-background p-5">
                <GoalTrackingContainer
                  carePlanId={selectedCarePlan.id}
                  data={goalTrackingData}
                  onChange={setGoalTrackingData}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Form */}
            {selectedTemplate ? (
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
                    formRef={formRef}
                    onDirtyChange={handleDirtyChange}
                    hideSubmitButton
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-background p-12 text-center">
                <FileText className="h-10 w-10 mx-auto text-foreground-tertiary mb-3" />
                <p className="text-foreground-secondary">No form template available.</p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Contact your administrator to set up templates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Options Modal - Link to Shift */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Options
                </CardTitle>
                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="text-foreground-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Link to Shift Section */}
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Link to Shift
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Optional</Badge>
                </label>

                {isLoadingShifts ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground-tertiary" />
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="text-center py-6 text-foreground-secondary">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent shifts found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedShift && (
                      <button
                        onClick={() => setSelectedShift(null)}
                        className="text-xs text-foreground-tertiary hover:text-foreground-secondary flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Clear selection
                      </button>
                    )}

                    {/* Today's Shifts */}
                    {groupedShifts.today.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-foreground-tertiary uppercase">Today</span>
                        <div className="mt-1.5 space-y-1.5">
                          {groupedShifts.today.map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={(s) => {
                                setSelectedShift(s);
                              }}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Yesterday's Shifts */}
                    {groupedShifts.yesterday.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-foreground-tertiary uppercase">Yesterday</span>
                        <div className="mt-1.5 space-y-1.5">
                          {groupedShifts.yesterday.map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={(s) => {
                                setSelectedShift(s);
                              }}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Earlier Shifts */}
                    {groupedShifts.earlier.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-foreground-tertiary uppercase">Earlier</span>
                        <div className="mt-1.5 space-y-1.5">
                          {groupedShifts.earlier.slice(0, 5).map((shift) => (
                            <ShiftSelectionCard
                              key={shift.id}
                              shift={shift}
                              isSelected={selectedShift?.id === shift.id}
                              onSelect={(s) => {
                                setSelectedShift(s);
                              }}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setShowOptionsModal(false)}>
                  Done
                </Button>
              </div>
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

      {/* Sticky Save Footer */}
      {!isLoading && client && selectedTemplate && (
        <SaveStateFooter
          saveState={saveState}
          onSave={handleStickyFooterSave}
          disabled={isSubmitting}
          submitLabel="Submit Visit Note"
          savingLabel="Submitting..."
          errorMessage={error || undefined}
        />
      )}
    </div>
  );
}
