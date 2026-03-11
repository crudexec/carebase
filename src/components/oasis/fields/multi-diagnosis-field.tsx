"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Search, Star } from "lucide-react";
import type { MultiDiagnosisConfig } from "@/lib/oasis/types";
import { useDebouncedCallback } from "use-debounce";

interface DiagnosisEntry {
  code: string;
  description: string;
  isPrimary?: boolean;
  sequence?: number;
}

interface MultiDiagnosisFieldProps {
  value: DiagnosisEntry[] | null;
  onChange: (value: DiagnosisEntry[]) => void;
  config: MultiDiagnosisConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

interface ICD10SearchResult {
  code: string;
  description: string;
}

export function MultiDiagnosisField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: MultiDiagnosisFieldProps) {
  const {
    maxDiagnoses = 6,
    requirePrimary = true,
    allowSequencing = true,
    showPaymentCode: _showPaymentCode = false,
  } = config;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<ICD10SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const diagnoses = value || [];

  // Click outside to close search
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const searchICD10 = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/icd10/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("ICD-10 search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchICD10(query);
  };

  const addDiagnosis = (diagnosis: ICD10SearchResult) => {
    if (diagnoses.length >= maxDiagnoses) return;
    if (diagnoses.some((d) => d.code === diagnosis.code)) return;

    const newDiagnosis: DiagnosisEntry = {
      code: diagnosis.code,
      description: diagnosis.description,
      isPrimary: diagnoses.length === 0 && requirePrimary,
      sequence: diagnoses.length + 1,
    };

    onChange([...diagnoses, newDiagnosis]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const removeDiagnosis = (code: string) => {
    const updated = diagnoses
      .filter((d) => d.code !== code)
      .map((d, index) => ({
        ...d,
        sequence: index + 1,
        isPrimary: index === 0 && requirePrimary ? true : d.isPrimary,
      }));
    onChange(updated);
  };

  const setPrimaryDiagnosis = (code: string) => {
    const updated = diagnoses.map((d) => ({
      ...d,
      isPrimary: d.code === code,
    }));
    onChange(updated);
  };

  const moveDiagnosis = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= diagnoses.length) return;

    const updated = [...diagnoses];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Update sequences
    const resequenced = updated.map((d, index) => ({
      ...d,
      sequence: index + 1,
    }));

    onChange(resequenced);
  };

  return (
    <div id={id} className="space-y-4">
      {/* Diagnoses list */}
      <div
        className={cn(
          "border rounded-lg divide-y",
          error ? "border-error" : "border-border"
        )}
      >
        {diagnoses.length === 0 ? (
          <div className="p-4 text-center text-foreground-tertiary text-sm">
            No diagnoses added. Use the search below to add ICD-10 codes.
          </div>
        ) : (
          diagnoses.map((diagnosis, index) => (
            <div
              key={diagnosis.code}
              className={cn(
                "flex items-center gap-3 p-3",
                diagnosis.isPrimary && "bg-primary/5"
              )}
            >
              {/* Drag handle */}
              {allowSequencing && (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveDiagnosis(index, index - 1)}
                    disabled={disabled || index === 0}
                    className="p-0.5 hover:bg-background-secondary rounded disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 12 12">
                      <path d="M6 3l4 4H2l4-4z" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDiagnosis(index, index + 1)}
                    disabled={disabled || index === diagnoses.length - 1}
                    className="p-0.5 hover:bg-background-secondary rounded disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 12 12">
                      <path d="M6 9l4-4H2l4 4z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Sequence number */}
              <div className="w-6 h-6 rounded-full bg-background-secondary flex items-center justify-center text-xs font-medium">
                {diagnosis.sequence || index + 1}
              </div>

              {/* Diagnosis info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-sm">
                    {diagnosis.code}
                  </span>
                  {diagnosis.isPrimary && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                      <Star className="h-3 w-3" />
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-secondary truncate">
                  {diagnosis.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!diagnosis.isPrimary && !disabled && (
                  <button
                    type="button"
                    onClick={() => setPrimaryDiagnosis(diagnosis.code)}
                    className="p-1.5 rounded hover:bg-background-secondary text-foreground-tertiary hover:text-primary transition-colors"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeDiagnosis(diagnosis.code)}
                    className="p-1.5 rounded hover:bg-error/10 text-foreground-tertiary hover:text-error transition-colors"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add diagnosis */}
      {diagnoses.length < maxDiagnoses && !disabled && (
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearch(true)}
              placeholder="Search ICD-10 codes..."
              className={cn(
                "w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "border-border"
              )}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => {
                const isAlreadyAdded = diagnoses.some((d) => d.code === result.code);
                return (
                  <button
                    key={result.code}
                    type="button"
                    onClick={() => !isAlreadyAdded && addDiagnosis(result)}
                    disabled={isAlreadyAdded}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-background-secondary transition-colors",
                      isAlreadyAdded && "opacity-50 cursor-not-allowed bg-background-secondary"
                    )}
                  >
                    <span className="font-mono font-medium">{result.code}</span>
                    <span className="text-foreground-secondary ml-2">
                      {result.description}
                    </span>
                    {isAlreadyAdded && (
                      <span className="text-xs text-foreground-tertiary ml-2">
                        (already added)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-sm text-foreground-tertiary">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}

      {/* Diagnosis count */}
      <p className="text-xs text-foreground-tertiary">
        {diagnoses.length} of {maxDiagnoses} diagnoses
        {requirePrimary && diagnoses.length > 0 && !diagnoses.some((d) => d.isPrimary) && (
          <span className="text-warning ml-2">
            Warning: No primary diagnosis selected
          </span>
        )}
      </p>
    </div>
  );
}
