"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, RefreshCw, Filter, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/scheduling/calendar-view";
import { ShiftCard, ShiftData } from "@/components/scheduling/shift-card";
import { ShiftFormModal, ShiftFormData } from "@/components/scheduling/shift-form-modal";
import { ShiftDetailModal } from "@/components/scheduling/shift-detail-modal";
import { BulkShiftModal } from "@/components/scheduling/bulk-shift-modal";
import { canManageSchedule } from "@/lib/scheduling";

interface CaregiverOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

export default function SchedulingPage() {
  const { data: session } = useSession();
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterCarerId, setFilterCarerId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const userRole = session?.user?.role;
  const canManage = userRole ? canManageSchedule(userRole) : false;

  // Fetch shifts
  const fetchShifts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCarerId) params.set("carerId", filterCarerId);
      if (filterStatus) params.set("status", filterStatus);

      const response = await fetch(`/api/scheduling?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch shifts");
      const data = await response.json();
      setShifts(data.shifts);
      setError(null);
    } catch (err) {
      setError("Failed to load shifts");
      console.error(err);
    }
  }, [filterCarerId, filterStatus]);

  // Fetch caregivers and clients (for form dropdowns)
  const fetchFormOptions = useCallback(async () => {
    if (!canManage) return;

    try {
      const [caregiversRes, clientsRes] = await Promise.all([
        fetch("/api/scheduling/caregivers"),
        fetch("/api/scheduling/clients"),
      ]);

      if (caregiversRes.ok) {
        const data = await caregiversRes.json();
        setCaregivers(data.caregivers);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients);
      }
    } catch (err) {
      console.error("Failed to fetch form options:", err);
    }
  }, [canManage]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchShifts(), fetchFormOptions()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchShifts, fetchFormOptions]);

  // Handle shift creation
  const handleCreateShift = async (data: ShiftFormData) => {
    const response = await fetch("/api/scheduling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to create shift");
    }

    await fetchShifts();
  };

  // Handle shift update
  const handleUpdateShift = async (data: ShiftFormData) => {
    if (!selectedShift) return;

    const response = await fetch(`/api/scheduling/${selectedShift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to update shift");
    }

    await fetchShifts();
  };

  // Handle shift cancel
  const handleCancelShift = async () => {
    if (!selectedShift) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/scheduling/${selectedShift.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to cancel shift");
      }

      setShowDetailModal(false);
      setSelectedShift(null);
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel shift");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle shift click from calendar
  const handleShiftClick = (shift: ShiftData) => {
    setSelectedShift(shift);
    setShowDetailModal(true);
  };

  // Handle date click from calendar
  const handleDateClick = (date: Date) => {
    if (canManage) {
      setSelectedDate(date);
      setSelectedShift(null);
      setIsEditMode(false);
      setShowFormModal(true);
    }
  };

  // Handle edit from detail modal
  const handleEditShift = () => {
    setIsEditMode(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  // Open create modal
  const handleAddClick = () => {
    setSelectedShift(null);
    setSelectedDate(new Date());
    setIsEditMode(false);
    setShowFormModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Scheduling</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage carer shifts and schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchShifts}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
                <CalendarPlus className="w-4 h-4 mr-1" />
                Bulk Schedule
              </Button>
              <Button onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-1" />
                Create Shift
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 rounded-lg bg-background-secondary border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canManage && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary">
                  Carer
                </label>
                <select
                  value={filterCarerId}
                  onChange={(e) => setFilterCarerId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Carers</option>
                  {caregivers.map((carer) => (
                    <option key={carer.id} value={carer.id}>
                      {carer.firstName} {carer.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterCarerId("");
                setFilterStatus("");
              }}
            >
              Clear Filters
            </Button>
            <Button size="sm" onClick={fetchShifts}>
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="min-h-[600px]">
        <CalendarView
          shifts={shifts}
          onShiftClick={handleShiftClick}
          onDateClick={handleDateClick}
          selectedDate={selectedDate}
        />
      </div>

      {/* Upcoming Shifts List (optional sidebar) */}
      {shifts.filter((s) => s.status === "SCHEDULED").length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upcoming Shifts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts
              .filter((s) => s.status === "SCHEDULED")
              .sort(
                (a, b) =>
                  new Date(a.scheduledStart).getTime() -
                  new Date(b.scheduledStart).getTime()
              )
              .slice(0, 6)
              .map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onClick={() => handleShiftClick(shift)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Shift Form Modal */}
      <ShiftFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedShift(null);
          setIsEditMode(false);
        }}
        onSubmit={isEditMode ? handleUpdateShift : handleCreateShift}
        shift={isEditMode ? selectedShift : null}
        caregivers={caregivers}
        clients={clients}
        selectedDate={selectedDate}
      />

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onEdit={handleEditShift}
        onCancel={handleCancelShift}
        canManage={canManage}
        isCancelling={isCancelling}
      />

      {/* Bulk Shift Modal */}
      <BulkShiftModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          setShowBulkModal(false);
          fetchShifts();
        }}
        caregivers={caregivers}
        clients={clients}
      />
    </div>
  );
}
