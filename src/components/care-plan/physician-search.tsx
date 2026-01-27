"use client";

import * as React from "react";
import { Search, Plus, User, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Button, Badge } from "@/components/ui";

interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string | null;
  specialty: string | null;
  phone: string | null;
  fax?: string | null;
}

interface PhysicianSearchProps {
  onSelect: (physician: Physician) => void;
  selectedPhysician?: Physician | null;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function PhysicianSearch({
  onSelect,
  selectedPhysician,
  onClear,
  placeholder = "Search physicians by name or NPI...",
  className,
}: PhysicianSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Physician[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPhysicians = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/physicians?search=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.physicians || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Physician search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchPhysicians(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchPhysicians]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (physician: Physician) => {
    onSelect(physician);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  if (selectedPhysician) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-background-secondary rounded-md", className)}>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">
            Dr. {selectedPhysician.firstName} {selectedPhysician.lastName}
          </p>
          <div className="flex items-center gap-3 text-sm text-foreground-secondary">
            {selectedPhysician.npi && (
              <span>NPI: {selectedPhysician.npi}</span>
            )}
            {selectedPhysician.specialty && (
              <Badge variant="default" className="text-xs">
                {selectedPhysician.specialty}
              </Badge>
            )}
          </div>
        </div>
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            Change
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {results.map((physician) => (
            <button
              key={physician.id}
              type="button"
              onClick={() => handleSelect(physician)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Dr. {physician.firstName} {physician.lastName}
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  {physician.npi && <span>NPI: {physician.npi}</span>}
                  {physician.specialty && (
                    <Badge variant="default" className="text-xs">
                      {physician.specialty}
                    </Badge>
                  )}
                </div>
              </div>
              <Plus className="w-4 h-4 text-foreground-tertiary flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg p-4 text-center text-sm text-foreground-secondary">
          No physicians found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
