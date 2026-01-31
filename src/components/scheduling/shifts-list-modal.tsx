"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  List,
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ShiftData } from "./shift-card";
import { format } from "date-fns";

interface ShiftsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftData[];
  onShiftClick: (shift: ShiftData) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
};

type SortField = "date" | "client" | "carer" | "status";
type SortDirection = "asc" | "desc";

// SortIcon component moved outside to avoid recreating during render
function SortIcon({
  field,
  sortField,
  sortDirection
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) return null;
  return sortDirection === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1" />
  );
}

export function ShiftsListModal({
  isOpen,
  onClose,
  shifts,
  onShiftClick,
}: ShiftsListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedShifts = useMemo(() => {
    let result = [...shifts];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((shift) => shift.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (shift) =>
          shift.client.firstName.toLowerCase().includes(query) ||
          shift.client.lastName.toLowerCase().includes(query) ||
          shift.carer.firstName.toLowerCase().includes(query) ||
          shift.carer.lastName.toLowerCase().includes(query) ||
          shift.client.address?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison =
            new Date(a.scheduledStart).getTime() -
            new Date(b.scheduledStart).getTime();
          break;
        case "client":
          comparison = `${a.client.firstName} ${a.client.lastName}`.localeCompare(
            `${b.client.firstName} ${b.client.lastName}`
          );
          break;
        case "carer":
          comparison = `${a.carer.firstName} ${a.carer.lastName}`.localeCompare(
            `${b.carer.firstName} ${b.carer.lastName}`
          );
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [shifts, searchQuery, statusFilter, sortField, sortDirection]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "h:mm a");
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <List className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Shifts</CardTitle>
              <p className="text-sm text-foreground-secondary mt-0.5">
                {filteredAndSortedShifts.length} of {shifts.length} shifts
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-border bg-background-secondary/50">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <input
                  type="text"
                  placeholder="Search by client, carer, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-background-secondary sticky top-0">
                <tr className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-background-tertiary"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2" />
                      Date & Time
                      <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-background-tertiary"
                    onClick={() => handleSort("client")}
                  >
                    <div className="flex items-center">
                      Client
                      <SortIcon field="client" sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-background-tertiary"
                    onClick={() => handleSort("carer")}
                  >
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-2" />
                      Caregiver
                      <SortIcon field="carer" sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th className="px-4 py-3">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-2" />
                      Duration
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-background-tertiary"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th className="px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSortedShifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-10 h-10 text-foreground-tertiary mb-2" />
                        <p className="text-foreground-secondary">No shifts found</p>
                        <p className="text-xs text-foreground-tertiary mt-1">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedShifts.map((shift) => {
                    const statusConfig = STATUS_CONFIG[shift.status] || STATUS_CONFIG.SCHEDULED;
                    return (
                      <tr
                        key={shift.id}
                        onClick={() => {
                          onShiftClick(shift);
                          onClose();
                        }}
                        className="hover:bg-background-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatDateTime(shift.scheduledStart)}
                            </p>
                            <p className="text-xs text-foreground-secondary">
                              {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">
                            {shift.client.firstName} {shift.client.lastName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">
                            {shift.carer.firstName} {shift.carer.lastName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground-secondary">
                            {calculateDuration(shift.scheduledStart, shift.scheduledEnd)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs", statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {shift.client.address ? (
                            <div className="flex items-center gap-1 text-xs text-foreground-secondary max-w-[200px]">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{shift.client.address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-foreground-tertiary">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-background-secondary/50 flex items-center justify-between">
            <p className="text-sm text-foreground-secondary">
              Showing {filteredAndSortedShifts.length} of {shifts.length} shifts
            </p>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
