"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { CarePlanForm } from "@/components/care-plan";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewCarePlanPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<Client | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clients/${clientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await response.json();
        setClient(data.client);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground-secondary">{error || "Client not found"}</p>
      </div>
    );
  }

  return (
    <CarePlanForm
      clientId={clientId}
      clientName={`${client.firstName} ${client.lastName}`}
    />
  );
}
