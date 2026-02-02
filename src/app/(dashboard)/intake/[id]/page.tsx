"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  ArrowRight,
  Loader2,
  User,
  ClipboardList,
  FileText,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface IntakeData {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  notes: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    emergencyRelation: string | null;
    medicaidId: string | null;
    insuranceInfo: string | null;
  };
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  assessments: {
    id: string;
    status: string;
    totalScore: number | null;
    interpretation: string | null;
    template: {
      id: string;
      name: string;
      code: string;
      maxScore: number | null;
    };
  }[];
  consents: {
    id: string;
    status: string;
    template: {
      id: string;
      name: string;
      formType: string;
    };
    signatures: {
      id: string;
      signedAt: string | null;
    }[];
  }[];
  carePlan: {
    id: string;
    status: string;
    tasks: {
      id: string;
      taskType: string;
      description: string;
      frequency: string;
    }[];
  } | null;
}

interface RequiredTemplate {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

interface RequiredConsent {
  id: string;
  name: string;
  description: string | null;
  formType: string;
}

const WIZARD_STEPS = [
  { id: 1, name: "Client Info", icon: User },
  { id: 2, name: "Assessments", icon: ClipboardList },
  { id: 3, name: "Consents", icon: FileText },
  { id: 4, name: "Care Plan", icon: Heart },
  { id: 5, name: "Review", icon: CheckCircle },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-primary/10 text-primary" },
  IN_PROGRESS: { label: "In Progress", color: "bg-warning/10 text-warning" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "bg-secondary/10 text-secondary" },
  APPROVED: { label: "Approved", color: "bg-success/10 text-success" },
  REJECTED: { label: "Rejected", color: "bg-error/10 text-error" },
  CANCELLED: { label: "Cancelled", color: "bg-foreground/10 text-foreground-secondary" },
};

export default function IntakeWizardPage() {
  const router = useRouter();
  const params = useParams();
  const intakeId = params.id as string;

  const [intake, setIntake] = React.useState<IntakeData | null>(null);
  const [requiredTemplates, setRequiredTemplates] = React.useState<RequiredTemplate[]>([]);
  const [requiredConsents, setRequiredConsents] = React.useState<RequiredConsent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingCarePlan, setIsGeneratingCarePlan] = React.useState(false);

  React.useEffect(() => {
    fetchIntake();
  }, [intakeId]);

  const fetchIntake = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/intake/${intakeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch intake");
      }

      setIntake(data.intake);
      setRequiredTemplates(data.requiredTemplates || []);
      setRequiredConsents(data.requiredConsents || []);
      setCurrentStep(data.intake.currentStep || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch intake");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStep = async (step: number) => {
    try {
      await fetch(`/api/intake/${intakeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStep: step }),
      });
      setCurrentStep(step);
    } catch (err) {
      console.error("Failed to update step:", err);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      updateStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const startAssessment = async (templateId: string) => {
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          clientId: intake?.client.id,
          intakeId,
          assessmentType: "INITIAL",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/assessments/${data.assessment.id}`);
      }
    } catch (err) {
      console.error("Failed to start assessment:", err);
    }
  };

  const createConsent = async (templateId: string) => {
    try {
      const response = await fetch(`/api/intake/${intakeId}/consents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/consents/${data.consent.id}`);
      }
    } catch (err) {
      console.error("Failed to create consent:", err);
    }
  };

  const generateCarePlan = async () => {
    if (!intake) return;
    setIsGeneratingCarePlan(true);

    try {
      const response = await fetch("/api/care-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: intake.client.id,
          intakeId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh intake to get the new care plan
        fetchIntake();
      } else {
        setError(data.error || "Failed to generate care plan");
      }
    } catch (err) {
      console.error("Failed to generate care plan:", err);
      setError("Failed to generate care plan");
    } finally {
      setIsGeneratingCarePlan(false);
    }
  };

  const submitForApproval = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/intake/${intakeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING_APPROVAL" }),
      });

      if (response.ok) {
        fetchIntake();
      }
    } catch (err) {
      console.error("Failed to submit for approval:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Intake", href: "/intake" },
            { label: "Loading..." },
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !intake) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Intake", href: "/intake" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-error">
              <p>{error || "Intake not found"}</p>
              <Button variant="secondary" onClick={() => router.push("/intake")} className="mt-4">
                Back to Intakes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[intake.status] || STATUS_CONFIG.IN_PROGRESS;

  // Check step completion
  const isStep1Complete = true; // Client info is always complete if intake exists
  const completedAssessments = intake.assessments.filter((a) => a.status === "COMPLETED");
  const isStep2Complete = requiredTemplates.length === 0 || completedAssessments.length >= requiredTemplates.length;
  const completedConsents = intake.consents.filter((c) => c.status === "SIGNED");
  const isStep3Complete = requiredConsents.length === 0 || completedConsents.length >= requiredConsents.length;
  const isStep4Complete = intake.carePlan !== null;
  const canSubmit = isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Review and verify the client's information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-foreground-secondary">Name</p>
                  <p className="font-medium">
                    {intake.client.firstName} {intake.client.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Date of Birth</p>
                  <p className="font-medium">
                    {intake.client.dateOfBirth
                      ? new Date(intake.client.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Phone</p>
                  <p className="font-medium">{intake.client.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Email</p>
                  <p className="font-medium">{intake.client.email || "Not provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground-secondary">Address</p>
                <p className="font-medium">
                  {intake.client.address
                    ? `${intake.client.address}, ${intake.client.city}, ${intake.client.state} ${intake.client.zipCode}`
                    : "Not provided"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Emergency Contact</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-foreground-secondary">Name</p>
                    <p className="font-medium">{intake.client.emergencyContact || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Phone</p>
                    <p className="font-medium">{intake.client.emergencyPhone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Relationship</p>
                    <p className="font-medium">{intake.client.emergencyRelation || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Insurance</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-foreground-secondary">Medicaid ID</p>
                    <p className="font-medium">{intake.client.medicaidId || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Insurance Info</p>
                    <p className="font-medium">{intake.client.insuranceInfo || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href={`/clients/${intake.client.id}`}>
                  <Button variant="secondary">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Edit Client Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Required Assessments</CardTitle>
              <CardDescription>
                Complete all required assessments for this intake
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredTemplates.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <ClipboardList className="mx-auto h-10 w-10 mb-3 opacity-50" />
                  <p>No required assessments for your state.</p>
                </div>
              ) : (
                requiredTemplates.map((template) => {
                  const existing = intake.assessments.find(
                    (a) => a.template.code === template.code
                  );
                  const isCompleted = existing?.status === "COMPLETED";

                  return (
                    <div
                      key={template.id}
                      className="p-4 rounded-lg border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isCompleted
                              ? "bg-success/10 text-success"
                              : existing
                              ? "bg-warning/10 text-warning"
                              : "bg-background-secondary"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : existing ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <ClipboardList className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-foreground-secondary">
                              {template.description}
                            </p>
                          )}
                          {existing && isCompleted && (
                            <p className="text-sm text-success">
                              Score: {existing.totalScore}
                              {existing.template.maxScore && ` / ${existing.template.maxScore}`}
                              {existing.interpretation && ` - ${existing.interpretation}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {existing ? (
                        <Link href={`/assessments/${existing.id}`}>
                          <Button variant="secondary" size="sm">
                            {isCompleted ? "View" : "Continue"}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" onClick={() => startAssessment(template.id)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Start
                        </Button>
                      )}
                    </div>
                  );
                })
              )}

              {!isStep2Complete && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Complete all required assessments before proceeding.</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Consent Forms</CardTitle>
              <CardDescription>
                Obtain required consent signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredConsents.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-50" />
                  <p>No required consent forms for your state.</p>
                </div>
              ) : (
                requiredConsents.map((consent) => {
                  const existing = intake.consents.find(
                    (c) => c.template.id === consent.id
                  );
                  const isSigned = existing?.status === "SIGNED";

                  return (
                    <div
                      key={consent.id}
                      className="p-4 rounded-lg border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSigned
                              ? "bg-success/10 text-success"
                              : existing
                              ? "bg-warning/10 text-warning"
                              : "bg-background-secondary"
                          }`}
                        >
                          {isSigned ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{consent.name}</p>
                          {consent.description && (
                            <p className="text-sm text-foreground-secondary">
                              {consent.description}
                            </p>
                          )}
                          <Badge className="mt-1">
                            {consent.formType.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      {existing ? (
                        <Link href={`/consents/${existing.id}`}>
                          <Button variant="secondary" size="sm">
                            {isSigned ? "View" : "Sign"}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" onClick={() => createConsent(consent.id)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Prepare
                        </Button>
                      )}
                    </div>
                  );
                })
              )}

              {!isStep3Complete && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Complete all required consent forms before proceeding.</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Care Plan</CardTitle>
              <CardDescription>
                Generate and review the care plan based on assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {intake.carePlan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        intake.carePlan.status === "APPROVED"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }
                    >
                      {intake.carePlan.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {intake.carePlan.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border flex items-center gap-3"
                      >
                        <Heart className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">{task.description}</p>
                          <p className="text-sm text-foreground-secondary">
                            {task.taskType} - {task.frequency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-10 w-10 text-foreground-secondary/50 mb-3" />
                  <p className="text-foreground-secondary">
                    Care plan will be generated based on completed assessment scores.
                  </p>
                  <Button
                    className="mt-4"
                    disabled={!isStep2Complete || isGeneratingCarePlan}
                    onClick={generateCarePlan}
                  >
                    {isGeneratingCarePlan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Care Plan
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review all information before submitting for approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>Client Information</span>
                  </div>
                  {isStep1Complete ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5" />
                    <span>
                      Assessments ({completedAssessments.length}/{requiredTemplates.length} completed)
                    </span>
                  </div>
                  {isStep2Complete ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span>
                      Consents ({completedConsents.length}/{requiredConsents.length} signed)
                    </span>
                  </div>
                  {isStep3Complete ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5" />
                    <span>Care Plan</span>
                  </div>
                  {isStep4Complete ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                </div>
              </div>

              {canSubmit ? (
                <div className="p-4 rounded-lg bg-success/10 text-success">
                  <p className="font-medium">Ready for submission</p>
                  <p className="text-sm mt-1">
                    All required steps have been completed. You can now submit this intake for approval.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-warning/10 text-warning">
                  <p className="font-medium">Not ready for submission</p>
                  <p className="text-sm mt-1">
                    Please complete all required steps before submitting.
                  </p>
                </div>
              )}

              {intake.status === "PENDING_APPROVAL" && (
                <div className="p-4 rounded-lg bg-primary/10 text-primary">
                  <p className="font-medium">Pending Approval</p>
                  <p className="text-sm mt-1">
                    This intake has been submitted and is waiting for approval.
                  </p>
                </div>
              )}

              {intake.status === "APPROVED" && (
                <div className="p-4 rounded-lg bg-success/10 text-success">
                  <p className="font-medium">Approved</p>
                  <p className="text-sm mt-1">
                    This intake has been approved. The client is ready for service.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Intake", href: "/intake" },
          { label: `${intake.client.firstName} ${intake.client.lastName}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Intake: {intake.client.firstName} {intake.client.lastName}
          </h1>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete =
            (step.id === 1 && isStep1Complete) ||
            (step.id === 2 && isStep2Complete) ||
            (step.id === 3 && isStep3Complete) ||
            (step.id === 4 && isStep4Complete) ||
            (step.id === 5 && intake.status === "APPROVED");

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => updateStep(step.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10"
                    : "hover:bg-background-secondary"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                      ? "bg-success text-success-foreground"
                      : "bg-background-secondary"
                  }`}
                >
                  {isComplete && !isActive ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-primary" : "text-foreground-secondary"
                  }`}
                >
                  {step.name}
                </span>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isComplete ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep === 5 ? (
          <Button
            onClick={submitForApproval}
            disabled={!canSubmit || isSubmitting || intake.status !== "IN_PROGRESS"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for Approval
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
