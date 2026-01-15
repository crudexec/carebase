"use client";

import { useState, useEffect } from "react";
import { ShiftStatus } from "@prisma/client";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftData } from "./shift-card";
import { SHIFT_STATUSES } from "@/lib/scheduling";

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

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShiftFormData) => Promise<void>;
  shift?: ShiftData | null;
  caregivers: CaregiverOption[];
  clients: ClientOption[];
  selectedDate?: Date;
}

export interface ShiftFormData {
  carerId: string;
  clientId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status?: ShiftStatus;
}

export function ShiftFormModal({
  isOpen,
  onClose,
  onSubmit,
  shift,
  caregivers,
  clients,
  selectedDate,
}: ShiftFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultDate = () => {
    const date = selectedDate || new Date();
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<ShiftFormData>({
    carerId: "",
    clientId: "",
    scheduledStart: `${getDefaultDate()}T09:00`,
    scheduledEnd: `${getDefaultDate()}T17:00`,
    status: "SCHEDULED",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        carerId: shift.carer.id,
        clientId: shift.client.id,
        scheduledStart: new Date(shift.scheduledStart).toISOString().slice(0, 16),
        scheduledEnd: new Date(shift.scheduledEnd).toISOString().slice(0, 16),
        status: shift.status,
      });
    } else {
      const date = getDefaultDate();
      setFormData({
        carerId: "",
        clientId: "",
        scheduledStart: `${date}T09:00`,
        scheduledEnd: `${date}T17:00`,
        status: "SCHEDULED",
      });
    }
    setError(null);
  }, [shift, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate times
      const start = new Date(formData.scheduledStart);
      const end = new Date(formData.scheduledEnd);
      if (end <= start) {
        throw new Error("End time must be after start time");
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!shift;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Shift" : "Create Shift"}</CardTitle>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-error/20 text-body-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="clientId" required>Client</Label>
              <select
                id="clientId"
                value={formData.clientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
                required
                className="flex w-full rounded-md border bg-background-secondary px-4 py-3 text-body transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carerId" required>Carer</Label>
              <select
                id="carerId"
                value={formData.carerId}
                onChange={(e) => setFormData((prev) => ({ ...prev, carerId: e.target.value }))}
                required
                className="flex w-full rounded-md border bg-background-secondary px-4 py-3 text-body transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a carer</option>
                {caregivers.map((carer) => (
                  <option key={carer.id} value={carer.id}>
                    {carer.firstName} {carer.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledStart" required>Start Time</Label>
                <Input
                  id="scheduledStart"
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledStart: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledEnd" required>End Time</Label>
                <Input
                  id="scheduledEnd"
                  type="datetime-local"
                  value={formData.scheduledEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledEnd: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as ShiftStatus }))
                  }
                  className="flex w-full rounded-md border bg-background-secondary px-4 py-3 text-body transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {SHIFT_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    {isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Shift"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
