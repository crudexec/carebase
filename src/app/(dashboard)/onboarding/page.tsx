"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { OnboardingStage } from "@prisma/client";
import { KanbanBoard } from "@/components/onboarding/kanban-board";
import { OnboardingClient } from "@/components/onboarding/kanban-card";
import { canMoveCards as checkCanMoveCards, canApproveClinical as checkCanApproveClinical } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<OnboardingClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<OnboardingClient | null>(null);

  // New client form
  const [newClientForm, setNewClientForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    medicalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = session?.user?.role;
  const canMove = userRole ? checkCanMoveCards(userRole) : false;
  const canApprove = userRole ? checkCanApproveClinical(userRole) : false;

  // Fetch onboarding clients (silent mode doesn't show loader)
  const fetchClients = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await fetch("/api/onboarding");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setClients(data.clients);
      setError(null);
    } catch {
      if (!silent) setError("Failed to load onboarding pipeline");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle stage change with optimistic update
  const handleStageChange = async (
    clientId: string,
    fromStage: OnboardingStage,
    toStage: OnboardingStage
  ) => {
    // Optimistically update the UI immediately
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? { ...client, stage: toStage, stageEnteredAt: new Date().toISOString() }
          : client
      )
    );

    try {
      const response = await fetch(`/api/onboarding/${clientId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromStage, toStage }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Revert on error
        setClients((prev) =>
          prev.map((client) =>
            client.id === clientId ? { ...client, stage: fromStage } : client
          )
        );
        setError(data.error || "Failed to update stage");
        throw new Error(data.error || "Failed to update stage");
      }

      // Silently sync with server to get any server-side changes
      fetchClients(true);
    } catch (err) {
      // Revert on error
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, stage: fromStage } : client
        )
      );
      throw err;
    }
  };

  // Handle add new client
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add client");
      }

      setShowAddModal(false);
      setNewClientForm({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        medicalNotes: "",
      });
      // Refresh to get the new client
      await fetchClients(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clinical approval with optimistic update
  const handleApproval = async (approved: boolean) => {
    if (!selectedClient) return;

    // Optimistically update
    setClients((prev) =>
      prev.map((client) =>
        client.id === selectedClient.id
          ? { ...client, clinicalApproval: approved }
          : client
      )
    );
    setShowDetailModal(false);

    try {
      const response = await fetch(`/api/onboarding/${selectedClient.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Revert on error
        setClients((prev) =>
          prev.map((client) =>
            client.id === selectedClient.id
              ? { ...client, clinicalApproval: null }
              : client
          )
        );
        throw new Error(data.error || "Failed to process approval");
      }

      // Silently sync
      fetchClients(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process approval");
    }
  };

  // Handle card click
  const handleCardClick = (client: OnboardingClient) => {
    setSelectedClient(client);
    setShowDetailModal(true);
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
        <div>
          <h1 className="text-heading-2 text-foreground">Client Onboarding</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage client onboarding pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchClients()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {canMove && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Client
            </Button>
          )}
        </div>
      </div>

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

      {/* Kanban Board */}
      <div className="overflow-x-auto -mx-6 px-6">
        <KanbanBoard
          clients={clients}
          canMoveCards={canMove}
          canApproveClinical={canApprove}
          onStageChange={handleStageChange}
          onCardClick={handleCardClick}
          onAddClick={() => setShowAddModal(true)}
        />
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add New Client</CardTitle>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" required>First Name</Label>
                    <Input
                      id="firstName"
                      value={newClientForm.firstName}
                      onChange={(e) =>
                        setNewClientForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" required>Last Name</Label>
                    <Input
                      id="lastName"
                      value={newClientForm.lastName}
                      onChange={(e) =>
                        setNewClientForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newClientForm.phone}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClientForm.address}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Medical Notes</Label>
                  <textarea
                    id="medicalNotes"
                    className="flex w-full rounded-md border bg-background-secondary px-4 py-3 text-body transition-all duration-200 placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-24 resize-none"
                    value={newClientForm.medicalNotes}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, medicalNotes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Client"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedClient.clientName}</CardTitle>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-foreground-secondary">Stage</p>
                  <p className="font-medium">{selectedClient.stage.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-foreground-secondary">Sponsor</p>
                  <p className="font-medium">{selectedClient.sponsorName || "None"}</p>
                </div>
                <div>
                  <p className="text-foreground-secondary">Documents</p>
                  <p className="font-medium">{selectedClient.documentsCount}</p>
                </div>
                <div>
                  <p className="text-foreground-secondary">Assigned To</p>
                  <p className="font-medium">{selectedClient.assignedTo || "Unassigned"}</p>
                </div>
              </div>

              {selectedClient.notes && (
                <div>
                  <p className="text-foreground-secondary text-sm">Notes</p>
                  <p className="text-sm mt-1">{selectedClient.notes}</p>
                </div>
              )}

              {/* Clinical Approval Actions */}
              {selectedClient.stage === "CLINICAL_AUTHORIZATION" &&
                canApprove &&
                selectedClient.clinicalApproval === null && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Clinical Authorization Required</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproval(true)}
                        className="flex-1 bg-success hover:bg-success-hover"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(false)}
                        variant="secondary"
                        className="flex-1 border-error text-error hover:bg-error/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
