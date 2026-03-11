"use client";

import { useState, useCallback } from "react";
import { useUserVisits } from "@/hooks/useUserVisits";
import VisitsTable from "@/components/visits/VisitsTable";
import VisitsFilterBar from "@/components/visits/VisitsFilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminVisitsPage() {
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
  const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);
  const [startDateFilter, setStartDateFilter] = useState<string | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<string | undefined>(undefined);

  const { data: visitsData, isLoading } = useUserVisits({
    page,
    size,
    status: statusFilter,
    employee_id: employeeFilter,
    client_id: clientFilter,
    start_date: startDateFilter,
    end_date: endDateFilter,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : value);
    setPage(1);
  };

  const handleFilterChange = useCallback((filters: {
    employee_id?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    setEmployeeFilter(filters.employee_id);
    setClientFilter(filters.client_id);
    setStartDateFilter(filters.start_date);
    setEndDateFilter(filters.end_date);
    setPage(1);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-[fadeIn_0.4s_ease-out]">
        <h1 className="text-[36px] font-[700] text-[#101828] tracking-[-0.02em] leading-tight">
          All Visits
        </h1>
        <p className="text-[15px] text-[#667085] font-[500] mt-1.5">
          View and manage visit notes from all staff members
        </p>
      </div>

      {/* Advanced Filters */}
      <div className="animate-[fadeIn_0.5s_ease-out_0.1s_both]">
        <VisitsFilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Tabs for filtering by status */}
      <div className="animate-[fadeIn_0.6s_ease-out_0.2s_both]">
        <Tabs defaultValue="all" onValueChange={handleStatusChange}>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-1.5 shadow-sm mb-6">
            <TabsList className="w-full grid grid-cols-4 gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-[#1A48AD] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                All Visits
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-[#1A48AD] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Drafts
              </TabsTrigger>
              <TabsTrigger
                value="awaiting_approval"
                className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-[#1A48AD] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Awaiting Approval
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-[#1A48AD] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Approved
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <VisitsTable
                visits={visitsData?.visits || []}
                total={visitsData?.total || 0}
                page={page}
                size={size}
                loading={isLoading}
                onPageChange={setPage}
                isAdmin={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="draft" className="mt-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <VisitsTable
                visits={visitsData?.visits || []}
                total={visitsData?.total || 0}
                page={page}
                size={size}
                loading={isLoading}
                onPageChange={setPage}
                isAdmin={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="awaiting_approval" className="mt-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <VisitsTable
                visits={visitsData?.visits || []}
                total={visitsData?.total || 0}
                page={page}
                size={size}
                loading={isLoading}
                onPageChange={setPage}
                isAdmin={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <VisitsTable
                visits={visitsData?.visits || []}
                total={visitsData?.total || 0}
                page={page}
                size={size}
                loading={isLoading}
                onPageChange={setPage}
                isAdmin={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
