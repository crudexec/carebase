"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  Phone,
} from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  faxNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    faxNumber: "",
  });

  // Fetch company details
  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await fetch("/api/settings/company");
        if (!response.ok) throw new Error("Failed to fetch company");
        const data = await response.json();
        setCompany(data.company);
        setFormData({
          name: data.company.name || "",
          address: data.company.address || "",
          phone: data.company.phone || "",
          faxNumber: data.company.faxNumber || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company");
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchCompany();
    }
  }, [sessionStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setCompany(data.company);
      setSuccess("Company settings updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while session loads
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check admin access
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground-secondary">
          Manage your company settings
        </p>
      </div>

      {/* Company Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Company Details</CardTitle>
          </div>
          <CardDescription>
            {isAdmin
              ? "Update your company information"
              : "View your company information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-light text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Company Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isAdmin}
                  required
                />
              </div>

              {/* Company Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Company Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isAdmin}
                />
              </div>

              {/* Company Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Company Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isAdmin}
                />
              </div>

              {/* Fax Number */}
              <div className="space-y-2">
                <Label htmlFor="faxNumber">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Virtual Fax Number
                  </div>
                </Label>
                <Input
                  id="faxNumber"
                  name="faxNumber"
                  type="tel"
                  placeholder="+12025551234"
                  value={formData.faxNumber}
                  onChange={handleChange}
                  disabled={!isAdmin}
                />
                <p className="text-xs text-foreground-tertiary">
                  E.164 format (e.g., +12025551234). This number will receive incoming faxes for your organization.
                </p>
              </div>

              {/* Company ID (read-only) */}
              {company && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-foreground-tertiary">
                    Company ID: {company.id}
                  </p>
                  <p className="text-xs text-foreground-tertiary">
                    Created: {new Date(company.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Save Button (admin only) */}
              {isAdmin && (
                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}

              {/* Non-admin message */}
              {!isAdmin && (
                <p className="text-xs text-foreground-tertiary text-center">
                  Only administrators can edit company settings
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
