"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClientStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  DateInput,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  X,
  User,
  ChevronUp,
  ChevronDown,
  Trash2,
  RotateCcw,
  Stethoscope,
  Phone,
  HeartPulse,
  UserCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import { StaffSearchSelect } from "@/components/staff";

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  phone: string | null;
  medicalNotes: string | null;
  status: ClientStatus;
  createdAt: string;
  // Insurance fields
  medicaidId: string | null;
  medicaidPayerId: string | null;
  secondaryInsuranceId: string | null;
  secondaryPayerId: string | null;
  // PCP fields
  physicianName: string | null;
  physicianNpi: string | null;
  physicianPhone: string | null;
  physicianFax: string | null;
  physicianAddress: string | null;
  // Referral fields
  referralSource: string | null;
  referralDate: string | null;
  referringPhysicianName: string | null;
  referringPhysicianNpi: string | null;
  referringPhysicianPhone: string | null;
  referringPhysicianFax: string | null;
  referralNotes: string | null;
  sponsor: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  assignedCarer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface CarerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: "Prospect",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const _STATUS_COLORS: Record<ClientStatus, "primary" | "success" | "warning" | "error" | "default"> = {
  PROSPECT: "default",
  ONBOARDING: "warning",
  ACTIVE: "success",
  INACTIVE: "error",
};

type SortField = "name" | "dob" | "status" | "carer" | "createdAt";
type SortDirection = "asc" | "desc";

export default function ClientsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [clients, setClients] = React.useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<ClientData | null>(null);
  const [_selectedCarer, setSelectedCarer] = React.useState<CarerData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const userRole = session?.user?.role;
  const canCreateClient = Boolean(userRole) && userRole !== "SPONSOR";

  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    medicalNotes: "",
    status: "PROSPECT" as ClientStatus,
    assignedCarerId: "",
    // Insurance fields
    medicaidId: "",
    medicaidPayerId: "",
    secondaryInsuranceId: "",
    secondaryPayerId: "",
    // PCP fields
    physicianName: "",
    physicianNpi: "",
    physicianPhone: "",
    physicianFax: "",
    physicianAddress: "",
    // Referral fields
    referralSource: "",
    referralDate: "",
    referringPhysicianName: "",
    referringPhysicianNpi: "",
    referringPhysicianPhone: "",
    referringPhysicianFax: "",
    referralNotes: "",
  });

  const fetchClients = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data.clients);
      setError(null);
    } catch {
      setError("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      medicalNotes: "",
      status: "PROSPECT",
      assignedCarerId: "",
      // Insurance fields
      medicaidId: "",
      medicaidPayerId: "",
      secondaryInsuranceId: "",
      secondaryPayerId: "",
      // PCP fields
      physicianName: "",
      physicianNpi: "",
      physicianPhone: "",
      physicianFax: "",
      physicianAddress: "",
      // Referral fields
      referralSource: "",
      referralDate: "",
      referringPhysicianName: "",
      referringPhysicianNpi: "",
      referringPhysicianPhone: "",
      referringPhysicianFax: "",
      referralNotes: "",
    });
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || null,
          address: formData.address || null,
          phone: formData.phone || null,
          medicalNotes: formData.medicalNotes || null,
          status: formData.status,
          assignedCarerId: formData.assignedCarerId || null,
          // Insurance fields
          medicaidId: formData.medicaidId || null,
          medicaidPayerId: formData.medicaidPayerId || null,
          secondaryInsuranceId: formData.secondaryInsuranceId || null,
          secondaryPayerId: formData.secondaryPayerId || null,
          // PCP fields
          physicianName: formData.physicianName || null,
          physicianNpi: formData.physicianNpi || null,
          physicianPhone: formData.physicianPhone || null,
          physicianFax: formData.physicianFax || null,
          physicianAddress: formData.physicianAddress || null,
          // Referral fields
          referralSource: formData.referralSource || null,
          referralDate: formData.referralDate || null,
          referringPhysicianName: formData.referringPhysicianName || null,
          referringPhysicianNpi: formData.referringPhysicianNpi || null,
          referringPhysicianPhone: formData.referringPhysicianPhone || null,
          referringPhysicianFax: formData.referringPhysicianFax || null,
          referralNotes: formData.referralNotes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update client");
      }

      setShowEditModal(false);
      setSelectedClient(null);
      resetForm();
      await fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: ClientData) => {
    try {
      const newStatus = client.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const openEditModal = (client: ClientData) => {
    setSelectedClient(client);
    setSelectedCarer(client.assignedCarer ? {
      id: client.assignedCarer.id,
      firstName: client.assignedCarer.firstName,
      lastName: client.assignedCarer.lastName,
    } : null);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split("T")[0] : "",
      address: client.address || "",
      phone: client.phone || "",
      medicalNotes: client.medicalNotes || "",
      status: client.status,
      assignedCarerId: client.assignedCarer?.id || "",
      // Insurance fields
      medicaidId: client.medicaidId || "",
      medicaidPayerId: client.medicaidPayerId || "",
      secondaryInsuranceId: client.secondaryInsuranceId || "",
      secondaryPayerId: client.secondaryPayerId || "",
      // PCP fields
      physicianName: client.physicianName || "",
      physicianNpi: client.physicianNpi || "",
      physicianPhone: client.physicianPhone || "",
      physicianFax: client.physicianFax || "",
      physicianAddress: client.physicianAddress || "",
      // Referral fields
      referralSource: client.referralSource || "",
      referralDate: client.referralDate ? client.referralDate.split("T")[0] : "",
      referringPhysicianName: client.referringPhysicianName || "",
      referringPhysicianNpi: client.referringPhysicianNpi || "",
      referringPhysicianPhone: client.referringPhysicianPhone || "",
      referringPhysicianFax: client.referringPhysicianFax || "",
      referralNotes: client.referralNotes || "",
    });
    setShowEditModal(true);
  };

  const handleCarerChange = (carerId: string, carer: CarerData | null) => {
    setSelectedCarer(carer);
    setFormData((prev) => ({ ...prev, assignedCarerId: carerId }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-0.5" />
    );
  };

  const filteredAndSortedClients = React.useMemo(() => {
    const result = clients.filter((client) => {
      const matchesSearch =
        !searchQuery ||
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "dob": {
          const aDate = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
          const bDate = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
        case "status":
          comparison = STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
          break;
        case "carer": {
          const aCarerName = a.assignedCarer
            ? `${a.assignedCarer.firstName} ${a.assignedCarer.lastName}`
            : "";
          const bCarerName = b.assignedCarer
            ? `${b.assignedCarer.firstName} ${b.assignedCarer.lastName}`
            : "";
          comparison = aCarerName.localeCompare(bCarerName);
          break;
        }
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Clients</h1>
          <span className="text-xs text-gray-500">{clients.length} total</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            onClick={() => fetchClients()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {canCreateClient && (
            <button
              onClick={() => router.push("/clients/new")}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
              Add Client
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Clients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No clients found</p>
            {canCreateClient && (
              <Button className="mt-4" onClick={() => router.push("/clients/new")}>
                <Plus className="w-4 h-4 mr-1" />
                Add Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort("dob")}
                  >
                    Age / DOB <SortIcon field="dob" />
                  </th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Address</th>
                  <th
                    className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort("carer")}
                  >
                    Assigned Carer <SortIcon field="carer" />
                  </th>
                  <th
                    className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600 w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.map((client, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  return (
                    <tr
                      key={client.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg} ${
                        client.status === "INACTIVE" ? "opacity-60" : ""
                      }`}
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-green-700">
                              {client.firstName[0]}
                              {client.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </span>
                            {client.sponsor && (
                              <div className="text-[10px] text-gray-500">
                                Sponsor: {client.sponsor.firstName} {client.sponsor.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-gray-700">
                        {client.dateOfBirth ? (
                          <div>
                            <span className="text-xs font-medium text-gray-900">{calculateAge(client.dateOfBirth)} yrs</span>
                            <div className="text-[10px] text-gray-500">
                              {formatDate(client.dateOfBirth)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">{client.phone || <span className="text-gray-400">-</span>}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 max-w-[180px] truncate" title={client.address || ""}>
                        {client.address || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">
                        {client.assignedCarer ? (
                          `${client.assignedCarer.firstName} ${client.assignedCarer.lastName}`
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          client.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          client.status === "INACTIVE" ? "bg-red-100 text-red-700" :
                          client.status === "ONBOARDING" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {STATUS_LABELS[client.status]}
                        </span>
                      </td>
                      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            className="p-0.5 text-gray-400 hover:text-blue-600"
                            onClick={() => openEditModal(client)}
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            className="p-0.5 text-gray-400 hover:text-red-600"
                            onClick={() => handleToggleStatus(client)}
                            title={client.status === "INACTIVE" ? "Reactivate" : "Deactivate"}
                          >
                            {client.status === "INACTIVE" ? (
                              <RotateCcw className="h-3 w-3 text-green-600" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
            Showing {filteredAndSortedClients.length} of {clients.length} clients
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Edit Client</CardTitle>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedClient(null);
                  setSelectedCarer(null);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditClient} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    Personal Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editFirstName" required>
                        First Name
                      </Label>
                      <Input
                        id="editFirstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLastName" required>
                        Last Name
                      </Label>
                      <Input
                        id="editLastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                    <DateInput
                      id="editDateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    Contact Information
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editAddress">Address</Label>
                    <Input
                      id="editAddress"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>

                {/* Care Assignment Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Care Assignment
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select
                        id="editStatus"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as ClientStatus,
                          }))
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <StaffSearchSelect
                        value={formData.assignedCarerId}
                        onChange={handleCarerChange}
                        label="Assigned Carer"
                        placeholder="Search for carer..."
                        role="CARER"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Insurance Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editMedicaidId">Medicaid ID</Label>
                      <Input
                        id="editMedicaidId"
                        value={formData.medicaidId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, medicaidId: e.target.value }))
                        }
                        placeholder="Member ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editMedicaidPayerId">Medicaid Payer ID</Label>
                      <Input
                        id="editMedicaidPayerId"
                        value={formData.medicaidPayerId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, medicaidPayerId: e.target.value }))
                        }
                        placeholder="Payer ID"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSecondaryInsuranceId">Secondary Insurance ID</Label>
                      <Input
                        id="editSecondaryInsuranceId"
                        value={formData.secondaryInsuranceId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, secondaryInsuranceId: e.target.value }))
                        }
                        placeholder="Secondary Member ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSecondaryPayerId">Secondary Payer ID</Label>
                      <Input
                        id="editSecondaryPayerId"
                        value={formData.secondaryPayerId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, secondaryPayerId: e.target.value }))
                        }
                        placeholder="Secondary Payer ID"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <HeartPulse className="w-4 h-4 text-primary" />
                    Medical Information
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMedicalNotes">Medical Notes</Label>
                    <Textarea
                      id="editMedicalNotes"
                      value={formData.medicalNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, medicalNotes: e.target.value }))
                      }
                      rows={3}
                      placeholder="Enter medical conditions, medications, or special care requirements..."
                    />
                  </div>
                </div>

                {/* PCP (Primary Care Physician) Information Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    PCP (Primary Care Physician)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPhysicianName">Physician Name</Label>
                      <Input
                        id="editPhysicianName"
                        value={formData.physicianName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, physicianName: e.target.value }))
                        }
                        placeholder="Dr. John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPhysicianNpi">NPI Number</Label>
                      <Input
                        id="editPhysicianNpi"
                        value={formData.physicianNpi}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, physicianNpi: e.target.value }))
                        }
                        placeholder="10-digit NPI"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPhysicianPhone">Phone Number</Label>
                      <Input
                        id="editPhysicianPhone"
                        type="tel"
                        value={formData.physicianPhone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, physicianPhone: e.target.value }))
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPhysicianFax">Fax Number</Label>
                      <Input
                        id="editPhysicianFax"
                        type="tel"
                        value={formData.physicianFax}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, physicianFax: e.target.value }))
                        }
                        placeholder="(555) 123-4568"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhysicianAddress">Office Address</Label>
                    <Input
                      id="editPhysicianAddress"
                      value={formData.physicianAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, physicianAddress: e.target.value }))
                      }
                      placeholder="123 Medical Center Dr, City, State 12345"
                    />
                  </div>
                </div>

                {/* Referral Information Section */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Referral Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editReferralSource">Referral Source</Label>
                      <Input
                        id="editReferralSource"
                        value={formData.referralSource}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referralSource: e.target.value }))
                        }
                        placeholder="Hospital, Physician, Self, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editReferralDate">Referral Date</Label>
                      <DateInput
                        id="editReferralDate"
                        value={formData.referralDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referralDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editReferringPhysicianName">Referring Physician Name</Label>
                      <Input
                        id="editReferringPhysicianName"
                        value={formData.referringPhysicianName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referringPhysicianName: e.target.value }))
                        }
                        placeholder="Dr. Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editReferringPhysicianNpi">Referring Physician NPI</Label>
                      <Input
                        id="editReferringPhysicianNpi"
                        value={formData.referringPhysicianNpi}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referringPhysicianNpi: e.target.value }))
                        }
                        placeholder="10-digit NPI"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editReferringPhysicianPhone">Referring Physician Phone</Label>
                      <Input
                        id="editReferringPhysicianPhone"
                        type="tel"
                        value={formData.referringPhysicianPhone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referringPhysicianPhone: e.target.value }))
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editReferringPhysicianFax">Referring Physician Fax</Label>
                      <Input
                        id="editReferringPhysicianFax"
                        type="tel"
                        value={formData.referringPhysicianFax}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referringPhysicianFax: e.target.value }))
                        }
                        placeholder="(555) 123-4568"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editReferralNotes">Referral Notes</Label>
                    <Textarea
                      id="editReferralNotes"
                      value={formData.referralNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, referralNotes: e.target.value }))
                      }
                      rows={2}
                      placeholder="Additional referral information..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedClient(null);
                      setSelectedCarer(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
