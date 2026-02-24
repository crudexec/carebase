"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pill,
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Label,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import {
  MedicationRoute,
  MedicationFrequency,
  ControlledSubstanceSchedule,
  MedicationSearchResult,
  MEDICATION_ROUTE_LABELS,
  MEDICATION_FREQUENCY_LABELS,
  CONTROLLED_SCHEDULE_LABELS,
} from "@/lib/emar/types";
import { MedicationSearch } from "./medication-search";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string | null;
}

interface MedicationFormProps {
  medicationId?: string;
  clientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MedicationForm({
  medicationId,
  clientId: initialClientId,
  onSuccess,
  onCancel,
}: MedicationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [physicians, setPhysicians] = React.useState<Physician[]>([]);
  const [isManualEntry, setIsManualEntry] = React.useState(false);
  const [selectedRxcui, setSelectedRxcui] = React.useState<string | null>(null);

  // Form state
  const [name, setName] = React.useState("");
  const [genericName, setGenericName] = React.useState("");
  const [ndc, setNdc] = React.useState("");
  const [strength, setStrength] = React.useState("");
  const [form, setForm] = React.useState("");
  const [route, setRoute] = React.useState<MedicationRoute>("ORAL");
  const [doseAmount, setDoseAmount] = React.useState("");
  const [frequency, setFrequency] = React.useState<MedicationFrequency>("ONCE_DAILY");
  const [frequencyOther, setFrequencyOther] = React.useState("");
  const [prnReason, setPrnReason] = React.useState("");
  const [maxDailyDoses, setMaxDailyDoses] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = React.useState("");
  const [controlledSchedule, setControlledSchedule] = React.useState<ControlledSubstanceSchedule>("NOT_CONTROLLED");
  const [requiresWitness, setRequiresWitness] = React.useState(false);
  const [prescriberId, setPrescriberId] = React.useState("");
  const [prescriptionNumber, setPrescriptionNumber] = React.useState("");
  const [indication, setIndication] = React.useState("");
  const [specialInstructions, setSpecialInstructions] = React.useState("");
  const [clientId, setClientId] = React.useState(initialClientId || "");

  // Array state
  const [scheduledTimes, setScheduledTimes] = React.useState<string[]>([]);
  const [newTime, setNewTime] = React.useState("");
  const [interactions, setInteractions] = React.useState<string[]>([]);
  const [newInteraction, setNewInteraction] = React.useState("");
  const [sideEffects, setSideEffects] = React.useState<string[]>([]);
  const [newSideEffect, setNewSideEffect] = React.useState("");

  const isEdit = Boolean(medicationId);
  const isPRN = frequency === "AS_NEEDED_PRN";
  const isControlled = controlledSchedule !== "NOT_CONTROLLED";

  // Handle medication selection from RxNorm search
  const handleMedicationSelect = (medication: MedicationSearchResult) => {
    setSelectedRxcui(medication.rxcui);
    setName(medication.name);
    setGenericName(medication.genericName);
    setStrength(medication.strength);
    setForm(medication.form);
    setRoute(medication.route);
    // Pre-fill dose amount with "1" + form (e.g., "1 Tablet")
    if (medication.form) {
      setDoseAmount(`1 ${medication.form}`);
    }
  };

  // Clear selected medication and switch to manual entry
  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedRxcui(null);
  };

  // Switch back to search mode
  const handleSearchMode = () => {
    setIsManualEntry(false);
  };

  // Fetch clients
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients?status=ACTIVE&limit=100");
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch physicians
  React.useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch("/api/physicians?limit=100");
        if (response.ok) {
          const data = await response.json();
          setPhysicians(data.physicians || []);
        }
      } catch (error) {
        console.error("Error fetching physicians:", error);
      }
    };
    fetchPhysicians();
  }, []);

  // Fetch existing medication if editing
  React.useEffect(() => {
    if (medicationId) {
      const fetchMedication = async () => {
        try {
          const response = await fetch(`/api/medications/${medicationId}`);
          if (response.ok) {
            const data = await response.json();
            setName(data.name || "");
            setGenericName(data.genericName || "");
            setNdc(data.ndc || "");
            setStrength(data.strength || "");
            setForm(data.form || "");
            setRoute(data.route || "ORAL");
            setDoseAmount(data.doseAmount || "");
            setFrequency(data.frequency || "ONCE_DAILY");
            setFrequencyOther(data.frequencyOther || "");
            setPrnReason(data.prnReason || "");
            setMaxDailyDoses(data.maxDailyDoses?.toString() || "");
            setStartDate(data.startDate?.split("T")[0] || "");
            setEndDate(data.endDate?.split("T")[0] || "");
            setControlledSchedule(data.controlledSchedule || "NOT_CONTROLLED");
            setRequiresWitness(data.requiresWitness || false);
            setPrescriberId(data.prescriberId || "");
            setPrescriptionNumber(data.prescriptionNumber || "");
            setIndication(data.indication || "");
            setSpecialInstructions(data.specialInstructions || "");
            setClientId(data.clientId || "");
            setScheduledTimes(data.scheduledTimes || []);
            setInteractions(data.interactions || []);
            setSideEffects(data.sideEffects || []);
          }
        } catch (error) {
          console.error("Error fetching medication:", error);
        }
      };
      fetchMedication();
    }
  }, [medicationId]);

  const addScheduledTime = () => {
    if (newTime && !scheduledTimes.includes(newTime)) {
      setScheduledTimes([...scheduledTimes, newTime].sort());
      setNewTime("");
    }
  };

  const removeScheduledTime = (time: string) => {
    setScheduledTimes(scheduledTimes.filter((t) => t !== time));
  };

  const addInteraction = () => {
    if (newInteraction && !interactions.includes(newInteraction)) {
      setInteractions([...interactions, newInteraction]);
      setNewInteraction("");
    }
  };

  const removeInteraction = (item: string) => {
    setInteractions(interactions.filter((i) => i !== item));
  };

  const addSideEffect = () => {
    if (newSideEffect && !sideEffects.includes(newSideEffect)) {
      setSideEffects([...sideEffects, newSideEffect]);
      setNewSideEffect("");
    }
  };

  const removeSideEffect = (item: string) => {
    setSideEffects(sideEffects.filter((s) => s !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Medication name is required");
      return;
    }
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!strength.trim()) {
      toast.error("Strength is required");
      return;
    }
    if (!form.trim()) {
      toast.error("Form is required");
      return;
    }
    if (!doseAmount.trim()) {
      toast.error("Dose amount is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!isPRN && scheduledTimes.length === 0) {
      toast.error("Please add at least one scheduled time");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        genericName: genericName || undefined,
        ndc: ndc || undefined,
        strength,
        form,
        route,
        doseAmount,
        frequency,
        frequencyOther: frequencyOther || undefined,
        scheduledTimes,
        prnReason: isPRN ? prnReason : undefined,
        maxDailyDoses: maxDailyDoses ? parseInt(maxDailyDoses) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        controlledSchedule,
        requiresWitness,
        prescriberId: prescriberId || undefined,
        prescriptionNumber: prescriptionNumber || undefined,
        indication: indication || undefined,
        specialInstructions: specialInstructions || undefined,
        interactions,
        sideEffects,
        clientId,
      };

      const url = isEdit
        ? `/api/medications/${medicationId}`
        : "/api/medications";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save medication");
      }

      toast.success(
        isEdit
          ? "Medication updated successfully"
          : "Medication added successfully"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/emar/medications");
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save medication"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Selection */}
          <div>
            <Label htmlFor="clientId">Client *</Label>
            <Select
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={Boolean(initialClientId)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Medication Search or Manual Entry Toggle */}
          {!isEdit && (
            <div className="space-y-3">
              {!isManualEntry && !selectedRxcui && (
                <>
                  <Label>Search Medication</Label>
                  <MedicationSearch
                    onSelect={handleMedicationSelect}
                    placeholder="Search medications (e.g., Lipitor, Metformin)..."
                  />
                  <p className="text-xs text-foreground-secondary">
                    Search the RxNorm database, or{" "}
                    <button
                      type="button"
                      onClick={handleManualEntry}
                      className="text-primary underline hover:no-underline"
                    >
                      enter manually
                    </button>
                  </p>
                </>
              )}

              {selectedRxcui && (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{name}</span>
                    <Badge variant="default" className="text-xs">
                      {strength}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRxcui(null);
                      setName("");
                      setGenericName("");
                      setStrength("");
                      setForm("");
                      setRoute("ORAL");
                      setDoseAmount("");
                    }}
                  >
                    <X className="h-4 w-4" />
                    Change
                  </Button>
                </div>
              )}

              {isManualEntry && (
                <div className="flex items-center justify-between">
                  <Label className="text-foreground-secondary">Manual Entry Mode</Label>
                  <button
                    type="button"
                    onClick={handleSearchMode}
                    className="text-xs text-primary underline hover:no-underline"
                  >
                    Switch to search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Show editable fields when editing, manual entry, or after selecting from search */}
          {(isEdit || isManualEntry || selectedRxcui) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Lisinopril"
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g., lisinopril"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="strength">Strength *</Label>
                  <Input
                    id="strength"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g., 10mg"
                  />
                </div>
                <div>
                  <Label htmlFor="form">Form *</Label>
                  <Input
                    id="form"
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                    placeholder="e.g., Tablet"
                  />
                </div>
                <div>
                  <Label htmlFor="route">Route *</Label>
                  <Select
                    id="route"
                    value={route}
                    onChange={(e) => setRoute(e.target.value as MedicationRoute)}
                  >
                    {Object.entries(MEDICATION_ROUTE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doseAmount">Dose Amount *</Label>
                  <Input
                    id="doseAmount"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    placeholder="e.g., 1 tablet"
                  />
                </div>
                <div>
                  <Label htmlFor="ndc">NDC Code</Label>
                  <Input
                    id="ndc"
                    value={ndc}
                    onChange={(e) => setNdc(e.target.value)}
                    placeholder="e.g., 12345-678-90"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
              >
                {Object.entries(MEDICATION_FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {frequency === "OTHER" && (
              <div>
                <Label htmlFor="frequencyOther">Specify Frequency</Label>
                <Input
                  id="frequencyOther"
                  value={frequencyOther}
                  onChange={(e) => setFrequencyOther(e.target.value)}
                  placeholder="Describe the schedule"
                />
              </div>
            )}
          </div>

          {/* PRN Fields */}
          {isPRN && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prnReason">PRN Reason</Label>
                <Input
                  id="prnReason"
                  value={prnReason}
                  onChange={(e) => setPrnReason(e.target.value)}
                  placeholder="e.g., For pain"
                />
              </div>
              <div>
                <Label htmlFor="maxDailyDoses">Max Daily Doses</Label>
                <Input
                  id="maxDailyDoses"
                  type="number"
                  value={maxDailyDoses}
                  onChange={(e) => setMaxDailyDoses(e.target.value)}
                  placeholder="e.g., 4"
                />
              </div>
            </div>
          )}

          {/* Scheduled Times */}
          {!isPRN && (
            <div>
              <Label>Scheduled Times *</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addScheduledTime}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {scheduledTimes.map((time) => (
                  <Badge key={time} variant="default" className="flex items-center gap-1">
                    {time}
                    <button
                      type="button"
                      onClick={() => removeScheduledTime(time)}
                      className="ml-1 hover:text-error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controlled Substance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Controlled Substance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="controlledSchedule">Schedule</Label>
            <Select
              id="controlledSchedule"
              value={controlledSchedule}
              onChange={(e) => setControlledSchedule(e.target.value as ControlledSubstanceSchedule)}
            >
              {Object.entries(CONTROLLED_SCHEDULE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {isControlled && (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-900">Requires Witness</p>
                <p className="text-sm text-orange-700">
                  Require a second person to verify administration
                </p>
              </div>
              <input
                type="checkbox"
                checked={requiresWitness}
                onChange={(e) => setRequiresWitness(e.target.checked)}
                className="h-5 w-5"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriber */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriber Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prescriberId">Prescriber</Label>
              <Select
                id="prescriberId"
                value={prescriberId}
                onChange={(e) => setPrescriberId(e.target.value)}
              >
                <option value="">Select prescriber</option>
                {physicians.map((physician) => (
                  <option key={physician.id} value={physician.id}>
                    Dr. {physician.firstName} {physician.lastName}
                    {physician.npi && ` (NPI: ${physician.npi})`}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="prescriptionNumber">Prescription Number</Label>
              <Input
                id="prescriptionNumber"
                value={prescriptionNumber}
                onChange={(e) => setPrescriptionNumber(e.target.value)}
                placeholder="Rx number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="indication">Indication</Label>
            <Input
              id="indication"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="Why is this medication prescribed?"
            />
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              placeholder="e.g., Take with food"
            />
          </div>

          {/* Interactions */}
          <div>
            <Label>Drug Interactions</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newInteraction}
                onChange={(e) => setNewInteraction(e.target.value)}
                placeholder="Add interaction warning"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addInteraction}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interactions.map((item) => (
                <Badge key={item} variant="warning" className="flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeInteraction(item)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Side Effects */}
          <div>
            <Label>Side Effects</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSideEffect}
                onChange={(e) => setNewSideEffect(e.target.value)}
                placeholder="Add side effect"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSideEffect}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sideEffects.map((item) => (
                <Badge key={item} variant="default" className="flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeSideEffect(item)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel || (() => router.back())}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Update Medication" : "Add Medication"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
