"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Label,
  Input,
  Textarea,
  Breadcrumb,
} from "@/components/ui";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import { Loader2, ClipboardCheck } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
}

export default function NewIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);

  const [formData, setFormData] = React.useState({
    clientId: preselectedClientId || "",
    scheduledDate: "",
    notes: "",
  });

  const handleClientChange = (clientId: string, client: Client | null) => {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, clientId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledDate: formData.scheduledDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create intake");
      }

      toast.success("Intake created successfully");
      router.push(`/intake/${data.intake.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create intake";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb - different path if client is selected */}
      <Breadcrumb
        items={
          selectedClient
            ? [
                { label: "Clients", href: "/clients" },
                { label: `${selectedClient.firstName} ${selectedClient.lastName}`, href: `/clients/${selectedClient.id}` },
                { label: "New Intake" },
              ]
            : [
                { label: "Intake", href: "/intake" },
                { label: "New Intake" },
              ]
        }
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Intake</h1>
        <p className="text-foreground-secondary">
          Start the intake process for a client
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
            <CardTitle>Select Client</CardTitle>
            <CardDescription>
              Search and select the client for this intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSearchSelect
              value={formData.clientId}
              onChange={handleClientChange}
              required
            />
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
            <CardDescription>
              Optionally schedule the intake for a future date, or start immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                }
              />
              <p className="text-xs text-foreground-secondary">
                Leave blank to start the intake immediately.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="Any notes about this intake..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/intake">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.clientId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {formData.scheduledDate ? "Schedule Intake" : "Start Intake"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
