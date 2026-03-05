"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendReportBuilder } from "@/components/reports/trend-report-builder";

interface SavedReport {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: {
    clientId: string;
    templateId: string;
    fieldIds: string[];
    defaultTimeRange: string;
    aggregation: string;
  };
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function TrendsReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const savedReportId = searchParams.get("savedReport");
  const initialClientId = searchParams.get("clientId") || undefined;

  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoadingSavedReports, setIsLoadingSavedReports] = useState(true);
  const [showSavedReports, setShowSavedReports] = useState(false);

  // Fetch saved reports
  const fetchSavedReports = useCallback(async () => {
    try {
      const response = await fetch("/api/reports/saved?type=VISIT_NOTE_TRENDS");
      if (response.ok) {
        const data = await response.json();
        setSavedReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch saved reports:", err);
    } finally {
      setIsLoadingSavedReports(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedReports();
  }, [fetchSavedReports]);

  const handleLoadSavedReport = (reportId: string) => {
    router.push(`/reports/trends?savedReport=${reportId}`);
    setShowSavedReports(false);
  };

  const handleDeleteSavedReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/saved/${reportId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (err) {
      console.error("Failed to delete saved report:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Visit Note Trends
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Track numeric field values over time with trend analysis
            </p>
          </div>
        </div>
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setShowSavedReports(!showSavedReports)}
          >
            <Bookmark className="w-4 h-4 mr-1" />
            Saved Reports ({savedReports.length})
          </Button>

          {showSavedReports && (
            <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-10">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-foreground">Saved Reports</h3>
              </div>
              {isLoadingSavedReports ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-foreground-secondary" />
                </div>
              ) : savedReports.length === 0 ? (
                <div className="p-4 text-center text-sm text-foreground-secondary">
                  No saved reports yet
                </div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3 border-b hover:bg-background-secondary/50 cursor-pointer"
                      onClick={() => handleLoadSavedReport(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">
                            {report.name}
                          </p>
                          {report.description && (
                            <p className="text-xs text-foreground-secondary mt-0.5">
                              {report.description}
                            </p>
                          )}
                          <p className="text-xs text-foreground-secondary mt-1">
                            By {report.createdBy.firstName} {report.createdBy.lastName}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedReport(report.id);
                          }}
                          className="text-xs text-error hover:underline ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Builder */}
      <TrendReportBuilder
        initialClientId={initialClientId}
        savedReportId={savedReportId || undefined}
        onSaveSuccess={fetchSavedReports}
      />
    </div>
  );
}
