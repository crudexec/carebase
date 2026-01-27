"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Label,
} from "@/components/ui";
import { SignaturePad } from "./signature-pad";
import { Loader2, CheckCircle, FileText, Printer } from "lucide-react";

interface ConsentTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  formType: string;
  requiresWitness: boolean;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

interface ConsentFormRendererProps {
  template: ConsentTemplate;
  client: Client;
  staff: Staff[];
  isSigned?: boolean;
  signedAt?: string | null;
  signedByName?: string | null;
  signatureData?: string | null;
  onSign?: (data: {
    signatureType: string;
    signatureData: string | null;
    signedByName: string;
    signedByRelation: string;
    witnessId?: string;
  }) => Promise<void>;
  isSigning?: boolean;
}

const RELATION_OPTIONS = [
  { value: "SELF", label: "Self (Patient)" },
  { value: "GUARDIAN", label: "Legal Guardian" },
  { value: "POA", label: "Power of Attorney" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "PARENT", label: "Parent" },
  { value: "CHILD", label: "Adult Child" },
  { value: "OTHER", label: "Other Authorized Representative" },
];

export function ConsentFormRenderer({
  template,
  client,
  staff,
  isSigned = false,
  signedAt,
  signedByName,
  signatureData,
  onSign,
  isSigning = false,
}: ConsentFormRendererProps) {
  const [signatureType, setSignatureType] = React.useState<"ELECTRONIC" | "HANDWRITTEN">("ELECTRONIC");
  const [localSignatureData, setLocalSignatureData] = React.useState<string | null>(null);
  const [signerName, setSignerName] = React.useState("");
  const [signerRelation, setSignerRelation] = React.useState("SELF");
  const [witnessId, setWitnessId] = React.useState("");

  // Replace placeholders in content
  const processedContent = React.useMemo(() => {
    let content = template.content;
    const today = new Date().toLocaleDateString();

    const replacements: Record<string, string> = {
      "{{CLIENT_NAME}}": `${client.firstName} ${client.lastName}`,
      "{{CLIENT_FIRST_NAME}}": client.firstName,
      "{{CLIENT_LAST_NAME}}": client.lastName,
      "{{CLIENT_DOB}}": client.dateOfBirth
        ? new Date(client.dateOfBirth).toLocaleDateString()
        : "N/A",
      "{{CLIENT_ADDRESS}}": client.address || "N/A",
      "{{CLIENT_CITY}}": client.city || "N/A",
      "{{CLIENT_STATE}}": client.state || "N/A",
      "{{CLIENT_ZIP}}": client.zipCode || "N/A",
      "{{DATE}}": today,
      "{{TODAY}}": today,
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(placeholder, "g"), value);
    }

    return content;
  }, [template.content, client]);

  const handleSubmit = async () => {
    if (!onSign) return;

    const data = {
      signatureType,
      signatureData: signatureType === "HANDWRITTEN" ? localSignatureData : null,
      signedByName: signerName || `${client.firstName} ${client.lastName}`,
      signedByRelation: signerRelation,
      witnessId: template.requiresWitness ? witnessId : undefined,
    };

    await onSign(data);
  };

  const canSign =
    (signatureType === "ELECTRONIC" || localSignatureData) &&
    (!template.requiresWitness || witnessId);

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{template.name}</CardTitle>
              {template.description && (
                <CardDescription>{template.description}</CardDescription>
              )}
            </div>
            {isSigned && (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Signed</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Form Content</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </CardContent>
      </Card>

      {/* Signature Section */}
      {isSigned ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2 text-success mb-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">This form has been signed</span>
              </div>
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="text-foreground-secondary">Signed by:</span>{" "}
                  {signedByName}
                </p>
                <p>
                  <span className="text-foreground-secondary">Date:</span>{" "}
                  {signedAt ? new Date(signedAt).toLocaleString() : "N/A"}
                </p>
              </div>
              {signatureData && (
                <div className="mt-4">
                  <p className="text-sm text-foreground-secondary mb-2">Signature:</p>
                  <img
                    src={signatureData}
                    alt="Signature"
                    className="max-w-[300px] border rounded"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign This Form</CardTitle>
            <CardDescription>
              Complete the signature section below to sign this consent form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Signer Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signerName">Signer Name</Label>
                <Input
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder={`${client.firstName} ${client.lastName}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signerRelation">Relationship to Patient</Label>
                <Select
                  id="signerRelation"
                  value={signerRelation}
                  onChange={(e) => setSignerRelation(e.target.value)}
                >
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Witness Selection */}
            {template.requiresWitness && (
              <div className="space-y-2">
                <Label htmlFor="witnessId" required>
                  Witness
                </Label>
                <Select
                  id="witnessId"
                  value={witnessId}
                  onChange={(e) => setWitnessId(e.target.value)}
                >
                  <option value="">Select a witness...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-foreground-secondary">
                  This form requires a witness signature
                </p>
              </div>
            )}

            {/* Signature Type */}
            <div className="space-y-3">
              <Label>Signature Type</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSignatureType("ELECTRONIC")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                    signatureType === "ELECTRONIC"
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">Electronic</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Click to sign electronically
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType("HANDWRITTEN")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                    signatureType === "HANDWRITTEN"
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <svg
                    className="h-6 w-6 mx-auto mb-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                  </svg>
                  <p className="font-medium">Handwritten</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Draw your signature
                  </p>
                </button>
              </div>
            </div>

            {/* Signature Pad (for handwritten) */}
            {signatureType === "HANDWRITTEN" && (
              <div className="space-y-2">
                <Label>Draw Your Signature</Label>
                <SignaturePad
                  onSignatureChange={setLocalSignatureData}
                  width={400}
                  height={150}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSubmit} disabled={!canSign || isSigning}>
                {isSigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sign Form
                  </>
                )}
              </Button>
            </div>

            {/* Legal Notice */}
            <p className="text-xs text-foreground-secondary text-center">
              By signing this form, you acknowledge that you have read, understand,
              and agree to the terms outlined above. Electronic signatures are legally
              binding under applicable state and federal law.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
