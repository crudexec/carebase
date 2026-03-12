"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Breadcrumb,
  DataTable,
  StatusCell,
  DateRangeCell,
  UserCell,
  type ColumnDef,
  type SortDirection,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  FileText,
  User,
  Search,
  ChevronRight,
  Loader2,
  X,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface CarePlan {
  id: string;
  status: string;
  effectiveDate: string | null;
  endDate: string | null;
  certStartDate: string | null;
  certEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  physician: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  caseManager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: {
    diagnoses: number;
    orders: number;
  };
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_CLINICAL_REVIEW: "Pending Review",
  CLINICAL_APPROVED: "Approved",
  PENDING_CLIENT_SIGNATURE: "Pending Signature",
  ACTIVE: "Active",
  REVISED: "Revised",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_VARIANTS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  DRAFT: "default",
  PENDING_CLINICAL_REVIEW: "warning",
  CLINICAL_APPROVED: "primary",
  PENDING_CLIENT_SIGNATURE: "warning",
  ACTIVE: "success",
  REVISED: "primary",
  COMPLETED: "success",
  CANCELLED: "error",
};

export default function CarePlansPage() {
  const router = useRouter();

  const [carePlans, setCarePlans] = React.useState<CarePlan[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  // Sorting state
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  // Actions dropdown
  const [openActionId, setOpenActionId] = React.useState<string | null>(null);

  // Client selector modal state
  const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientSearch, setClientSearch] = React.useState("");
  const [isLoadingClients, setIsLoadingClients] = React.useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [carePlanToDelete, setCarePlanToDelete] = React.useState<CarePlan | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchCarePlans = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/care-plans?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch care plans");

      const data = await response.json();
      setCarePlans(data.carePlans || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load care plans");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchCarePlans();
  }, [fetchCarePlans]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = () => setOpenActionId(null);
    if (openActionId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openActionId]);

  // Fetch clients when modal opens
  const fetchClients = React.useCallback(async (searchTerm: string = "") => {
    try {
      setIsLoadingClients(true);
      const params = new URLSearchParams();
      params.set("status", "ACTIVE");
      params.set("limit", "20");
      if (searchTerm) params.set("search", searchTerm);

      const response = await fetch(`/api/clients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  React.useEffect(() => {
    if (isClientModalOpen) {
      fetchClients();
    }
  }, [isClientModalOpen, fetchClients]);

  // Debounced client search
  React.useEffect(() => {
    if (!isClientModalOpen) return;
    const timer = setTimeout(() => {
      fetchClients(clientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, isClientModalOpen, fetchClients]);

  // Filter and sort care plans
  const processedCarePlans = React.useMemo(() => {
    let result = [...carePlans];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((cp) =>
        cp.client.firstName.toLowerCase().includes(searchLower) ||
        cp.client.lastName.toLowerCase().includes(searchLower) ||
        cp.physician?.firstName.toLowerCase().includes(searchLower) ||
        cp.physician?.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aVal: string | number | null = null;
        let bVal: string | number | null = null;

        switch (sortColumn) {
          case "client":
            aVal = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
            bVal = `${b.client.firstName} ${b.client.lastName}`.toLowerCase();
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
          case "certPeriod":
            aVal = a.certStartDate || "";
            bVal = b.certStartDate || "";
            break;
          case "physician":
            aVal = a.physician ? `${a.physician.firstName} ${a.physician.lastName}`.toLowerCase() : "";
            bVal = b.physician ? `${b.physician.firstName} ${b.physician.lastName}`.toLowerCase() : "";
            break;
          case "updatedAt":
            aVal = a.updatedAt;
            bVal = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (aVal === null || aVal === "") return 1;
        if (bVal === null || bVal === "") return -1;

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [carePlans, search, sortColumn, sortDirection]);

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const handleRowClick = (carePlan: CarePlan) => {
    router.push(`/clients/${carePlan.client.id}/care-plans/${carePlan.id}`);
  };

  const handleDeleteClick = (carePlan: CarePlan) => {
    setCarePlanToDelete(carePlan);
    setShowDeleteModal(true);
    setOpenActionId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!carePlanToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/care-plans/${carePlanToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete care plan");
      }

      toast.success("Care plan deleted successfully");
      setShowDeleteModal(false);
      setCarePlanToDelete(null);
      fetchCarePlans(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete care plan";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRevertToDraft = async (carePlan: CarePlan) => {
    setOpenActionId(null);

    try {
      const response = await fetch(`/api/care-plans/${carePlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revert care plan to draft");
      }

      toast.success("Care plan reverted to draft");
      fetchCarePlans(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to revert care plan";
      toast.error(errorMessage);
    }
  };

  // Column definitions
  const columns: ColumnDef<CarePlan>[] = [
    {
      id: "client",
      header: "Client",
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <UserCell
          firstName={row.client.firstName}
          lastName={row.client.lastName}
          subtitle={row._count ? `${row._count.diagnoses} diagnoses, ${row._count.orders} orders` : undefined}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      width: "140px",
      cell: (row) => (
        <StatusCell
          status={row.status}
          label={STATUS_LABELS[row.status] || row.status}
          variant={STATUS_VARIANTS[row.status] || "default"}
        />
      ),
    },
    {
      id: "certPeriod",
      header: "Certification Period",
      sortable: true,
      hideOnMobile: true,
      minWidth: "180px",
      cell: (row) => (
        <DateRangeCell startDate={row.certStartDate} endDate={row.certEndDate} />
      ),
    },
    {
      id: "physician",
      header: "Physician",
      sortable: true,
      hideOnMobile: true,
      minWidth: "160px",
      cell: (row) => row.physician ? (
        <span className="text-foreground-secondary">
          Dr. {row.physician.firstName} {row.physician.lastName}
        </span>
      ) : (
        <span className="text-foreground-tertiary">-</span>
      ),
    },
    {
      id: "updatedAt",
      header: "Last Updated",
      sortable: true,
      hideOnMobile: true,
      width: "130px",
      cell: (row) => (
        <span className="text-foreground-secondary text-sm">
          {new Date(row.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Row actions
  const renderRowActions = (row: CarePlan) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenActionId(openActionId === row.id ? null : row.id);
        }}
        className="p-1.5 rounded-md hover:bg-background-secondary transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
      </button>

      {openActionId === row.id && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded-lg shadow-lg py-1 z-20">
          <button
            onClick={() => router.push(`/clients/${row.client.id}/care-plans/${row.id}`)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => router.push(`/clients/${row.client.id}/care-plans/${row.id}?edit=true`)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Care Plan
          </button>
          <button
            onClick={() => {
              // TODO: Implement download
              setOpenActionId(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          {row.status !== "DRAFT" && (
            <button
              onClick={() => handleRevertToDraft(row)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-secondary transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Revert to Draft
            </button>
          )}
          <div className="border-t border-border my-1" />
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  // Stats for the header
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    carePlans.forEach((cp) => {
      counts[cp.status] = (counts[cp.status] || 0) + 1;
    });
    return counts;
  }, [carePlans]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Care Plans" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Plans of Care</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage and track client care plans
          </p>
        </div>
        <Button onClick={() => setIsClientModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Care Plan
        </Button>
      </div>

      {/* Stats - Compact inline */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold">{total}</span>
          <span className="text-foreground-secondary">total</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="font-semibold">{statusCounts["ACTIVE"] || 0}</span>
          <span className="text-foreground-secondary">active</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <span className="font-semibold">{(statusCounts["PENDING_CLINICAL_REVIEW"] || 0) + (statusCounts["PENDING_CLIENT_SIGNATURE"] || 0)}</span>
          <span className="text-foreground-secondary">pending</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-foreground-tertiary" />
          <span className="font-semibold">{statusCounts["DRAFT"] || 0}</span>
          <span className="text-foreground-secondary">drafts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search by client or physician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button variant="ghost" onClick={fetchCarePlans} className="sm:w-auto">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/10 border border-error/20 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={processedCarePlans}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={handleRowClick}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        rowActions={renderRowActions}
        emptyIcon={<FileText className="w-12 h-12" />}
        emptyMessage={
          search || statusFilter
            ? "No care plans match your filters."
            : "No care plans have been created yet."
        }
      />

      {/* Client Selection Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsClientModalOpen(false)}
          />
          {/* Modal Content */}
          <Card className="relative z-10 w-full max-w-md mx-4 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Select a Client</h2>
                <button
                  onClick={() => setIsClientModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-background-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-secondary" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
                  <Input
                    type="text"
                    placeholder="Search clients by name..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="text-center py-8 text-foreground-secondary">
                      {clientSearch
                        ? "No clients found matching your search."
                        : "No active clients available."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => {
                            setIsClientModalOpen(false);
                            router.push(`/clients/${client.id}/care-plans/new`);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background-secondary transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              Click to create care plan
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-foreground-tertiary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && carePlanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
                setCarePlanToDelete(null);
              }
            }}
          />
          {/* Modal Content */}
          <Card className="relative z-10 w-full max-w-md mx-4 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
                  <AlertTriangle className="h-5 w-5 text-error" />
                </div>
                <h3 className="text-lg font-semibold">Delete Care Plan</h3>
              </div>
              <p className="text-foreground-secondary mb-2">
                Are you sure you want to delete this care plan for{" "}
                <span className="font-medium text-foreground">
                  {carePlanToDelete.client.firstName} {carePlanToDelete.client.lastName}
                </span>
                ?
              </p>
              <p className="text-foreground-secondary text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCarePlanToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="error"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
