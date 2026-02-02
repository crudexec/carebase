"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Textarea,
  Breadcrumb,
} from "@/components/ui";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  medicaidId: string | null;
}

const SERVICE_CODES = [
  { value: "T1019", label: "T1019 - Personal Care Services (15 min)" },
  { value: "T1020", label: "T1020 - Personal Care Services (per diem)" },
  { value: "S5125", label: "S5125 - Attendant Care (15 min)" },
  { value: "S5130", label: "S5130 - Homemaker Services (15 min)" },
  { value: "S5135", label: "S5135 - Companion Services (15 min)" },
];

export default function NewAuthorizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    clientId: preselectedClientId || "",
    authNumber: "",
    serviceType: "T1019",
    startDate: "",
    endDate: "",
    authorizedUnits: "",
    unitType: "HOURLY",
    diagnosisCodes: "",
    notes: "",
  });

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clients?limit=100");
      const data = await response.json();

      if (response.ok) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/authorizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorizedUnits: parseFloat(formData.authorizedUnits) || 0,
          diagnosisCodes: formData.diagnosisCodes
            ? formData.diagnosisCodes.split(",").map((c) => c.trim())
            : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create authorization");
      }

      router.push(`/authorizations/${data.authorization.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create authorization");
      setIsSubmitting(false);
    }
  };

  // Find preselected client for breadcrumb
  const preselectedClient = preselectedClientId
    ? clients.find((c) => c.id === preselectedClientId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb - different path if coming from client */}
      <Breadcrumb
        items={
          preselectedClient
            ? [
                { label: "Clients", href: "/clients" },
                { label: `${preselectedClient.firstName} ${preselectedClient.lastName}`, href: `/clients/${preselectedClient.id}` },
                { label: "New Authorization" },
              ]
            : [
                { label: "Authorizations", href: "/authorizations" },
                { label: "New Authorization" },
              ]
        }
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Authorization</h1>
        <p className="text-foreground-secondary">
          Add a Medicaid authorization for a client
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-md bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" required>
                Select Client
              </Label>
              <Select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                    {client.medicaidId && ` (${client.medicaidId})`}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Authorization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Authorization Details</CardTitle>
            <CardDescription>
              Enter the authorization information from Medicaid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authNumber" required>
                Authorization Number
              </Label>
              <Input
                id="authNumber"
                name="authNumber"
                value={formData.authNumber}
                onChange={handleChange}
                placeholder="e.g., MD-2024-12345"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serviceType" required>
                  Service Code (HCPCS)
                </Label>
                <Select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                >
                  {SERVICE_CODES.map((code) => (
                    <option key={code.value} value={code.value}>
                      {code.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitType" required>
                  Unit Type
                </Label>
                <Select
                  id="unitType"
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleChange}
                  required
                >
                  <option value="HOURLY">Hourly</option>
                  <option value="QUARTER_HOURLY">15-Minute Units</option>
                  <option value="DAILY">Daily</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" required>
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" required>
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorizedUnits" required>
                Units Authorized
              </Label>
              <Input
                id="authorizedUnits"
                name="authorizedUnits"
                type="number"
                min="0"
                step="0.5"
                value={formData.authorizedUnits}
                onChange={handleChange}
                placeholder="e.g., 160"
                required
              />
              <p className="text-xs text-foreground-secondary">
                Total {formData.unitType.toLowerCase().replace("_", " ")} units authorized for the period
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosisCodes">Diagnosis Codes (ICD-10)</Label>
              <Input
                id="diagnosisCodes"
                name="diagnosisCodes"
                value={formData.diagnosisCodes}
                onChange={handleChange}
                placeholder="e.g., F41.1, Z74.1"
              />
              <p className="text-xs text-foreground-secondary">
                Comma-separated ICD-10 codes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this authorization..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/authorizations">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.clientId || !formData.authNumber}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Create Authorization
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
