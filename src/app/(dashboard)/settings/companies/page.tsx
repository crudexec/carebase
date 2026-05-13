"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
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
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
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

interface CreatedCredentials {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}

const currencyOptions: Currency[] = ["USD", "GBP", "CAD", "NGN"];

export default function InternalCompaniesPage() {
  const { data: session, status } = useSession();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    address: "",
    phone: "",
    faxNumber: "",
    currency: "USD" as Currency,
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
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
    setError(null);
    setSuccess(null);
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

  const openCreateModal = () => {
    setError(null);
    setSuccess(null);
    setCreatedCredentials(null);
    setCopiedCredentials(false);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setIsCreateModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedCredentials(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/internal/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create company");
      }

      setSuccess(`Created company: ${data.company.name}.`);
      setCreatedCredentials({
        companyName: data.company.name,
        adminName: `${data.adminUser.firstName} ${data.adminUser.lastName}`,
        email: data.credentials.email,
        password: data.credentials.password,
      });
      setCreateForm({
        name: "",
        address: "",
        phone: "",
        faxNumber: "",
        currency: "USD",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "",
      });
      setCopiedCredentials(false);
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
    setCreatedCredentials(null);

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

  const cancelEdit = () => {
    setEditingCompanyId(null);
  };

  const handleDelete = async (company: CompanyRow) => {
    const confirmation = window.prompt(
      `Type "${company.name}" to permanently delete this company and all associated data.`
    );

    if (confirmation === null) {
      return;
    }

    setError(null);
    setSuccess(null);
    setCreatedCredentials(null);
    setDeletingCompanyId(company.id);

    try {
      const response = await fetch(
        `/api/internal/companies/${company.id}?confirm=${encodeURIComponent(confirmation)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete company");
      }

      setSuccess(`Deleted company: ${data.deletedCompanyName}`);
      if (editingCompanyId === company.id) {
        setEditingCompanyId(null);
      }
      setCompanies((prev) => prev.filter((entry) => entry.id !== company.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete company");
    } finally {
      setDeletingCompanyId(null);
    }
  };

  const copyLoginCredentials = async () => {
    if (!createdCredentials) return;

    const text = [
      `Company: ${createdCredentials.companyName}`,
      `Admin: ${createdCredentials.adminName}`,
      `Email: ${createdCredentials.email}`,
      `Password: ${createdCredentials.password}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
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

  const columns: ColumnDef<CompanyRow>[] = [
    {
      id: "name",
      header: "Company",
      minWidth: "220px",
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        return (
          <div className="space-y-1">
            {isEditing ? (
              <Input
                value={current.name ?? ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    [company.id]: { ...prev[company.id], name: e.target.value },
                  }))
                }
              />
            ) : (
              <>
                <div className="font-medium text-gray-900">{company.name}</div>
                <div className="text-[10px] text-gray-500">{company.id}</div>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: "counts",
      header: "Usage",
      minWidth: "150px",
      hideOnMobile: true,
      cell: (company) => (
        <div className="text-[11px] text-gray-600">
          {company._count.users} users
          <br />
          {company._count.clients} clients
          <br />
          {company._count.invites} invites
        </div>
      ),
    },
    {
      id: "currency",
      header: "Currency",
      width: "110px",
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        if (!isEditing) {
          return company.currency;
        }

        return (
          <Select
            value={(current.currency as Currency) ?? company.currency}
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
        );
      },
    },
    {
      id: "address",
      header: "Address",
      minWidth: "220px",
      hideOnMobile: true,
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        return isEditing ? (
          <Input
            value={current.address ?? ""}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                [company.id]: { ...prev[company.id], address: e.target.value },
              }))
            }
          />
        ) : (
          company.address || <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      minWidth: "140px",
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        return isEditing ? (
          <Input
            value={current.phone ?? ""}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                [company.id]: { ...prev[company.id], phone: e.target.value },
              }))
            }
          />
        ) : (
          company.phone || <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "faxNumber",
      header: "Fax",
      minWidth: "150px",
      hideOnMobile: true,
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        return isEditing ? (
          <Input
            value={current.faxNumber ?? ""}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                [company.id]: { ...prev[company.id], faxNumber: e.target.value },
              }))
            }
          />
        ) : (
          company.faxNumber || <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "active",
      header: "Active",
      width: "100px",
      align: "center",
      cell: (company) => {
        const isEditing = editingCompanyId === company.id;
        const current = (editForm[company.id] || {}) as Partial<CompanyRow>;

        return isEditing ? (
          <label className="inline-flex items-center justify-center">
            <input
              type="checkbox"
              checked={Boolean(current.isActive)}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  [company.id]: { ...prev[company.id], isActive: e.target.checked },
                }))
              }
            />
          </label>
        ) : company.isActive ? (
          "Yes"
        ) : (
          "No"
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500">
            Internal admin tools for creating and managing tenant companies.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Button>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Companies</CardTitle>
          <CardDescription>
            Update tenant details in a table view, or permanently delete a tenant and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={companies}
            columns={columns}
            getRowKey={(company) => company.id}
            clickableRows={false}
            emptyMessage="No companies found."
            rowActions={(company) => {
              const isEditing = editingCompanyId === company.id;
              const isDeleting = deletingCompanyId === company.id;

              return (
                <div className="flex items-center justify-center gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(company.id)}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="secondary" size="sm" onClick={cancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(company)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => handleDelete(company)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeCreateModal}
          />
          <div className="relative z-10 w-full max-w-3xl rounded-xl bg-background shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b p-6">
              <div>
                <h2 className="text-lg font-semibold">Create Company</h2>
                <p className="text-sm text-gray-500">
                  Create the tenant and its first admin account directly.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isCreating}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
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
                  <Label htmlFor="adminFirstName" required>
                    Initial Admin First Name
                  </Label>
                  <Input
                    id="adminFirstName"
                    value={createForm.adminFirstName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, adminFirstName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName" required>
                    Initial Admin Last Name
                  </Label>
                  <Input
                    id="adminLastName"
                    value={createForm.adminLastName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, adminLastName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" required>
                    Initial Admin Email
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={createForm.adminEmail}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, adminEmail: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" required>
                    Initial Admin Password
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={createForm.adminPassword}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, adminPassword: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2 text-xs text-gray-500">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Button type="button" variant="secondary" onClick={closeCreateModal} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="mr-2 h-4 w-4" />
                    )}
                    Create Company
                  </Button>
                </div>
              </form>

              {createdCredentials && (
                <div className="mt-4 rounded border bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Login Credentials</div>
                      <div className="text-xs text-gray-500">
                        Copy these now if you need to share them with the new company admin.
                      </div>
                    </div>
                    <Button type="button" variant="secondary" onClick={copyLoginCredentials}>
                      {copiedCredentials ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copiedCredentials ? "Copied" : "Copy Login Credentials"}
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div><strong>Company:</strong> {createdCredentials.companyName}</div>
                    <div><strong>Admin:</strong> {createdCredentials.adminName}</div>
                    <div><strong>Email:</strong> {createdCredentials.email}</div>
                    <div><strong>Password:</strong> {createdCredentials.password}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
