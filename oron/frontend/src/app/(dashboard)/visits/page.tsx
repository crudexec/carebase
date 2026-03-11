"use client";

import { useState } from "react";
import { useUserVisits } from "@/hooks/useUserVisits";
import VisitsTable from "@/components/visits/VisitsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VisitsPage() {
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const { data: visitsData, isLoading } = useUserVisits({
    page,
    size,
    status: statusFilter,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : value);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Visits</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your visit notes
        </p>
      </div>

      {/* Tabs for filtering by status */}
      <Tabs defaultValue="all" onValueChange={handleStatusChange}>
        <TabsList>
          <TabsTrigger value="all">All Visits</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="awaiting_approval">Awaiting Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <VisitsTable
              visits={visitsData?.visits || []}
              total={visitsData?.total || 0}
              page={page}
              size={size}
              loading={isLoading}
              onPageChange={setPage}
              isAdmin={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <VisitsTable
              visits={visitsData?.visits || []}
              total={visitsData?.total || 0}
              page={page}
              size={size}
              loading={isLoading}
              onPageChange={setPage}
              isAdmin={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="awaiting_approval" className="mt-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <VisitsTable
              visits={visitsData?.visits || []}
              total={visitsData?.total || 0}
              page={page}
              size={size}
              loading={isLoading}
              onPageChange={setPage}
              isAdmin={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <VisitsTable
              visits={visitsData?.visits || []}
              total={visitsData?.total || 0}
              page={page}
              size={size}
              loading={isLoading}
              onPageChange={setPage}
              isAdmin={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
