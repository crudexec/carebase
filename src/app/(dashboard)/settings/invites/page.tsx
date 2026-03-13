"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Loader2,
  Copy,
  Check,
  X,
  Mail,
  UserPlus,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@prisma/client";

interface InviteData {
  id: string;
  token: string;
  email: string | null;
  role: UserRole;
  status: string;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  usedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
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

export default function InvitesSettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create invite modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    role: "CARER" as UserRole,
    expiresInDays: 7,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    try {
      const response = await fetch("/api/invites");
      if (!response.ok) throw new Error("Failed to fetch invites");
      const data = await response.json();
      setInvites(data.invites);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invites");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchInvites();
    }
  }, [sessionStatus, fetchInvites]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createForm.email || undefined,
          role: createForm.role,
          expiresInDays: createForm.expiresInDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      setCreatedInviteUrl(data.inviteUrl);
      fetchInvites();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke invite");
      }

      fetchInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite");
    }
  };

  const copyToClipboard = async (text: string, token: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({ email: "", role: "CARER", expiresInDays: 7 });
    setCreateError(null);
    setCreatedInviteUrl(null);
  };

  const getStatusBadge = (invite: InviteData) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);
    const isExpired = invite.status === "PENDING" && expiresAt < now;

    const status = isExpired ? "EXPIRED" : invite.status;

    const styles: Record<string, string> = {
      PENDING: "bg-blue-100 text-blue-700",
      ACCEPTED: "bg-green-100 text-green-700",
      EXPIRED: "bg-gray-100 text-gray-600",
      REVOKED: "bg-red-100 text-red-700",
    };

    return (
      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // Show loading while session loads
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check access
  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "OPS_MANAGER";

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to manage invites.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Team Invitations</h1>
          <p className="text-xs text-gray-500">Invite new team members to join your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvites}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Invite
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-0.5 rounded hover:bg-red-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Invites Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded border border-gray-200">
          <UserPlus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No invitations yet</p>
          <p className="text-xs text-gray-400 mt-1">Create an invite to add team members</p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Email</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Role</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Status</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Created</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Expires</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  const inviteUrl = `${window.location.origin}/register/invite?token=${invite.token}`;

                  return (
                    <tr key={invite.id} className={`border-b border-gray-100 ${rowBg}`}>
                      <td className="px-3 py-2">
                        {invite.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-[11px] text-gray-900">{invite.email}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Any email</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[11px] text-gray-700">{ROLE_LABELS[invite.role]}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          {getStatusBadge(invite)}
                          {invite.usedBy && (
                            <span className="text-[10px] text-gray-500">
                              by {invite.usedBy.firstName} {invite.usedBy.lastName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-gray-700">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            by {invite.createdBy.firstName} {invite.createdBy.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-[11px] text-gray-700">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {invite.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => copyToClipboard(inviteUrl, invite.token)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                                title="Copy invite link"
                              >
                                {copiedToken === invite.token ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRevokeInvite(invite.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                title="Revoke invite"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invite Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Create Invitation</span>
              </div>
              <button onClick={resetCreateModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdInviteUrl ? (
              <div className="p-4 space-y-4">
                <div className="p-3 rounded bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Invite created successfully!</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    Share this link with the person you want to invite:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInviteUrl}
                      className="flex-1 px-2 py-1.5 text-xs bg-white border border-green-300 rounded"
                    />
                    <button
                      onClick={() => copyToClipboard(createdInviteUrl, "created")}
                      className="px-2 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                    >
                      {copiedToken === "created" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <Button onClick={resetCreateModal} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="p-4 space-y-4">
                {createError && (
                  <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                    {createError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email Address (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Leave empty for a generic invite"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-gray-500">
                    If provided, only this email can use the invite
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs">
                    Role
                  </Label>
                  <select
                    id="role"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiresInDays" className="text-xs">
                    Expires In (days)
                  </Label>
                  <select
                    id="expiresInDays"
                    value={createForm.expiresInDays}
                    onChange={(e) => setCreateForm({ ...createForm, expiresInDays: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={resetCreateModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="flex-1">
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Invite"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
