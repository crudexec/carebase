"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  ConfirmActionModal,
} from "@/components/ui";
import { DataTable, ColumnDef, SortDirection, StatusCell, DateCell } from "@/components/ui/data-table";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  X,
  User,
  RotateCcw,
} from "lucide-react";
import { ProfileFieldsRenderer } from "@/components/profile-fields/profile-fields-renderer";
import { FieldValue } from "@/lib/visit-notes/types";

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  profileData: Record<string, FieldValue> | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPS_MANAGER: "Ops Manager",
  CLINICAL_DIRECTOR: "Clinical Director",
  STAFF: "Staff",
  SUPERVISOR: "Supervisor",
  CARER: "Carer",
  SPONSOR: "Sponsor",
};

const ROLE_COLORS: Record<UserRole, "primary" | "success" | "warning" | "error" | "default"> = {
  ADMIN: "error",
  OPS_MANAGER: "warning",
  CLINICAL_DIRECTOR: "warning",
  STAFF: "primary",
  SUPERVISOR: "primary",
  CARER: "success",
  SPONSOR: "default",
};

const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "STAFF",
  "SUPERVISOR",
  "CARER",
];

type SortField = "name" | "email" | "role" | "lastLogin" | "status";

export default function StaffPage() {
  const { data: _session } = useSession();
  const router = useRouter();
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("active"); // Default to active
  const [sortField, setSortField] = React.useState<SortField | null>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Deactivate confirmation modal
  const [deactivateModal, setDeactivateModal] = React.useState<{
    isOpen: boolean;
    member: StaffMember | null;
  }>({ isOpen: false, member: null });

  // Track which member is being deactivated for fade animation
  const [deactivatingId, setDeactivatingId] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CARER" as UserRole,
    phone: "",
    profileData: {} as Record<string, FieldValue>,
  });

  const fetchStaff = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);

      const response = await fetch(`/api/staff?${params}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data.staff);
      setError(null);
    } catch {
      setError("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roleFilter]);

  React.useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "CARER",
      phone: "",
      profileData: {},
    });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add staff member");
      }

      setShowAddModal(false);
      resetForm();
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone || null,
          profileData: Object.keys(formData.profileData).length > 0 ? formData.profileData : null,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update staff member");
      }

      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateClick = (member: StaffMember) => {
    if (member.isActive) {
      // Show confirmation for deactivation
      setDeactivateModal({ isOpen: true, member });
    } else {
      // Reactivate without confirmation
      handleReactivate(member);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateModal.member) return;

    const member = deactivateModal.member;

    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate staff member");
      }

      // Start fade-out animation
      setDeactivatingId(member.id);
      // Wait for animation, then update state
      setTimeout(() => {
        setStaff((prev) =>
          prev.map((s) => (s.id === member.id ? { ...s, isActive: false } : s))
        );
        setDeactivatingId(null);
      }, 300);
      toast.success(`${member.firstName} ${member.lastName} has been deactivated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate staff member");
      toast.error("Failed to deactivate staff member");
      throw err;
    }
  };

  const handleReactivate = async (member: StaffMember) => {
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate staff member");
      }

      // Update state optimistically
      setStaff((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, isActive: true } : s))
      );
      toast.success(`${member.firstName} ${member.lastName} has been reactivated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate staff member");
      toast.error("Failed to reactivate staff member");
    }
  };

  const openEditModal = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      email: member.email,
      password: "",
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      phone: member.phone || "",
      profileData: (member.profileData as Record<string, FieldValue>) || {},
    });
    setShowEditModal(true);
  };

  const handleSortChange = (column: string, direction: SortDirection) => {
    setSortField(direction ? (column as SortField) : null);
    setSortDirection(direction);
  };

  const filteredAndSortedStaff = React.useMemo(() => {
    const result = staff.filter((member) => {
      const matchesSearch =
        !searchQuery ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || member.role === roleFilter;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && member.isActive) ||
        (statusFilter === "inactive" && !member.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "name":
            comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            break;
          case "email":
            comparison = a.email.localeCompare(b.email);
            break;
          case "role":
            comparison = ROLE_LABELS[a.role].localeCompare(ROLE_LABELS[b.role]);
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
    }

    return result;
  }, [staff, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Staff Management</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchStaff()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Staff
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Roles</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-36"
            >
              <option value="">All Status</option>
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

      {/* Staff Table */}
      {(() => {
        const columns: ColumnDef<StaffMember>[] = [
          {
            id: "name",
            header: "Name",
            sortable: true,
            cell: (member) => (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-medium text-green-700">
                    {member.firstName[0]}{member.lastName[0]}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </span>
              </div>
            ),
          },
          {
            id: "email",
            header: "Email",
            accessorKey: "email",
            sortable: true,
          },
          {
            id: "role",
            header: "Role",
            sortable: true,
            cell: (member) => (
              <StatusCell
                status={member.role}
                label={ROLE_LABELS[member.role]}
                variant={ROLE_COLORS[member.role]}
              />
            ),
          },
          {
            id: "phone",
            header: "Phone",
            cell: (member) => member.phone || "-",
          },
          {
            id: "lastLogin",
            header: "Last Login",
            sortable: true,
            cell: (member) => <DateCell date={member.lastLogin} />,
          },
          {
            id: "status",
            header: "Status",
            sortable: true,
            cell: (member) => (
              <StatusCell
                status={member.isActive ? "active" : "inactive"}
                label={member.isActive ? "Active" : "Inactive"}
                variant={member.isActive ? "success" : "error"}
              />
            ),
          },
        ];

        return (
          <>
            <DataTable
              data={filteredAndSortedStaff}
              columns={columns}
              isLoading={isLoading}
              getRowKey={(member) => member.id}
              onRowClick={(member) => router.push(`/staff/${member.id}`)}
              sortColumn={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              emptyIcon={<User className="w-8 h-8" />}
              emptyMessage="No staff members found"
              emptyState={
                <div className="text-center">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No staff members found</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Staff Member
                  </Button>
                </div>
              }
              getRowClassName={(member) =>
                `${!member.isActive ? "opacity-60" : ""} ${
                  deactivatingId === member.id ? "opacity-0 scale-95" : ""
                }`
              }
              rowActions={(member) => (
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(member)}
                    title="Edit"
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivateClick(member)}
                    title={member.isActive ? "Deactivate" : "Reactivate"}
                    className="h-6 w-6 p-0"
                  >
                    {member.isActive ? (
                      <Trash2 className="w-3 h-3 text-red-500" />
                    ) : (
                      <RotateCcw className="w-3 h-3 text-green-500" />
                    )}
                  </Button>
                </div>
              )}
            />
            {filteredAndSortedStaff.length > 0 && (
              <div className="mt-2 text-[11px] text-gray-500">
                Showing {filteredAndSortedStaff.length} of {staff.length} staff members
              </div>
            )}
          </>
        );
      })()}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Add Staff Member</CardTitle>
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
              <form onSubmit={handleAddStaff} className="space-y-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" required>
                    Role
                  </Label>
                  <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as UserRole,
                      }))
                    }
                    required
                  >
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
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

                {/* Custom Profile Fields */}
                <ProfileFieldsRenderer
                  type="STAFF_PROFILE"
                  data={formData.profileData}
                  onChange={(data) =>
                    setFormData((prev) => ({ ...prev, profileData: data }))
                  }
                />

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
                    {isSubmitting ? "Adding..." : "Add Staff"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Edit Staff Member</CardTitle>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditStaff} className="space-y-4">
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
                  <Label htmlFor="editRole" required>
                    Role
                  </Label>
                  <Select
                    id="editRole"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as UserRole,
                      }))
                    }
                    required
                  >
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
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

                {/* Custom Profile Fields */}
                <ProfileFieldsRenderer
                  type="STAFF_PROFILE"
                  data={formData.profileData}
                  onChange={(data) =>
                    setFormData((prev) => ({ ...prev, profileData: data }))
                  }
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
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

      {/* Deactivate Confirmation Modal */}
      <ConfirmActionModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, member: null })}
        onConfirm={handleDeactivateConfirm}
        variant="warning"
        title="Deactivate Staff Member"
        description="Are you sure you want to deactivate this staff member? They will no longer be able to log in."
        itemName={deactivateModal.member ? `${deactivateModal.member.firstName} ${deactivateModal.member.lastName}` : undefined}
        confirmText="Deactivate"
      />
    </div>
  );
}
