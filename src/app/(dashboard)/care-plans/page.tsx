"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Search,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

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

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
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

  // Client selector modal state
  const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientSearch, setClientSearch] = React.useState("");
  const [isLoadingClients, setIsLoadingClients] = React.useState(false);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter care plans by search
  const filteredCarePlans = carePlans.filter((cp) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cp.client.firstName.toLowerCase().includes(searchLower) ||
      cp.client.lastName.toLowerCase().includes(searchLower) ||
      (cp.physician?.firstName.toLowerCase().includes(searchLower) ?? false) ||
      (cp.physician?.lastName.toLowerCase().includes(searchLower) ?? false)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Plans of Care</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            {total} total care plans
          </p>
        </div>
        <Button onClick={() => setIsClientModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Care Plan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search by client or physician name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button variant="ghost" onClick={fetchCarePlans}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Care Plans List */}
      {filteredCarePlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">
              {search || statusFilter
                ? "No care plans match your filters."
                : "No care plans have been created yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCarePlans.map((carePlan) => (
            <Card
              key={carePlan.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                router.push(
                  `/clients/${carePlan.client.id}/care-plans/${carePlan.id}`
                )
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {carePlan.client.firstName} {carePlan.client.lastName}
                        </span>
                        <Badge
                          variant={STATUS_COLORS[carePlan.status] || "default"}
                        >
                          {STATUS_LABELS[carePlan.status] || carePlan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-foreground-secondary">
                        {carePlan.certStartDate && carePlan.certEndDate && (
                          <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(carePlan.certStartDate)} -{" "}
                            {formatDate(carePlan.certEndDate)}
                          </span>
                        )}
                        {carePlan.physician && (
                          <span>
                            <User className="w-3 h-3 inline mr-1" />
                            Dr. {carePlan.physician.firstName}{" "}
                            {carePlan.physician.lastName}
                          </span>
                        )}
                        {carePlan._count && (
                          <>
                            <span>{carePlan._count.diagnoses} diagnoses</span>
                            <span>{carePlan._count.orders} orders</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-foreground-tertiary">
                      <p>Created {formatDate(carePlan.createdAt)}</p>
                      <p>Updated {formatDate(carePlan.updatedAt)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-foreground-tertiary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                          <div>
                            <p className="font-medium text-foreground">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              Click to create care plan
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-foreground-tertiary ml-auto" />
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
    </div>
  );
}
