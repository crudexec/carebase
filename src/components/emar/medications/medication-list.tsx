"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pill,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Pause,
  Play,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import {
  MedicationStatus,
  MEDICATION_STATUS_LABELS,
  MEDICATION_ROUTE_LABELS,
  MEDICATION_FREQUENCY_LABELS,
  CONTROLLED_SCHEDULE_LABELS,
} from "@/lib/emar/types";

interface MedicationListItem {
  id: string;
  name: string;
  genericName: string | null;
  strength: string;
  form: string;
  route: string;
  status: MedicationStatus;
  frequency: string;
  scheduledTimes: string[];
  controlledSchedule: string;
  startDate: string;
  endDate: string | null;
  clientId: string;
  clientName: string;
  prescriberName: string | null;
  _count?: {
    scheduledDoses: number;
    administrations: number;
    refillRequests: number;
  };
}

interface MedicationListProps {
  clientId?: string;
  showClientColumn?: boolean;
  onAddClick?: () => void;
}

export function MedicationList({
  clientId,
  showClientColumn = true,
  onAddClick,
}: MedicationListProps) {
  const router = useRouter();
  const [medications, setMedications] = useState<MedicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [controlledOnly, setControlledOnly] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchMedications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (clientId) params.set("clientId", clientId);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (controlledOnly) params.set("controlledOnly", "true");
      if (search) params.set("search", search);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const response = await fetch(`/api/medications?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to fetch medications");
      }
      setMedications(data.medications);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, statusFilter, controlledOnly, search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleHold = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/medications/${id}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Temporarily held" }),
      });
      if (!response.ok) throw new Error("Failed to hold medication");
      toast.success("Medication put on hold");
      fetchMedications();
    } catch (error) {
      console.error("Error holding medication:", error);
      toast.error("Failed to hold medication");
    }
  };

  const handleResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/medications/${id}/resume`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to resume medication");
      toast.success("Medication resumed");
      fetchMedications();
    } catch (error) {
      console.error("Error resuming medication:", error);
      toast.error("Failed to resume medication");
    }
  };

  const handleDiscontinue = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to discontinue this medication?")) {
      return;
    }
    try {
      const response = await fetch(`/api/medications/${id}/discontinue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Discontinued by provider" }),
      });
      if (!response.ok) throw new Error("Failed to discontinue medication");
      toast.success("Medication discontinued");
      fetchMedications();
    } catch (error) {
      console.error("Error discontinuing medication:", error);
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
      <Badge variant={variants[status]}>
        {MEDICATION_STATUS_LABELS[status]}
      </Badge>
    );
  };

  const getControlledBadge = (schedule: string) => {
    if (schedule === "NOT_CONTROLLED") return null;
    return (
      <Badge variant="warning" className="ml-1">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {CONTROLLED_SCHEDULE_LABELS[schedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
      </Badge>
    );
  };

  const columns: ColumnDef<MedicationListItem>[] = [
    {
      id: "name",
      header: "Medication",
      cell: (row) => (
        <div>
          <div className="font-medium flex items-center">
            {row.name}
            {getControlledBadge(row.controlledSchedule)}
          </div>
          {row.genericName && (
            <div className="text-sm text-muted-foreground">{row.genericName}</div>
          )}
          <div className="text-sm text-muted-foreground">
            {row.strength} {row.form}
          </div>
        </div>
      ),
    },
    ...(showClientColumn
      ? [
          {
            id: "client",
            header: "Client",
            cell: (row) => (
              <Link
                href={`/clients/${row.clientId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline font-medium py-2 inline-block touch-manipulation"
              >
                {row.clientName}
              </Link>
            ),
          } as ColumnDef<MedicationListItem>,
        ]
      : []),
    {
      id: "route",
      header: "Route",
      cell: (row) =>
        MEDICATION_ROUTE_LABELS[row.route as keyof typeof MEDICATION_ROUTE_LABELS] ||
        row.route,
    },
    {
      id: "frequency",
      header: "Frequency",
      cell: (row) => (
        <div>
          <div>
            {MEDICATION_FREQUENCY_LABELS[
              row.frequency as keyof typeof MEDICATION_FREQUENCY_LABELS
            ] || row.frequency}
          </div>
          {row.scheduledTimes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {row.scheduledTimes.join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "prescriber",
      header: "Prescriber",
      accessorKey: "prescriberName",
      cell: (row) => row.prescriberName || "-",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/emar/medications/${row.id}`);
            }}
            className="min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/emar/medications/${row.id}/edit`);
            }}
            className="min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <Edit className="h-5 w-5" />
          </Button>
          {row.status === "ACTIVE" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleHold(row.id, e)}
              className="min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <Pause className="h-5 w-5" />
            </Button>
          )}
          {row.status === "ON_HOLD" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleResume(row.id, e)}
              className="min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <Play className="h-5 w-5" />
            </Button>
          )}
          {row.status !== "DISCONTINUED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDiscontinue(row.id, e)}
              className="text-error hover:text-error min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Medications</h2>
          <Badge variant="default">{pagination.total}</Badge>
        </div>
        {onAddClick && (
          <Button onClick={onAddClick} className="min-h-[44px] px-4 touch-manipulation">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[160px] min-h-[44px]"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="DISCONTINUED">Discontinued</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Button
          variant={controlledOnly ? "default" : "secondary"}
          onClick={() => setControlledOnly(!controlledOnly)}
          className="min-h-[44px] px-4 touch-manipulation"
        >
          <Filter className="h-4 w-4 mr-2" />
          Controlled Only
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={medications}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/emar/medications/${row.id}`)}
        clickableRows
        emptyMessage="No medications found"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} medications
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="min-h-[44px] px-6 touch-manipulation"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="min-h-[44px] px-6 touch-manipulation"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
