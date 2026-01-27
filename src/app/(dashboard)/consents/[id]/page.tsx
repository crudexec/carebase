"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { ConsentFormRenderer } from "@/components/consents/consent-form-renderer";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Consent {
  id: string;
  status: string;
  signatureType: string | null;
  signatureData: string | null;
  signedByName: string | null;
  signedByRelation: string | null;
  signedAt: string | null;
  template: {
    id: string;
    name: string;
    description: string | null;
    content: string;
    formType: string;
    requiresWitness: boolean;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
  intake: {
    id: string;
    status: string;
  } | null;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-warning/10 text-warning" },
  SIGNED: { label: "Signed", color: "bg-success/10 text-success" },
  EXPIRED: { label: "Expired", color: "bg-error/10 text-error" },
  REVOKED: { label: "Revoked", color: "bg-foreground/10 text-foreground-secondary" },
};

export default function ConsentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const consentId = params.id as string;

  const [consent, setConsent] = React.useState<Consent | null>(null);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSigning, setIsSigning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchData();
  }, [consentId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [consentRes, staffRes] = await Promise.all([
        fetch(`/api/consents/${consentId}`),
        fetch("/api/staff?roles=ADMIN,OPS_MANAGER,CLINICAL_DIRECTOR,STAFF"),
      ]);

      const [consentData, staffData] = await Promise.all([
        consentRes.json(),
        staffRes.json(),
      ]);

      if (!consentRes.ok) {
        throw new Error(consentData.error || "Failed to fetch consent");
      }

      setConsent(consentData.consent);
      setStaff(staffData.staff || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch consent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (data: {
    signatureType: string;
    signatureData: string | null;
    signedByName: string;
    signedByRelation: string;
    witnessId?: string;
  }) => {
    setIsSigning(true);
    setError(null);

    try {
      const response = await fetch(`/api/consents/${consentId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ipAddress: "", // Could capture this client-side
          userAgent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to sign consent");
      }

      setConsent(result.consent);

      // Redirect back to intake if applicable
      if (consent?.intake) {
        setTimeout(() => {
          router.push(`/intake/${consent.intake!.id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign consent");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !consent) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/intake">
            <button type="button" className="rounded p-1 hover:bg-background-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Consent Form</h1>
        </div>
        <div className="text-center py-8 text-error">
          <p>{error || "Consent not found"}</p>
          <Button variant="secondary" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[consent.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded p-1 hover:bg-background-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{consent.template.name}</h1>
            <p className="text-foreground-secondary">
              For: {consent.client.firstName} {consent.client.lastName}
            </p>
          </div>
        </div>
        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Form Renderer */}
      <ConsentFormRenderer
        template={consent.template}
        client={consent.client}
        staff={staff}
        isSigned={consent.status === "SIGNED"}
        signedAt={consent.signedAt}
        signedByName={consent.signedByName}
        signatureData={consent.signatureData}
        onSign={handleSign}
        isSigning={isSigning}
      />
    </div>
  );
}
