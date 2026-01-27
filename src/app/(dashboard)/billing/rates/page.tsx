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
} from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  DollarSign,
} from "lucide-react";

interface ServiceType {
  id: string;
  code: string;
  name: string;
}

interface BillingRate {
  id: string;
  name: string;
  rate: number;
  effectiveDate: string;
  endDate: string | null;
  isActive: boolean;
  serviceType: ServiceType;
  _count?: {
    clients: number;
  };
}

export default function BillingRatesPage() {
  const [rates, setRates] = React.useState<BillingRate[]>([]);
  const [serviceTypes, setServiceTypes] = React.useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = React.useState(false);
  const [editingRate, setEditingRate] = React.useState<BillingRate | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    rate: "",
    serviceTypeId: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [ratesRes, typesRes] = await Promise.all([
        fetch("/api/billing/rates"),
        fetch("/api/billing/service-types"),
      ]);

      if (ratesRes.ok) {
        const data = await ratesRes.json();
        setRates(data.rates || []);
      }

      if (typesRes.ok) {
        const data = await typesRes.json();
        setServiceTypes(
          (data.serviceTypes || []).filter((t: ServiceType & { isActive: boolean }) => t.isActive)
        );
      }

      setError(null);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      name: "",
      rate: "",
      serviceTypeId: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setEditingRate(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (rate: BillingRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      rate: String(rate.rate),
      serviceTypeId: rate.serviceType.id,
      effectiveDate: rate.effectiveDate.split("T")[0],
      endDate: rate.endDate ? rate.endDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingRate
        ? `/api/billing/rates/${editingRate.id}`
        : "/api/billing/rates";
      const method = editingRate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rate: parseFloat(formData.rate),
          endDate: formData.endDate || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save rate");
      }

      setShowModal(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (rate: BillingRate) => {
    try {
      const response = await fetch(`/api/billing/rates/${rate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rate.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rate");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            <h1 className="text-heading-2 text-foreground">Billing Rates</h1>
            <p className="text-body-sm text-foreground-secondary mt-1">
              Manage hourly rates for services
            </p>
          </div>
        </div>
        <Button onClick={openAddModal} disabled={serviceTypes.length === 0}>
          <Plus className="w-4 h-4 mr-1" />
          Add Rate
        </Button>
      </div>

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

      {serviceTypes.length === 0 && (
        <div className="p-4 rounded-md bg-warning/20 text-body-sm">
          <strong>Note:</strong> You need to add service types before creating billing
          rates.{" "}
          <Link href="/billing/service-types" className="underline">
            Add service types
          </Link>
        </div>
      )}

      {/* Rates List */}
      {rates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No billing rates configured</p>
            <p className="text-sm text-foreground-tertiary mt-1">
              Set up rates for your service types
            </p>
            {serviceTypes.length > 0 && (
              <Button className="mt-4" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-1" />
                Add Rate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Name
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Service Type
                  </th>
                  <th className="text-right p-4 font-medium text-foreground-secondary">
                    Rate
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Effective
                  </th>
                  <th className="text-left p-4 font-medium text-foreground-secondary">
                    Clients
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
                {rates.map((rate) => (
                  <tr
                    key={rate.id}
                    className={`border-b border-border hover:bg-background-secondary/50 transition-colors ${
                      !rate.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-medium">{rate.name}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-mono text-sm">{rate.serviceType.code}</span>
                        <p className="text-xs text-foreground-tertiary">
                          {rate.serviceType.name}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold">{formatCurrency(rate.rate)}</span>
                      <span className="text-xs text-foreground-tertiary">/hr</span>
                    </td>
                    <td className="p-4 text-foreground-secondary text-sm">
                      <div>{formatDate(rate.effectiveDate)}</div>
                      {rate.endDate && (
                        <div className="text-xs text-foreground-tertiary">
                          to {formatDate(rate.endDate)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {rate._count?.clients || 0}
                    </td>
                    <td className="p-4">
                      <Badge variant={rate.isActive ? "success" : "default"}>
                        {rate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(rate)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(rate)}
                          title={rate.isActive ? "Deactivate" : "Activate"}
                        >
                          {rate.isActive ? (
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
              <CardTitle>{editingRate ? "Edit Rate" : "Add Billing Rate"}</CardTitle>
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
                  <Label htmlFor="name" required>
                    Rate Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Standard Personal Care Rate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceTypeId" required>
                    Service Type
                  </Label>
                  <Select
                    id="serviceTypeId"
                    value={formData.serviceTypeId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, serviceTypeId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.code} - {type.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" required>
                    Hourly Rate ($)
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rate: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate" required>
                      Effective Date
                    </Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          effectiveDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </div>
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
                      : editingRate
                        ? "Save Changes"
                        : "Add Rate"}
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
