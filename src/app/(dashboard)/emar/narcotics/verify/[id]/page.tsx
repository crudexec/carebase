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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Label,
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
}

export default function VerifyNarcoticCountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [count, setCount] = useState<CountRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");

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

  const handleVerify = async () => {
    if (!count) return;

    if (count.discrepancy !== 0 && !discrepancyNotes.trim()) {
      toast.error("Please provide notes about the discrepancy");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/narcotic-counts/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifiedBySignature: "Electronic Signature", // In real app, capture actual signature
          discrepancyNotes: discrepancyNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify count");
      }

      toast.success("Count verified successfully");
      router.push("/emar/narcotics");
    } catch (error) {
      console.error("Error verifying count:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify count");
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
  const hasDiscrepancy = count.discrepancy !== 0;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Narcotic Counts", href: "/emar/narcotics" },
          { label: "Verify Count" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          Verify Narcotic Count
        </h1>
        <p className="text-muted-foreground">
          Review and verify this controlled substance count
        </p>
      </div>

      {/* Already Verified Warning */}
      {count.status === "VERIFIED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Already Verified</p>
              <p className="text-sm text-green-700">
                This count has been verified by {count.verifiedBy?.firstName} {count.verifiedBy?.lastName}
              </p>
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

      {/* Count Numbers */}
      <Card>
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
            <div className={`p-4 rounded-lg ${hasDiscrepancy ? "bg-red-100" : "bg-green-100"}`}>
              <p className="text-sm text-muted-foreground">Actual</p>
              <p className={`text-3xl font-bold ${hasDiscrepancy ? "text-red-600" : "text-green-600"}`}>
                {count.currentCount}
              </p>
            </div>
          </div>

          {hasDiscrepancy && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-900">
                  Discrepancy: {count.discrepancy > 0 ? "+" : ""}{count.discrepancy}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discrepancy Notes */}
      {hasDiscrepancy && count.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Discrepancy Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes">
              Please document any observations about this discrepancy *
            </Label>
            <Textarea
              id="notes"
              value={discrepancyNotes}
              onChange={(e) => setDiscrepancyNotes(e.target.value)}
              placeholder="Document your observations about the discrepancy..."
              rows={3}
              className="mt-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {count.status === "PENDING" && (
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
            onClick={handleVerify}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Count
              </>
            )}
          </Button>
        </div>
      )}

      {count.status !== "PENDING" && (
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
