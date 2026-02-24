"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Loader2,
  XCircle,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Label,
  Select,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface CountRecord {
  id: string;
  countTime: string;
  shiftType: string;
  previousCount: number;
  currentCount: number;
  expectedCount: number;
  discrepancy: number;
  status: string;
  countedBySignature: string | null;
  discrepancyNotes: string | null;
  discrepancyResolution: string | null;
  inventory: {
    id: string;
    quantityOnHand: number;
    medication: {
      id: string;
      name: string;
      genericName: string | null;
      strength: string;
      form: string;
      controlledSchedule: string;
      client: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
  countedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  verifiedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  resolvedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

const RESOLUTION_TYPES = [
  { value: "DOCUMENTATION_ERROR", label: "Documentation Error" },
  { value: "COUNTING_ERROR", label: "Counting Error" },
  { value: "ADMINISTRATION_NOT_RECORDED", label: "Administration Not Recorded" },
  { value: "SPILLAGE_WASTE", label: "Spillage/Waste" },
  { value: "THEFT_SUSPECTED", label: "Theft Suspected" },
  { value: "OTHER", label: "Other" },
];

export default function ResolveDiscrepancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [count, setCount] = useState<CountRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`/api/narcotic-counts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch count");
        }
        const data = await response.json();
        setCount(data.count);
      } catch (error) {
        console.error("Error fetching count:", error);
        toast.error("Failed to load count details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, [id]);

  const handleResolve = async () => {
    if (!count) return;

    if (!resolutionType) {
      toast.error("Please select a resolution type");
      return;
    }

    if (!resolutionNotes.trim()) {
      toast.error("Please provide detailed resolution notes");
      return;
    }

    setIsSubmitting(true);

    try {
      const resolution = `[${RESOLUTION_TYPES.find(r => r.value === resolutionType)?.label}] ${resolutionNotes}`;

      const response = await fetch(`/api/narcotic-counts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discrepancyResolution: resolution,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resolve discrepancy");
      }

      toast.success("Discrepancy resolved successfully");
      router.push("/emar/narcotics");
    } catch (error) {
      console.error("Error resolving discrepancy:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resolve discrepancy");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!count) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p>Count record not found</p>
            <Button
              variant="secondary"
              onClick={() => router.push("/emar/narcotics")}
              className="mt-4"
            >
              Back to Narcotic Counts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const medication = count.inventory.medication;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Narcotic Counts", href: "/emar/narcotics" },
          { label: "Resolve Discrepancy" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          Resolve Discrepancy
        </h1>
        <p className="text-muted-foreground">
          Document and resolve this controlled substance discrepancy
        </p>
      </div>

      {/* Already Resolved Notice */}
      {count.status === "VERIFIED" && count.discrepancyResolution && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Already Resolved</p>
                <p className="text-sm text-green-700">
                  Resolved by {count.resolvedBy?.firstName} {count.resolvedBy?.lastName}
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/50 rounded">
              <p className="text-sm text-green-800">{count.discrepancyResolution}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discrepancy Alert */}
      {count.status === "DISCREPANCY" && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Unresolved Discrepancy</p>
                <p className="text-sm text-red-700 mt-1">
                  This discrepancy requires immediate documentation and resolution.
                  All controlled substance discrepancies must be investigated and explained.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {medication.name}
            <Badge variant="warning">
              {CONTROLLED_SCHEDULE_LABELS[medication.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{medication.strength} {medication.form}</p>
          <p className="text-muted-foreground">
            Client: {medication.client.firstName} {medication.client.lastName}
          </p>
        </CardContent>
      </Card>

      {/* Count Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Count Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">
              {format(new Date(count.countTime), "MMM d, yyyy h:mm a")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shift</span>
            <Badge variant="default">{count.shiftType}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Counted By</span>
            <span className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {count.countedBy.firstName} {count.countedBy.lastName}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Count Numbers with Discrepancy Highlight */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Previous</p>
              <p className="text-3xl font-bold">{count.previousCount}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Expected</p>
              <p className="text-3xl font-bold">{count.expectedCount}</p>
            </div>
            <div className="p-4 bg-red-100 rounded-lg">
              <p className="text-sm text-muted-foreground">Actual</p>
              <p className="text-3xl font-bold text-red-600">
                {count.currentCount}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
            <p className="text-sm text-red-700 font-medium">Discrepancy</p>
            <p className="text-4xl font-bold text-red-600">
              {count.discrepancy > 0 ? "+" : ""}{count.discrepancy}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {count.discrepancy > 0 ? "Over count" : "Short count"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Existing Notes */}
      {count.discrepancyNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Verifier Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted p-3 rounded">{count.discrepancyNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Resolution Form */}
      {count.status === "DISCREPANCY" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Resolution Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resolutionType">Resolution Type *</Label>
              <Select
                id="resolutionType"
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value)}
                className="mt-2 min-h-[44px]"
              >
                <option value="">Select resolution type...</option>
                {RESOLUTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">
                Resolution Details *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Provide a detailed explanation of the discrepancy and how it was resolved
              </p>
              <Textarea
                id="notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document your investigation findings, corrective actions taken, and any follow-up required..."
                rows={4}
                className="mt-2"
              />
            </div>

            {resolutionType === "THEFT_SUSPECTED" && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Suspected Theft Protocol</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Notify your supervisor immediately</li>
                      <li>Document all relevant details</li>
                      <li>Preserve any evidence</li>
                      <li>Contact appropriate authorities as required by facility policy</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {count.status === "DISCREPANCY" && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/emar/narcotics")}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            variant="error"
            onClick={handleResolve}
            disabled={isSubmitting || !resolutionType || !resolutionNotes.trim()}
            className="flex-1 min-h-[48px] touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Resolution
              </>
            )}
          </Button>
        </div>
      )}

      {count.status !== "DISCREPANCY" && (
        <Button
          variant="secondary"
          onClick={() => router.push("/emar/narcotics")}
          className="w-full min-h-[48px] touch-manipulation"
        >
          Back to Narcotic Counts
        </Button>
      )}
    </div>
  );
}
