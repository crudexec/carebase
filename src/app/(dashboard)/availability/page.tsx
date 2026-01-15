"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityEditor } from "@/components/scheduling/availability-editor";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/availability");
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Only caregivers can manage their availability");
        }
        throw new Error("Failed to fetch availability");
      }
      const data = await response.json();
      setSlots(data.profile.availabilitySlots || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSave = async (newSlots: AvailabilitySlot[]) => {
    try {
      const response = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: newSlots }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save availability");
      }

      const data = await response.json();
      setSlots(data.profile.availabilitySlots || []);
      setSuccessMessage("Availability saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
      throw err;
    }
  };

  // Check if user is a carer
  if (session?.user?.role !== "CARER") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading-2 text-foreground">My Availability</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage your work availability
          </p>
        </div>
        <div className="p-4 rounded-lg bg-warning/20 text-body-sm text-warning">
          Only caregivers can manage their availability. This feature is not available for your role.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">My Availability</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Set your weekly availability for shift scheduling
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAvailability}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 rounded-md bg-success/20 text-body-sm text-success">
          {successMessage}
        </div>
      )}

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

      {/* Availability Editor */}
      <div className="bg-background rounded-lg border p-6">
        <AvailabilityEditor
          initialSlots={slots}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </div>

      {/* Tips */}
      <div className="bg-background-secondary rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Tips</h4>
        <ul className="text-sm text-foreground-secondary space-y-1 list-disc list-inside">
          <li>Click on time slots to toggle your availability</li>
          <li>Use &quot;All&quot; or &quot;None&quot; to quickly set availability for an entire day</li>
          <li>Your availability helps schedulers assign you to appropriate shifts</li>
          <li>Remember to update your availability if your schedule changes</li>
        </ul>
      </div>
    </div>
  );
}
