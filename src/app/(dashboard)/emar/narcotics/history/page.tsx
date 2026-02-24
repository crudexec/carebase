"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  Input,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { format } from "date-fns";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface CountRecord {
  id: string;
  countTime: string;
  shiftType: string;
  status: string;
  previousCount: number;
  currentCount: number;
  expectedCount: number;
  discrepancy: number;
  discrepancyNotes: string | null;
  discrepancyResolution: string | null;
  inventory: {
    medication: {
      id: string;
      name: string;
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

type ShiftType = "DAY" | "EVENING" | "NIGHT" | "";
type StatusType = "PENDING" | "VERIFIED" | "DISCREPANCY" | "";

export default function NarcoticHistoryPage() {
  const [counts, setCounts] = useState<CountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftFilter, setShiftFilter] = useState<ShiftType>("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (shiftFilter) params.append("shiftType", shiftFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/narcotic-counts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCounts(data.counts || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
      toast.error("Failed to load count history");
    } finally {
      setIsLoading(false);
    }
  }, [shiftFilter, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleFilterReset = () => {
    setShiftFilter("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "DISCREPANCY":
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Discrepancy
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR", href: "/emar" },
          { label: "Narcotic Counts", href: "/emar/narcotics" },
          { label: "History" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          Narcotic Count History
        </h1>
        <p className="text-muted-foreground">
          View all controlled substance count records
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Shift</label>
              <Select
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value as ShiftType);
                  setPage(1);
                }}
                className="min-h-[44px]"
              >
                <option value="">All Shifts</option>
                <option value="DAY">Day</option>
                <option value="EVENING">Evening</option>
                <option value="NIGHT">Night</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusType);
                  setPage(1);
                }}
                className="min-h-[44px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="DISCREPANCY">Discrepancy</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="min-h-[44px]"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={handleFilterReset}
                className="min-h-[44px] w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Count Records</span>
            <Badge variant="default">
              {counts.length} of {totalPages * limit}+
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : counts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No count records found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {counts.map((count) => (
                <div
                  key={count.id}
                  className={`p-4 rounded-lg border ${
                    count.status === "DISCREPANCY"
                      ? "border-red-200 bg-red-50"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {count.inventory.medication.name}
                        </span>
                        <Badge variant="warning" className="text-xs">
                          {CONTROLLED_SCHEDULE_LABELS[count.inventory.medication.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          {count.shiftType}
                        </Badge>
                        {getStatusBadge(count.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {count.inventory.medication.strength} {count.inventory.medication.form} -{" "}
                        {count.inventory.medication.client.firstName} {count.inventory.medication.client.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(count.countTime), "MMM d, yyyy h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Counted by {count.countedBy.firstName} {count.countedBy.lastName}
                        {count.verifiedBy && (
                          <>, verified by {count.verifiedBy.firstName} {count.verifiedBy.lastName}</>
                        )}
                        {count.resolvedBy && (
                          <>, resolved by {count.resolvedBy.firstName} {count.resolvedBy.lastName}</>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Previous</p>
                        <p className="font-medium text-lg">{count.previousCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Expected</p>
                        <p className="font-medium text-lg">{count.expectedCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Actual</p>
                        <p className={`font-medium text-lg ${count.discrepancy !== 0 ? "text-red-600" : "text-green-600"}`}>
                          {count.currentCount}
                        </p>
                      </div>
                      {count.discrepancy !== 0 && (
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Diff</p>
                          <p className={`font-bold text-lg ${count.discrepancy > 0 ? "text-green-600" : "text-red-600"}`}>
                            {count.discrepancy > 0 ? "+" : ""}{count.discrepancy}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {count.status === "PENDING" && (
                        <Link href={`/emar/narcotics/verify/${count.id}`}>
                          <Button
                            variant="secondary"
                            className="min-h-[44px] touch-manipulation"
                          >
                            Verify
                          </Button>
                        </Link>
                      )}
                      {count.status === "DISCREPANCY" && (
                        <Link href={`/emar/narcotics/resolve/${count.id}`}>
                          <Button
                            variant="error"
                            className="min-h-[44px] touch-manipulation"
                          >
                            Resolve
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Resolution details */}
                  {count.discrepancyResolution && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                      <p className="font-medium text-green-900">Resolution:</p>
                      <p className="text-green-800">{count.discrepancyResolution}</p>
                    </div>
                  )}
                </div>
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
    </div>
  );
}
