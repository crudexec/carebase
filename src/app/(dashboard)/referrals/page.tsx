"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Loader2,
  Search,
  AlertTriangle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: string;
  referralNumber: string;
  status: string;
  prospectFirstName: string;
  prospectLastName: string;
  prospectPhone?: string;
  urgency?: string;
  receivedDate: string;
  nextFollowUpDate?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  referralSource?: {
    id: string;
    name: string;
    type: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-green-100 text-green-700",
  CONVERTED: "bg-green-100 text-green-700",
  DECLINED: "bg-gray-100 text-gray-700",
  LOST: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  DECLINED: "Declined",
  LOST: "Lost",
};

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const fetchReferrals = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/referrals?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReferrals(data.referrals || []);
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReferrals();
  };

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Referrals</h1>
          <span className="text-xs text-gray-500">{referrals.length} total</span>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
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
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => fetchReferrals()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* New Referral */}
          <Link
            href="/referrals/new"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
            New Referral
          </Link>
        </form>
      </div>

      {/* Referral Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : referrals.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 px-3 py-8 text-center">
          <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">
            {statusFilter
              ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} referrals`
              : "No referrals found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Prospect</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Ref #</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Source</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Received</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Follow-up</th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600">Assigned</th>
                  <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
                  const overdue = isOverdue(referral.nextFollowUpDate);

                  return (
                    <tr
                      key={referral.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
                      onClick={() => router.push(`/referrals/${referral.id}`)}
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-medium text-blue-700">
                              {referral.prospectFirstName[0]}
                              {referral.prospectLastName[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-900">
                              {referral.prospectFirstName} {referral.prospectLastName}
                            </span>
                            {(referral.urgency === "URGENT" || referral.urgency === "STAT") && (
                              <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-700">
                                {referral.urgency}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-[10px] font-mono text-gray-500">
                        {referral.referralNumber}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">
                        {referral.prospectPhone || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">
                        {referral.referralSource?.name || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-500">
                        {format(new Date(referral.receivedDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-3 py-1.5">
                        {referral.nextFollowUpDate ? (
                          <span className={`flex items-center gap-0.5 text-[10px] ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                            {overdue && <AlertTriangle className="h-3 w-3" />}
                            {format(new Date(referral.nextFollowUpDate), "MMM d")}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700">
                        {referral.assignedTo ? (
                          `${referral.assignedTo.firstName} ${referral.assignedTo.lastName[0]}.`
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[referral.status]}`}>
                          {STATUS_LABELS[referral.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-600">
            Showing {referrals.length} referral{referrals.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
