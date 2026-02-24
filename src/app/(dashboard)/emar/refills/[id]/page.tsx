"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Truck,
  User,
  Phone,
  FileText,
  Calendar,
  Pill,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Label,
  Input,
  Select,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface RefillRequest {
  id: string;
  status: string;
  requestedAt: string;
  quantityRequested: number | null;
  requestNotes: string | null;
  pharmacyName: string | null;
  pharmacyPhone: string | null;
  pharmacyFax: string | null;
  responseNotes: string | null;
  orderedAt: string | null;
  expectedDelivery: string | null;
  receivedAt: string | null;
  quantityReceived: number | null;
  medication: {
    id: string;
    name: string;
    genericName: string | null;
    strength: string;
    form: string;
    controlledSchedule: string;
    refillsRemaining: number | null;
    prescriptionNumber: string | null;
    prescriber: {
      id: string;
      firstName: string;
      lastName: string;
      npi: string | null;
    } | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  respondedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  receivedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  faxRecord: {
    id: string;
    status: string;
    sentAt: string | null;
    recipientFax: string | null;
  } | null;
}

export default function RefillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [refill, setRefill] = useState<RefillRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for updates
  const [newStatus, setNewStatus] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [quantityReceived, setQuantityReceived] = useState("");

  useEffect(() => {
    fetchRefill();
  }, [id]);

  const fetchRefill = async () => {
    try {
      const response = await fetch(`/api/refills/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch refill");
      }
      const data = await response.json();
      setRefill(data.refill);
      setNewStatus(data.refill.status);
      setResponseNotes(data.refill.responseNotes || "");
    } catch (error) {
      console.error("Error fetching refill:", error);
      toast.error("Failed to load refill details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!refill || !newStatus) return;

    setIsSubmitting(true);

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        responseNotes: responseNotes || undefined,
      };

      if (newStatus === "ORDERED" && expectedDelivery) {
        updateData.expectedDelivery = expectedDelivery;
      }

      if (newStatus === "RECEIVED") {
        updateData.quantityReceived = quantityReceived ? parseInt(quantityReceived) : undefined;
      }

      const response = await fetch(`/api/refills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update refill");
      }

      toast.success("Refill request updated successfully");
      fetchRefill(); // Refresh data
    } catch (error) {
      console.error("Error updating refill:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update refill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "DENIED":
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      case "ORDERED":
        return <Badge variant="primary"><Truck className="h-3 w-3 mr-1" />Ordered</Badge>;
      case "RECEIVED":
        return <Badge variant="success"><Package className="h-3 w-3 mr-1" />Received</Badge>;
      case "CANCELLED":
        return <Badge variant="default"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["APPROVED", "DENIED", "CANCELLED"];
      case "APPROVED":
        return ["ORDERED", "CANCELLED"];
      case "ORDERED":
        return ["RECEIVED", "CANCELLED"];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!refill) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p>Refill request not found</p>
            <Button
              variant="secondary"
              onClick={() => router.push("/emar/refills")}
              className="mt-4"
            >
              Back to Refills
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(refill.status);
  const canUpdate = nextStatuses.length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Refill Requests", href: "/emar/refills" },
          { label: refill.medication.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Refill Request
          </h1>
          <p className="text-muted-foreground">
            {refill.medication.name} - {refill.client.firstName} {refill.client.lastName}
          </p>
        </div>
        {getStatusBadge(refill.status)}
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Requested</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(refill.requestedAt), "MMM d, h:mm a")}
                </p>
              </div>
            </div>

            {refill.respondedBy && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${refill.status === "DENIED" ? "bg-red-500" : "bg-green-500"}`}>
                    {refill.status === "DENIED" ? (
                      <XCircle className="h-4 w-4 text-white" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {refill.status === "DENIED" ? "Denied" : "Approved"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {refill.respondedBy.firstName}
                    </p>
                  </div>
                </div>
              </>
            )}

            {refill.orderedAt && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ordered</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(refill.orderedAt), "MMM d")}
                    </p>
                  </div>
                </div>
              </>
            )}

            {refill.receivedAt && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Received</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(refill.receivedAt), "MMM d")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medication Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{refill.medication.name}</span>
            {refill.medication.controlledSchedule !== "NOT_CONTROLLED" && (
              <Badge variant="warning">
                {CONTROLLED_SCHEDULE_LABELS[refill.medication.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {refill.medication.strength} {refill.medication.form}
          </p>
          {refill.medication.genericName && (
            <p className="text-sm text-muted-foreground">
              Generic: {refill.medication.genericName}
            </p>
          )}
          {refill.medication.prescriptionNumber && (
            <p className="text-sm">
              Rx #: {refill.medication.prescriptionNumber}
            </p>
          )}
          {refill.medication.refillsRemaining !== null && (
            <p className={`text-sm ${refill.medication.refillsRemaining <= 1 ? "text-red-600 font-medium" : ""}`}>
              Refills remaining: {refill.medication.refillsRemaining}
            </p>
          )}
          {refill.medication.prescriber && (
            <p className="text-sm text-muted-foreground">
              Prescriber: Dr. {refill.medication.prescriber.firstName} {refill.medication.prescriber.lastName}
              {refill.medication.prescriber.npi && ` (NPI: ${refill.medication.prescriber.npi})`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Requested by {refill.requestedBy.firstName} {refill.requestedBy.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(refill.requestedAt), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          {refill.quantityRequested && (
            <p className="text-sm">
              Quantity requested: <span className="font-medium">{refill.quantityRequested}</span>
            </p>
          )}
          {refill.requestNotes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm">{refill.requestNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pharmacy Info */}
      {(refill.pharmacyName || refill.pharmacyPhone || refill.pharmacyFax) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pharmacy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {refill.pharmacyName && (
              <p className="font-medium">{refill.pharmacyName}</p>
            )}
            {refill.pharmacyPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {refill.pharmacyPhone}
              </div>
            )}
            {refill.pharmacyFax && (
              <p className="text-sm text-muted-foreground">Fax: {refill.pharmacyFax}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Info */}
      {refill.expectedDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Expected delivery: <span className="font-medium">{format(new Date(refill.expectedDelivery), "MMMM d, yyyy")}</span>
            </p>
            {refill.quantityReceived && (
              <p className="text-sm mt-2">
                Quantity received: <span className="font-medium">{refill.quantityReceived}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Response Notes */}
      {refill.responseNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Response Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{refill.responseNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Update Form */}
      {canUpdate && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 min-h-[44px]"
              >
                <option value={refill.status}>Current: {refill.status}</option>
                {nextStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>

            {newStatus === "ORDERED" && (
              <div>
                <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="mt-2 min-h-[44px]"
                />
              </div>
            )}

            {newStatus === "RECEIVED" && (
              <div>
                <Label htmlFor="quantityReceived">Quantity Received</Label>
                <Input
                  id="quantityReceived"
                  type="number"
                  min="1"
                  value={quantityReceived}
                  onChange={(e) => setQuantityReceived(e.target.value)}
                  placeholder="Enter quantity received"
                  className="mt-2 min-h-[44px]"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Add any notes about this update..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => router.push("/emar/refills")}
                disabled={isSubmitting}
                className="flex-1 min-h-[48px] touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={isSubmitting || newStatus === refill.status}
                className="flex-1 min-h-[48px] touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button for completed statuses */}
      {!canUpdate && (
        <Button
          variant="secondary"
          onClick={() => router.push("/emar/refills")}
          className="w-full min-h-[48px] touch-manipulation"
        >
          Back to Refill Requests
        </Button>
      )}
    </div>
  );
}
