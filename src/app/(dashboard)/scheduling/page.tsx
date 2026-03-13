"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, RefreshCw, Filter, CalendarPlus, List, Trash2, X, Loader2, Clock, User, MapPin } from "lucide-react";
import { CalendarView } from "@/components/scheduling/calendar-view";
import { ShiftData } from "@/components/scheduling/shift-card";
import { getShiftStatusConfig, formatTime, getShiftDuration } from "@/lib/scheduling";
import { ShiftFormModal, ShiftFormData } from "@/components/scheduling/shift-form-modal";
import { ShiftDetailModal } from "@/components/scheduling/shift-detail-modal";
import { BulkShiftModal } from "@/components/scheduling/bulk-shift-modal";
import { ShiftsListModal } from "@/components/scheduling/shifts-list-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
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
  const [showListModal, setShowListModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
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

  // Handle delete all scheduled shifts
  const handleDeleteAllShifts = async () => {
    const response = await fetch("/api/scheduling/bulk?status=SCHEDULED", {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to delete shifts");
    }

    await fetchShifts();
  };

  // Handle delete selected shifts (from modal)
  const handleDeleteSelectedShifts = async (shiftIds: string[]) => {
    const response = await fetch(`/api/scheduling/bulk?ids=${shiftIds.join(",")}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to delete shifts");
    }

    await fetchShifts();
  };

  // Count of scheduled shifts for delete confirmation
  const scheduledShiftsCount = shifts.filter((s) => s.status === "SCHEDULED").length;
  const inProgressCount = shifts.filter((s) => s.status === "IN_PROGRESS").length;
  const completedCount = shifts.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Scheduling</h1>
          <span className="text-xs text-gray-500">{shifts.length} shifts</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              showFilters || filterCarerId || filterStatus
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter className="h-3 w-3" />
            Filters
            {(filterCarerId || filterStatus) && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-blue-600 text-white rounded">
                {(filterCarerId ? 1 : 0) + (filterStatus ? 1 : 0)}
              </span>
            )}
          </button>

          {/* View All */}
          <button
            onClick={() => setShowListModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 rounded hover:bg-gray-100"
          >
            <List className="h-3 w-3" />
            View All
          </button>

          {/* Refresh */}
          <button
            onClick={fetchShifts}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {canManage && (
            <>
              {/* Delete All */}
              {scheduledShiftsCount > 0 && (
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 rounded hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete ({scheduledShiftsCount})
                </button>
              )}

              {/* Bulk Schedule */}
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                <CalendarPlus className="h-3 w-3" />
                Bulk
              </button>

              {/* Create Shift */}
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" />
                Create Shift
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Bar - inline with header */}
      <div className="flex items-center gap-3 text-[11px] -mt-1">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-gray-500">{scheduledShiftsCount} scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-gray-500">{inProgressCount} in progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-gray-500">{completedCount} completed</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-0.5 rounded hover:bg-red-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-3 rounded border border-gray-200 bg-gray-50 space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            {canManage && (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-gray-500 uppercase">Carer</label>
                <select
                  value={filterCarerId}
                  onChange={(e) => {
                    setFilterCarerId(e.target.value);
                    fetchShifts();
                  }}
                  className="w-40 rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  fetchShifts();
                }}
                className="w-32 rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            {(filterCarerId || filterStatus) && (
              <button
                onClick={() => {
                  setFilterCarerId("");
                  setFilterStatus("");
                  fetchShifts();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}

      {/* Calendar View */}
      {!isLoading && (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <CalendarView
            shifts={shifts}
            onShiftClick={handleShiftClick}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>
      )}

      {/* Upcoming Shifts Table */}
      {!isLoading && scheduledShiftsCount > 0 && (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Date</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Time</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Client</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Carer</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 hidden md:table-cell">Location</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts
                  .filter((s) => s.status === "SCHEDULED")
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledStart).getTime() -
                      new Date(b.scheduledStart).getTime()
                  )
                  .slice(0, 10)
                  .map((shift, index) => {
                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                    const startTime = new Date(shift.scheduledStart);
                    const endTime = new Date(shift.scheduledEnd);
                    const statusConfig = getShiftStatusConfig(shift.status);
                    return (
                      <tr
                        key={shift.id}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                        onClick={() => handleShiftClick(shift)}
                      >
                        <td className="px-3 py-2">
                          <span className="text-[11px] font-medium text-gray-900">
                            {startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-[11px] text-gray-700">
                              {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ({getShiftDuration(startTime, endTime)})
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-medium text-blue-700">
                              {shift.client.firstName[0]}{shift.client.lastName[0]}
                            </div>
                            <span className="text-[11px] font-medium text-gray-900">
                              {shift.client.firstName} {shift.client.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-[11px] text-gray-700">
                              {shift.carer.firstName} {shift.carer.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 hidden md:table-cell">
                          {shift.client.address ? (
                            <div className="flex items-center gap-1 max-w-[200px]">
                              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-[10px] text-gray-500 truncate">
                                {shift.client.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[10px] text-gray-600">
              Showing {Math.min(10, scheduledShiftsCount)} of {scheduledShiftsCount} upcoming shift{scheduledShiftsCount !== 1 ? "s" : ""}
            </span>
            {scheduledShiftsCount > 10 && (
              <button
                onClick={() => setShowListModal(true)}
                className="text-[10px] text-blue-600 hover:underline"
              >
                View all
              </button>
            )}
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

      {/* Shifts List Modal */}
      <ShiftsListModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        shifts={shifts}
        onShiftClick={(shift) => {
          setSelectedShift(shift);
          setShowDetailModal(true);
        }}
        onDeleteShifts={handleDeleteSelectedShifts}
      />

      {/* Delete All Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllShifts}
        title="Delete All Scheduled Shifts"
        description={`Are you sure you want to delete all ${scheduledShiftsCount} scheduled shift${scheduledShiftsCount !== 1 ? "s" : ""}? This will only delete shifts with "Scheduled" status.`}
        itemName={`${scheduledShiftsCount} scheduled shift${scheduledShiftsCount !== 1 ? "s" : ""}`}
        confirmText="Delete All"
        cancelText="Cancel"
      />
    </div>
  );
}
