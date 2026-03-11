"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Label,
  Breadcrumb,
} from "@/components/ui";
import { ArrowLeft, ArrowRight, Loader2, Search, User } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  medicareNumber: string | null;
  dateOfBirth: string | null;
}

interface Template {
  id: string;
  name: string;
  version: string;
  description: string | null;
}

export default function NewOasisAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [step, setStep] = React.useState(1);
  const [_isLoading, _setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // Form data
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [timePoint, setTimePoint] = React.useState<string>("");
  const [assessorDiscipline, setAssessorDiscipline] = React.useState<string>("");
  const [assessmentDate, setAssessmentDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [episodeStartDate, setEpisodeStartDate] = React.useState<string>("");

  // Client search
  const [clientSearch, setClientSearch] = React.useState("");
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isSearchingClients, setIsSearchingClients] = React.useState(false);

  // Templates
  const [templates, setTemplates] = React.useState<Template[]>([]);

  // Fetch templates on mount
  React.useEffect(() => {
    fetchTemplates();
    if (preselectedClientId) {
      fetchClient(preselectedClientId);
    }
  }, [preselectedClientId]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/oasis/templates?isActive=true");
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates || []);
        // Auto-select if only one template
        if (data.templates?.length === 1) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      const data = await response.json();
      if (response.ok && data.client) {
        setSelectedClient(data.client);
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    }
  };

  const searchClients = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setClients([]);
      return;
    }

    setIsSearchingClients(true);
    try {
      const response = await fetch(`/api/clients?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      if (response.ok) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to search clients:", error);
    } finally {
      setIsSearchingClients(false);
    }
  }, []);

  // Debounced client search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  const handleCreate = async () => {
    if (!selectedClient || !selectedTemplate || !timePoint || !assessorDiscipline) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/oasis/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          clientId: selectedClient.id,
          timePoint,
          assessorDiscipline,
          assessmentDate,
          episodeStartDate: episodeStartDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create assessment");
      }

      toast.success("OASIS assessment created successfully");
      router.push(`/oasis/${data.assessment.id}/edit`);
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create assessment");
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedToStep2 = selectedClient !== null;
  const canProceedToStep3 = selectedTemplate !== null && timePoint && assessorDiscipline;
  const canCreate = canProceedToStep2 && canProceedToStep3 && assessmentDate;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "OASIS Assessments", href: "/oasis" },
          { label: "New Assessment" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New OASIS Assessment</h1>
        <p className="text-foreground-secondary">
          Create a new OASIS-E2 assessment for a client
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                  ? "bg-success text-success-foreground"
                  : "bg-background-secondary text-foreground-secondary"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 rounded ${
                  step > s ? "bg-success" : "bg-background-secondary"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Client */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Step 1: Select Client</h2>

            {selectedClient ? (
              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </p>
                    {selectedClient.medicareNumber && (
                      <p className="text-sm text-foreground-tertiary font-mono">
                        MBI: {selectedClient.medicareNumber}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedClient(null);
                    setClientSearch("");
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                  <Input
                    placeholder="Search by name or Medicare number..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-9"
                  />
                  {isSearchingClients && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>

                {clients.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setClientSearch("");
                          setClients([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-background-secondary transition-colors"
                      >
                        <p className="font-medium">
                          {client.firstName} {client.lastName}
                        </p>
                        {client.medicareNumber && (
                          <p className="text-sm text-foreground-tertiary font-mono">
                            MBI: {client.medicareNumber}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {clientSearch.length >= 2 && clients.length === 0 && !isSearchingClients && (
                  <p className="text-sm text-foreground-tertiary text-center py-4">
                    No clients found matching &quot;{clientSearch}&quot;
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedToStep2}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Assessment Details */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Step 2: Assessment Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="template">OASIS Template *</Label>
                <Select
                  id="template"
                  value={selectedTemplate?.id || ""}
                  onChange={(e) => {
                    const template = templates.find((t) => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                  }}
                  className="mt-1"
                >
                  <option value="">Select template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} (v{template.version})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="timePoint">Time Point *</Label>
                <Select
                  id="timePoint"
                  value={timePoint}
                  onChange={(e) => setTimePoint(e.target.value)}
                  className="mt-1"
                >
                  <option value="">Select time point...</option>
                  <option value="SOC">SOC - Start of Care</option>
                  <option value="ROC">ROC - Resumption of Care</option>
                  <option value="FU">FU - Follow-up/Recertification</option>
                  <option value="TRN">TRN - Transfer to Inpatient</option>
                  <option value="DC">DC - Discharge from Agency</option>
                  <option value="DAH">DAH - Death at Home</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="discipline">Assessor Discipline *</Label>
                <Select
                  id="discipline"
                  value={assessorDiscipline}
                  onChange={(e) => setAssessorDiscipline(e.target.value)}
                  className="mt-1"
                >
                  <option value="">Select discipline...</option>
                  <option value="RN">RN - Registered Nurse</option>
                  <option value="PT">PT - Physical Therapist</option>
                  <option value="OT">OT - Occupational Therapist</option>
                  <option value="ST">ST - Speech Therapist</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedToStep3}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Dates & Confirmation */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Step 3: Dates & Confirmation</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="assessmentDate">Assessment Date (M0090) *</Label>
                <Input
                  id="assessmentDate"
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              {(timePoint === "SOC" || timePoint === "ROC") && (
                <div>
                  <Label htmlFor="episodeStartDate">Episode Start Date</Label>
                  <Input
                    id="episodeStartDate"
                    type="date"
                    value={episodeStartDate}
                    onChange={(e) => setEpisodeStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="bg-background-secondary rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Summary</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-foreground-secondary">Client:</span>{" "}
                    {selectedClient?.firstName} {selectedClient?.lastName}
                  </p>
                  <p>
                    <span className="text-foreground-secondary">Template:</span>{" "}
                    {selectedTemplate?.name} (v{selectedTemplate?.version})
                  </p>
                  <p>
                    <span className="text-foreground-secondary">Time Point:</span>{" "}
                    {timePoint}
                  </p>
                  <p>
                    <span className="text-foreground-secondary">Discipline:</span>{" "}
                    {assessorDiscipline}
                  </p>
                  <p>
                    <span className="text-foreground-secondary">Date:</span>{" "}
                    {assessmentDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!canCreate || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create & Start Assessment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
