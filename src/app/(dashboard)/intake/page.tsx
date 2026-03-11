"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Intake {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  scheduledDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  assessments: {
    id: string;
    status: string;
    template: {
      name: string;
    };
  }[];
  consents: {
    id: string;
    status: string;
    template: {
      name: string;
    };
  }[];
  carePlan: {
    id: string;
    status: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "text-blue-700", bgColor: "bg-blue-100", icon: Calendar },
  IN_PROGRESS: { label: "In Progress", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
  PENDING_APPROVAL: { label: "Pending", color: "text-orange-700", bgColor: "bg-orange-100", icon: AlertCircle },
  APPROVED: { label: "Approved", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "text-gray-700", bgColor: "bg-gray-100", icon: XCircle },
};

// Stage configuration for intake workflow
const STAGES = [
  { id: 1, name: "Client Info", short: "Info" },
  { id: 2, name: "Assessments", short: "Assess" },
  { id: 3, name: "Consents", short: "Consent" },
  { id: 4, name: "Care Plan", short: "Plan" },
  { id: 5, name: "Approval", short: "Approve" },
];

function StageIndicator({ currentStage, status }: { currentStage: number; status: string }) {
  const isCompleted = status === "APPROVED";
  const isCancelled = status === "CANCELLED" || status === "REJECTED";

  return (
    <div className="flex items-center gap-0.5">
      {STAGES.map((stage, index) => {
        const isActive = index + 1 === currentStage;
        const isDone = index + 1 < currentStage || isCompleted;
        const isLast = index === STAGES.length - 1;

        return (
          <React.Fragment key={stage.id}>
            <div
              className={`relative flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-medium transition-colors ${
                isCancelled
                  ? "bg-gray-100 text-gray-400"
                  : isDone
                  ? "bg-green-500 text-white"
                  : isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
              title={stage.name}
            >
              {isDone && !isCancelled ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                stage.id
              )}
            </div>
            {!isLast && (
              <div
                className={`w-2 h-0.5 ${
                  isCancelled
                    ? "bg-gray-100"
                    : isDone
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getStageName(intake: Intake): string {
  if (intake.status === "APPROVED") return "Completed";
  if (intake.status === "CANCELLED") return "Cancelled";
  if (intake.status === "REJECTED") return "Rejected";
  if (intake.status === "PENDING_APPROVAL") return "Pending Approval";

  const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
  const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;

  if (intake.carePlan) return "Care Plan";
  if (consentsDone > 0 || intake.consents.length > 0) return "Consents";
  if (assessmentsDone > 0 || intake.assessments.length > 0) return "Assessments";
  return "Client Info";
}

function getCurrentStage(intake: Intake): number {
  if (intake.status === "APPROVED") return 5;
  if (intake.status === "PENDING_APPROVAL") return 5;
  if (intake.status === "CANCELLED" || intake.status === "REJECTED") return 1;

  const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
  const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;

  if (intake.carePlan) return 4;
  if (consentsDone > 0) return 4;
  if (intake.consents.length > 0) return 3;
  if (assessmentsDone > 0) return 3;
  if (intake.assessments.length > 0) return 2;
  return 1;
}

export default function IntakePage() {
  const router = useRouter();
  const [intakes, setIntakes] = React.useState<Intake[]>([]);
  const [_total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchIntakes();
  }, [statusFilter]);

  const fetchIntakes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const response = await fetch(`/api/intake?${params}`);
      const data = await response.json();

      if (response.ok) {
        setIntakes(data.intakes || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch intakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIntakes = intakes.filter((intake) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      intake.client.firstName.toLowerCase().includes(searchLower) ||
      intake.client.lastName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Intake</h1>
          <span className="text-xs text-gray-500">{filteredIntakes.length} total</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 border border-gray-300 rounded px-2 py-1 pl-7 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => fetchIntakes()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* New Intake */}
          <Link
            href="/intake/new"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Intake
          </Link>
        </div>
      </div>

      {/* Intake Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filteredIntakes.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 px-3 py-8 text-center">
          <ClipboardCheck className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">
            {search || statusFilter
              ? "No intakes match your filters"
              : "No intakes found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Client</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Progress</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Stage</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Status</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Assess</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Consent</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Plan</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntakes.map((intake, index) => {
                  const statusConfig = STATUS_CONFIG[intake.status] || STATUS_CONFIG.IN_PROGRESS;
                  const StatusIcon = statusConfig.icon;
                  const currentStage = getCurrentStage(intake);
                  const stageName = getStageName(intake);
                  const assessmentsDone = intake.assessments.filter((a) => a.status === "COMPLETED").length;
                  const consentsDone = intake.consents.filter((c) => c.status === "SIGNED").length;
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";

                  return (
                    <tr
                      key={intake.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                      onClick={() => router.push(`/intake/${intake.id}`)}
                    >
                      {/* Client */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-blue-700">
                              {intake.client.firstName[0]}
                              {intake.client.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-900">
                              {intake.client.firstName} {intake.client.lastName}
                            </span>
                            {intake.coordinator && (
                              <p className="text-[10px] text-gray-500">
                                {intake.coordinator.firstName} {intake.coordinator.lastName[0]}.
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stage Progress */}
                      <td className="px-3 py-1.5">
                        <StageIndicator currentStage={currentStage} status={intake.status} />
                      </td>

                      {/* Current Stage */}
                      <td className="px-3 py-1.5">
                        <span className="text-[11px] text-gray-700">{stageName}</span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Assessments */}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`text-[11px] ${assessmentsDone === intake.assessments.length && intake.assessments.length > 0 ? "text-green-700 font-medium" : "text-gray-700"}`}>
                          {assessmentsDone}/{intake.assessments.length}
                        </span>
                      </td>

                      {/* Consents */}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`text-[11px] ${consentsDone === intake.consents.length && intake.consents.length > 0 ? "text-green-700 font-medium" : "text-gray-700"}`}>
                          {consentsDone}/{intake.consents.length}
                        </span>
                      </td>

                      {/* Care Plan */}
                      <td className="px-3 py-1.5 text-center">
                        {intake.carePlan ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-3 py-1.5 text-[10px] text-gray-500">
                        {new Date(intake.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
            Showing {filteredIntakes.length} intake{filteredIntakes.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
