"use client";

import * as React from "react";
import { Input, Label } from "@/components/ui";
import { Search, X, UserCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  status?: string;
}

interface StaffSearchSelectProps {
  value: string;
  onChange: (staffId: string, staff: StaffMember | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  /** Filter by role: CARER, STAFF, ADMIN, etc. */
  role?: string;
}

export function StaffSearchSelect({
  value,
  onChange,
  label = "Staff Member",
  required = false,
  placeholder = "Search by name...",
  disabled = false,
  error,
  role,
}: StaffSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch selected staff on mount if value is provided
  React.useEffect(() => {
    if (value && !selectedStaff) {
      fetchStaffById(value);
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
      searchStaff(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, role]);

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

  const fetchStaffById = async (staffId: string) => {
    try {
      const response = await fetch(`/api/staff/${staffId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedStaff(data.staff || data);
      }
    } catch (error) {
      console.error("Failed to fetch staff member:", error);
    }
  };

  const searchStaff = async (query: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: "10",
      });
      if (role) {
        params.set("role", role);
      }

      const response = await fetch(`/api/staff?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to search staff:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    onChange(staff.id, staff);
    setSearch("");
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setSelectedStaff(null);
    onChange("", null);
    setSearch("");
    setResults([]);
    inputRef.current?.focus();
  };

  const getRoleLabel = (staffRole?: string) => {
    switch (staffRole) {
      case "CARER":
        return "Carer";
      case "STAFF":
        return "Staff";
      case "ADMIN":
        return "Admin";
      case "OWNER":
        return "Owner";
      default:
        return staffRole;
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label htmlFor="staff-search" required={required}>
          {label}
        </Label>
      )}

      {/* Selected Staff Display */}
      {selectedStaff ? (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            "bg-primary/5 border-primary/30",
            disabled && "opacity-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <UserCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {selectedStaff.firstName} {selectedStaff.lastName}
              </p>
              <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                {selectedStaff.role && (
                  <span>{getRoleLabel(selectedStaff.role)}</span>
                )}
                {selectedStaff.email && (
                  <>
                    <span>&bull;</span>
                    <span>{selectedStaff.email}</span>
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
              id="staff-search"
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
                  {results.map((staff) => (
                    <li key={staff.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(staff)}
                        className="w-full px-4 py-3 text-left hover:bg-background-secondary transition-colors flex items-center gap-3"
                      >
                        <div className="p-2 rounded-full bg-background-secondary">
                          <UserCircle className="h-4 w-4 text-foreground-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {staff.firstName} {staff.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                            {staff.role && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded-full text-xs",
                                  staff.role === "CARER"
                                    ? "bg-info/10 text-info"
                                    : staff.role === "ADMIN"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-foreground-tertiary/10 text-foreground-tertiary"
                                )}
                              >
                                {getRoleLabel(staff.role)}
                              </span>
                            )}
                            {staff.email && (
                              <span className="truncate">{staff.email}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : search.trim() ? (
                <div className="p-4 text-center text-foreground-secondary">
                  No staff found for "{search}"
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
