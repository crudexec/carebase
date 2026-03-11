"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Truck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RefillRequestModal } from "@/components/emar/refills/refill-request-modal";
import { toast } from "sonner";
import { format } from "date-fns";

interface RefillRequest {
  id: string;
  status: string;
  requestedAt: string;
  quantityRequested: number | null;
  requestNotes: string | null;
  pharmacyName: string | null;
  responseNotes: string | null;
  orderedAt: string | null;
  expectedDelivery: string | null;
  receivedAt: string | null;
  quantityReceived: number | null;
  medication: {
    id: string;
    name: string;
    strength: string;
    form: string;
    controlledSchedule: string;
    refillsRemaining: number | null;
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
}

type StatusFilter = "PENDING" | "APPROVED" | "DENIED" | "ORDERED" | "RECEIVED" | "CANCELLED" | "";

export default function RefillsPage() {
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const limit = 20;

  const fetchRefills = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/refills?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log("[Refills Page] Fetched data:", data);
      setRefills(data.refills || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching refills:", error);
      toast.error("Failed to load refill requests");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRefills();
  }, [fetchRefills]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "DENIED":
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case "ORDERED":
        return (
          <Badge variant="primary">
            <Truck className="h-3 w-3 mr-1" />
            Ordered
          </Badge>
        );
      case "RECEIVED":
        return (
          <Badge variant="success">
            <Package className="h-3 w-3 mr-1" />
            Received
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="default">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const pendingCount = refills.filter((r) => r.status === "PENDING").length;
  const orderedCount = refills.filter((r) => r.status === "ORDERED").length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Refill Requests" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Refill Requests
          </h1>
          <p className="text-muted-foreground">
            Manage medication refill requests and track orders
          </p>
        </div>
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          className="min-h-[44px] touch-manipulation"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation"
          onClick={() => {
            setStatusFilter("PENDING");
            setPage(1);
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation"
          onClick={() => {
            setStatusFilter("ORDERED");
            setPage(1);
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Delivery</p>
                <p className="text-3xl font-bold">{orderedCount}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] touch-manipulation"
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold">{refills.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className="min-h-[44px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DENIED">Denied</option>
                <option value="ORDERED">Ordered</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            {statusFilter && (
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusFilter("");
                  setPage(1);
                }}
                className="min-h-[44px]"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refill List */}
      <Card>
        <CardHeader>
          <CardTitle>Refill Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : refills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No refill requests found</p>
              <p className="text-sm">Create a new request to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refills.map((refill) => (
                <Link
                  key={refill.id}
                  href={`/emar/refills/${refill.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] touch-manipulation">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{refill.medication.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {refill.medication.strength} {refill.medication.form}
                        </span>
                        {getStatusBadge(refill.status)}
                        {refill.medication.controlledSchedule !== "NOT_CONTROLLED" && (
                          <Badge variant="warning" className="text-xs">
                            Controlled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {refill.client.firstName} {refill.client.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {format(new Date(refill.requestedAt), "MMM d, yyyy h:mm a")} by{" "}
                        {refill.requestedBy.firstName} {refill.requestedBy.lastName}
                      </p>
                      {refill.pharmacyName && (
                        <p className="text-xs text-muted-foreground">
                          Pharmacy: {refill.pharmacyName}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {refill.quantityRequested && (
                        <span className="text-sm">
                          Qty: {refill.quantityRequested}
                        </span>
                      )}
                      {refill.expectedDelivery && refill.status === "ORDERED" && (
                        <span className="text-xs text-muted-foreground">
                          Expected: {format(new Date(refill.expectedDelivery), "MMM d")}
                        </span>
                      )}
                      {refill.medication.refillsRemaining !== null && (
                        <span className={`text-xs ${refill.medication.refillsRemaining <= 1 ? "text-red-600" : "text-muted-foreground"}`}>
                          {refill.medication.refillsRemaining} refills left
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="min-h-[44px] touch-manipulation"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="min-h-[44px] touch-manipulation"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Modal */}
      <RefillRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          setIsRequestModalOpen(false);
          fetchRefills();
        }}
      />
    </div>
  );
}
