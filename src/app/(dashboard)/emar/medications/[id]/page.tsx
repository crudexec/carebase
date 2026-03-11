"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  Pause,
  Play,
  XCircle,
  Pill,
  User,
  Clock,
  AlertTriangle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import {
  MEDICATION_STATUS_LABELS,
  MEDICATION_ROUTE_LABELS,
  MEDICATION_FREQUENCY_LABELS,
  CONTROLLED_SCHEDULE_LABELS,
  ADMINISTRATION_RESULT_LABELS,
  MedicationStatus,
} from "@/lib/emar/types";
import { RefillRequestModal } from "@/components/emar/refills/refill-request-modal";

interface MedicationDetail {
  id: string;
  name: string;
  genericName: string | null;
  ndc: string | null;
  strength: string;
  form: string;
  route: string;
  status: MedicationStatus;
  doseAmount: string;
  frequency: string;
  frequencyOther: string | null;
  scheduledTimes: string[];
  prnReason: string | null;
  maxDailyDoses: number | null;
  startDate: string;
  endDate: string | null;
  controlledSchedule: string;
  requiresWitness: boolean;
  prescriptionNumber: string | null;
  lastFillDate: string | null;
  refillsRemaining: number | null;
  indication: string | null;
  specialInstructions: string | null;
  interactions: string[];
  sideEffects: string[];
  discontinuedAt: string | null;
  discontinuedReason: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
  };
  prescriber: {
    id: string;
    firstName: string;
    lastName: string;
    npi: string | null;
  } | null;
  discontinuedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count: {
    scheduledDoses: number;
    administrations: number;
    refillRequests: number;
  };
}

interface Administration {
  id: string;
  scheduledTime: string;
  administeredAt: string | null;
  result: string;
  resultNotes: string | null;
  administeredBy: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [medication, setMedication] = useState<MedicationDetail | null>(null);
  const [recentAdministrations, setRecentAdministrations] = useState<Administration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await fetch(`/api/medications/${id}`);
        if (!response.ok) throw new Error("Failed to fetch medication");
        const data = await response.json();
        setMedication(data.medication);
        setRecentAdministrations(data.recentAdministrations || []);
      } catch (error) {
        console.error("Error fetching medication:", error);
        toast.error("Failed to load medication");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedication();
  }, [id]);

  const handleHold = async () => {
    try {
      const response = await fetch(`/api/medications/${id}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Temporarily held" }),
      });
      if (!response.ok) throw new Error("Failed to hold medication");
      toast.success("Medication put on hold");
      // Refresh
      const data = await response.json();
      setMedication((prev) =>
        prev ? { ...prev, status: data.medication.status } : null
      );
    } catch {
      toast.error("Failed to hold medication");
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch(`/api/medications/${id}/resume`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to resume medication");
      toast.success("Medication resumed");
      const data = await response.json();
      setMedication((prev) =>
        prev ? { ...prev, status: data.medication.status } : null
      );
    } catch {
      toast.error("Failed to resume medication");
    }
  };

  const handleDiscontinue = async () => {
    if (!confirm("Are you sure you want to discontinue this medication?")) return;
    try {
      const response = await fetch(`/api/medications/${id}/discontinue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Discontinued by provider" }),
      });
      if (!response.ok) throw new Error("Failed to discontinue medication");
      toast.success("Medication discontinued");
      router.push("/emar/medications");
    } catch {
      toast.error("Failed to discontinue medication");
    }
  };

  const getStatusBadge = (status: MedicationStatus) => {
    const variants: Record<MedicationStatus, "default" | "warning" | "error" | "primary"> = {
      ACTIVE: "primary",
      ON_HOLD: "warning",
      DISCONTINUED: "error",
      COMPLETED: "default",
    };
    return (
      <Badge variant={variants[status]} className="text-sm">
        {MEDICATION_STATUS_LABELS[status]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="container mx-auto py-6">
        <p>Medication not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Medications", href: "/emar/medications" },
          { label: medication.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{medication.name}</h1>
            {getStatusBadge(medication.status)}
            {medication.controlledSchedule !== "NOT_CONTROLLED" && (
              <Badge variant="warning">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {CONTROLLED_SCHEDULE_LABELS[medication.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
              </Badge>
            )}
          </div>
          {medication.genericName && (
            <p className="text-muted-foreground">{medication.genericName}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/emar/medications/${id}/edit`)}
            className="min-h-[44px] px-4"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {medication.status === "ACTIVE" && (
            <Button variant="secondary" onClick={handleHold} className="min-h-[44px] px-4">
              <Pause className="h-4 w-4 mr-2" />
              Hold
            </Button>
          )}
          {medication.status === "ON_HOLD" && (
            <Button variant="secondary" onClick={handleResume} className="min-h-[44px] px-4">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {medication.status !== "DISCONTINUED" && (
            <Button variant="error" onClick={handleDiscontinue} className="min-h-[44px] px-4">
              <XCircle className="h-4 w-4 mr-2" />
              Discontinue
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medication Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Strength</p>
                <p className="font-medium">{medication.strength}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Form</p>
                <p className="font-medium">{medication.form}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-medium">
                  {MEDICATION_ROUTE_LABELS[medication.route as keyof typeof MEDICATION_ROUTE_LABELS]}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dose Amount</p>
                <p className="font-medium">{medication.doseAmount}</p>
              </div>
              {medication.ndc && (
                <div>
                  <p className="text-sm text-muted-foreground">NDC</p>
                  <p className="font-medium">{medication.ndc}</p>
                </div>
              )}
              {medication.indication && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Indication</p>
                  <p className="font-medium">{medication.indication}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-medium">
                    {MEDICATION_FREQUENCY_LABELS[medication.frequency as keyof typeof MEDICATION_FREQUENCY_LABELS]}
                  </p>
                </div>
                {medication.scheduledTimes.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Times</p>
                    <div className="flex flex-wrap gap-1">
                      {medication.scheduledTimes.map((time) => (
                        <Badge key={time} variant="default">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(medication.startDate).toLocaleDateString()}
                  </p>
                </div>
                {medication.endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {new Date(medication.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {medication.prnReason && (
                <div>
                  <p className="text-sm text-muted-foreground">PRN Reason</p>
                  <p className="font-medium">{medication.prnReason}</p>
                  {medication.maxDailyDoses && (
                    <p className="text-sm text-muted-foreground">
                      Max {medication.maxDailyDoses} doses per day
                    </p>
                  )}
                </div>
              )}
              {medication.specialInstructions && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Instructions
                  </p>
                  <p className="font-medium whitespace-pre-wrap">
                    {medication.specialInstructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Administrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Administrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAdministrations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No administration records yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAdministrations.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(admin.scheduledTime).toLocaleString()}
                        </p>
                        {admin.administeredBy && (
                          <p className="text-sm text-muted-foreground">
                            By {admin.administeredBy.firstName}{" "}
                            {admin.administeredBy.lastName}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          admin.result === "GIVEN"
                            ? "default"
                            : admin.result === "REFUSED"
                            ? "error"
                            : "warning"
                        }
                      >
                        {ADMINISTRATION_RESULT_LABELS[admin.result as keyof typeof ADMINISTRATION_RESULT_LABELS]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Link href={`/clients/${medication.client.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] touch-manipulation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {medication.client.firstName} {medication.client.lastName}
                </p>
                {medication.client.dateOfBirth && (
                  <p className="text-sm text-muted-foreground">
                    DOB: {new Date(medication.client.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Prescriber Info */}
          {medication.prescriber && (
            <Card>
              <CardHeader>
                <CardTitle>Prescriber</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  Dr. {medication.prescriber.firstName}{" "}
                  {medication.prescriber.lastName}
                </p>
                {medication.prescriber.npi && (
                  <p className="text-sm text-muted-foreground">
                    NPI: {medication.prescriber.npi}
                  </p>
                )}
                {medication.prescriptionNumber && (
                  <p className="text-sm text-muted-foreground">
                    Rx#: {medication.prescriptionNumber}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Refill Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Refill Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {medication.lastFillDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Filled</p>
                  <p className="font-medium">
                    {new Date(medication.lastFillDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {medication.refillsRemaining !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Refills Remaining
                  </p>
                  <p className="font-medium">{medication.refillsRemaining}</p>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => setIsRefillModalOpen(true)}
                className="w-full min-h-[44px] touch-manipulation"
              >
                Request Refill
              </Button>
            </CardContent>
          </Card>

          {/* Warnings */}
          {(medication.interactions.length > 0 ||
            medication.sideEffects.length > 0) && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medication.interactions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Drug Interactions
                    </p>
                    <ul className="list-disc list-inside text-sm">
                      {medication.interactions.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {medication.sideEffects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Side Effects
                    </p>
                    <ul className="list-disc list-inside text-sm">
                      {medication.sideEffects.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Doses</span>
                <span className="font-medium">
                  {medication._count.scheduledDoses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Administrations</span>
                <span className="font-medium">
                  {medication._count.administrations}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refill Requests</span>
                <span className="font-medium">
                  {medication._count.refillRequests}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refill Request Modal */}
      <RefillRequestModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        onSuccess={() => {
          setIsRefillModalOpen(false);
          toast.success("Refill request submitted");
        }}
        preselectedMedicationId={id}
      />
    </div>
  );
}
