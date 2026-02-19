"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Card, CardContent } from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { FormStepper } from "./form-stepper";
import { BasicInfoStep } from "./steps/basic-info-step";
import { CareNeedsStep } from "./steps/care-needs-step";
import { ReferralSourceStep } from "./steps/referral-source-step";
import { FullProfileStep } from "./steps/full-profile-step";
import {
  UnifiedFormData,
  DEFAULT_FORM_DATA,
  ReferralSource,
  StaffMember,
} from "./types";

interface UnifiedClientFormProps {
  referralId?: string;
  defaultExpanded?: boolean;
  onSuccess?: (result: { type: "referral" | "client"; id: string }) => void;
}

const STEPS = [
  { id: 1, label: "Basic Info", description: "Personal details" },
  { id: 2, label: "Care Needs", description: "Services required" },
  { id: 3, label: "Referral Source", description: "Where from" },
  { id: 4, label: "Full Profile", description: "Complete details" },
];

export function UnifiedClientForm({
  referralId,
  defaultExpanded = false,
  onSuccess,
}: UnifiedClientFormProps) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = React.useState<UnifiedFormData>(DEFAULT_FORM_DATA);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [expandedMode, setExpandedMode] = React.useState(defaultExpanded);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingReferral, setIsLoadingReferral] = React.useState(!!referralId);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Reference data
  const [sources, setSources] = React.useState<ReferralSource[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [isLoadingSources, setIsLoadingSources] = React.useState(true);
  const [isLoadingStaff, setIsLoadingStaff] = React.useState(true);

  // Fetch referral data if pre-filling
  React.useEffect(() => {
    if (referralId) {
      fetchReferralData(referralId);
    }
  }, [referralId]);

  // Fetch reference data
  React.useEffect(() => {
    fetchSources();
    fetchStaff();
  }, []);

  const fetchReferralData = async (id: string) => {
    try {
      setIsLoadingReferral(true);
      const response = await fetch(`/api/referrals/${id}`);
      if (response.ok) {
        const data = await response.json();
        const referral = data.referral;

        // Map referral data to form data
        setFormData({
          ...DEFAULT_FORM_DATA,
          firstName: referral.prospectFirstName || "",
          lastName: referral.prospectLastName || "",
          dateOfBirth: referral.prospectDob ? referral.prospectDob.split("T")[0] : "",
          phone: referral.prospectPhone || "",
          address: referral.prospectAddress || "",
          city: referral.prospectCity || "",
          state: referral.prospectState || "MD",
          zipCode: referral.prospectZip || "",
          primaryDiagnosis: referral.primaryDiagnosis || "",
          requestedServices: referral.requestedServices || [],
          hoursRequested: referral.hoursRequested?.toString() || "",
          urgency: referral.urgency || "ROUTINE",
          specialNeeds: referral.specialNeeds || "",
          referralSourceId: referral.referralSourceId || "",
          referralSourceOther: referral.referralSourceOther || "",
          referralDate: referral.receivedDate ? referral.receivedDate.split("T")[0] : "",
          reason: referral.reason || "",
          assignedToId: referral.assignedToId || "",
          emergencyContact: referral.emergencyContact || "",
          emergencyPhone: referral.emergencyPhone || "",
          emergencyRelation: referral.emergencyRelation || "",
          medicaidId: referral.medicaidId || "",
          insuranceInfo: referral.insuranceInfo || "",
        });

        // Mark steps 1-3 as completed since we have referral data
        setCompletedSteps([1, 2, 3]);
        setCurrentStep(4);
        setExpandedMode(true);
      }
    } catch (error) {
      console.error("Failed to fetch referral:", error);
    } finally {
      setIsLoadingReferral(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/referrals/sources");
      const data = await response.json();
      if (response.ok) {
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff?roles=ADMIN,OPS_MANAGER,CLINICAL_DIRECTOR,STAFF");
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleChange = (updates: Partial<UnifiedFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for changed fields
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete updatedErrors[key];
    });
    setErrors(updatedErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      const maxStep = expandedMode ? 4 : 3;
      if (currentStep < maxStep) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleToggleExpand = () => {
    setExpandedMode(!expandedMode);
    if (!expandedMode && currentStep === 3 && completedSteps.includes(3)) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async (mode: "referral" | "client") => {
    // Validate current step before submitting
    if (!validateStep(currentStep)) return;

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        mode,
        referralId: referralId || undefined,
        data: {
          ...formData,
          hoursRequested: formData.hoursRequested
            ? parseFloat(formData.hoursRequested)
            : undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
        },
      };

      const response = await fetch("/api/clients/unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      const successMessage = result.type === "referral"
        ? "Referral created successfully"
        : "Client created successfully";
      toast.success(successMessage);

      if (onSuccess) {
        onSuccess({ type: result.type, id: result.id });
      } else {
        // Default navigation
        if (result.type === "referral") {
          router.push(`/referrals/${result.id}`);
        } else {
          router.push(`/clients/${result.id}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which steps to show
  const visibleSteps = expandedMode ? STEPS : STEPS.slice(0, 3);
  const isLastStep = currentStep === (expandedMode ? 4 : 3);
  const canSaveAsReferral = currentStep >= 3 || completedSteps.includes(3);
  const canSaveAsClient = expandedMode && (currentStep === 4 || completedSteps.includes(4));

  // Loading state for pre-fill
  if (isLoadingReferral) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {referralId ? "Complete Profile" : "Add New Client"}
            </h1>
            <p className="text-sm text-foreground-secondary">
              {referralId
                ? "Complete the client profile to start intake"
                : "Enter client or referral information"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="py-6">
          <FormStepper
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            expandedMode={expandedMode}
            onToggleExpand={!referralId ? handleToggleExpand : undefined}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {submitError && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Error saving</p>
            <p className="text-sm text-error/80 mt-1">{submitError}</p>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="text-error/60 hover:text-error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Form Content */}
      <Card>
        <CardContent className="py-6">
          {currentStep === 1 && (
            <BasicInfoStep
              data={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <CareNeedsStep
              data={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <ReferralSourceStep
              data={formData}
              onChange={handleChange}
              errors={errors}
              sources={sources}
              staff={staff}
              isLoadingSources={isLoadingSources}
              isLoadingStaff={isLoadingStaff}
            />
          )}
          {currentStep === 4 && expandedMode && (
            <FullProfileStep
              data={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Back Button */}
        <div>
          {currentStep > 1 && (
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Save as Referral - shown after step 3 */}
          {canSaveAsReferral && !referralId && (
            <Button
              variant="secondary"
              onClick={() => handleSubmit("referral")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Referral
            </Button>
          )}

          {/* Continue / Save as Client */}
          {!isLastStep ? (
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit("client")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : referralId ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {referralId ? "Complete & Start Intake" : "Save as Client"}
            </Button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      {!expandedMode && currentStep === 3 && !referralId && (
        <p className="text-center text-sm text-foreground-secondary">
          Need to add insurance, physician, or emergency contact details?{" "}
          <button
            type="button"
            onClick={handleToggleExpand}
            className="text-primary hover:underline"
          >
            Add Full Profile
          </button>
        </p>
      )}
    </div>
  );
}

export default UnifiedClientForm;
