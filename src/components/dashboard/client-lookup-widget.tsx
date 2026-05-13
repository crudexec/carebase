"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search, UserRound } from "lucide-react";

interface ClientLookupItem {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  dateOfBirth: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PROSPECT: "Prospect",
  INACTIVE: "Inactive",
  DISCHARGED: "Discharged",
  ON_HOLD: "On Hold",
};

export function ClientLookupWidget() {
  const [query, setQuery] = React.useState("");
  const [clients, setClients] = React.useState<ClientLookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          limit: "6",
        });

        if (query.trim()) {
          params.set("search", query.trim());
        } else {
          params.set("status", "ACTIVE");
        }

        const response = await fetch(`/api/clients?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await response.json();
        setClients(data.clients || []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to fetch clients:", error);
          setClients([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="rounded-lg border border-border-light bg-background-tertiary">
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Client Lookup</h3>
        </div>
        <Link
          href="/clients"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-2">
        <div className="relative px-2 pb-2">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients"
            className="h-10 w-full rounded-md border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-foreground-secondary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-foreground-secondary">
            <UserRound className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">
              {query.trim() ? "No matching clients found" : "No clients available"}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {clients.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-background-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {STATUS_LABELS[client.status] || client.status}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-foreground-tertiary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
