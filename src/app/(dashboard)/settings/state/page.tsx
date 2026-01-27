"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  Label,
} from "@/components/ui";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ClipboardCheck,
  Shield,
  Clock,
} from "lucide-react";

interface StateConfig {
  id: string;
  stateCode: string;
  stateName: string;
  medicaidProgramName?: string;
  evvRequired: boolean;
  authorizationRequired: boolean;
  maxHoursPerDay?: number;
  maxHoursPerWeek?: number;
}

interface StateDetails {
  id: string;
  stateCode: string;
  stateName: string;
  medicaidProgramName?: string;
  medicaidPayerId?: string;
  evvRequired: boolean;
  evvVendor?: string;
  assessmentFrequency?: number;
  requiredAssessments: string[];
  authorizationRequired: boolean;
  maxAuthorizationDays?: number;
  reauthorizationLeadDays?: number;
  maxHoursPerDay?: number;
  maxHoursPerWeek?: number;
  requiredConsentForms: string[];
  medicaidRequirements?: Record<string, unknown>;
  assessmentTemplates: Array<{
    id: string;
    name: string;
    description?: string;
    isRequired: boolean;
  }>;
  consentFormTemplates: Array<{
    id: string;
    name: string;
    formType: string;
    isRequired: boolean;
  }>;
}

interface CompanyStateConfig {
  id: string;
  isPrimaryState: boolean;
  stateConfig: {
    id: string;
    stateCode: string;
    stateName: string;
  };
}

export default function StateSettingsPage() {
  const [states, setStates] = React.useState<StateConfig[]>([]);
  const [primaryState, setPrimaryState] = React.useState<StateConfig | null>(null);
  const [companyStates, setCompanyStates] = React.useState<CompanyStateConfig[]>([]);
  const [selectedStateDetails, setSelectedStateDetails] = React.useState<StateDetails | null>(null);
  const [selectedStateCode, setSelectedStateCode] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchStateConfig();
  }, []);

  React.useEffect(() => {
    if (selectedStateCode) {
      fetchStateDetails(selectedStateCode);
    } else {
      setSelectedStateDetails(null);
    }
  }, [selectedStateCode]);

  const fetchStateConfig = async () => {
    try {
      const response = await fetch("/api/settings/state");
      const data = await response.json();
      if (response.ok) {
        setStates(data.states || []);
        setPrimaryState(data.primaryState);
        setCompanyStates(data.companyStates || []);
        if (data.primaryState) {
          setSelectedStateCode(data.primaryState.stateCode);
        }
      } else {
        setError(data.error || "Failed to fetch state configuration");
      }
    } catch (err) {
      setError("Failed to load state configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStateDetails = async (stateCode: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/settings/state/${stateCode}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedStateDetails(data.stateConfig);
      }
    } catch (err) {
      console.error("Failed to fetch state details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveState = async () => {
    if (!selectedStateCode) return;

    const selectedState = states.find((s) => s.stateCode === selectedStateCode);
    if (!selectedState) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/settings/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateConfigId: selectedState.id,
          isPrimaryState: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrimaryState(selectedState);
        setSuccess(data.message);
        fetchStateConfig(); // Refresh
      } else {
        setError(data.error || "Failed to update state configuration");
      }
    } catch (err) {
      setError("Failed to save state configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const formatConsentType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">State Configuration</h1>
        <p className="text-foreground-secondary">
          Configure your operating state for Medicaid billing and compliance requirements
        </p>
      </div>

      {/* Current State Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Operating State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {primaryState ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">
                  Currently configured for {primaryState.stateName}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {primaryState.medicaidProgramName || "Medicaid"} program requirements apply
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">No state configured</p>
                <p className="text-sm text-foreground-secondary">
                  Select your operating state to enable Medicaid billing features
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="state-select">Select Operating State</Label>
            <div className="flex gap-2">
              <Select
                id="state-select"
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                className="flex-1"
              >
                <option value="">Select a state...</option>
                {states.map((state) => (
                  <option key={state.id} value={state.stateCode}>
                    {state.stateName} ({state.stateCode})
                    {state.medicaidProgramName ? ` - ${state.medicaidProgramName}` : ""}
                  </option>
                ))}
              </Select>
              <Button
                onClick={handleSaveState}
                disabled={
                  !selectedStateCode ||
                  isSaving ||
                  selectedStateCode === primaryState?.stateCode
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-error/10 text-sm text-error">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-success/10 text-sm text-success">{success}</div>
          )}
        </CardContent>
      </Card>

      {/* State Details */}
      {selectedStateCode && (
        <>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-foreground-tertiary" />
            </div>
          ) : selectedStateDetails ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Requirements Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    State Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-foreground-secondary">
                        Medicaid Program
                      </span>
                      <span className="font-medium">
                        {selectedStateDetails.medicaidProgramName || "Standard Medicaid"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-foreground-secondary">
                        EVV Required
                      </span>
                      <Badge variant={selectedStateDetails.evvRequired ? "success" : "default"}>
                        {selectedStateDetails.evvRequired ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {selectedStateDetails.evvVendor && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          EVV Vendor
                        </span>
                        <span className="font-medium">{selectedStateDetails.evvVendor}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-foreground-secondary">
                        Authorization Required
                      </span>
                      <Badge
                        variant={selectedStateDetails.authorizationRequired ? "success" : "default"}
                      >
                        {selectedStateDetails.authorizationRequired ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {selectedStateDetails.maxHoursPerDay && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          Max Hours/Day
                        </span>
                        <span className="font-medium">
                          {Number(selectedStateDetails.maxHoursPerDay)} hours
                        </span>
                      </div>
                    )}
                    {selectedStateDetails.maxHoursPerWeek && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          Max Hours/Week
                        </span>
                        <span className="font-medium">
                          {Number(selectedStateDetails.maxHoursPerWeek)} hours
                        </span>
                      </div>
                    )}
                    {selectedStateDetails.assessmentFrequency && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          Reassessment Frequency
                        </span>
                        <span className="font-medium">
                          Every {selectedStateDetails.assessmentFrequency} days
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Authorization Card */}
              {selectedStateDetails.authorizationRequired && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Authorization Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedStateDetails.maxAuthorizationDays && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          Max Authorization Period
                        </span>
                        <span className="font-medium">
                          {selectedStateDetails.maxAuthorizationDays} days
                        </span>
                      </div>
                    )}
                    {selectedStateDetails.reauthorizationLeadDays && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-foreground-secondary">
                          Reauthorization Lead Time
                        </span>
                        <span className="font-medium">
                          {selectedStateDetails.reauthorizationLeadDays} days before expiry
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-foreground-tertiary pt-2">
                      Authorization alerts will be sent automatically based on these settings.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Required Assessments Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    Required Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStateDetails.assessmentTemplates.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStateDetails.assessmentTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background-secondary"
                        >
                          <div>
                            <p className="font-medium text-sm">{template.name}</p>
                            {template.description && (
                              <p className="text-xs text-foreground-tertiary line-clamp-1">
                                {template.description}
                              </p>
                            )}
                          </div>
                          {template.isRequired && (
                            <Badge variant="default" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">
                      No assessments configured for this state.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Required Consent Forms Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Consent Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStateDetails.consentFormTemplates.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStateDetails.consentFormTemplates.map((form) => (
                        <div
                          key={form.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background-secondary"
                        >
                          <div>
                            <p className="font-medium text-sm">{form.name}</p>
                            <p className="text-xs text-foreground-tertiary">
                              {formatConsentType(form.formType)}
                            </p>
                          </div>
                          {form.isRequired && (
                            <Badge variant="default" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">
                      No consent forms configured for this state.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}

      {/* Help Text */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">About State Configuration</h3>
          <p className="text-sm text-foreground-secondary">
            State configuration determines the Medicaid billing requirements, required assessments,
            and consent forms for your agency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
