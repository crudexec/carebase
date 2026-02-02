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
  Select,
  Label,
  Input,
  Textarea,
  Breadcrumb,
} from "@/components/ui";
import { Loader2, ClipboardCheck, UserPlus } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    clientId: preselectedClientId || "",
    scheduledDate: "",
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

      router.push(`/intake/${data.intake.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create intake");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Intake", href: "/intake" },
            { label: "New Intake" },
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Intake", href: "/intake" },
          { label: "New Intake" },
        ]}
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
              Choose the client for this intake. Clients are created from referrals or can be added directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="mx-auto h-10 w-10 text-foreground-secondary/50 mb-3" />
                <p className="text-foreground-secondary">No clients available.</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  Create a client from a referral first.
                </p>
                <Link href="/referrals">
                  <Button variant="secondary" className="mt-4">
                    Go to Referrals
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="clientId" required>
                  Client
                </Label>
                <Select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            )}
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
