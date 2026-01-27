"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Button, Badge } from "@/components/ui";

interface ICD10Result {
  code: string;
  description: string;
}

interface ICD10SearchProps {
  onSelect: (code: string, description: string) => void;
  placeholder?: string;
  className?: string;
}

export function ICD10Search({
  onSelect,
  placeholder = "Search ICD-10 codes (e.g., diabetes, E11)...",
  className,
}: ICD10SearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ICD10Result[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchICD10 = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/lookup/icd10?terms=${encodeURIComponent(searchQuery)}&maxList=15`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("ICD-10 search error:", error);
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
      searchICD10(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchICD10]);

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

  const handleSelect = (result: ICD10Result) => {
    onSelect(result.code, result.description);
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
            className="bg-white border border-border rounded-md shadow-lg max-h-64 overflow-y-auto"
          >
            {results.map((result) => (
              <button
                key={result.code}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background-secondary transition-colors"
              >
                <Badge variant="default" className="font-mono text-xs">
                  {result.code}
                </Badge>
                <span className="text-sm text-foreground truncate flex-1">
                  {result.description}
                </span>
                <Plus className="w-4 h-4 text-foreground-tertiary flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div
            style={dropdownStyle}
            className="bg-white border border-border rounded-md shadow-lg p-4 text-center text-sm text-foreground-secondary"
          >
            No ICD-10 codes found for &quot;{query}&quot;
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
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary animate-spin" />
        )}
      </div>

      {renderDropdown()}
    </div>
  );
}

interface DiagnosisItemProps {
  code: string;
  description: string;
  type: string;
  onRemove: () => void;
  onTypeChange: (type: string) => void;
  isEditable?: boolean;
}

export function DiagnosisItem({
  code,
  description,
  type,
  onRemove,
  onTypeChange,
  isEditable = true,
}: DiagnosisItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background-secondary rounded-md">
      <Badge
        variant={type === "PRIMARY" ? "success" : "default"}
        className="font-mono text-xs"
      >
        {code}
      </Badge>
      <span className="text-sm text-foreground flex-1 truncate">
        {description}
      </span>
      {isEditable && (
        <>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="text-xs border border-border rounded px-2 py-1 bg-white"
          >
            <option value="PRIMARY">Primary</option>
            <option value="SECONDARY">Secondary</option>
            <option value="ADMITTING">Admitting</option>
            <option value="PRINCIPAL">Principal</option>
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4 text-foreground-tertiary hover:text-error" />
          </Button>
        </>
      )}
    </div>
  );
}
