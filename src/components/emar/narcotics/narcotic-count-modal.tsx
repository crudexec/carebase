"use client";

import * as React from "react";
import { X, AlertTriangle, Loader2, Save } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CONTROLLED_SCHEDULE_LABELS } from "@/lib/emar/types";

interface InventoryItem {
  id: string;
  medicationId: string;
  medicationName: string;
  genericName: string | null;
  strength: string;
  form: string;
  controlledSchedule: string;
  clientId: string;
  clientName: string;
  quantityOnHand: number;
  lotNumber: string | null;
  expirationDate: string | null;
}

interface NarcoticCountModalProps {
  inventory: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentShift: "DAY" | "EVENING" | "NIGHT" | "";
}

export function NarcoticCountModal({
  inventory,
  isOpen,
  onClose,
  onSuccess,
  currentShift,
}: NarcoticCountModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentCount, setCurrentCount] = React.useState("");
  const [expectedCount, setExpectedCount] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Reset form when modal opens with new inventory
  React.useEffect(() => {
    if (inventory && isOpen) {
      setCurrentCount("");
      // Set expected count to current quantity on hand as starting point
      setExpectedCount(inventory.quantityOnHand.toString());
      setNotes("");
    }
  }, [inventory, isOpen]);

  if (!isOpen || !inventory) return null;

  const previousCount = inventory.quantityOnHand;
  const currentCountNum = parseInt(currentCount) || 0;
  const expectedCountNum = parseInt(expectedCount) || 0;
  const discrepancy = currentCountNum - expectedCountNum;
  const hasDiscrepancy = currentCount !== "" && discrepancy !== 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCount) {
      toast.error("Please enter the current count");
      return;
    }

    if (!expectedCount) {
      toast.error("Please enter the expected count");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/narcotic-counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: inventory.id,
          shiftType: currentShift || "DAY",
          previousCount,
          currentCount: currentCountNum,
          expectedCount: expectedCountNum,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record count");
      }

      toast.success(
        hasDiscrepancy
          ? "Count recorded with discrepancy - requires resolution"
          : "Count recorded successfully"
      );
      onSuccess();
    } catch (error) {
      console.error("Error recording count:", error);
      toast.error(error instanceof Error ? error.message : "Failed to record count");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Narcotic Count</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Medication Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {inventory.medicationName}
                <Badge variant="warning" className="text-xs">
                  {CONTROLLED_SCHEDULE_LABELS[inventory.controlledSchedule as keyof typeof CONTROLLED_SCHEDULE_LABELS]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{inventory.strength} {inventory.form}</p>
              <p>Client: {inventory.clientName}</p>
              {inventory.lotNumber && <p>Lot: {inventory.lotNumber}</p>}
            </CardContent>
          </Card>

          {/* Shift Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Shift</span>
            <Badge variant="primary">{currentShift || "DAY"}</Badge>
          </div>

          {/* Previous Count Display */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Previous Count</span>
            <span className="text-2xl font-bold">{previousCount}</span>
          </div>

          {/* Expected Count Input */}
          <div>
            <Label htmlFor="expectedCount">Expected Count</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Based on previous count minus administered doses
            </p>
            <Input
              id="expectedCount"
              type="number"
              min="0"
              value={expectedCount}
              onChange={(e) => setExpectedCount(e.target.value)}
              placeholder="Expected quantity"
              className="min-h-[44px] text-lg"
            />
          </div>

          {/* Current Count Input */}
          <div>
            <Label htmlFor="currentCount">Current Count *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Physically count and enter the actual quantity
            </p>
            <Input
              id="currentCount"
              type="number"
              min="0"
              value={currentCount}
              onChange={(e) => setCurrentCount(e.target.value)}
              placeholder="Enter actual count"
              className="min-h-[44px] text-lg"
              autoFocus
            />
          </div>

          {/* Discrepancy Warning */}
          {hasDiscrepancy && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Discrepancy Detected</p>
                  <p className="text-sm text-red-700 mt-1">
                    Difference: {discrepancy > 0 ? "+" : ""}{discrepancy}
                    {discrepancy > 0 ? " (over)" : " (short)"}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    This will require witness verification and documented resolution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !currentCount}
              className="flex-1 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Count
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
