"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  AlertTriangle,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { MISSED_VISIT_REASONS } from "@/lib/missed-visit-reasons";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface MissedVisitModalProps {
  shiftId: string;
  clientName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function MissedVisitModal({
  shiftId,
  clientName,
  onSuccess,
  onClose,
}: MissedVisitModalProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      const response = await fetch(`/api/shifts/${shiftId}/mark-missed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");

        // Auto-close after 2 seconds on success
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to mark shift as missed");
      }
    } catch (err) {
      console.error("Mark missed error:", err);
      setError(err instanceof Error ? err.message : "Failed to mark shift as missed");
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-foreground-secondary hover:text-foreground transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Mark Visit as Missed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "idle" || status === "error" ? (
            <>
              {/* Client Info */}
              <div className="text-center">
                <p className="text-foreground-secondary">
                  Marking visit as missed for
                </p>
                <p className="text-lg font-medium">{clientName}</p>
              </div>

              {/* Reason Select */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason <span className="text-error">*</span>
                </Label>
                <Select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select a reason</option>
                  {MISSED_VISIT_REASONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Notes (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Additional Notes <span className="text-foreground-tertiary">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details about the missed visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-error text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-warning hover:bg-warning/90"
                  disabled={!reason || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Mark as Missed"
                  )}
                </Button>
              </div>
            </>
          ) : status === "submitting" ? (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-warning mx-auto animate-spin" />
              <p className="text-foreground-secondary">Marking visit as missed...</p>
            </div>
          ) : status === "success" ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <div>
                <p className="font-medium text-success">Visit Marked as Missed</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  The shift has been marked as missed. Supervisors have been notified.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
