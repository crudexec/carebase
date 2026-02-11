"use client";

import * as React from "react";
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
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  X,
  Users,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Mail,
  Heart,
  AlertTriangle,
  Power,
} from "lucide-react";

interface SponsoredClient {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface Sponsor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  clientCount: number;
  sponsoredClients: SponsoredClient[];
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

type SortField = "name" | "email" | "clients" | "lastLogin" | "status";
type SortDirection = "asc" | "desc";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(null);
  const [sponsorToDelete, setSponsorToDelete] = React.useState<Sponsor | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state for adding sponsor directly
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    clientId: "",
  });

  // Form state for inviting sponsor
  const [inviteFormData, setInviteFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    clientId: "",
  });

  // Client search state for Add modal
  const [clientSearch, setClientSearch] = React.useState("");
  const [clientSuggestions, setClientSuggestions] = React.useState<Client[]>([]);
  const [selectedClientName, setSelectedClientName] = React.useState("");
  const [showClientDropdown, setShowClientDropdown] = React.useState(false);

  // Client search state for Invite modal
  const [inviteClientSearch, setInviteClientSearch] = React.useState("");
  const [inviteClientSuggestions, setInviteClientSuggestions] = React.useState<Client[]>([]);
  const [inviteSelectedClientName, setInviteSelectedClientName] = React.useState("");
  const [showInviteClientDropdown, setShowInviteClientDropdown] = React.useState(false);

  // Client management state for Edit modal
  const [editAssignedClients, setEditAssignedClients] = React.useState<SponsoredClient[]>([]);
  const [editClientSearch, setEditClientSearch] = React.useState("");
  const [editClientSuggestions, setEditClientSuggestions] = React.useState<Client[]>([]);
  const [showEditClientDropdown, setShowEditClientDropdown] = React.useState(false);
  const [clientsToAdd, setClientsToAdd] = React.useState<string[]>([]);
  const [clientsToRemove, setClientsToRemove] = React.useState<string[]>([]);

  // Refs for click outside handling
  const clientDropdownRef = React.useRef<HTMLDivElement>(null);
  const inviteClientDropdownRef = React.useRef<HTMLDivElement>(null);
  const editClientDropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchSponsors = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/sponsors?${params}`);
      if (!response.ok) throw new Error("Failed to fetch sponsors");
      const data = await response.json();
      setSponsors(data.sponsors);
      setError(null);
    } catch {
      setError("Failed to load sponsors");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  // Search clients for autocomplete
  const searchClients = React.useCallback(async (query: string, setter: (clients: Client[]) => void) => {
    if (!query || query.length < 2) {
      setter([]);
      return;
    }
    try {
      const response = await fetch(`/api/clients?search=${encodeURIComponent(query)}&status=ACTIVE&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setter(data.clients || []);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  React.useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  // Debounced client search for Add modal
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch, setClientSuggestions);
      } else {
        setClientSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  // Debounced client search for Invite modal
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteClientSearch) {
        searchClients(inviteClientSearch, setInviteClientSuggestions);
      } else {
        setInviteClientSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteClientSearch, searchClients]);

  // Debounced client search for Edit modal
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (editClientSearch) {
        searchClients(editClientSearch, setEditClientSuggestions);
      } else {
        setEditClientSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [editClientSearch, searchClients]);

  // Click outside handler for dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      if (inviteClientDropdownRef.current && !inviteClientDropdownRef.current.contains(event.target as Node)) {
        setShowInviteClientDropdown(false);
      }
      if (editClientDropdownRef.current && !editClientDropdownRef.current.contains(event.target as Node)) {
        setShowEditClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      clientId: "",
    });
    setClientSearch("");
    setClientSuggestions([]);
    setSelectedClientName("");
    setShowClientDropdown(false);
  };

  const resetInviteForm = () => {
    setInviteFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      clientId: "",
    });
    setInviteClientSearch("");
    setInviteClientSuggestions([]);
    setInviteSelectedClientName("");
    setShowInviteClientDropdown(false);
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientId: formData.clientId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add sponsor");
      }

      setShowAddModal(false);
      resetForm();
      await fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sponsor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sponsors/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inviteFormData,
          clientId: inviteFormData.clientId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invite");
      }

      setShowInviteModal(false);
      resetInviteForm();
      setError(null);
      // Show success message
      alert("Invitation sent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsor) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/sponsors/${selectedSponsor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
          ...(formData.password ? { password: formData.password } : {}),
          clientsToAdd: clientsToAdd.length > 0 ? clientsToAdd : undefined,
          clientsToRemove: clientsToRemove.length > 0 ? clientsToRemove : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update sponsor");
      }

      setShowEditModal(false);
      setSelectedSponsor(null);
      resetEditForm();
      await fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sponsor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      const response = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sponsor.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDeleteSponsor = async () => {
    if (!sponsorToDelete) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/sponsors/${sponsorToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete sponsor");
      }

      setShowDeleteModal(false);
      setSponsorToDelete(null);
      await fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sponsor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (sponsor: Sponsor) => {
    setSponsorToDelete(sponsor);
    setShowDeleteModal(true);
  };

  const openEditModal = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setFormData({
      email: sponsor.email,
      password: "",
      firstName: sponsor.firstName,
      lastName: sponsor.lastName,
      phone: sponsor.phone || "",
      clientId: "",
    });
    // Load assigned clients
    setEditAssignedClients(sponsor.sponsoredClients || []);
    setClientsToAdd([]);
    setClientsToRemove([]);
    setEditClientSearch("");
    setEditClientSuggestions([]);
    setShowEditClientDropdown(false);
    setShowEditModal(true);
  };

  const resetEditForm = () => {
    resetForm();
    setEditAssignedClients([]);
    setClientsToAdd([]);
    setClientsToRemove([]);
    setEditClientSearch("");
    setEditClientSuggestions([]);
    setShowEditClientDropdown(false);
  };

  const handleAddClientToEdit = (client: Client) => {
    // Check if already assigned or already in the add list
    const alreadyAssigned = editAssignedClients.some((c) => c.id === client.id);
    const alreadyInAddList = clientsToAdd.includes(client.id);

    if (!alreadyAssigned && !alreadyInAddList) {
      // Add to the UI list
      setEditAssignedClients((prev) => [
        ...prev,
        { id: client.id, firstName: client.firstName, lastName: client.lastName, status: client.status },
      ]);
      // Track for API call
      setClientsToAdd((prev) => [...prev, client.id]);
      // If it was marked for removal, unmark it
      setClientsToRemove((prev) => prev.filter((id) => id !== client.id));
    }
    setEditClientSearch("");
    setEditClientSuggestions([]);
    setShowEditClientDropdown(false);
  };

  const handleRemoveClientFromEdit = (clientId: string) => {
    // Remove from UI list
    setEditAssignedClients((prev) => prev.filter((c) => c.id !== clientId));
    // If it was newly added, just remove from add list
    if (clientsToAdd.includes(clientId)) {
      setClientsToAdd((prev) => prev.filter((id) => id !== clientId));
    } else {
      // Otherwise mark for removal
      setClientsToRemove((prev) => [...prev, clientId]);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  const filteredAndSortedSponsors = React.useMemo(() => {
    const result = sponsors.filter((sponsor) => {
      const matchesSearch =
        !searchQuery ||
        `${sponsor.firstName} ${sponsor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sponsor.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && sponsor.isActive) ||
        (statusFilter === "inactive" && !sponsor.isActive);
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "clients":
          comparison = a.clientCount - b.clientCount;
          break;
        case "lastLogin": {
          const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
        case "status":
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [sponsors, searchQuery, statusFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Sponsors</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage family members and sponsors for your clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchSponsors()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
            <Mail className="w-4 h-4 mr-1" />
            Invite Sponsor
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Sponsor
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
                placeholder="Search by name or email..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

      {/* Sponsors Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedSponsors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No sponsors found</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
                <Mail className="w-4 h-4 mr-1" />
                Invite Sponsor
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Sponsor
              </Button>
            </div>
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
                    onClick={() => handleSort("email")}
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Phone</th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("clients")}
                  >
                    Clients <SortIcon field="clients" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("lastLogin")}
                  >
                    Last Login <SortIcon field="lastLogin" />
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
                {filteredAndSortedSponsors.map((sponsor) => (
                  <tr
                    key={sponsor.id}
                    className={`border-b border-border hover:bg-background-secondary/50 transition-colors ${
                      !sponsor.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-warning">
                            {sponsor.firstName[0]}
                            {sponsor.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium">
                          {sponsor.firstName} {sponsor.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">{sponsor.email}</td>
                    <td className="p-4 text-foreground-secondary">{sponsor.phone || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-foreground-tertiary" />
                        <span>{sponsor.clientCount}</span>
                        {sponsor.sponsoredClients.length > 0 && (
                          <span className="text-foreground-tertiary text-sm ml-1">
                            ({sponsor.sponsoredClients.map((c) => `${c.firstName} ${c.lastName[0]}.`).join(", ")})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">{formatDate(sponsor.lastLogin)}</td>
                    <td className="p-4">
                      <Badge variant={sponsor.isActive ? "success" : "error"}>
                        {sponsor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(sponsor)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(sponsor)}
                          title={sponsor.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {sponsor.isActive ? (
                            <Power className="w-4 h-4 text-warning" />
                          ) : (
                            <RotateCcw className="w-4 h-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(sponsor)}
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border text-sm text-foreground-secondary">
            Showing {filteredAndSortedSponsors.length} of {sponsors.length} sponsors
          </div>
        </Card>
      )}

      {/* Add Sponsor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Add Sponsor</CardTitle>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSponsor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" required>
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" required>
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-foreground-tertiary">
                    Minimum 8 characters. The sponsor will receive this password via email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Assign to Client (Optional)</Label>
                  <div className="relative" ref={clientDropdownRef}>
                    <Input
                      id="clientId"
                      placeholder="Start typing to search clients..."
                      value={selectedClientName || clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setSelectedClientName("");
                        setFormData((prev) => ({ ...prev, clientId: "" }));
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      autoComplete="off"
                    />
                    {selectedClientName && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                        onClick={() => {
                          setSelectedClientName("");
                          setClientSearch("");
                          setFormData((prev) => ({ ...prev, clientId: "" }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {showClientDropdown && clientSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {clientSuggestions.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, clientId: client.id }));
                              setSelectedClientName(`${client.firstName} ${client.lastName}`);
                              setClientSearch("");
                              setShowClientDropdown(false);
                            }}
                          >
                            {client.firstName} {client.lastName}
                          </button>
                        ))}
                      </div>
                    )}
                    {showClientDropdown && clientSearch.length >= 2 && clientSuggestions.length === 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-foreground-tertiary">
                        No clients found
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground-tertiary">
                    Type at least 2 characters to search
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Sponsor"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Sponsor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Invite Sponsor</CardTitle>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  resetInviteForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-foreground-secondary mb-4">
                Send an email invitation to the sponsor. They will be able to create their own password when they accept the invitation.
              </p>
              <form onSubmit={handleInviteSponsor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteFirstName" required>
                      First Name
                    </Label>
                    <Input
                      id="inviteFirstName"
                      value={inviteFormData.firstName}
                      onChange={(e) =>
                        setInviteFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteLastName" required>
                      Last Name
                    </Label>
                    <Input
                      id="inviteLastName"
                      value={inviteFormData.lastName}
                      onChange={(e) =>
                        setInviteFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteEmail" required>
                    Email
                  </Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteFormData.email}
                    onChange={(e) =>
                      setInviteFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invitePhone">Phone</Label>
                  <Input
                    id="invitePhone"
                    type="tel"
                    value={inviteFormData.phone}
                    onChange={(e) =>
                      setInviteFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteClientId">Pre-assign to Client (Optional)</Label>
                  <div className="relative" ref={inviteClientDropdownRef}>
                    <Input
                      id="inviteClientId"
                      placeholder="Start typing to search clients..."
                      value={inviteSelectedClientName || inviteClientSearch}
                      onChange={(e) => {
                        setInviteClientSearch(e.target.value);
                        setInviteSelectedClientName("");
                        setInviteFormData((prev) => ({ ...prev, clientId: "" }));
                        setShowInviteClientDropdown(true);
                      }}
                      onFocus={() => setShowInviteClientDropdown(true)}
                      autoComplete="off"
                    />
                    {inviteSelectedClientName && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                        onClick={() => {
                          setInviteSelectedClientName("");
                          setInviteClientSearch("");
                          setInviteFormData((prev) => ({ ...prev, clientId: "" }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {showInviteClientDropdown && inviteClientSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {inviteClientSuggestions.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm"
                            onClick={() => {
                              setInviteFormData((prev) => ({ ...prev, clientId: client.id }));
                              setInviteSelectedClientName(`${client.firstName} ${client.lastName}`);
                              setInviteClientSearch("");
                              setShowInviteClientDropdown(false);
                            }}
                          >
                            {client.firstName} {client.lastName}
                          </button>
                        ))}
                      </div>
                    )}
                    {showInviteClientDropdown && inviteClientSearch.length >= 2 && inviteClientSuggestions.length === 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-foreground-tertiary">
                        No clients found
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground-tertiary">
                    Type at least 2 characters to search
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowInviteModal(false);
                      resetInviteForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Mail className="w-4 h-4 mr-1" />
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Sponsor Modal */}
      {showEditModal && selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Edit Sponsor</CardTitle>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSponsor(null);
                  resetEditForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSponsor} className="space-y-4">
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
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-background-tertiary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPassword">
                    New Password (leave blank to keep current)
                  </Label>
                  <Input
                    id="editPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    minLength={8}
                  />
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
                  />
                </div>

                {/* Client Management Section */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label>Assigned Clients</Label>

                  {/* Currently assigned clients */}
                  {editAssignedClients.length > 0 ? (
                    <div className="space-y-2">
                      {editAssignedClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-2 bg-background-secondary rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-foreground-tertiary" />
                            <span className="text-sm">
                              {client.firstName} {client.lastName}
                            </span>
                            <Badge variant={client.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
                              {client.status}
                            </Badge>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveClientFromEdit(client.id)}
                            className="text-foreground-tertiary hover:text-error p-1"
                            title="Remove client"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-tertiary py-2">
                      No clients assigned to this sponsor
                    </p>
                  )}

                  {/* Add client search */}
                  <div className="relative pt-2" ref={editClientDropdownRef}>
                    <Input
                      placeholder="Search clients to add..."
                      value={editClientSearch}
                      onChange={(e) => {
                        setEditClientSearch(e.target.value);
                        setShowEditClientDropdown(true);
                      }}
                      onFocus={() => setShowEditClientDropdown(true)}
                      autoComplete="off"
                    />
                    {showEditClientDropdown && editClientSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {editClientSuggestions
                          .filter((client) => !editAssignedClients.some((c) => c.id === client.id))
                          .map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm flex items-center justify-between"
                              onClick={() => handleAddClientToEdit(client)}
                            >
                              <span>{client.firstName} {client.lastName}</span>
                              <Plus className="w-4 h-4 text-success" />
                            </button>
                          ))}
                        {editClientSuggestions.filter((client) => !editAssignedClients.some((c) => c.id === client.id)).length === 0 && (
                          <div className="px-3 py-2 text-sm text-foreground-tertiary">
                            All matching clients are already assigned
                          </div>
                        )}
                      </div>
                    )}
                    {showEditClientDropdown && editClientSearch.length >= 2 && editClientSuggestions.length === 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-foreground-tertiary">
                        No clients found
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground-tertiary">
                    Type at least 2 characters to search for clients
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSponsor(null);
                      resetEditForm();
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sponsorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-5 h-5" />
                Delete Sponsor
              </CardTitle>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSponsorToDelete(null);
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground-secondary">
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground">
                  {sponsorToDelete.firstName} {sponsorToDelete.lastName}
                </strong>
                ?
              </p>
              <div className="p-3 rounded-md bg-error/10 text-sm">
                <p className="font-medium text-error">Warning: This action cannot be undone.</p>
                <p className="text-foreground-secondary mt-1">
                  The sponsor will be permanently removed from the system along with their login access.
                  {sponsorToDelete.clientCount > 0 && (
                    <span className="block mt-1">
                      This sponsor is currently assigned to {sponsorToDelete.clientCount} client(s).
                    </span>
                  )}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSponsorToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="error"
                  onClick={handleDeleteSponsor}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Permanently"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
