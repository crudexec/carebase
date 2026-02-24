"use client";

import * as React from "react";
import { X, Loader2, Package, Search } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Card,
  CardContent,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  strength: string;
  form: string;
  controlledSchedule: string;
  clientId: string;
  clientName: string;
  refillsRemaining: number | null;
}

interface RefillRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedMedicationId?: string;
}

export function RefillRequestModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedMedicationId,
}: RefillRequestModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedMedicationId, setSelectedMedicationId] = React.useState(
    preselectedMedicationId || ""
  );
  const [quantityRequested, setQuantityRequested] = React.useState("");
  const [requestNotes, setRequestNotes] = React.useState("");
  const [pharmacyName, setPharmacyName] = React.useState("");
  const [pharmacyPhone, setPharmacyPhone] = React.useState("");
  const [pharmacyFax, setPharmacyFax] = React.useState("");

  // Fetch medications when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchMedications();
      if (preselectedMedicationId) {
        setSelectedMedicationId(preselectedMedicationId);
      }
    }
  }, [isOpen, preselectedMedicationId]);

  const fetchMedications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/medications?page=1&limit=100");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      // Filter to only active medications on the client side
      const meds = (data.medications || [])
        .filter((m: Record<string, unknown>) => m.status === "ACTIVE")
        .map((m: Record<string, unknown>) => ({
          id: m.id as string,
          name: m.name as string,
          strength: m.strength as string,
          form: m.form as string,
          controlledSchedule: m.controlledSchedule as string,
          clientId: m.clientId as string,
          clientName: m.clientName as string,
          refillsRemaining: (m.refillsRemaining as number | null) ?? null,
        }));
      setMedications(meds);
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMedicationId("");
    setQuantityRequested("");
    setRequestNotes("");
    setPharmacyName("");
    setPharmacyPhone("");
    setPharmacyFax("");
    setSearchQuery("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedicationId) {
      toast.error("Please select a medication");
      return;
    }

    const selectedMed = medications.find((m) => m.id === selectedMedicationId);
    if (!selectedMed) {
      toast.error("Selected medication not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/refills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: selectedMedicationId,
          clientId: selectedMed.clientId,
          quantityRequested: quantityRequested ? parseInt(quantityRequested) : undefined,
          requestNotes: requestNotes || undefined,
          pharmacyName: pharmacyName || undefined,
          pharmacyPhone: pharmacyPhone || undefined,
          pharmacyFax: pharmacyFax || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create refill request");
      }

      toast.success("Refill request created successfully");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error creating refill request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create refill request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMedication = medications.find((m) => m.id === selectedMedicationId);

  const filteredMedications = medications.filter((med) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(query) ||
      med.clientName.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            New Refill Request
          </h2>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Medication Selection */}
              <div>
                <Label htmlFor="medication">Select Medication *</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>
                <Select
                  id="medication"
                  value={selectedMedicationId}
                  onChange={(e) => setSelectedMedicationId(e.target.value)}
                  className="mt-2 min-h-[44px]"
                >
                  <option value="">Choose a medication...</option>
                  {filteredMedications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.strength} - {med.clientName}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Selected Medication Details */}
              {selectedMedication && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedMedication.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedMedication.strength} {selectedMedication.form}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Client: {selectedMedication.clientName}
                        </p>
                      </div>
                      <div className="text-right">
                        {selectedMedication.controlledSchedule !== "NOT_CONTROLLED" && (
                          <Badge variant="warning" className="mb-1">
                            Controlled
                          </Badge>
                        )}
                        {selectedMedication.refillsRemaining !== null && (
                          <p className={`text-sm ${selectedMedication.refillsRemaining <= 1 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                            {selectedMedication.refillsRemaining} refills remaining
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">Quantity Requested</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantityRequested}
                  onChange={(e) => setQuantityRequested(e.target.value)}
                  placeholder="Enter quantity (optional)"
                  className="mt-2 min-h-[44px]"
                />
              </div>

              {/* Pharmacy Info */}
              <div className="space-y-3">
                <Label>Pharmacy Information</Label>
                <Input
                  placeholder="Pharmacy Name"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="min-h-[44px]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Phone"
                    value={pharmacyPhone}
                    onChange={(e) => setPharmacyPhone(e.target.value)}
                    className="min-h-[44px]"
                  />
                  <Input
                    placeholder="Fax"
                    value={pharmacyFax}
                    onChange={(e) => setPharmacyFax(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Request Notes</Label>
                <Textarea
                  id="notes"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Any special instructions or notes..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedMedicationId}
                  className="flex-1 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
