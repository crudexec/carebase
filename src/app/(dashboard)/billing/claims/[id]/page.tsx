"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
} from "@/components/ui";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Download,
  User,
  Building2,
  Calendar,
  Stethoscope,
} from "lucide-react";

interface ClaimLine {
  id: string;
  lineNumber: number;
  serviceDate: string;
  hcpcsCode: string;
  modifiers: string[];
  units: number;
  unitRate: number;
  lineAmount: number;
  serviceType?: {
    id: string;
    code: string;
    name: string;
  };
}

interface Submission {
  id: string;
  submissionType: string;
  status: string;
  clearinghouse: string;
  ediFileName: string | null;
  submittedAt: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  serviceStartDate: string;
  serviceEndDate: string;
  patientMedicaidId: string;
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  patientPhone: string | null;
  providerNpi: string;
  providerTaxId: string;
  providerTaxonomy: string;
  providerName: string;
  payerId: string;
  payerName: string | null;
  diagnosisCodes: string[];
  totalUnits: number;
  totalAmount: number;
  placeOfService: string;
  notes: string | null;
  paidAmount: number | null;
  denialReason: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    medicaidId: string | null;
  };
  billingPeriod: {
    id: string;
    name: string;
    status: string;
  };
  claimLines: ClaimLine[];
  submissions: Submission[];
}

interface ValidationResult {
  valid: boolean;
  canSubmit: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "default"> = {
  DRAFT: "default",
  READY: "primary",
  SUBMITTED: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  DENIED: "error",
  PAID: "success",
  PARTIALLY_PAID: "warning",
};

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const [claim, setClaim] = React.useState<Claim | null>(null);
  const [validation, setValidation] = React.useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchClaim = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/billing/claims/${claimId}`);
      if (response.ok) {
        const data = await response.json();
        setClaim(data.claim);
      } else {
        throw new Error("Failed to load claim");
      }
      setError(null);
    } catch {
      setError("Failed to load claim");
    } finally {
      setIsLoading(false);
    }
  }, [claimId]);

  React.useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  const handleValidate = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/claims/${claimId}/validate`, {
        method: "POST",
      });

      const data = await response.json();
      setValidation(data);
    } catch {
      setError("Failed to validate claim");
    } finally {
      setIsValidating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/billing/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      setSuccess("Status updated successfully");
      await fetchClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (clearinghouse: string) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/billing/claims/${claimId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearinghouse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit claim");
      }

      // If GENERIC, offer download
      if (clearinghouse === "GENERIC" && data.ediContent) {
        const blob = new Blob([data.ediContent], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.submission.filename || `${claim?.claimNumber}.edi`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setSuccess("Claim submitted successfully");
      await fetchClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary">Claim not found</p>
        <Link href="/billing/claims">
          <Button className="mt-4">Back to Claims</Button>
        </Link>
      </div>
    );
  }

  const canEdit = ["DRAFT", "REJECTED", "DENIED"].includes(claim.status);
  const canSubmit = ["DRAFT", "READY", "REJECTED", "DENIED"].includes(claim.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/billing/claims">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-2 text-foreground font-mono">
                {claim.claimNumber}
              </h1>
              <Badge variant={STATUS_COLORS[claim.status]}>{claim.status}</Badge>
            </div>
            <p className="text-body-sm text-foreground-secondary mt-1">
              {claim.patientFirstName} {claim.patientLastName} |{" "}
              {formatDate(claim.serviceStartDate)} - {formatDate(claim.serviceEndDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchClaim}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={handleValidate} disabled={isValidating}>
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Validate
              </>
            )}
          </Button>
          {canSubmit && (
            <Button onClick={() => handleSubmit("GENERIC")} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Submit & Download
                </>
              )}
            </Button>
          )}
        </div>
      </div>

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

      {success && (
        <div className="p-3 rounded-md bg-success/20 text-body-sm">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Validation Results */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  Validation Passed
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-error" />
                  Validation Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.errors.length > 0 && (
              <div className="mb-4">
                <p className="font-medium text-error mb-2">
                  Errors ({validation.errorCount})
                </p>
                <ul className="space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-mono text-xs">{err.field}:</span>{" "}
                        {err.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <p className="font-medium text-warning mb-2">
                  Warnings ({validation.warningCount})
                </p>
                <ul className="space-y-1">
                  {validation.warnings.map((warn, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-mono text-xs">{warn.field}:</span>{" "}
                        {warn.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => setValidation(null)}
              className="mt-3 text-sm underline text-foreground-secondary"
            >
              Dismiss
            </button>
          </CardContent>
        </Card>
      )}

      {/* Status Change */}
      {canEdit && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Change Status:</span>
              <Select
                value={claim.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="w-40"
              >
                <option value="DRAFT">Draft</option>
                <option value="READY">Ready</option>
              </Select>
              {isUpdating && (
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-success/50" />
              <div>
                <p className="text-sm text-foreground-secondary">Total Amount</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(claim.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary/50" />
              <div>
                <p className="text-sm text-foreground-secondary">Service Lines</p>
                <p className="text-xl font-semibold">{claim.claimLines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-warning/50" />
              <div>
                <p className="text-sm text-foreground-secondary">Total Units</p>
                <p className="text-xl font-semibold">{claim.totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="w-8 h-8 text-primary/50" />
              <div>
                <p className="text-sm text-foreground-secondary">Submissions</p>
                <p className="text-xl font-semibold">{claim.submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Name</dt>
                <dd className="font-medium">
                  {claim.patientFirstName} {claim.patientLastName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Medicaid ID</dt>
                <dd className="font-mono">{claim.patientMedicaidId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Date of Birth</dt>
                <dd>{formatDate(claim.patientDob)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Address</dt>
                <dd className="text-right">
                  {claim.patientAddress}
                  <br />
                  {claim.patientCity}, {claim.patientState} {claim.patientZip}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Provider Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Name</dt>
                <dd className="font-medium">{claim.providerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">NPI</dt>
                <dd className="font-mono">{claim.providerNpi}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Tax ID</dt>
                <dd className="font-mono">{claim.providerTaxId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Taxonomy</dt>
                <dd className="font-mono">{claim.providerTaxonomy}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Payer ID</dt>
                <dd className="font-mono">{claim.payerId}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Diagnosis Codes (ICD-10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {claim.diagnosisCodes.map((code, index) => (
              <Badge key={code} variant={index === 0 ? "primary" : "default"}>
                {index === 0 && <span className="mr-1 text-xs">Primary:</span>}
                {code}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Service Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    #
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Date
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    HCPCS
                  </th>
                  <th className="text-left p-3 font-medium text-foreground-secondary">
                    Service
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Units
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Rate
                  </th>
                  <th className="text-right p-3 font-medium text-foreground-secondary">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {claim.claimLines.map((line) => (
                  <tr key={line.id} className="border-b border-border">
                    <td className="p-3">{line.lineNumber}</td>
                    <td className="p-3">{formatDate(line.serviceDate)}</td>
                    <td className="p-3">
                      <span className="font-mono">{line.hcpcsCode}</span>
                      {line.modifiers.length > 0 && (
                        <span className="text-xs text-foreground-tertiary ml-1">
                          ({line.modifiers.join(", ")})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-foreground-secondary">
                      {line.serviceType?.name || "-"}
                    </td>
                    <td className="p-3 text-right">{line.units}</td>
                    <td className="p-3 text-right">{formatCurrency(line.unitRate)}</td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(line.lineAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-background-secondary font-semibold">
                  <td colSpan={4} className="p-3 text-right">
                    Total
                  </td>
                  <td className="p-3 text-right">{claim.totalUnits}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right">{formatCurrency(claim.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submission History */}
      {claim.submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background-secondary"
                >
                  <div>
                    <p className="font-medium text-sm">{sub.clearinghouse}</p>
                    <p className="text-xs text-foreground-secondary">
                      {sub.submissionType} | {formatDate(sub.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        sub.status === "TRANSMITTED" || sub.status === "ACCEPTED"
                          ? "success"
                          : sub.status === "REJECTED" || sub.status === "ERROR"
                            ? "error"
                            : "warning"
                      }
                    >
                      {sub.status}
                    </Badge>
                    {sub.ediFileName && (
                      <Link href={`/api/billing/submissions/${sub.id}/download`}>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
