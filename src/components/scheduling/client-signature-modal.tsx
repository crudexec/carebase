"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/ui/signature-pad";
import {
  PenLine,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface ClientSignatureModalProps {
  shiftId: string;
  clientName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ClientSignatureModal({
  shiftId,
  clientName,
  onSuccess,
  onClose,
}: ClientSignatureModalProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [signature, setSignature] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!signature) {
      setError("Please provide a signature");
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      const response = await fetch(`/api/shifts/${shiftId}/signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          signerName: signerName.trim() || undefined,
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
        throw new Error(data.error || "Failed to save signature");
      }
    } catch (err) {
      console.error("Signature submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to save signature");
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
            <PenLine className="w-5 h-5 text-primary" />
            Client Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "idle" || status === "error" ? (
            <>
              {/* Client Info */}
              <div className="text-center">
                <p className="text-foreground-secondary">
                  Capturing signature for shift with
                </p>
                <p className="text-lg font-medium">{clientName}</p>
              </div>

              {/* Signer Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="signerName">
                  Signer Name <span className="text-foreground-tertiary">(optional)</span>
                </Label>
                <Input
                  id="signerName"
                  placeholder="Enter the name of the person signing"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Signature Pad */}
              <div className="space-y-2">
                <Label>Signature</Label>
                <SignaturePad
                  value={signature || undefined}
                  onChange={setSignature}
                  width={400}
                  height={150}
                  disabled={isSubmitting}
                  error={!!error && !signature}
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
                  className="flex-1"
                  disabled={!signature || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Signature"
                  )}
                </Button>
              </div>
            </>
          ) : status === "submitting" ? (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-foreground-secondary">Saving signature...</p>
            </div>
          ) : status === "success" ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <div>
                <p className="font-medium text-success">Signature Captured</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  Client signature has been saved successfully
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
