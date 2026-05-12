"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, Check, Copy, Loader2, Plus, Save } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { isInternalAdminClient } from "@/lib/internal-admin";

type Currency = "USD" | "GBP" | "CAD" | "NGN";

interface CompanyRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  faxNumber: string | null;
  currency: Currency;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    clients: number;
    invites: number;
  };
}

const currencyOptions: Currency[] = ["USD", "GBP", "CAD", "NGN"];

export default function InternalCompaniesPage() {
  const { data: session, status } = useSession();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    address: "",
    phone: "",
    faxNumber: "",
    currency: "USD" as Currency,
    adminInviteEmail: "",
    expiresInDays: 7,
  });
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, Partial<CompanyRow>>>({});

  const canManage = useMemo(
    () => isInternalAdminClient(session?.user?.email || null),
    [session?.user?.email]
  );

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/internal/companies");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch companies");
      }
      setCompanies(data.companies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && canManage) {
      fetchCompanies();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, canManage, fetchCompanies]);

  const startEdit = (company: CompanyRow) => {
    setEditingCompanyId(company.id);
    setEditForm({
      [company.id]: {
        name: company.name,
        address: company.address,
        phone: company.phone,
        faxNumber: company.faxNumber,
        currency: company.currency,
        isActive: company.isActive,
      },
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedInviteUrl(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/internal/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          adminInviteEmail: createForm.adminInviteEmail || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create company");
      }

      setSuccess(`Created company: ${data.company.name}`);
      setCreatedInviteUrl(data.inviteUrl || null);
      setCreateForm({
        name: "",
        address: "",
        phone: "",
        faxNumber: "",
        currency: "USD",
        adminInviteEmail: "",
        expiresInDays: 7,
      });
      fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (companyId: string) => {
    const payload = editForm[companyId];
    if (!payload) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/internal/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update company");
      }

      setSuccess(`Updated company: ${data.company.name}`);
      setEditingCompanyId(null);
      fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    }
  };

  const copyInviteUrl = async () => {
    if (!createdInviteUrl) return;
    await navigator.clipboard.writeText(createdInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="py-12 text-sm text-gray-500">
        You do not have access to company management.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Companies</h1>
        <p className="text-sm text-gray-500">
          Internal admin tools for creating and managing tenant companies.
        </p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Create Company</CardTitle>
          </div>
          <CardDescription>
            Optionally generate the first admin invite at creation time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Company Name
              </Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                id="currency"
                value={createForm.currency}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, currency: e.target.value as Currency }))
                }
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={createForm.address}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faxNumber">Fax Number</Label>
              <Input
                id="faxNumber"
                placeholder="+12025551234"
                value={createForm.faxNumber}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, faxNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminInviteEmail">Initial Admin Invite Email</Label>
              <Input
                id="adminInviteEmail"
                type="email"
                value={createForm.adminInviteEmail}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, adminInviteEmail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresInDays">Invite Expires In (Days)</Label>
              <Input
                id="expiresInDays"
                type="number"
                min={1}
                max={30}
                value={createForm.expiresInDays}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    expiresInDays: Number(e.target.value) || 7,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                Create Company
              </Button>
              {createdInviteUrl && (
                <Button type="button" variant="secondary" onClick={copyInviteUrl}>
                  {copied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy Admin Invite Link
                </Button>
              )}
            </div>
            {createdInviteUrl && (
              <div className="md:col-span-2 break-all rounded border bg-gray-50 p-3 text-xs text-gray-700">
                {createdInviteUrl}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Companies</CardTitle>
          <CardDescription>Update core tenant details and active status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companies.map((company) => {
            const isEditing = editingCompanyId === company.id;
            const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

            return (
              <div key={company.id} className="rounded border p-4">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">{company.id}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {company._count.users} users • {company._count.clients} clients •{" "}
                      {company._count.invites} invites
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button variant="secondary" size="sm" onClick={() => startEdit(company)}>
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleSave(company.id)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      value={isEditing ? (current.name ?? "") : company.name}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: { ...prev[company.id], name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Currency</Label>
                    <Select
                      value={
                        isEditing
                          ? ((current.currency as Currency) ?? company.currency)
                          : company.currency
                      }
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: {
                            ...prev[company.id],
                            currency: e.target.value as Currency,
                          },
                        }))
                      }
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={isEditing ? (current.address ?? "") : (company.address || "")}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: { ...prev[company.id], address: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input
                      value={isEditing ? (current.phone ?? "") : (company.phone || "")}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: { ...prev[company.id], phone: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fax Number</Label>
                    <Input
                      value={isEditing ? (current.faxNumber ?? "") : (company.faxNumber || "")}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: { ...prev[company.id], faxNumber: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isEditing ? Boolean(current.isActive) : company.isActive}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [company.id]: { ...prev[company.id], isActive: e.target.checked },
                        }))
                      }
                    />
                    Active
                  </label>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
