"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Input,
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
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

type SortDirection = "asc" | "desc" | null;

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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_CLINICAL_REVIEW: "bg-yellow-100 text-yellow-700",
  CLINICAL_APPROVED: "bg-blue-100 text-blue-700",
  PENDING_CLIENT_SIGNATURE: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  REVISED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
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

  // Sort header click handler
  const handleHeaderClick = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-0.5" />
    );
  };

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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


  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Care Plans</h1>
          <span className="text-xs text-gray-500">{total} total</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 border border-gray-300 rounded px-2 py-1 pl-7 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchCarePlans()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* New Care Plan */}
          <button
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Care Plan
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Care Plans Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("client")}
                >
                  Client {renderSortIndicator("client")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHeaderClick("status")}
                >
                  Status {renderSortIndicator("status")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  onClick={() => handleHeaderClick("certPeriod")}
                >
                  Certification Period {renderSortIndicator("certPeriod")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  onClick={() => handleHeaderClick("physician")}
                >
                  Physician {renderSortIndicator("physician")}
                </th>
                <th
                  className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  onClick={() => handleHeaderClick("updatedAt")}
                >
                  Last Updated {renderSortIndicator("updatedAt")}
                </th>
                <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 w-10">
                  {/* Actions */}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                    <p className="text-[11px] text-gray-500 mt-1">Loading...</p>
                  </td>
                </tr>
              ) : processedCarePlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-[11px] text-gray-500">
                      {search || statusFilter
                        ? "No care plans match your filters."
                        : "No care plans have been created yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                processedCarePlans.map((cp, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  return (
                    <tr
                      key={cp.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                      onClick={() => handleRowClick(cp)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700">
                            {cp.client.firstName[0]}{cp.client.lastName[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">
                              {cp.client.firstName} {cp.client.lastName}
                            </p>
                            {cp._count && (
                              <p className="text-[10px] text-gray-500">
                                {cp._count.diagnoses} diagnoses, {cp._count.orders} orders
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${STATUS_COLORS[cp.status] || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[cp.status] || cp.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <div className="text-[10px] text-gray-600">
                          {cp.certStartDate ? (
                            <>
                              <p>{formatDate(cp.certStartDate)}</p>
                              <p className="text-gray-400">to {formatDate(cp.certEndDate)}</p>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        {cp.physician ? (
                          <span className="text-[11px] text-gray-600">
                            Dr. {cp.physician.firstName} {cp.physician.lastName}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <span className="text-[10px] text-gray-600">
                          {formatDate(cp.updatedAt)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === cp.id ? null : cp.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                          {openActionId === cp.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded shadow-lg bg-white border border-gray-200 z-50">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/clients/${cp.client.id}/care-plans/${cp.id}`);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <Eye className="mr-2 h-3 w-3" />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/clients/${cp.client.id}/care-plans/${cp.id}?edit=true`);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <Edit2 className="mr-2 h-3 w-3" />
                                  Edit Care Plan
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionId(null);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                >
                                  <Download className="mr-2 h-3 w-3" />
                                  Download PDF
                                </button>
                                {cp.status !== "DRAFT" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevertToDraft(cp);
                                    }}
                                    className="flex items-center w-full px-3 py-1.5 text-[11px] hover:bg-gray-100"
                                  >
                                    <Edit2 className="mr-2 h-3 w-3" />
                                    Revert to Draft
                                  </button>
                                )}
                                <hr className="my-1 border-gray-200" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(cp);
                                  }}
                                  className="flex items-center w-full px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-100"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
          Showing {processedCarePlans.length} care plan{processedCarePlans.length !== 1 ? "s" : ""}
        </div>
      </div>

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
