"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CredentialCategory } from "@prisma/client";
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
  Checkbox,
  Breadcrumb,
} from "@/components/ui";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  X,
  Award,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

interface CredentialType {
  id: string;
  name: string;
  category: CredentialCategory;
  description: string | null;
  defaultValidityMonths: number;
  isRequired: boolean;
  requiredForRoles: string[];
  reminderDays: number[];
  isActive: boolean;
  _count?: {
    credentials: number;
  };
  createdAt: string;
}

const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  LICENSE: "License",
  CERTIFICATION: "Certification",
  HEALTH: "Health",
  TRAINING: "Training",
  COMPLIANCE: "Compliance",
  OTHER: "Other",
};

const CATEGORY_COLORS: Record<CredentialCategory, "primary" | "success" | "warning" | "error" | "default"> = {
  LICENSE: "primary",
  CERTIFICATION: "success",
  HEALTH: "warning",
  TRAINING: "default",
  COMPLIANCE: "error",
  OTHER: "default",
};

const ROLE_OPTIONS = [
  { value: "CARER", label: "Caregiver" },
  { value: "STAFF", label: "Staff" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

type SortField = "name" | "category" | "validity" | "credentials";
type SortDirection = "asc" | "desc";

export default function CredentialTypesPage() {
  const router = useRouter();
  const [credentialTypes, setCredentialTypes] = React.useState<CredentialType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<CredentialType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    category: "LICENSE" as CredentialCategory,
    description: "",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: [] as string[],
    reminderDays: "60, 30, 14, 7",
  });

  const fetchCredentialTypes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);

      const response = await fetch(`/api/credentials/types?${params}`);
      if (!response.ok) throw new Error("Failed to fetch credential types");
      const data = await response.json();
      setCredentialTypes(data.credentialTypes);
      setError(null);
    } catch {
      setError("Failed to load credential types");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  React.useEffect(() => {
    fetchCredentialTypes();
  }, [fetchCredentialTypes]);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "LICENSE",
      description: "",
      defaultValidityMonths: 24,
      isRequired: false,
      requiredForRoles: [],
      reminderDays: "60, 30, 14, 7",
    });
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reminderDaysArray = formData.reminderDays
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d) && d > 0)
        .sort((a, b) => b - a);

      const response = await fetch("/api/credentials/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          defaultValidityMonths: formData.defaultValidityMonths,
          isRequired: formData.isRequired,
          requiredForRoles: formData.requiredForRoles,
          reminderDays: reminderDaysArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add credential type");
      }

      setShowAddModal(false);
      resetForm();
      await fetchCredentialTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credential type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setIsSubmitting(true);

    try {
      const reminderDaysArray = formData.reminderDays
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d) && d > 0)
        .sort((a, b) => b - a);

      const response = await fetch(`/api/credentials/types/${selectedType.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          defaultValidityMonths: formData.defaultValidityMonths,
          isRequired: formData.isRequired,
          requiredForRoles: formData.requiredForRoles,
          reminderDays: reminderDaysArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update credential type");
      }

      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
      await fetchCredentialTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update credential type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (type: CredentialType) => {
    try {
      const response = await fetch(`/api/credentials/types/${type.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !type.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      await fetchCredentialTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (type: CredentialType) => {
    if (!confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/types/${type.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete credential type");
      }

      await fetchCredentialTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credential type");
    }
  };

  const openEditModal = (type: CredentialType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      category: type.category,
      description: type.description || "",
      defaultValidityMonths: type.defaultValidityMonths,
      isRequired: type.isRequired,
      requiredForRoles: type.requiredForRoles,
      reminderDays: type.reminderDays.join(", "),
    });
    setShowEditModal(true);
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

  const filteredAndSortedTypes = React.useMemo(() => {
    const result = credentialTypes.filter((type) => {
      const matchesSearch =
        !searchQuery ||
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (type.description && type.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !categoryFilter || type.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = CATEGORY_LABELS[a.category].localeCompare(CATEGORY_LABELS[b.category]);
          break;
        case "validity":
          comparison = a.defaultValidityMonths - b.defaultValidityMonths;
          break;
        case "credentials":
          comparison = (a._count?.credentials || 0) - (b._count?.credentials || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [credentialTypes, searchQuery, categoryFilter, sortField, sortDirection]);

  const breadcrumbItems = [
    { label: "Credentials", href: "/credentials" },
    { label: "Credential Types" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Credential Types</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Configure the types of credentials your organization tracks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/credentials")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fetchCredentialTypes()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Type
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
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
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

      {/* Types Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedTypes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No credential types found</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Credential Type
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
                    onClick={() => handleSort("category")}
                  >
                    Category <SortIcon field="category" />
                  </th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("validity")}
                  >
                    Validity <SortIcon field="validity" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Reminders</th>
                  <th
                    className="text-left p-4 font-medium text-foreground-secondary cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("credentials")}
                  >
                    In Use <SortIcon field="credentials" />
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">Status</th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTypes.map((type) => (
                  <tr
                    key={type.id}
                    className={`border-b border-border hover:bg-background-secondary/50 transition-colors ${
                      !type.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {type.name}
                          {type.isRequired && (
                            <span className="ml-2 text-xs text-warning">(Required)</span>
                          )}
                        </p>
                        {type.description && (
                          <p className="text-xs text-foreground-secondary line-clamp-1">
                            {type.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={CATEGORY_COLORS[type.category]}>
                        {CATEGORY_LABELS[type.category]}
                      </Badge>
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {type.defaultValidityMonths === 0
                        ? "No expiration"
                        : `${type.defaultValidityMonths} months`}
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {type.reminderDays.length > 0
                        ? type.reminderDays.map((d) => `${d}d`).join(", ")
                        : "None"}
                    </td>
                    <td className="p-4 text-foreground-secondary">{type._count?.credentials || 0}</td>
                    <td className="p-4">
                      <Badge variant={type.isActive ? "success" : "error"}>
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(type)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(type)}
                          title={type.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {type.isActive ? (
                            <Trash2 className="w-4 h-4 text-error" />
                          ) : (
                            <RotateCcw className="w-4 h-4 text-success" />
                          )}
                        </Button>
                        {(type._count?.credentials || 0) === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(type)}
                            title="Delete permanently"
                          >
                            <X className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border text-sm text-foreground-secondary">
            Showing {filteredAndSortedTypes.length} of {credentialTypes.length} credential types
          </div>
        </Card>
      )}

      {/* Add Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Add Credential Type</CardTitle>
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
              <form onSubmit={handleAddType} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" required>
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., CPR Certification"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" required>
                    Category
                  </Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as CredentialCategory,
                      }))
                    }
                    required
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Optional description..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityMonths" required>
                    Default Validity (months)
                  </Label>
                  <Input
                    id="validityMonths"
                    type="number"
                    min="0"
                    value={formData.defaultValidityMonths}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultValidityMonths: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-foreground-secondary">Use 0 for credentials that don't expire</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days (comma-separated)</Label>
                  <Input
                    id="reminderDays"
                    value={formData.reminderDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reminderDays: e.target.value }))
                    }
                    placeholder="e.g., 60, 30, 14, 7"
                  />
                  <p className="text-xs text-foreground-secondary">
                    Days before expiration to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Checkbox
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isRequired: e.target.checked }))
                    }
                    label="This credential is required for employment"
                  />
                </div>

                {formData.isRequired && (
                  <div className="space-y-2">
                    <Label>Required for Roles</Label>
                    <div className="space-y-2">
                      {ROLE_OPTIONS.map((role) => (
                        <Checkbox
                          key={role.value}
                          id={`role-${role.value}`}
                          checked={formData.requiredForRoles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                requiredForRoles: [...prev.requiredForRoles, role.value],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                requiredForRoles: prev.requiredForRoles.filter((r) => r !== role.value),
                              }));
                            }
                          }}
                          label={role.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

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
                    {isSubmitting ? "Adding..." : "Add Type"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Type Modal */}
      {showEditModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10">
              <CardTitle>Edit Credential Type</CardTitle>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedType(null);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditType} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editName" required>
                    Name
                  </Label>
                  <Input
                    id="editName"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCategory" required>
                    Category
                  </Label>
                  <Select
                    id="editCategory"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as CredentialCategory,
                      }))
                    }
                    required
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Input
                    id="editDescription"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editValidityMonths" required>
                    Default Validity (months)
                  </Label>
                  <Input
                    id="editValidityMonths"
                    type="number"
                    min="0"
                    value={formData.defaultValidityMonths}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultValidityMonths: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editReminderDays">Reminder Days (comma-separated)</Label>
                  <Input
                    id="editReminderDays"
                    value={formData.reminderDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reminderDays: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Checkbox
                    id="editIsRequired"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isRequired: e.target.checked }))
                    }
                    label="This credential is required for employment"
                  />
                </div>

                {formData.isRequired && (
                  <div className="space-y-2">
                    <Label>Required for Roles</Label>
                    <div className="space-y-2">
                      {ROLE_OPTIONS.map((role) => (
                        <Checkbox
                          key={role.value}
                          id={`editRole-${role.value}`}
                          checked={formData.requiredForRoles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                requiredForRoles: [...prev.requiredForRoles, role.value],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                requiredForRoles: prev.requiredForRoles.filter((r) => r !== role.value),
                              }));
                            }
                          }}
                          label={role.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedType(null);
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
