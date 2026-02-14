"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClientStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
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

interface CarerOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: "Prospect",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const STATUS_COLORS: Record<ClientStatus, "primary" | "success" | "warning" | "error" | "default"> = {
  PROSPECT: "default",
  ONBOARDING: "warning",
  ACTIVE: "success",
  INACTIVE: "error",
};

type SortField = "name" | "dob" | "status" | "carer" | "createdAt";
type SortDirection = "asc" | "desc";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<ClientData[]>([]);
  const [carers, setCarers] = React.useState<CarerOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<ClientData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const fetchCarers = React.useCallback(async () => {
    try {
      const response = await fetch("/api/staff?role=CARER&limit=100");
      if (response.ok) {
        const data = await response.json();
        setCarers(data.staff);
      }
    } catch {
      // Ignore errors for carers list
    }
  }, []);

  React.useEffect(() => {
    fetchClients();
    fetchCarers();
  }, [fetchClients, fetchCarers]);

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
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Client Management</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage your care recipients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchClients()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/clients/new")}>
            <Plus className="w-4 h-4 mr-1" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

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
            <Button className="mt-4" onClick={() => router.push("/clients/new")}>
              <Plus className="w-4 h-4 mr-1" />
              Add Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("dob")}
                  >
                    Age / DOB <SortIcon field="dob" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Phone</th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Address</th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("carer")}
                  >
                    Assigned Carer <SortIcon field="carer" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className={`border-b border-border hover:bg-background-secondary/50 transition-colors cursor-pointer ${
                      client.status === "INACTIVE" ? "opacity-60" : ""
                    }`}
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-success">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            {client.firstName} {client.lastName}
                          </span>
                          {client.sponsor && (
                            <div className="text-xs text-foreground-tertiary">
                              Sponsor: {client.sponsor.firstName} {client.sponsor.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {client.dateOfBirth ? (
                        <div>
                          <span className="font-medium">{calculateAge(client.dateOfBirth)} yrs</span>
                          <div className="text-xs text-foreground-tertiary">
                            {formatDate(client.dateOfBirth)}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 text-foreground-secondary">{client.phone || "-"}</td>
                    <td className="p-4 text-foreground-secondary max-w-[200px] truncate" title={client.address || ""}>
                      {client.address || "-"}
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {client.assignedCarer ? (
                        `${client.assignedCarer.firstName} ${client.assignedCarer.lastName}`
                      ) : (
                        <span className="text-foreground-tertiary">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={STATUS_COLORS[client.status]}>
                        {STATUS_LABELS[client.status]}
                      </Badge>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(client)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(client)}
                          title={client.status === "INACTIVE" ? "Reactivate" : "Deactivate"}
                        >
                          {client.status === "INACTIVE" ? (
                            <RotateCcw className="w-4 h-4 text-success" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-error" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border text-sm text-foreground-secondary">
            Showing {filteredAndSortedClients.length} of {clients.length} clients
          </div>
        </Card>
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
                    <Input
                      id="editDateOfBirth"
                      type="date"
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
                    <div className="space-y-2">
                      <Label htmlFor="editAssignedCarerId">Assigned Carer</Label>
                      <Select
                        id="editAssignedCarerId"
                        value={formData.assignedCarerId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            assignedCarerId: e.target.value,
                          }))
                        }
                      >
                        <option value="">No Carer Assigned</option>
                        {carers.map((carer) => (
                          <option key={carer.id} value={carer.id}>
                            {carer.firstName} {carer.lastName}
                          </option>
                        ))}
                      </Select>
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
                      <Input
                        id="editReferralDate"
                        type="date"
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
