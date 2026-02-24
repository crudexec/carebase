"use client";

import * as React from "react";
import { X, Loader2, Package, AlertTriangle } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface ControlledMedication {
  id: string;
  name: string;
  genericName: string | null;
  strength: string;
  form: string;
  controlledSchedule: string;
  clientId: string;
  clientName: string;
}

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddInventoryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddInventoryModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [medications, setMedications] = React.useState<ControlledMedication[]>([]);
  const [selectedMedicationId, setSelectedMedicationId] = React.useState("");
  const [quantityOnHand, setQuantityOnHand] = React.useState("");
  const [lotNumber, setLotNumber] = React.useState("");
  const [expirationDate, setExpirationDate] = React.useState("");
  const [lowInventoryThreshold, setLowInventoryThreshold] = React.useState("");

  // Fetch controlled medications without inventory
  React.useEffect(() => {
    if (isOpen) {
      fetchAvailableMedications();
    }
  }, [isOpen]);

  const fetchAvailableMedications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/medications?controlledOnly=true&withoutInventory=true");
      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMedicationId("");
    setQuantityOnHand("");
    setLotNumber("");
    setExpirationDate("");
    setLowInventoryThreshold("");
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

    if (!quantityOnHand || parseInt(quantityOnHand) < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/narcotic-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: selectedMedicationId,
          quantityOnHand: parseInt(quantityOnHand),
          lotNumber: lotNumber || undefined,
          expirationDate: expirationDate || undefined,
          lowInventoryThreshold: lowInventoryThreshold ? parseInt(lowInventoryThreshold) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create inventory");
      }

      toast.success("Inventory record created successfully");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error creating inventory:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create inventory");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMedication = medications.find((m) => m.id === selectedMedicationId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Controlled Substance Inventory
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
          ) : medications.length === 0 ? (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="py-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="font-medium text-yellow-900">No Medications Available</p>
                <p className="text-sm text-yellow-700 mt-1">
                  All controlled substances already have inventory records,
                  or there are no controlled medications in the system.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Medication Selection */}
              <div>
                <Label htmlFor="medication">Select Medication *</Label>
                <Select
                  id="medication"
                  value={selectedMedicationId}
                  onChange={(e) => setSelectedMedicationId(e.target.value)}
                  className="mt-2 min-h-[44px]"
                >
                  <option value="">Choose a controlled substance...</option>
                  {medications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.strength} - {med.clientName}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Selected Medication Details */}
              {selectedMedication && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {selectedMedication.name}
                      <Badge variant="warning" className="text-xs">
                        {CONTROLLED_SCHEDULE_LABELS[selectedMedication.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{selectedMedication.strength} {selectedMedication.form}</p>
                    <p>Client: {selectedMedication.clientName}</p>
                    {selectedMedication.genericName && (
                      <p>Generic: {selectedMedication.genericName}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Initial Quantity */}
              <div>
                <Label htmlFor="quantity">Initial Quantity on Hand *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter the current physical count
                </p>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantityOnHand}
                  onChange={(e) => setQuantityOnHand(e.target.value)}
                  placeholder="Enter quantity"
                  className="min-h-[44px] text-lg"
                />
              </div>

              {/* Lot Number */}
              <div>
                <Label htmlFor="lotNumber">Lot Number</Label>
                <Input
                  id="lotNumber"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Optional"
                  className="mt-2 min-h-[44px]"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <Label htmlFor="expiration">Expiration Date</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="mt-2 min-h-[44px]"
                />
              </div>

              {/* Low Inventory Threshold */}
              <div>
                <Label htmlFor="threshold">Low Inventory Alert Threshold</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Alert when quantity falls to or below this number
                </p>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={lowInventoryThreshold}
                  onChange={(e) => setLowInventoryThreshold(e.target.value)}
                  placeholder="e.g., 10"
                  className="min-h-[44px]"
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
                  disabled={isSubmitting || !selectedMedicationId || !quantityOnHand}
                  className="flex-1 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Create Inventory
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
