"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SupervisorType, SupervisionFrequency, SupervisionVisitStatus, PerformanceRating } from "@prisma/client";

interface SupervisoryRelationship {
  id: string;
  relationshipType: SupervisorType;
  discipline: string | null;
  requiredVisitFrequency: SupervisionFrequency;
  requiredHoursPerPeriod: number | null;
  isActive: boolean;
  startDate: string;
  supervisor: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  supervisee: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  lastVisitDate: string | null;
  _count: {
    supervisionVisits: number;
  };
}

interface SupervisionVisit {
  id: string;
  scheduledDate: string;
  scheduledDuration: number;
  visitDate: string | null;
  visitType: string;
  status: SupervisionVisitStatus;
  overallRating: PerformanceRating | null;
  relationship: {
    supervisor: { firstName: string; lastName: string };
    supervisee: { firstName: string; lastName: string };
  };
  client: { firstName: string; lastName: string } | null;
}

const TYPE_LABELS: Record<SupervisorType, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  CLINICAL: "Clinical",
  ADMINISTRATIVE: "Administrative",
  PRECEPTOR: "Preceptor",
  MENTOR: "Mentor",
};

const FREQUENCY_LABELS: Record<SupervisionFrequency, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  AS_NEEDED: "As Needed",
};

const STATUS_COLORS: Record<SupervisionVisitStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  MISSED_BY_SUPERVISOR: "bg-red-100 text-red-700",
  MISSED_BY_SUPERVISEE: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function SupervisionPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "relationships" | "visits">("dashboard");
  const [relationships, setRelationships] = useState<SupervisoryRelationship[]>([]);
  const [visits, setVisits] = useState<SupervisionVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    activeRelationships: 0,
    upcomingVisits: 0,
    overdueVisits: 0,
    completedThisMonth: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [relationshipsRes, visitsRes] = await Promise.all([
        fetch("/api/supervision/relationships?isActive=true"),
        fetch("/api/supervision/visits?upcoming=true"),
      ]);

      if (!relationshipsRes.ok || !visitsRes.ok) {
        throw new Error("Failed to fetch supervision data");
      }

      const relationshipsData = await relationshipsRes.json();
      const visitsData = await visitsRes.json();

      setRelationships(relationshipsData);
      setVisits(visitsData);

      // Calculate overdue - visits scheduled in the past but not completed
      const now = new Date();
      const overdueCount = visitsData.filter((v: SupervisionVisit) =>
        new Date(v.scheduledDate) < now && v.status === "SCHEDULED"
      ).length;

      setStats({
        activeRelationships: relationshipsData.length,
        upcomingVisits: visitsData.filter((v: SupervisionVisit) =>
          v.status === "SCHEDULED" && new Date(v.scheduledDate) >= now
        ).length,
        overdueVisits: overdueCount,
        completedThisMonth: visitsData.filter((v: SupervisionVisit) => {
          const visitDate = new Date(v.visitDate || v.scheduledDate);
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return v.status === "COMPLETED" && visitDate >= monthStart;
        }).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDue = (relationship: SupervisoryRelationship): number | null => {
    if (!relationship.lastVisitDate) return null;

    const lastVisit = new Date(relationship.lastVisitDate);
    const frequencyDays: Record<SupervisionFrequency, number> = {
      WEEKLY: 7,
      BIWEEKLY: 14,
      MONTHLY: 30,
      QUARTERLY: 90,
      AS_NEEDED: 0,
    };

    const daysInterval = frequencyDays[relationship.requiredVisitFrequency];
    if (daysInterval === 0) return null;

    const nextDue = new Date(lastVisit);
    nextDue.setDate(nextDue.getDate() + daysInterval);

    const now = new Date();
    return Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervision Management</h1>
          <p className="text-gray-600 mt-1">
            Track supervisory relationships and document supervision visits
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/supervision/relationships/new"
            className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add Relationship
          </Link>
          <Link
            href="/supervision/visits/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Visit
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Relationships</div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeRelationships}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Upcoming Visits</div>
          <div className="text-2xl font-bold text-blue-600">{stats.upcomingVisits}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Overdue Visits</div>
          <div className="text-2xl font-bold text-red-600">{stats.overdueVisits}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Completed This Month</div>
          <div className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "relationships", label: "Relationships" },
            { id: "visits", label: "Visits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading supervision data...</div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Supervision Due */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-semibold text-gray-900">Supervision Status</h2>
                </div>
                <div className="divide-y">
                  {relationships.slice(0, 5).map((rel) => {
                    const daysUntilDue = getDaysUntilDue(rel);
                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

                    return (
                      <div key={rel.id} className="px-6 py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rel.supervisee.firstName} {rel.supervisee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Supervisor: {rel.supervisor.firstName} {rel.supervisor.lastName}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {TYPE_LABELS[rel.relationshipType]} | {FREQUENCY_LABELS[rel.requiredVisitFrequency]}
                            </div>
                          </div>
                          <div className="text-right">
                            {daysUntilDue === null ? (
                              <span className="text-xs text-gray-500">No visits yet</span>
                            ) : isOverdue ? (
                              <span className="text-sm text-red-600 font-medium">
                                Overdue by {Math.abs(daysUntilDue)} days
                              </span>
                            ) : isDueSoon ? (
                              <span className="text-sm text-yellow-600 font-medium">
                                Due in {daysUntilDue} days
                              </span>
                            ) : (
                              <span className="text-sm text-green-600">
                                Due in {daysUntilDue} days
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {relationships.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No supervisory relationships found
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Visits */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">Upcoming Visits</h2>
                  <Link href="/supervision/visits" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y">
                  {visits.slice(0, 5).map((visit) => (
                    <div key={visit.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {visit.relationship.supervisee.firstName} {visit.relationship.supervisee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(visit.scheduledDate)} - {visit.scheduledDuration} min
                          </div>
                          {visit.client && (
                            <div className="text-xs text-gray-400">
                              With client: {visit.client.firstName} {visit.client.lastName}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[visit.status]}`}>
                          {visit.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                  {visits.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No upcoming visits scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === "relationships" && (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {relationships.map((rel) => (
                  <div key={rel.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {rel.supervisee.firstName} {rel.supervisee.lastName}
                          </span>
                          <span className="text-gray-400">supervised by</span>
                          <span className="font-medium text-gray-900">
                            {rel.supervisor.firstName} {rel.supervisor.lastName}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{TYPE_LABELS[rel.relationshipType]}</span>
                          {rel.discipline && <span>{rel.discipline}</span>}
                          <span>{FREQUENCY_LABELS[rel.requiredVisitFrequency]}</span>
                          <span>{rel._count.supervisionVisits} visits</span>
                        </div>
                        {rel.lastVisitDate && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last visit: {formatDate(rel.lastVisitDate)}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/supervision/relationships/${rel.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
                {relationships.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No supervisory relationships found. Click "Add Relationship" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === "visits" && (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {visits.map((visit) => (
                  <div key={visit.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {visit.relationship.supervisee.firstName} {visit.relationship.supervisee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Supervisor: {visit.relationship.supervisor.firstName} {visit.relationship.supervisor.lastName}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{formatDate(visit.scheduledDate)}</span>
                          <span>{visit.scheduledDuration} minutes</span>
                          <span>{visit.visitType.replace(/_/g, " ")}</span>
                        </div>
                        {visit.client && (
                          <div className="text-xs text-gray-400 mt-1">
                            Client: {visit.client.firstName} {visit.client.lastName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[visit.status]}`}>
                          {visit.status.replace(/_/g, " ")}
                        </span>
                        <Link
                          href={`/supervision/visits/${visit.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm block mt-2"
                        >
                          {visit.status === "SCHEDULED" ? "Document" : "View"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {visits.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No visits found. Click "Schedule Visit" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
