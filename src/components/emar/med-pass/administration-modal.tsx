"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, AlertTriangle, User, X } from "lucide-react";
import { Button, Input, Textarea, Select, Label } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MedPassDose,
  MEDICATION_ROUTE_LABELS,
  ADMINISTRATION_RESULT_LABELS,
  AdministrationResult,
} from "@/lib/emar/types";

interface AdministrationModalProps {
  dose: MedPassDose | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WitnessOption {
  id: string;
  fullName: string;
  role: string;
}

export function AdministrationModal({
  dose,
  isOpen,
  onClose,
  onSuccess,
}: AdministrationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  // Form state
  const [result, setResult] = React.useState<string>("GIVEN");
  const [resultNotes, setResultNotes] = React.useState("");
  const [amountGiven, setAmountGiven] = React.useState("");
  const [administrationSite, setAdministrationSite] = React.useState("");
  const [witnessId, setWitnessId] = React.useState("");
  const [witnessSignature, setWitnessSignature] = React.useState("");
  const [availableWitnesses, setAvailableWitnesses] = React.useState<WitnessOption[]>([]);
  const [isLoadingWitnesses, setIsLoadingWitnesses] = React.useState(false);

  // Vitals
  const [bpSystolic, setBpSystolic] = React.useState("");
  const [bpDiastolic, setBpDiastolic] = React.useState("");
  const [pulse, setPulse] = React.useState("");
  const [temperature, setTemperature] = React.useState("");
  const [respiratoryRate, setRespiratoryRate] = React.useState("");
  const [oxygenSaturation, setOxygenSaturation] = React.useState("");
  const [showVitals, setShowVitals] = React.useState(false);

  const requiresWitness = dose?.medication.requiresWitness && result === "GIVEN";
  const isControlled = dose?.medication.controlledSchedule !== "NOT_CONTROLLED";

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && dose) {
      setResult("GIVEN");
      setResultNotes("");
      setAmountGiven(dose.medication.doseAmount);
      setAdministrationSite("");
      setWitnessId("");
      setWitnessSignature("");
      setAvailableWitnesses([]);
      setBpSystolic("");
      setBpDiastolic("");
      setPulse("");
      setTemperature("");
      setRespiratoryRate("");
      setOxygenSaturation("");
      setShowVitals(false);
    }
  }, [isOpen, dose]);

  React.useEffect(() => {
    const fetchWitnesses = async () => {
      if (!isOpen || !dose?.medication.requiresWitness) {
        return;
      }

      setIsLoadingWitnesses(true);
      try {
        const response = await fetch("/api/emar/witnesses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load witnesses");
        }

        setAvailableWitnesses(data.witnesses || []);
      } catch (error) {
        console.error("Error fetching witnesses:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load witnesses"
        );
      } finally {
        setIsLoadingWitnesses(false);
      }
    };

    fetchWitnesses();
  }, [isOpen, dose]);

  const handleClose = React.useCallback(() => {
    if (isSubmitting) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [isSubmitting, onClose]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleClose, isOpen, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dose) return;

    // Validate witness for controlled substances
    if (requiresWitness && !witnessId) {
      toast.error("Please select a witness for this controlled substance");
      return;
    }

    if (requiresWitness && !witnessSignature.trim()) {
      toast.error("Please record witness attestation for this controlled substance");
      return;
    }

    // Require notes for held/refused
    if ((result === "HELD" || result === "REFUSED") && !resultNotes.trim()) {
      toast.error(`Please provide a reason for ${result.toLowerCase()} medication`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build vitals object if any vitals provided
      const vitalsBeforeAdmin =
        bpSystolic || bpDiastolic || pulse || temperature || respiratoryRate || oxygenSaturation
          ? {
              bloodPressureSystolic: bpSystolic ? parseInt(bpSystolic) : undefined,
              bloodPressureDiastolic: bpDiastolic ? parseInt(bpDiastolic) : undefined,
              pulse: pulse ? parseInt(pulse) : undefined,
              temperature: temperature ? parseFloat(temperature) : undefined,
              respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
              oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : undefined,
            }
          : undefined;

      const response = await fetch("/api/administrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: dose.medication.id,
          clientId: dose.client.id,
          scheduledTime: dose.scheduledTime,
          administeredAt: result === "GIVEN" ? new Date().toISOString() : undefined,
          result,
          resultNotes: resultNotes || undefined,
          amountGiven: amountGiven || undefined,
          administrationSite: administrationSite || undefined,
          witnessId: witnessId || undefined,
          witnessSignature: witnessSignature || undefined,
          vitalsBeforeAdmin,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record administration");
      }

      toast.success(
        `${dose.medication.name} recorded as ${ADMINISTRATION_RESULT_LABELS[result as AdministrationResult]}`
      );

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error recording administration:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to record administration"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !dose) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-150",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-background rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-all duration-150",
          isClosing
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100 animate-in fade-in zoom-in-95"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 p-1 text-foreground-tertiary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <h2 className="text-lg font-semibold mb-1">Record Medication Administration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Document the administration of this medication dose
          </p>

          {/* Medication Summary */}
          <div className="p-4 bg-background-secondary rounded-lg space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{dose.medication.name}</h3>
              {isControlled && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Controlled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {dose.medication.strength} {dose.medication.form} via{" "}
              {MEDICATION_ROUTE_LABELS[dose.medication.route]}
            </p>
            <p className="text-sm">
              <strong>Dose:</strong> {dose.medication.doseAmount}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>
                {dose.client.firstName} {dose.client.lastName}
              </span>
            </div>
            <p className="text-sm">
              <strong>Scheduled:</strong>{" "}
              {format(new Date(dose.scheduledTime), "h:mm a")}
            </p>
            {dose.medication.specialInstructions && (
              <p className="text-sm italic text-muted-foreground">
                {dose.medication.specialInstructions}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Result */}
            <div>
              <Label htmlFor="result">Administration Result *</Label>
              <Select
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
              >
                <option value="GIVEN">Given</option>
                <option value="HELD">Held</option>
                <option value="REFUSED">Refused</option>
                <option value="NOT_AVAILABLE">Not Available</option>
                <option value="SELF_ADMINISTERED">Self-Administered</option>
              </Select>
            </div>

            {/* Amount Given (only for GIVEN) */}
            {result === "GIVEN" && (
              <div>
                <Label htmlFor="amountGiven">Amount Given</Label>
                <Input
                  id="amountGiven"
                  value={amountGiven}
                  onChange={(e) => setAmountGiven(e.target.value)}
                  placeholder={dose.medication.doseAmount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to use prescribed dose
                </p>
              </div>
            )}

            {/* Administration Site */}
            {result === "GIVEN" && (
              <div>
                <Label htmlFor="administrationSite">Administration Site</Label>
                <Input
                  id="administrationSite"
                  value={administrationSite}
                  onChange={(e) => setAdministrationSite(e.target.value)}
                  placeholder="e.g., Left arm, Right thigh"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="resultNotes">
                Notes {(result === "HELD" || result === "REFUSED") && "*"}
              </Label>
              <Textarea
                id="resultNotes"
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                rows={3}
                placeholder={
                  result === "HELD"
                    ? "Reason for holding medication..."
                    : result === "REFUSED"
                    ? "Document refusal details..."
                    : "Additional notes..."
                }
              />
            </div>

            {/* Vitals Section (collapsed by default) */}
            {result === "GIVEN" && (
              <div className="border rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowVitals(!showVitals)}
                  className="font-medium text-sm flex items-center gap-2"
                >
                  {showVitals ? "▼" : "▶"} Record Vitals (Optional)
                </button>
                {showVitals && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="bpSystolic">BP Systolic</Label>
                      <Input
                        id="bpSystolic"
                        type="number"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bpDiastolic">BP Diastolic</Label>
                      <Input
                        id="bpDiastolic"
                        type="number"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pulse">Pulse</Label>
                      <Input
                        id="pulse"
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature (°F)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="98.6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        value={respiratoryRate}
                        onChange={(e) => setRespiratoryRate(e.target.value)}
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        value={oxygenSaturation}
                        onChange={(e) => setOxygenSaturation(e.target.value)}
                        placeholder="98"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Witness Section for Controlled Substances */}
            {requiresWitness && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-medium">Witness Required</h4>
                </div>
                <p className="text-sm text-orange-600">
                  This is a controlled substance and requires witness verification.
                </p>
                <div>
                  <Label htmlFor="witnessId">Witness *</Label>
                  <Select
                    id="witnessId"
                    value={witnessId}
                    onChange={(e) => setWitnessId(e.target.value)}
                    disabled={isLoadingWitnesses}
                  >
                    <option value="">
                      {isLoadingWitnesses
                        ? "Loading witnesses..."
                        : "Select a witness..."}
                    </option>
                    {availableWitnesses.map((witness) => (
                      <option key={witness.id} value={witness.id}>
                        {witness.fullName} ({witness.role})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="witnessSignature">Witness Attestation *</Label>
                  <Input
                    id="witnessSignature"
                    value={witnessSignature}
                    onChange={(e) => setWitnessSignature(e.target.value)}
                    placeholder="Enter witness initials or signature note"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    The witness verifies the medication administration
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Administration"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
