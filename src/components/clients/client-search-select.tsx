"use client";

import * as React from "react";
import { Input, Label } from "@/components/ui";
import { Search, X, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  status?: string;
}

interface ClientSearchSelectProps {
  value: string;
  onChange: (clientId: string, client: Client | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function ClientSearchSelect({
  value,
  onChange,
  label = "Client",
  required = false,
  placeholder = "Search by name...",
  disabled = false,
  error,
}: ClientSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch selected client on mount if value is provided
  React.useEffect(() => {
    if (value && !selectedClient) {
      fetchClientById(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounced search
  React.useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchClients(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClientById = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedClient(data.client);
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    }
  };

  const searchClients = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/clients?search=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to search clients:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    onChange(client.id, client);
    setSearch("");
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setSelectedClient(null);
    onChange("", null);
    setSearch("");
    setResults([]);
    inputRef.current?.focus();
  };

  const formatAge = (dateOfBirth: string | null | undefined) => {
    if (!dateOfBirth) return null;
    const age = Math.floor(
      (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return `${age} years old`;
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label htmlFor="client-search" required={required}>
          {label}
        </Label>
      )}

      {/* Selected Client Display */}
      {selectedClient ? (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            "bg-primary/5 border-primary/30",
            disabled && "opacity-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              {selectedClient.dateOfBirth && (
                <p className="text-xs text-foreground-secondary">
                  {formatAge(selectedClient.dateOfBirth)} &bull; DOB:{" "}
                  {new Date(selectedClient.dateOfBirth).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-background-secondary text-foreground-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
            <Input
              ref={inputRef}
              id="client-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="pl-10"
              error={!!error}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-foreground-tertiary" />
            )}
          </div>

          {/* Results Dropdown */}
          {isOpen && (search.trim() || results.length > 0) && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-foreground-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <ul className="py-1">
                  {results.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(client)}
                        className="w-full px-4 py-3 text-left hover:bg-background-secondary transition-colors flex items-center gap-3"
                      >
                        <div className="p-2 rounded-full bg-background-secondary">
                          <User className="h-4 w-4 text-foreground-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                            {client.dateOfBirth && (
                              <span>{formatAge(client.dateOfBirth)}</span>
                            )}
                            {client.status && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded-full text-xs",
                                  client.status === "ACTIVE"
                                    ? "bg-success/10 text-success"
                                    : "bg-foreground-tertiary/10 text-foreground-tertiary"
                                )}
                              >
                                {client.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : search.trim() ? (
                <div className="p-4 text-center text-foreground-secondary">
                  No clients found for "{search}"
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
