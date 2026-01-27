"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  FileCode,
  Download,
} from "lucide-react";

interface ServiceType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unitType: string;
  isActive: boolean;
  _count?: {
    billingRates: number;
  };
}

const UNIT_TYPES = [
  { value: "HOURLY", label: "Hourly (1 unit = 1 hour)" },
  { value: "QUARTER_HOURLY", label: "15-minute (1 unit = 15 min)" },
  { value: "DAILY", label: "Daily (1 unit = 1 day)" },
];

export default function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = React.useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = React.useState(false);
  const [editingType, setEditingType] = React.useState<ServiceType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    description: "",
    unitType: "HOURLY",
  });

  // Import state
  const [isImporting, setIsImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    created: number;
    skipped: number;
  } | null>(null);

  const fetchServiceTypes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/billing/service-types");
      if (response.ok) {
        const data = await response.json();
        setServiceTypes(data.serviceTypes || []);
      }
      setError(null);
    } catch {
      setError("Failed to load service types");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      unitType: "HOURLY",
    });
    setEditingType(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (serviceType: ServiceType) => {
    setEditingType(serviceType);
    setFormData({
      code: serviceType.code,
      name: serviceType.name,
      description: serviceType.description || "",
      unitType: serviceType.unitType,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingType
        ? `/api/billing/service-types/${editingType.id}`
        : "/api/billing/service-types";
      const method = editingType ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save service type");
      }

      setShowModal(false);
      resetForm();
      await fetchServiceTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (serviceType: ServiceType) => {
    try {
      const response = await fetch(`/api/billing/service-types/${serviceType.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !serviceType.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update service type");
      }

      await fetchServiceTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (serviceType: ServiceType) => {
    if (!confirm(`Are you sure you want to delete "${serviceType.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/billing/service-types/${serviceType.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete service type");
      }

      await fetchServiceTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleImportCodes = async () => {
    if (!confirm("This will import 50+ standard HCPCS codes for home care services. Continue?")) {
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const response = await fetch("/api/billing/service-types/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import HCPCS codes");
      }

      setImportResult({
        created: data.created,
        skipped: data.skipped,
      });

      await fetchServiceTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setIsImporting(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <Link href="/billing/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-heading-2 text-foreground">Service Types</h1>
            <p className="text-body-sm text-foreground-secondary mt-1">
              Manage HCPCS codes for billing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleImportCodes} disabled={isImporting}>
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Import Standard Codes
              </>
            )}
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1" />
            Add Service Type
          </Button>
        </div>
      </div>

      {importResult && (
        <div className="p-3 rounded-md bg-success/20 text-body-sm">
          Successfully imported {importResult.created} HCPCS codes
          {importResult.skipped > 0 && ` (${importResult.skipped} already existed)`}
          <button
            onClick={() => setImportResult(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Service Types List */}
      {serviceTypes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileCode className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No service types configured</p>
            <p className="text-sm text-foreground-tertiary mt-1">
              Import standard HCPCS codes or add them manually
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button onClick={handleImportCodes} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Import 50+ Standard Codes
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-1" />
                Add Manually
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
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Code
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Name
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Unit Type
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Rates
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Status
                  </th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceTypes.map((serviceType) => (
                  <tr
                    key={serviceType.id}
                    className={`border-b border-border hover:bg-background-secondary/50 transition-colors ${
                      !serviceType.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium">{serviceType.code}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-medium">{serviceType.name}</span>
                        {serviceType.description && (
                          <p className="text-xs text-foreground-tertiary mt-0.5">
                            {serviceType.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {UNIT_TYPES.find((t) => t.value === serviceType.unitType)?.label ||
                        serviceType.unitType}
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {serviceType._count?.billingRates || 0}
                    </td>
                    <td className="p-4">
                      <Badge variant={serviceType.isActive ? "success" : "default"}>
                        {serviceType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(serviceType)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(serviceType)}
                          title={serviceType.isActive ? "Deactivate" : "Activate"}
                        >
                          {serviceType.isActive ? (
                            <Trash2 className="w-4 h-4 text-error" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-success" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingType ? "Edit Service Type" : "Add Service Type"}
              </CardTitle>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" required>
                    HCPCS Code
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., T1019"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-foreground-tertiary">
                    Common codes: T1019, T1020, S5125, S5130, S5135
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" required>
                    Service Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Personal Care Services"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select
                    id="unitType"
                    value={formData.unitType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unitType: e.target.value }))
                    }
                  >
                    {UNIT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editingType
                        ? "Save Changes"
                        : "Add Service Type"}
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
