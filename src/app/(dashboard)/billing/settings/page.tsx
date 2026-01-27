"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { ArrowLeft, Save, RefreshCw, Building2, FileCode, DollarSign } from "lucide-react";

interface BillingSettings {
  npi: string | null;
  taxId: string | null;
  taxonomyCode: string | null;
  billingName: string | null;
  billingAddress: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZip: string | null;
  billingPhone: string | null;
  billingFrequency: string | null;
}

const BILLING_FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "FORTNIGHTLY", label: "Fortnightly (Every 2 weeks)" },
  { value: "MONTHLY", label: "Monthly" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function BillingSettingsPage() {
  const [settings, setSettings] = React.useState<BillingSettings>({
    npi: "",
    taxId: "",
    taxonomyCode: "",
    billingName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingPhone: "",
    billingFrequency: "WEEKLY",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/billing/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          npi: data.settings?.npi || "",
          taxId: data.settings?.taxId || "",
          taxonomyCode: data.settings?.taxonomyCode || "",
          billingName: data.settings?.billingName || "",
          billingAddress: data.settings?.billingAddress || "",
          billingCity: data.settings?.billingCity || "",
          billingState: data.settings?.billingState || "",
          billingZip: data.settings?.billingZip || "",
          billingPhone: data.settings?.billingPhone || "",
          billingFrequency: data.settings?.billingFrequency || "WEEKLY",
        });
      }
      setError(null);
    } catch {
      setError("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/billing/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess("Settings saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTaxId = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return digits;
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
      <div className="flex items-center gap-4">
        <Link href="/billing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-heading-2 text-foreground">Billing Settings</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Configure provider billing information for claim submissions
          </p>
        </div>
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

      {success && (
        <div className="p-3 rounded-md bg-success/20 text-body-sm">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Identifiers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              <CardTitle>Provider Identifiers</CardTitle>
            </div>
            <CardDescription>
              Required identifiers for Medicaid claim submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="npi" required>
                  NPI (National Provider Identifier)
                </Label>
                <Input
                  id="npi"
                  value={settings.npi || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      npi: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="10 digits"
                  maxLength={10}
                />
                <p className="text-xs text-foreground-tertiary">
                  Your 10-digit National Provider Identifier
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId" required>
                  Tax ID (EIN)
                </Label>
                <Input
                  id="taxId"
                  value={settings.taxId || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      taxId: formatTaxId(e.target.value),
                    }))
                  }
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                />
                <p className="text-xs text-foreground-tertiary">
                  Your Employer Identification Number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxonomyCode" required>
                  Taxonomy Code
                </Label>
                <Input
                  id="taxonomyCode"
                  value={settings.taxonomyCode || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      taxonomyCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g., 251G00000X"
                  maxLength={10}
                />
                <p className="text-xs text-foreground-tertiary">
                  Provider specialty taxonomy code
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle>Billing Address</CardTitle>
            </div>
            <CardDescription>
              Address that appears on claims and remittance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingName">Billing Name</Label>
              <Input
                id="billingName"
                value={settings.billingName || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, billingName: e.target.value }))
                }
                placeholder="Organization name for billing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Street Address</Label>
              <Input
                id="billingAddress"
                value={settings.billingAddress || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, billingAddress: e.target.value }))
                }
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  value={settings.billingCity || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, billingCity: e.target.value }))
                  }
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingState">State</Label>
                <Select
                  id="billingState"
                  value={settings.billingState || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, billingState: e.target.value }))
                  }
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingZip">ZIP Code</Label>
                <Input
                  id="billingZip"
                  value={settings.billingZip || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      billingZip: e.target.value.replace(/[^\d-]/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="12345"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPhone">Phone</Label>
              <Input
                id="billingPhone"
                type="tel"
                value={settings.billingPhone || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, billingPhone: e.target.value }))
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <CardTitle>Billing Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure billing cycle and submission preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="billingFrequency">Default Billing Frequency</Label>
              <Select
                id="billingFrequency"
                value={settings.billingFrequency || "WEEKLY"}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, billingFrequency: e.target.value }))
                }
              >
                {BILLING_FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-foreground-tertiary">
                How often billing periods are created
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Types & Rates Links */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
            <CardDescription>
              Configure service codes and billing rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/billing/service-types">
                <Button variant="secondary">
                  <FileCode className="w-4 h-4 mr-2" />
                  Manage Service Types (HCPCS)
                </Button>
              </Link>
              <Link href="/billing/rates">
                <Button variant="secondary">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Billing Rates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
