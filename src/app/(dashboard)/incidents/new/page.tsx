"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { ArrowLeft, AlertTriangle, Save } from "lucide-react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

const INCIDENT_CATEGORIES = [
  "Fall",
  "Medication Error",
  "Injury",
  "Behavioral",
  "Property Damage",
  "Abuse/Neglect",
  "Missing Person",
  "Medical Emergency",
  "Equipment Failure",
  "Other",
];

const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Low - Minor incident, no injury" },
  { value: "MEDIUM", label: "Medium - Moderate concern, possible minor injury" },
  { value: "HIGH", label: "High - Serious incident, injury sustained" },
  { value: "CRITICAL", label: "Critical - Life-threatening, emergency services required" },
];

export default function NewIncidentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clients, setClients] = React.useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    clientId: "",
    incidentDate: new Date().toISOString().slice(0, 16),
    location: "",
    category: "",
    severity: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: "",
    actionsTaken: "",
    witnesses: "",
  });

  // Check permissions
  const canCreate = session?.user
    ? hasPermission(session.user.role, PERMISSIONS.INCIDENT_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL)
    : false;

  // Fetch clients
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients?limit=100");
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    };

    if (canCreate) {
      fetchClients();
    } else {
      setIsLoading(false);
    }
  }, [canCreate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          witnesses: formData.witnesses || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create incident report");
      }

      const data = await response.json();
      router.push(`/incidents/${data.incident.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create incident report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-error mb-4" />
            <h2 className="text-heading-3 text-foreground mb-2">Access Denied</h2>
            <p className="text-foreground-secondary">
              You do not have permission to create incident reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-heading-2 text-foreground">Report Incident</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Document and report an incident
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-md bg-error/20 text-body-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-error">Error</p>
            <p className="text-foreground-secondary">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId" required>
                      Client Involved
                    </Label>
                    <Select
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                      }
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incidentDate" required>
                      Date & Time
                    </Label>
                    <Input
                      id="incidentDate"
                      type="datetime-local"
                      value={formData.incidentDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, incidentDate: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" required>
                      Category
                    </Label>
                    <Select
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      required
                    >
                      <option value="">Select category</option>
                      {INCIDENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" required>
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="Where did the incident occur?"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity" required>
                    Severity
                  </Label>
                  <Select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        severity: e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                      }))
                    }
                    required
                  >
                    {SEVERITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" required>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Provide a detailed description of what happened..."
                    rows={5}
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-foreground-tertiary">
                    Include who was involved, what happened, and any relevant circumstances.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionsTaken" required>
                    Actions Taken
                  </Label>
                  <Textarea
                    id="actionsTaken"
                    value={formData.actionsTaken}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, actionsTaken: e.target.value }))
                    }
                    placeholder="What immediate actions were taken in response?"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="witnesses">Witnesses (Optional)</Label>
                  <Input
                    id="witnesses"
                    value={formData.witnesses}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, witnesses: e.target.value }))
                    }
                    placeholder="Names of any witnesses"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Severity Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-md bg-background-secondary">
                    <span className="font-medium text-foreground">Low</span>
                    <p className="text-foreground-tertiary mt-1">
                      Minor incident with no injury. Example: Verbal altercation, minor property
                      damage.
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-warning/10">
                    <span className="font-medium text-warning">Medium</span>
                    <p className="text-foreground-tertiary mt-1">
                      Moderate concern, possible minor injury. Example: Minor fall without injury,
                      medication timing error.
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-error/10">
                    <span className="font-medium text-error">High</span>
                    <p className="text-foreground-tertiary mt-1">
                      Serious incident with injury sustained. Example: Fall with injury, wrong
                      medication administered.
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-error/20">
                    <span className="font-medium text-error">Critical</span>
                    <p className="text-foreground-tertiary mt-1">
                      Life-threatening, requires emergency services. Example: Serious injury,
                      cardiac event, missing person.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Important</p>
                    <p className="text-foreground-secondary mt-1">
                      All incident reports are reviewed by management before being shared with
                      sponsors. Be thorough and factual in your documentation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
