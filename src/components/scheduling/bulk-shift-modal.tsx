"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  CalendarPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users,
  Calendar,
  Loader2,
  Info,
} from "lucide-react";
import {
  DAY_NAMES_SHORT,
  formatTime12Hour,
  formatDateShort,
  formatUnitType,
  calculateHoursBetween,
} from "@/lib/bulk-scheduling";

interface CaregiverOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface PreviewShift {
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  hasConflict: boolean;
}

interface PreviewAuthorization {
  id: string;
  authorizedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  unitType: string;
  endDate: string;
  hasInsufficientUnits: boolean;
  unitsAfterCreation: number;
}

interface PreviewData {
  valid: boolean;
  shifts: PreviewShift[];
  totalShifts: number;
  shiftsToCreate: number;
  totalHours: number;
  hoursPerShift: number;
  unitsToConsume: number;
  authorization: PreviewAuthorization | null;
  conflicts: { date: string; existingShiftId: string }[];
}

interface BulkShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caregivers: CaregiverOption[];
  clients: ClientOption[];
}

export function BulkShiftModal({
  isOpen,
  onClose,
  onSuccess,
  caregivers,
  clients,
}: BulkShiftModalProps) {
  // Form state
  const [clientId, setClientId] = useState("");
  const [carerId, setCarerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [skipConflicts, setSkipConflicts] = useState(false);

  // Preview state
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ created: number; skipped: number } | null>(null);

  // Set default start date to today
  useEffect(() => {
    if (isOpen && !startDate) {
      const today = new Date();
      setStartDate(today.toISOString().split("T")[0]);
    }
  }, [isOpen, startDate]);

  // Fetch preview when form changes
  const fetchPreview = useCallback(async () => {
    if (!clientId || !carerId || !startDate || selectedDays.length === 0) {
      setPreview(null);
      return;
    }

    const hours = calculateHoursBetween(startTime, endTime);
    if (hours <= 0) {
      setPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const params = new URLSearchParams({
        clientId,
        carerId,
        startDate,
        numberOfWeeks: numberOfWeeks.toString(),
        selectedDays: selectedDays.join(","),
        startTime,
        endTime,
      });

      const response = await fetch(`/api/scheduling/bulk?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (err) {
      console.error("Failed to fetch preview:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [clientId, carerId, startDate, numberOfWeeks, selectedDays, startTime, endTime]);

  // Debounced preview fetch
  useEffect(() => {
    const timer = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  // Toggle day selection
  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/scheduling/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          carerId,
          startDate,
          numberOfWeeks,
          selectedDays,
          startTime,
          endTime,
          skipConflicts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create shifts");
      }

      setSuccess({ created: data.created, skipped: data.skipped });
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shifts");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setClientId("");
    setCarerId("");
    setStartDate("");
    setNumberOfWeeks(1);
    setSelectedDays([1, 3, 5]);
    setStartTime("09:00");
    setEndTime("13:00");
    setSkipConflicts(false);
    setPreview(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  const hoursPerShift = calculateHoursBetween(startTime, endTime);
  const isFormValid =
    clientId &&
    carerId &&
    startDate &&
    selectedDays.length > 0 &&
    hoursPerShift > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Bulk Schedule Shifts</CardTitle>
              <p className="text-sm text-foreground-secondary mt-0.5">
                Create recurring shifts across multiple weeks
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Panel - Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 p-6 overflow-y-auto border-r border-border"
            >
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Successfully created {success.created} shifts
                  {success.skipped > 0 && ` (${success.skipped} skipped)`}
                </div>
              )}

              {/* Client Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Client <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Carer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Caregiver <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                  <select
                    value={carerId}
                    onChange={(e) => setCarerId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select a caregiver</option>
                    {caregivers.map((carer) => (
                      <option key={carer.id} value={carer.id}>
                        {carer.firstName} {carer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Start Date <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              {/* Number of Weeks */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Number of Weeks <span className="text-error">*</span>
                </label>
                <select
                  value={numberOfWeeks}
                  onChange={(e) => setNumberOfWeeks(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} week{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days of Week */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Days of Week <span className="text-error">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAY_NAMES_SHORT.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                        selectedDays.includes(index)
                          ? "bg-primary text-white"
                          : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-xs text-error mt-1">Select at least one day</p>
                )}
              </div>

              {/* Time Slot */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Time Slot <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
                {hoursPerShift > 0 && (
                  <p className="text-xs text-foreground-secondary mt-1">
                    {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)} ({hoursPerShift} hours per shift)
                  </p>
                )}
                {hoursPerShift <= 0 && startTime && endTime && (
                  <p className="text-xs text-error mt-1">End time must be after start time</p>
                )}
              </div>

              {/* Skip Conflicts Option */}
              {preview && preview.conflicts.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipConflicts}
                      onChange={(e) => setSkipConflicts(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-warning">
                        {preview.conflicts.length} conflicting shift{preview.conflicts.length > 1 ? "s" : ""} detected
                      </span>
                      <br />
                      <span className="text-foreground-secondary">
                        Check to skip dates with conflicts instead of failing
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || (preview?.conflicts.length || 0) > 0 && !skipConflicts}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : preview ? (
                    `Create ${preview.shiftsToCreate} Shifts`
                  ) : (
                    "Create Shifts"
                  )}
                </Button>
              </div>
            </form>

            {/* Right Panel - Preview */}
            <div className="w-full lg:w-96 bg-background-secondary p-6 overflow-y-auto">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Preview
              </h3>

              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !preview ? (
                <div className="text-center py-12 text-foreground-secondary text-sm">
                  Fill in the form to see a preview of shifts that will be created
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background border border-border">
                      <p className="text-2xl font-bold text-primary">{preview.shiftsToCreate}</p>
                      <p className="text-xs text-foreground-secondary">Shifts to create</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border">
                      <p className="text-2xl font-bold text-foreground">{preview.totalHours}</p>
                      <p className="text-xs text-foreground-secondary">Total hours</p>
                    </div>
                  </div>

                  {/* Authorization Impact */}
                  {preview.authorization ? (
                    <div
                      className={cn(
                        "p-4 rounded-lg border",
                        preview.authorization.hasInsufficientUnits
                          ? "bg-error/5 border-error/30"
                          : "bg-background border-border"
                      )}
                    >
                      <h4 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
                        Authorization Impact
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Unit Type</span>
                          <span className="font-medium">{formatUnitType(preview.authorization.unitType as "HOURLY" | "QUARTER_HOURLY" | "DAILY")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Current Usage</span>
                          <span className="font-medium">
                            {preview.authorization.usedUnits} / {preview.authorization.authorizedUnits}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">This Batch</span>
                          <span className="font-medium text-warning">+{preview.unitsToConsume}</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">After Creation</span>
                          <span
                            className={cn(
                              "font-bold",
                              preview.authorization.hasInsufficientUnits ? "text-error" : "text-success"
                            )}
                          >
                            {preview.authorization.usedUnits + preview.unitsToConsume} / {preview.authorization.authorizedUnits}
                          </span>
                        </div>
                      </div>
                      {preview.authorization.hasInsufficientUnits && (
                        <div className="mt-3 p-2 rounded bg-error/10 text-error text-xs flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>
                            Insufficient units! Will exceed authorization by{" "}
                            {Math.abs(preview.authorization.unitsAfterCreation)} {formatUnitType(preview.authorization.unitType as "HOURLY" | "QUARTER_HOURLY" | "DAILY")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : clientId ? (
                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/30">
                      <div className="flex items-start gap-2 text-warning text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>No active authorization found for this client</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Scheduled Dates */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-2">
                      Scheduled Dates ({preview.shifts.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {preview.shifts.map((shift, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center justify-between p-2 rounded text-sm",
                            shift.hasConflict
                              ? "bg-error/10 border border-error/30"
                              : "bg-background border border-border"
                          )}
                        >
                          <span className={shift.hasConflict ? "text-error" : "text-foreground"}>
                            {formatDateShort(new Date(shift.date))}
                          </span>
                          {shift.hasConflict ? (
                            <Badge variant="default" className="bg-error/10 text-error text-[10px]">
                              Conflict
                            </Badge>
                          ) : (
                            <span className="text-foreground-secondary text-xs">
                              {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
