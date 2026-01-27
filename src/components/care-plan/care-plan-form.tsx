"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  FileText,
  Heart,
  Stethoscope,
  Target,
  User,
  Shield,
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  FileCheck,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Checkbox,
  CollapsibleSection,
  Badge,
  SignaturePad,
} from "@/components/ui";
import { ICD10Search, DiagnosisItem } from "./icd10-search";
import { PhysicianSearch } from "./physician-search";

// Types
interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string | null;
  specialty: string | null;
  phone: string | null;
  fax?: string | null;
}

interface CaseManager {
  id: string;
  firstName: string;
  lastName: string;
}

interface Diagnosis {
  id?: string;
  icdCode: string;
  icdDescription: string;
  diagnosisType: string;
  onsetDate?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

interface Order {
  id?: string;
  disciplineType: string;
  bodySystem?: string | null;
  orderText: string;
  orderExplanation?: string | null;
  goals?: string | null;
  goalsExplanation?: string | null;
  orderStatus?: string;
  isFrequencyOrder?: boolean;
  effectiveDate?: string | null;
  isActive?: boolean;
}

interface CarePlanData {
  id?: string;
  status: string;
  effectiveDate?: string | null;
  endDate?: string | null;
  certStartDate?: string | null;
  certEndDate?: string | null;
  signatureSentDate?: string | null;
  signatureReceivedDate?: string | null;
  verbalSOCDate?: string | null;
  summary?: string | null;
  goals?: Record<string, unknown> | null;
  interventions?: Record<string, unknown> | null;
  frequency?: Record<string, unknown> | null;
  internalNotes?: string | null;
  medications?: string | null;
  dmeSupplies?: string | null;
  safetyMeasures?: string | null;
  nutritionalRequirements?: string | null;
  allergies?: string | null;
  functionalLimitations?: string[];
  otherFunctionalLimit?: string | null;
  activitiesPermitted?: string[];
  otherActivitiesPermit?: string | null;
  mentalStatus?: string[];
  otherMentalStatus?: string | null;
  prognosis?: string | null;
  cognitiveStatus?: string | null;
  rehabPotential?: string | null;
  dischargePlan?: string | null;
  riskIntervention?: string | null;
  advancedDirectives?: string | null;
  caregiverNeeds?: string | null;
  homeboundStatus?: string | null;
  carePreferences?: string | null;
  careLevel?: string | null;
  recommendedHours?: number | null;
  physicianId?: string | null;
  caseManagerId?: string | null;
  physicianCertStatement?: string | null;
  isCert485?: boolean;
  cert485Orders?: string | null;
  cert485Goals?: string | null;
  qaStatus?: string | null;
  qaNotes?: string | null;
  nurseSignature?: string | null;
  nurseSignedAt?: string | null;
  clinicalNotes?: string | null;
  clientSignature?: string | null;
  clientSignedAt?: string | null;
  clientSignerName?: string | null;
  clientSignerRelation?: string | null;
  physician?: Physician | null;
  caseManager?: CaseManager | null;
  diagnoses?: Diagnosis[];
  orders?: Order[];
}

interface CarePlanFormProps {
  carePlanId?: string;
  clientId: string;
  clientName: string;
  initialData?: CarePlanData;
  onSave?: (data: CarePlanData) => Promise<void>;
  isLoading?: boolean;
}

// Constants
const FUNCTIONAL_LIMITATIONS = [
  "Amputation",
  "Bowel/Bladder Incontinence",
  "Contracture",
  "Hearing",
  "Paralysis",
  "Endurance",
  "Ambulation",
  "Speech",
  "Legally Blind",
  "Dyspnea with Minimal Exertion",
  "Other",
];

const ACTIVITIES_PERMITTED = [
  "Complete Bedrest",
  "Bedrest BRP",
  "Up as Tolerated",
  "Transfer Bed/Chair",
  "Exercises Prescribed",
  "Partial Weight Bearing",
  "Independent at Home",
  "Crutches",
  "Cane",
  "Wheelchair",
  "Walker",
  "No Restrictions",
  "Other",
];

const MENTAL_STATUS_OPTIONS = [
  "Oriented",
  "Comatose",
  "Forgetful",
  "Depressed",
  "Disoriented",
  "Lethargic",
  "Agitated",
  "Other",
];

const PROGNOSIS_OPTIONS = [
  "Poor",
  "Guarded",
  "Fair",
  "Good",
  "Excellent",
];

const DISCIPLINE_TYPES = [
  "SN",
  "PT",
  "OT",
  "ST",
  "MSW",
  "HHA",
  "Dietary",
];

const CARE_PLAN_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_CLINICAL_REVIEW", label: "Pending Clinical Review" },
  { value: "CLINICAL_APPROVED", label: "Clinical Approved" },
  { value: "PENDING_CLIENT_SIGNATURE", label: "Pending Client Signature" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVISED", label: "Revised" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function CarePlanForm({
  carePlanId,
  clientId,
  clientName,
  initialData,
  onSave,
  isLoading = false,
}: CarePlanFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [caseManagers, setCaseManagers] = React.useState<CaseManager[]>([]);

  // Form state
  const [formData, setFormData] = React.useState<CarePlanData>({
    status: "DRAFT",
    functionalLimitations: [],
    activitiesPermitted: [],
    mentalStatus: [],
    ...initialData,
  });

  const [diagnoses, setDiagnoses] = React.useState<Diagnosis[]>(
    initialData?.diagnoses || []
  );
  const [orders, setOrders] = React.useState<Order[]>(initialData?.orders || []);
  const [selectedPhysician, setSelectedPhysician] = React.useState<Physician | null>(
    initialData?.physician || null
  );

  // Fetch case managers
  React.useEffect(() => {
    const fetchCaseManagers = async () => {
      try {
        const response = await fetch("/api/staff?role=STAFF&limit=100");
        if (response.ok) {
          const data = await response.json();
          setCaseManagers(data.staff || []);
        }
      } catch (error) {
        console.error("Failed to fetch case managers:", error);
      }
    };
    fetchCaseManagers();
  }, []);

  const updateField = <K extends keyof CarePlanData>(
    field: K,
    value: CarePlanData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (
    field: "functionalLimitations" | "activitiesPermitted" | "mentalStatus",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  // Diagnosis handlers
  const addDiagnosis = (code: string, description: string) => {
    const isFirst = diagnoses.length === 0;
    setDiagnoses((prev) => [
      ...prev,
      {
        icdCode: code,
        icdDescription: description,
        diagnosisType: isFirst ? "PRIMARY" : "SECONDARY",
        isActive: true,
      },
    ]);
  };

  const updateDiagnosisType = (index: number, type: string) => {
    setDiagnoses((prev) => {
      const updated = [...prev];
      // If setting as PRIMARY, demote existing PRIMARY to SECONDARY
      if (type === "PRIMARY") {
        updated.forEach((d, i) => {
          if (d.diagnosisType === "PRIMARY" && i !== index) {
            d.diagnosisType = "SECONDARY";
          }
        });
      }
      updated[index] = { ...updated[index], diagnosisType: type };
      return updated;
    });
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses((prev) => prev.filter((_, i) => i !== index));
  };

  // Order handlers
  const addOrder = () => {
    setOrders((prev) => [
      ...prev,
      {
        disciplineType: "SN",
        orderText: "",
        goals: "",
        orderStatus: "ACTIVE",
        isActive: true,
      },
    ]);
  };

  const updateOrder = (index: number, field: keyof Order, value: unknown) => {
    setOrders((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeOrder = (index: number) => {
    setOrders((prev) => prev.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Clean up payload - remove relation objects, arrays, and any extra API fields
      // Only send fields that the API schema accepts
      const payload: Record<string, unknown> = {
        status: formData.status,
        effectiveDate: formData.effectiveDate,
        endDate: formData.endDate,
        certStartDate: formData.certStartDate,
        certEndDate: formData.certEndDate,
        signatureSentDate: formData.signatureSentDate,
        signatureReceivedDate: formData.signatureReceivedDate,
        verbalSOCDate: formData.verbalSOCDate,
        summary: formData.summary,
        goals: formData.goals,
        interventions: formData.interventions,
        frequency: formData.frequency,
        internalNotes: formData.internalNotes,
        medications: formData.medications,
        dmeSupplies: formData.dmeSupplies,
        safetyMeasures: formData.safetyMeasures,
        nutritionalRequirements: formData.nutritionalRequirements,
        allergies: formData.allergies,
        functionalLimitations: formData.functionalLimitations,
        otherFunctionalLimit: formData.otherFunctionalLimit,
        activitiesPermitted: formData.activitiesPermitted,
        otherActivitiesPermit: formData.otherActivitiesPermit,
        mentalStatus: formData.mentalStatus,
        otherMentalStatus: formData.otherMentalStatus,
        prognosis: formData.prognosis,
        cognitiveStatus: formData.cognitiveStatus,
        rehabPotential: formData.rehabPotential,
        dischargePlan: formData.dischargePlan,
        riskIntervention: formData.riskIntervention,
        advancedDirectives: formData.advancedDirectives,
        caregiverNeeds: formData.caregiverNeeds,
        homeboundStatus: formData.homeboundStatus,
        carePreferences: formData.carePreferences,
        careLevel: formData.careLevel,
        recommendedHours: formData.recommendedHours != null
          ? (typeof formData.recommendedHours === 'string'
              ? (formData.recommendedHours ? parseFloat(formData.recommendedHours) : null)
              : formData.recommendedHours)
          : null,
        physicianId: selectedPhysician?.id || null,
        caseManagerId: formData.caseManagerId,
        physicianCertStatement: formData.physicianCertStatement,
        isCert485: formData.isCert485 || false,
        cert485Orders: formData.cert485Orders,
        cert485Goals: formData.cert485Goals,
        qaStatus: formData.qaStatus,
        qaNotes: formData.qaNotes,
        nurseSignature: formData.nurseSignature,
        nurseSignedAt: formData.nurseSignedAt,
        clinicalNotes: formData.clinicalNotes,
        clientSignature: formData.clientSignature,
        clientSignedAt: formData.clientSignedAt,
        clientSignerName: formData.clientSignerName,
        clientSignerRelation: formData.clientSignerRelation,
      };

      let response;
      if (carePlanId) {
        // Update existing care plan
        response = await fetch(`/api/care-plans/${carePlanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new care plan
        response = await fetch("/api/care-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, clientId }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save care plan");
      }

      const { carePlan } = await response.json();

      // Save diagnoses
      for (const diagnosis of diagnoses) {
        if (diagnosis.id) {
          await fetch(`/api/care-plans/${carePlan.id}/diagnoses`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              diagnosisId: diagnosis.id,
              diagnosisType: diagnosis.diagnosisType,
            }),
          });
        } else {
          await fetch(`/api/care-plans/${carePlan.id}/diagnoses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(diagnosis),
          });
        }
      }

      // Save orders
      for (const order of orders) {
        if (order.id) {
          await fetch(`/api/care-plans/${carePlan.id}/orders`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              ...order,
            }),
          });
        } else {
          await fetch(`/api/care-plans/${carePlan.id}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
          });
        }
      }

      if (onSave) {
        await onSave(carePlan);
      } else {
        router.push(`/clients/${clientId}/care-plans/${carePlan.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save care plan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">
            {carePlanId ? "Edit" : "New"} Plan of Care
          </h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            {clientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm text-error">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status and 485 Toggle */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Label>Status:</Label>
          <Select
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-48"
          >
            {CARE_PLAN_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            label="CMS-485 Certification"
            checked={formData.isCert485 || false}
            onChange={() => updateField("isCert485", !formData.isCert485)}
          />
          {formData.isCert485 && (
            <Badge variant="primary">485 Mode</Badge>
          )}
        </div>
      </div>

      {/* 485 Certification Section - Only shown when isCert485 is true */}
      {formData.isCert485 && (
        <CollapsibleSection
          title="CMS-485 Certification"
          description="Home Health Certification and Plan of Care (CMS-485)"
          icon={FileCheck}
          defaultOpen={true}
        >
          <div className="space-y-4 pt-4">
            <div className="p-3 rounded-md bg-primary/10 text-body-sm text-primary">
              This care plan will be formatted as a CMS-485 Home Health Certification
              and Plan of Care form for Medicare compliance.
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert485Orders">485 Orders</Label>
              <Textarea
                id="cert485Orders"
                value={formData.cert485Orders || ""}
                onChange={(e) => updateField("cert485Orders", e.target.value)}
                rows={6}
                placeholder="Enter discipline-specific orders, treatments, and supplies ordered for the patient (required for 485)..."
              />
              <p className="text-xs text-foreground-tertiary">
                Include: Discipline, treatment/procedure, frequency, duration, and any special instructions.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert485Goals">485 Goals & Rehabilitation Potential</Label>
              <Textarea
                id="cert485Goals"
                value={formData.cert485Goals || ""}
                onChange={(e) => updateField("cert485Goals", e.target.value)}
                rows={6}
                placeholder="Enter measurable goals and rehabilitation potential for the certification period..."
              />
              <p className="text-xs text-foreground-tertiary">
                Include: Short-term goals, long-term goals, discharge goals, and rehabilitation potential assessment.
              </p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Section 1: Basic Information */}
      <CollapsibleSection
        title="Basic Information"
        description="Certification dates, physician, and case manager"
        icon={Calendar}
        defaultOpen={true}
      >
        <div className="space-y-6 pt-4">
          {/* Plan Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("effectiveDate", e.target.value || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate?.split("T")[0] || ""}
                onChange={(e) => updateField("endDate", e.target.value || null)}
              />
            </div>
          </div>

          {/* Certification Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certStartDate">Certification Start</Label>
              <Input
                id="certStartDate"
                type="date"
                value={formData.certStartDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("certStartDate", e.target.value || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certEndDate">Certification End</Label>
              <Input
                id="certEndDate"
                type="date"
                value={formData.certEndDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("certEndDate", e.target.value || null)
                }
              />
            </div>
          </div>

          {/* Physician */}
          <div className="space-y-2">
            <Label>Attending Physician</Label>
            <PhysicianSearch
              selectedPhysician={selectedPhysician}
              onSelect={setSelectedPhysician}
              onClear={() => setSelectedPhysician(null)}
            />
          </div>

          {/* Case Manager */}
          <div className="space-y-2">
            <Label htmlFor="caseManagerId">Case Manager</Label>
            <Select
              id="caseManagerId"
              value={formData.caseManagerId || ""}
              onChange={(e) =>
                updateField("caseManagerId", e.target.value || null)
              }
            >
              <option value="">Select case manager</option>
              {caseManagers.map((cm) => (
                <option key={cm.id} value={cm.id}>
                  {cm.firstName} {cm.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Signature Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verbalSOCDate">Verbal SOC Date</Label>
              <Input
                id="verbalSOCDate"
                type="date"
                value={formData.verbalSOCDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("verbalSOCDate", e.target.value || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureSentDate">Signature Sent</Label>
              <Input
                id="signatureSentDate"
                type="date"
                value={formData.signatureSentDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("signatureSentDate", e.target.value || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureReceivedDate">Signature Received</Label>
              <Input
                id="signatureReceivedDate"
                type="date"
                value={formData.signatureReceivedDate?.split("T")[0] || ""}
                onChange={(e) =>
                  updateField("signatureReceivedDate", e.target.value || null)
                }
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Diagnoses */}
      <CollapsibleSection
        title="Diagnoses (ICD-10)"
        description="Primary and secondary diagnoses"
        icon={Stethoscope}
        defaultOpen={true}
      >
        <div className="space-y-4 pt-4">
          <ICD10Search onSelect={addDiagnosis} />
          {diagnoses.length > 0 ? (
            <div className="space-y-2">
              {diagnoses.map((diagnosis, index) => (
                <DiagnosisItem
                  key={diagnosis.id || `new-${index}`}
                  code={diagnosis.icdCode}
                  description={diagnosis.icdDescription}
                  type={diagnosis.diagnosisType}
                  onTypeChange={(type) => updateDiagnosisType(index, type)}
                  onRemove={() => removeDiagnosis(index)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-tertiary text-center py-4">
              No diagnoses added. Search above to add ICD-10 codes.
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 3: Medications */}
      <CollapsibleSection
        title="Medications"
        description="Current medications and dosages"
        icon={ClipboardList}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              value={formData.medications || ""}
              onChange={(e) => updateField("medications", e.target.value)}
              rows={6}
              placeholder="List all current medications with dosages and frequency..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies || ""}
              onChange={(e) => updateField("allergies", e.target.value)}
              rows={3}
              placeholder="List all known allergies..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4: DME / Safety / Nutrition */}
      <CollapsibleSection
        title="DME / Safety / Nutrition"
        description="Equipment, safety measures, and dietary requirements"
        icon={Shield}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="dmeSupplies">DME and Supplies</Label>
            <Textarea
              id="dmeSupplies"
              value={formData.dmeSupplies || ""}
              onChange={(e) => updateField("dmeSupplies", e.target.value)}
              rows={4}
              placeholder="List durable medical equipment and supplies..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safetyMeasures">Safety Measures</Label>
            <Textarea
              id="safetyMeasures"
              value={formData.safetyMeasures || ""}
              onChange={(e) => updateField("safetyMeasures", e.target.value)}
              rows={4}
              placeholder="List safety measures and precautions..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nutritionalRequirements">
              Nutritional Requirements
            </Label>
            <Textarea
              id="nutritionalRequirements"
              value={formData.nutritionalRequirements || ""}
              onChange={(e) =>
                updateField("nutritionalRequirements", e.target.value)
              }
              rows={4}
              placeholder="Dietary restrictions, requirements, and recommendations..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 5: Functional Status */}
      <CollapsibleSection
        title="Functional Status"
        description="Limitations, activities, and mental status"
        icon={Heart}
      >
        <div className="space-y-6 pt-4">
          {/* Functional Limitations */}
          <div className="space-y-3">
            <Label>Functional Limitations</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FUNCTIONAL_LIMITATIONS.map((limitation) => (
                <Checkbox
                  key={limitation}
                  label={limitation}
                  checked={formData.functionalLimitations?.includes(limitation)}
                  onChange={() =>
                    toggleArrayField("functionalLimitations", limitation)
                  }
                />
              ))}
            </div>
            {formData.functionalLimitations?.includes("Other") && (
              <Input
                placeholder="Specify other functional limitation..."
                value={formData.otherFunctionalLimit || ""}
                onChange={(e) =>
                  updateField("otherFunctionalLimit", e.target.value)
                }
                className="mt-2"
              />
            )}
          </div>

          {/* Activities Permitted */}
          <div className="space-y-3">
            <Label>Activities Permitted</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACTIVITIES_PERMITTED.map((activity) => (
                <Checkbox
                  key={activity}
                  label={activity}
                  checked={formData.activitiesPermitted?.includes(activity)}
                  onChange={() =>
                    toggleArrayField("activitiesPermitted", activity)
                  }
                />
              ))}
            </div>
            {formData.activitiesPermitted?.includes("Other") && (
              <Input
                placeholder="Specify other activity..."
                value={formData.otherActivitiesPermit || ""}
                onChange={(e) =>
                  updateField("otherActivitiesPermit", e.target.value)
                }
                className="mt-2"
              />
            )}
          </div>

          {/* Mental Status */}
          <div className="space-y-3">
            <Label>Mental Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MENTAL_STATUS_OPTIONS.map((status) => (
                <Checkbox
                  key={status}
                  label={status}
                  checked={formData.mentalStatus?.includes(status)}
                  onChange={() => toggleArrayField("mentalStatus", status)}
                />
              ))}
            </div>
            {formData.mentalStatus?.includes("Other") && (
              <Input
                placeholder="Specify other mental status..."
                value={formData.otherMentalStatus || ""}
                onChange={(e) =>
                  updateField("otherMentalStatus", e.target.value)
                }
                className="mt-2"
              />
            )}
          </div>

          {/* Prognosis */}
          <div className="space-y-2">
            <Label htmlFor="prognosis">Prognosis</Label>
            <Select
              id="prognosis"
              value={formData.prognosis || ""}
              onChange={(e) => updateField("prognosis", e.target.value)}
            >
              <option value="">Select prognosis</option>
              {PROGNOSIS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 6: Clinical Narratives */}
      <CollapsibleSection
        title="Clinical Narratives"
        description="Care preferences, rehab potential, and discharge planning"
        icon={FileText}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cognitiveStatus">Cognitive Status</Label>
              <Textarea
                id="cognitiveStatus"
                value={formData.cognitiveStatus || ""}
                onChange={(e) => updateField("cognitiveStatus", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rehabPotential">Rehabilitation Potential</Label>
              <Textarea
                id="rehabPotential"
                value={formData.rehabPotential || ""}
                onChange={(e) => updateField("rehabPotential", e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeboundStatus">Homebound Status</Label>
              <Textarea
                id="homeboundStatus"
                value={formData.homeboundStatus || ""}
                onChange={(e) => updateField("homeboundStatus", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caregiverNeeds">Caregiver Needs</Label>
              <Textarea
                id="caregiverNeeds"
                value={formData.caregiverNeeds || ""}
                onChange={(e) => updateField("caregiverNeeds", e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskIntervention">Risk Interventions</Label>
              <Textarea
                id="riskIntervention"
                value={formData.riskIntervention || ""}
                onChange={(e) =>
                  updateField("riskIntervention", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advancedDirectives">Advanced Directives</Label>
              <Textarea
                id="advancedDirectives"
                value={formData.advancedDirectives || ""}
                onChange={(e) =>
                  updateField("advancedDirectives", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dischargePlan">Discharge Plan</Label>
            <Textarea
              id="dischargePlan"
              value={formData.dischargePlan || ""}
              onChange={(e) => updateField("dischargePlan", e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carePreferences">Care Preferences</Label>
            <Textarea
              id="carePreferences"
              value={formData.carePreferences || ""}
              onChange={(e) => updateField("carePreferences", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 7: Orders & Goals */}
      <CollapsibleSection
        title="Orders & Goals"
        description="Discipline-specific orders and treatment goals"
        icon={Target}
      >
        <div className="space-y-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={addOrder}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </Button>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.id || `new-order-${index}`}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">{order.disciplineType}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrder(index)}
                      className="p-1 h-auto text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discipline</Label>
                      <Select
                        value={order.disciplineType}
                        onChange={(e) =>
                          updateOrder(index, "disciplineType", e.target.value)
                        }
                      >
                        {DISCIPLINE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Body System (optional)</Label>
                      <Input
                        value={order.bodySystem || ""}
                        onChange={(e) =>
                          updateOrder(index, "bodySystem", e.target.value)
                        }
                        placeholder="e.g., Cardiovascular"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label required>Order</Label>
                    <Textarea
                      value={order.orderText}
                      onChange={(e) =>
                        updateOrder(index, "orderText", e.target.value)
                      }
                      rows={2}
                      placeholder="Enter order details..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goals</Label>
                    <Textarea
                      value={order.goals || ""}
                      onChange={(e) =>
                        updateOrder(index, "goals", e.target.value)
                      }
                      rows={2}
                      placeholder="Enter treatment goals..."
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-tertiary text-center py-4">
              No orders added. Click &quot;Add Order&quot; to begin.
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 8: Clinical Summary */}
      <CollapsibleSection
        title="Clinical Summary"
        description="Plan summary and internal notes"
        icon={FileText}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Care Plan Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary || ""}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={6}
              placeholder="Provide a comprehensive summary of the care plan..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="physicianCertStatement">
              Physician Certification Statement
            </Label>
            <Textarea
              id="physicianCertStatement"
              value={formData.physicianCertStatement || ""}
              onChange={(e) =>
                updateField("physicianCertStatement", e.target.value)
              }
              rows={4}
              placeholder="Physician certification statement..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="careLevel">Care Level</Label>
              <Input
                id="careLevel"
                value={formData.careLevel || ""}
                onChange={(e) => updateField("careLevel", e.target.value)}
                placeholder="e.g., Skilled Nursing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendedHours">Recommended Hours/Week</Label>
              <Input
                id="recommendedHours"
                type="number"
                value={formData.recommendedHours || ""}
                onChange={(e) =>
                  updateField(
                    "recommendedHours",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes || ""}
              onChange={(e) => updateField("internalNotes", e.target.value)}
              rows={4}
              placeholder="Notes visible only to staff..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 9: QA & Signatures */}
      <CollapsibleSection
        title="QA & Signatures"
        description="Quality assurance and signature collection"
        icon={User}
      >
        <div className="space-y-6 pt-4">
          {/* QA Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qaStatus">QA Status</Label>
              <Select
                id="qaStatus"
                value={formData.qaStatus || ""}
                onChange={(e) =>
                  updateField("qaStatus", e.target.value || null)
                }
              >
                <option value="">Select status</option>
                <option value="IN_USE">In Use</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qaNotes">QA Notes</Label>
            <Textarea
              id="qaNotes"
              value={formData.qaNotes || ""}
              onChange={(e) => updateField("qaNotes", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Review Notes</Label>
            <Textarea
              id="clinicalNotes"
              value={formData.clinicalNotes || ""}
              onChange={(e) => updateField("clinicalNotes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Nurse Signature */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <h4 className="font-medium text-foreground">Nurse Signature</h4>
            <SignaturePad
              value={formData.nurseSignature || ""}
              onChange={(signature) => {
                updateField("nurseSignature", signature);
                if (signature) {
                  updateField("nurseSignedAt", new Date().toISOString());
                } else {
                  updateField("nurseSignedAt", null);
                }
              }}
            />
            {formData.nurseSignedAt && (
              <p className="text-sm text-foreground-secondary">
                Signed on:{" "}
                {new Date(formData.nurseSignedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Client Signature */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <h4 className="font-medium text-foreground">Client Signature</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientSignerName">Signer Name</Label>
                <Input
                  id="clientSignerName"
                  value={formData.clientSignerName || ""}
                  onChange={(e) =>
                    updateField("clientSignerName", e.target.value)
                  }
                  placeholder="Name of person signing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSignerRelation">Relation to Client</Label>
                <Input
                  id="clientSignerRelation"
                  value={formData.clientSignerRelation || ""}
                  onChange={(e) =>
                    updateField("clientSignerRelation", e.target.value)
                  }
                  placeholder="e.g., Self, Spouse, Child"
                />
              </div>
            </div>
            <SignaturePad
              value={formData.clientSignature || ""}
              onChange={(signature) => {
                updateField("clientSignature", signature);
                if (signature) {
                  updateField("clientSignedAt", new Date().toISOString());
                } else {
                  updateField("clientSignedAt", null);
                }
              }}
            />
            {formData.clientSignedAt && (
              <p className="text-sm text-foreground-secondary">
                Signed on:{" "}
                {new Date(formData.clientSignedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Save Button (bottom) */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          {isSaving ? "Saving..." : "Save Care Plan"}
        </Button>
      </div>
    </div>
  );
}
