"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Label, Textarea } from "@/components/ui";
import { SignaturePad } from "@/components/ui/signature-pad";
import { CheckCircle2, FileSignature, Loader2, XCircle } from "lucide-react";

interface PublicOffer {
  id: string;
  status: string;
  renderedSubject: string;
  renderedBodyHtml: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  company: {
    name: string;
    phone: string | null;
    address: string | null;
  };
}

export default function PublicOfferPage() {
  const params = useParams();
  const token = params.token as string;
  const [offer, setOffer] = React.useState<PublicOffer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedStatus, setSubmittedStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchOffer() {
      try {
        const response = await fetch(`/api/offers/${token}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load offer");
        setOffer(data.offer);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offer");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffer();
  }, [token]);

  const submitResponse = async (action: "accept" | "decline") => {
    if (action === "accept" && !signature) {
      setError("Please sign before accepting the offer");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/offers/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "accept"
            ? { action, signatureData: signature, consentConfirmed: confirmed }
            : { action, declineReason }
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit response");
      setSubmittedStatus(data.offer.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
            <h1 className="text-xl font-semibold">Unable to Load Offer</h1>
            <p className="mt-2 text-sm text-foreground-secondary">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) return null;

  if (submittedStatus || offer.status === "ACCEPTED" || offer.status === "DECLINED") {
    const status = submittedStatus || offer.status;
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
            <h1 className="text-xl font-semibold">
              Offer {status === "ACCEPTED" ? "Accepted" : "Response Submitted"}
            </h1>
            <p className="mt-2 text-sm text-foreground-secondary">
              Thank you. {offer.company.name} has received your response.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary p-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileSignature className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{offer.renderedSubject}</h1>
          <p className="text-sm text-foreground-secondary">
            {offer.company.name} &bull; Expires {new Date(offer.expiresAt).toLocaleDateString()}
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-error/20 bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Offer Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {offer.renderedBodyHtml}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accept Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Signature</Label>
              <SignaturePad value={signature || undefined} onChange={setSignature} height={100} />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              <span>
                I confirm that I have reviewed this offer letter and agree to accept the terms presented.
              </span>
            </label>
            <Button
              className="w-full"
              disabled={isSubmitting || !signature || !confirmed}
              onClick={() => submitResponse("accept")}
            >
              {isSubmitting ? "Submitting..." : "Accept and Sign"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decline Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              rows={3}
              placeholder="Optional reason..."
            />
            <Button
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => submitResponse("decline")}
            >
              Decline Offer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
