"use client";

import * as React from "react";
import { Input, Label } from "@/components/ui";
import { Search, X, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Sponsor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship?: string;
  status?: string;
}

interface SponsorSearchSelectProps {
  value: string;
  onChange: (sponsorId: string, sponsor: Sponsor | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function SponsorSearchSelect({
  value,
  onChange,
  label = "Sponsor",
  required = false,
  placeholder = "Search by name or email...",
  disabled = false,
  error,
}: SponsorSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch selected sponsor on mount if value is provided
  React.useEffect(() => {
    if (value && !selectedSponsor) {
      fetchSponsorById(value);
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
      searchSponsors(search);
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

  const fetchSponsorById = async (sponsorId: string) => {
    try {
      const response = await fetch(`/api/sponsors/${sponsorId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSponsor(data.sponsor || data);
      }
    } catch (error) {
      console.error("Failed to fetch sponsor:", error);
    }
  };

  const searchSponsors = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/sponsors?search=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.sponsors || []);
      }
    } catch (error) {
      console.error("Failed to search sponsors:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    onChange(sponsor.id, sponsor);
    setSearch("");
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setSelectedSponsor(null);
    onChange("", null);
    setSearch("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label htmlFor="sponsor-search" required={required}>
          {label}
        </Label>
      )}

      {/* Selected Sponsor Display */}
      {selectedSponsor ? (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            "bg-primary/5 border-primary/30",
            disabled && "opacity-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {selectedSponsor.firstName} {selectedSponsor.lastName}
              </p>
              <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                {selectedSponsor.relationship && (
                  <span>{selectedSponsor.relationship}</span>
                )}
                {selectedSponsor.email && (
                  <>
                    {selectedSponsor.relationship && <span>&bull;</span>}
                    <span>{selectedSponsor.email}</span>
                  </>
                )}
              </div>
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
              id="sponsor-search"
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
                  {results.map((sponsor) => (
                    <li key={sponsor.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(sponsor)}
                        className="w-full px-4 py-3 text-left hover:bg-background-secondary transition-colors flex items-center gap-3"
                      >
                        <div className="p-2 rounded-full bg-background-secondary">
                          <Users className="h-4 w-4 text-foreground-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {sponsor.firstName} {sponsor.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                            {sponsor.relationship && (
                              <span
                                className="px-1.5 py-0.5 rounded-full bg-info/10 text-info"
                              >
                                {sponsor.relationship}
                              </span>
                            )}
                            {sponsor.email && (
                              <span className="truncate">{sponsor.email}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : search.trim() ? (
                <div className="p-4 text-center text-foreground-secondary">
                  No sponsors found for "{search}"
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
