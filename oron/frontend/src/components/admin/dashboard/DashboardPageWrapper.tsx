"use client";

import { useState } from "react";
import { useDashboardMetrics } from "@/hooks/admin/useDashboardMetrics";
import { usePendingVisits } from "@/hooks/admin/usePendingVisits";
import MetricsCards from "./MetricsCards";
import PendingVisitsTable from "./PendingVisitsTable";
import VisitApprovalModal from "./VisitApprovalModal";
import QuickActions from "@/components/dashboard/QuickActions";
import useUser from "@/hooks/useUser";

export default function DashboardPageWrapper() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const {
    data: visitsData,
    isLoading: visitsLoading,
    refetch: refetchVisits,
  } = usePendingVisits(page, size);
  const { data: userData } = useUser();

  const handleVisitClick = (visitId: string) => {
    setSelectedVisit(visitId);
  };

  const handleCloseModal = () => {
    setSelectedVisit(null);
    // Refetch data when modal closes to reflect any changes
    refetchVisits();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Quick Actions */}
      <QuickActions userRole={userData?.data?.role} />

      {/* Metrics Cards Grid */}
      <MetricsCards metrics={metrics} loading={metricsLoading} />

      {/* Pending Visits Section */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Visit Approvals
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve visit notes submitted by staff
          </p>
        </div>
        <PendingVisitsTable
          visits={visitsData?.visits || []}
          total={visitsData?.total || 0}
          page={page}
          size={size}
          loading={visitsLoading}
          onVisitClick={handleVisitClick}
          onPageChange={setPage}
        />
      </div>

      {/* Visit Approval Modal */}
      <VisitApprovalModal
        visitId={selectedVisit}
        isOpen={!!selectedVisit}
        onClose={handleCloseModal}
      />
    </div>
  );
}
