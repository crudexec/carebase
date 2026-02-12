"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Select,
  Card,
  CardContent,
} from "@/components/ui";
import {
  X,
  Loader2,
  Calendar,
  FileText,
  User,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Sponsor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ShiftPreview {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ClientPreview {
  client: Client;
  shiftCount: number;
  totalHours: number;
  shifts: ShiftPreview[];
}

interface GenerateInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  sponsors: Sponsor[];
}

export function GenerateInvoicesModal({
  isOpen,
  onClose,
  clients,
  sponsors,
}: GenerateInvoicesModalProps) {
  const router = useRouter();

  // Step state
  const [step, setStep] = React.useState<"select" | "preview" | "generate">("select");

  // Form state
  const [periodStart, setPeriodStart] = React.useState(() => {
    // Default to first day of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = React.useState(() => {
    // Default to last day of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  });
  const [selectedClientId, setSelectedClientId] = React.useState<string>("all");
  const [dueDate, setDueDate] = React.useState("");
  const [taxRate, setTaxRate] = React.useState("0");

  // Preview state
  const [preview, setPreview] = React.useState<ClientPreview[]>([]);
  const [selectedClients, setSelectedClients] = React.useState<Set<string>>(new Set());
  const [clientSponsors, setClientSponsors] = React.useState<Record<string, string>>({});

  // Loading states
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = React.useState(0);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep("select");
      setError(null);
      setPreview([]);
      setSelectedClients(new Set());
      setGeneratedCount(0);
    }
  }, [isOpen]);

  const handlePreview = async () => {
    setError(null);
    setIsLoadingPreview(true);

    try {
      const params = new URLSearchParams({
        periodStart,
        periodEnd,
      });
      if (selectedClientId !== "all") {
        params.set("clientId", selectedClientId);
      }

      const response = await fetch(`/api/invoices/generate?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to preview shifts");
      }

      const data = await response.json();
      setPreview(data.preview);

      // Select all clients by default
      const allClientIds = new Set<string>(data.preview.map((p: ClientPreview) => p.client.id));
      setSelectedClients(allClientIds);

      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleGenerate = async () => {
    if (selectedClients.size === 0) {
      setError("Please select at least one client");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedCount(0);

    try {
      // Generate invoice for each selected client
      const clientsToGenerate = preview.filter((p) => selectedClients.has(p.client.id));
      let count = 0;

      for (const clientPreview of clientsToGenerate) {
        const response = await fetch("/api/invoices/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientPreview.client.id,
            sponsorId: clientSponsors[clientPreview.client.id] || null,
            periodStart,
            periodEnd,
            dueDate: dueDate || null,
            taxRate: parseFloat(taxRate) / 100,
            status: "DRAFT",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error(`Failed to generate invoice for ${clientPreview.client.firstName}:`, data.error);
          continue;
        }

        count++;
        setGeneratedCount(count);
      }

      // Navigate to invoices list on success
      onClose();
      router.push("/invoices");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Invoices from Shifts
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-foreground-tertiary hover:text-foreground rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-foreground-secondary">
                Select a date range to find completed shifts that can be invoiced.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodStart">Period Start *</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="periodEnd">Period End *</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientFilter">Client</Label>
                <Select
                  id="clientFilter"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-secondary">
                  Found {preview.length} clients with uninvoiced shifts.
                  Select which clients to generate invoices for.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("select")}
                >
                  Back
                </Button>
              </div>

              {preview.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
                  <p className="text-foreground-secondary">
                    No uninvoiced completed shifts found for the selected period.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preview.map((clientPreview) => (
                    <Card
                      key={clientPreview.client.id}
                      className={`cursor-pointer transition-colors ${
                        selectedClients.has(clientPreview.client.id)
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => toggleClientSelection(clientPreview.client.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedClients.has(clientPreview.client.id)}
                              onChange={() => toggleClientSelection(clientPreview.client.id)}
                              className="w-4 h-4 rounded border-border"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-foreground-secondary" />
                                <span className="font-medium">
                                  {clientPreview.client.firstName} {clientPreview.client.lastName}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-foreground-secondary">
                                <span>{clientPreview.shiftCount} shifts</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {clientPreview.totalHours.toFixed(1)} hours
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
                        </div>

                        {selectedClients.has(clientPreview.client.id) && (
                          <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                            <Label htmlFor={`sponsor-${clientPreview.client.id}`}>
                              Bill To (Sponsor)
                            </Label>
                            <Select
                              id={`sponsor-${clientPreview.client.id}`}
                              value={clientSponsors[clientPreview.client.id] || ""}
                              onChange={(e) => {
                                setClientSponsors({
                                  ...clientSponsors,
                                  [clientPreview.client.id]: e.target.value,
                                });
                              }}
                            >
                              <option value="">Bill to client directly</option>
                              {sponsors.map((sponsor) => (
                                <option key={sponsor.id} value={sponsor.id}>
                                  {sponsor.firstName} {sponsor.lastName} ({sponsor.email})
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isLoadingPreview || isGenerating}>
            Cancel
          </Button>

          {step === "select" && (
            <Button onClick={handlePreview} disabled={isLoadingPreview || !periodStart || !periodEnd}>
              {isLoadingPreview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Preview
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}

          {step === "preview" && preview.length > 0 && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedClients.size === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating... ({generatedCount}/{selectedClients.size})
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate {selectedClients.size} Invoice{selectedClients.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
