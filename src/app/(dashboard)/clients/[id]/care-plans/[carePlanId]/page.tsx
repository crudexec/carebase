"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { CarePlanForm } from "@/components/care-plan";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface CarePlanData {
  id: string;
  status: string;
  effectiveDate: string | null;
  endDate: string | null;
  certStartDate: string | null;
  certEndDate: string | null;
  signatureSentDate: string | null;
  signatureReceivedDate: string | null;
  verbalSOCDate: string | null;
  summary: string | null;
  goals: Record<string, unknown> | null;
  interventions: Record<string, unknown> | null;
  frequency: Record<string, unknown> | null;
  internalNotes: string | null;
  medications: string | null;
  dmeSupplies: string | null;
  safetyMeasures: string | null;
  nutritionalRequirements: string | null;
  allergies: string | null;
  functionalLimitations: string[];
  otherFunctionalLimit: string | null;
  activitiesPermitted: string[];
  otherActivitiesPermit: string | null;
  mentalStatus: string[];
  otherMentalStatus: string | null;
  prognosis: string | null;
  cognitiveStatus: string | null;
  rehabPotential: string | null;
  dischargePlan: string | null;
  riskIntervention: string | null;
  advancedDirectives: string | null;
  caregiverNeeds: string | null;
  homeboundStatus: string | null;
  carePreferences: string | null;
  careLevel: string | null;
  recommendedHours: number | null;
  physicianId: string | null;
  caseManagerId: string | null;
  physicianCertStatement: string | null;
  // Manual physician entry fields
  physicianName: string | null;
  physicianNpi: string | null;
  physicianPhone: string | null;
  physicianFax: string | null;
  qaStatus: string | null;
  qaNotes: string | null;
  nurseSignature: string | null;
  nurseSignedAt: string | null;
  clinicalNotes: string | null;
  clientSignature: string | null;
  clientSignedAt: string | null;
  clientSignerName: string | null;
  clientSignerRelation: string | null;
  client: Client;
  intake: {
    id: string;
  } | null;
  physician: {
    id: string;
    firstName: string;
    lastName: string;
    npi: string | null;
    specialty: string | null;
    phone: string | null;
    fax: string | null;
  } | null;
  caseManager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  diagnoses: Array<{
    id: string;
    icdCode: string;
    icdDescription: string;
    diagnosisType: string;
    onsetDate: string | null;
    notes: string | null;
    isActive: boolean;
  }>;
  orders: Array<{
    id: string;
    disciplineType: string;
    bodySystem: string | null;
    orderText: string;
    orderExplanation: string | null;
    goals: string | null;
    goalsExplanation: string | null;
    orderStatus: string;
    isFrequencyOrder: boolean;
    effectiveDate: string | null;
    isActive: boolean;
  }>;
}

export default function CarePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const carePlanId = params.carePlanId as string;

  const [carePlan, setCarePlan] = React.useState<CarePlanData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCarePlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/care-plans/${carePlanId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch care plan");
        }
        const data = await response.json();
        setCarePlan(data.carePlan);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load care plan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarePlan();
  }, [carePlanId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !carePlan) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground-secondary">{error || "Care plan not found"}</p>
      </div>
    );
  }

  // Transform the data to match the form's expected format
  const initialData = {
    ...carePlan,
    diagnoses: carePlan.diagnoses.filter((d) => d.isActive),
    orders: carePlan.orders.filter((o) => o.isActive),
  };

  return (
    <CarePlanForm
      carePlanId={carePlanId}
      clientId={clientId}
      clientName={`${carePlan.client.firstName} ${carePlan.client.lastName}`}
      initialData={initialData}
      intakeId={carePlan.intake?.id}
    />
  );
}
