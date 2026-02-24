"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, Pill, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Badge } from "@/components/ui";
import { MedicationSearchResult, MEDICATION_ROUTE_LABELS } from "@/lib/emar/types";

interface MedicationSearchProps {
  onSelect: (medication: MedicationSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MedicationSearch({
  onSelect,
  placeholder = "Search medications (e.g., Lipitor, Metformin)...",
  className,
  disabled = false,
}: MedicationSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<MedicationSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchMedications = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/medications/search?q=${encodeURIComponent(searchQuery)}&limit=15`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Medication search error:", error);
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
      searchMedications(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchMedications]);

  // Calculate dropdown position based on input element
  const updateDropdownPosition = React.useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position when dropdown opens or on scroll/resize
  React.useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const handleSelect = (result: MedicationSearchResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  // Render dropdown using portal to escape overflow:hidden containers
  const renderDropdown = () => {
    if (typeof document === "undefined") return null;
    if (!isOpen) return null;

    const dropdownContent = (
      <div ref={dropdownRef}>
        {results.length > 0 && (
          <div
            style={dropdownStyle}
            className="bg-white border border-border rounded-md shadow-lg max-h-80 overflow-y-auto"
          >
            {results.map((result) => (
              <button
                key={result.rxcui}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full flex flex-col px-3 py-2 text-left hover:bg-background-secondary transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-foreground-tertiary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate flex-1">
                    {result.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-6">
                  <span className="text-xs text-foreground-secondary">
                    {result.genericName}
                  </span>
                  {result.strength && (
                    <Badge variant="default" className="text-xs py-0">
                      {result.strength}
                    </Badge>
                  )}
                  {result.form && (
                    <span className="text-xs text-foreground-tertiary">
                      {result.form}
                    </span>
                  )}
                  <span className="text-xs text-foreground-tertiary">
                    {MEDICATION_ROUTE_LABELS[result.route]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 3 && results.length === 0 && !isLoading && (
          <div
            style={dropdownStyle}
            className="bg-white border border-border rounded-md shadow-lg p-4 text-center text-sm text-foreground-secondary"
          >
            No medications found for &quot;{query}&quot;
          </div>
        )}
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
          onFocus={() => results.length > 0 && setIsOpen(true)}
          disabled={disabled}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary animate-spin" />
        )}
      </div>

      {renderDropdown()}
    </div>
  );
}
