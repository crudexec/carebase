"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEmployeesForFilter, fetchClientsForFilter } from "@/actions/visits";
import { EmployeeOption, ClientOption } from "@/types/VisitsTypes";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface VisitsFilterBarProps {
  onFilterChange: (filters: {
    employee_id?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
  }) => void;
}

const PRESET_DATE_RANGES = [
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom Range", value: "custom" },
];

const getPresetDateRange = (preset: string): { start_date: string; end_date: string } | null => {
  const today = new Date();

  switch (preset) {
    case "last_7_days":
      return {
        start_date: format(subDays(today, 7), "yyyy-MM-dd"),
        end_date: format(today, "yyyy-MM-dd"),
      };
    case "last_30_days":
      return {
        start_date: format(subDays(today, 30), "yyyy-MM-dd"),
        end_date: format(today, "yyyy-MM-dd"),
      };
    case "this_month":
      return {
        start_date: format(startOfMonth(today), "yyyy-MM-dd"),
        end_date: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "last_month":
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return {
        start_date: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        end_date: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    case "this_year":
      return {
        start_date: format(startOfYear(today), "yyyy-MM-dd"),
        end_date: format(endOfYear(today), "yyyy-MM-dd"),
      };
    default:
      return null;
  }
};

export default function VisitsFilterBar({ onFilterChange }: VisitsFilterBarProps) {
  const token = localStorage.getItem("token") as string;

  const [employeeId, setEmployeeId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<EmployeeOption[]>({
    queryKey: ["employees-filter"],
    queryFn: () => fetchEmployeesForFilter(token),
    enabled: !!token,
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery<ClientOption[]>({
    queryKey: ["clients-filter"],
    queryFn: () => fetchClientsForFilter(token),
    enabled: !!token,
  });

  useEffect(() => {
    const filters: any = {};

    if (employeeId) filters.employee_id = employeeId;
    if (clientId) filters.client_id = clientId;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    onFilterChange(filters);
  }, [employeeId, clientId, startDate, endDate, onFilterChange]);

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);

    if (preset === "custom") {
      setStartDate("");
      setEndDate("");
    } else if (preset) {
      const range = getPresetDateRange(preset);
      if (range) {
        setStartDate(range.start_date);
        setEndDate(range.end_date);
      }
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const clearAllFilters = () => {
    setEmployeeId("");
    setClientId("");
    setDatePreset("");
    setStartDate("");
    setEndDate("");
  };

  const activeFiltersCount = [employeeId, clientId, startDate, endDate].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#1A48AD]" />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-[600] text-[#101828]">Advanced Filters</h3>
            <p className="text-[13px] text-[#667085]">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`
                : "No filters applied"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-[13px] font-[600] text-[#DC2626] hover:text-[#B91C1C] transition-colors"
            >
              Clear All
            </button>
          )}
          <div className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Filter Content */}
      {showFilters && (
        <div className="px-6 pb-6 pt-2 border-t border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Employee Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-[600] text-[#344054] uppercase tracking-wide">
                Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={loadingEmployees}
                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#101828] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1A48AD] focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-[600] text-[#344054] uppercase tracking-wide">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loadingClients}
                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#101828] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1A48AD] focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Preset Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-[600] text-[#344054] uppercase tracking-wide">
                Date Range
              </label>
              <select
                value={datePreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#101828] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1A48AD] focus:border-transparent transition-all"
              >
                <option value="">All Time</option>
                {PRESET_DATE_RANGES.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range (shown when Custom is selected) */}
            {datePreset === "custom" && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-[600] text-[#344054] uppercase tracking-wide">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#101828] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1A48AD] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-[600] text-[#344054] uppercase tracking-wide">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#101828] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1A48AD] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex flex-wrap gap-2">
                <span className="text-[13px] font-[600] text-[#667085] mr-2">Active Filters:</span>
                {employeeId && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full">
                    <span className="text-[13px] font-[500] text-[#1A48AD]">
                      Employee: {employees.find(e => e.id === employeeId)?.name}
                    </span>
                    <button
                      onClick={() => setEmployeeId("")}
                      className="hover:bg-[#DBEAFE] rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-[#1A48AD]" />
                    </button>
                  </div>
                )}
                {clientId && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full">
                    <span className="text-[13px] font-[500] text-[#16A34A]">
                      Client: {clients.find(c => c.id === clientId)?.name}
                    </span>
                    <button
                      onClick={() => setClientId("")}
                      className="hover:bg-[#DCFCE7] rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-[#16A34A]" />
                    </button>
                  </div>
                )}
                {(startDate || endDate) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3F2] border border-[#FECACA] rounded-full">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span className="text-[13px] font-[500] text-[#DC2626]">
                      {startDate && endDate
                        ? `${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}`
                        : startDate
                        ? `From ${format(new Date(startDate), "MMM d, yyyy")}`
                        : `Until ${format(new Date(endDate), "MMM d, yyyy")}`}
                    </span>
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setDatePreset("");
                      }}
                      className="hover:bg-[#FEE2E2] rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-[#DC2626]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
