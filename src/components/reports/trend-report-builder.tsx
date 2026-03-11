"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  FileText,
  Save,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ClientSearchSelect } from "@/components/clients/client-search-select";
import { TrendChart, CHART_COLORS } from "./trend-chart";

interface _Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Template {
  id: string;
  name: string;
}

interface NumericField {
  id: string;
  label: string;
  sectionId: string;
  sectionTitle: string;
  config: {
    min?: number;
    max?: number;
    thresholdEnabled?: boolean;
    invertTrend?: boolean;
  };
}

interface FieldData {
  fieldId: string;
  label: string;
  sectionTitle: string;
  config: {
    min?: number;
    max?: number;
    thresholdEnabled?: boolean;
  };
  dataPoints: Array<{
    date: string;
    value: number;
    visitNoteId?: string;
  }>;
  stats: {
    average: number;
    min: number;
    max: number;
    count: number;
    slope: number;
    trend: "improving" | "worsening" | "stable";
  };
}

interface TrendReportData {
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  template: {
    id: string;
    name: string;
  };
  fields: FieldData[];
  dateRange: {
    start: string;
    end: string;
  };
  aggregation: string;
  totalVisitNotes: number;
}

interface SavedReport {
  id: string;
  name: string;
  description?: string;
  config: {
    clientId: string;
    templateId: string;
    fieldIds: string[];
    defaultTimeRange: string;
    aggregation: string;
  };
}

type TimePreset = "7d" | "30d" | "90d" | "custom";
type AggregationMethod = "average" | "latest" | "first";

interface TrendReportBuilderProps {
  initialClientId?: string;
  savedReportId?: string;
  onSaveSuccess?: () => void;
}

export function TrendReportBuilder({
  initialClientId,
  savedReportId,
  onSaveSuccess,
}: TrendReportBuilderProps) {
  // Client selection
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || ""
  );

  // Template selection
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Field selection
  const [availableFields, setAvailableFields] = useState<NumericField[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  // Time range
  const [timePreset, setTimePreset] = useState<TimePreset>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Aggregation method
  const [aggregation, setAggregation] = useState<AggregationMethod>("latest");

  // Report data
  const [reportData, setReportData] = useState<TrendReportData | null>(null);

  // Loading states
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Save report modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch templates for selected client
  const fetchTemplates = useCallback(async () => {
    if (!selectedClientId) return;

    setIsLoadingTemplates(true);
    try {
      const response = await fetch("/api/visit-notes/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [selectedClientId]);

  // Fetch fields for selected template
  const fetchFields = useCallback(async () => {
    if (!selectedTemplateId) return;

    setIsLoadingFields(true);
    try {
      const params = new URLSearchParams({ templateId: selectedTemplateId });
      if (selectedClientId) {
        params.set("clientId", selectedClientId);
      }
      const response = await fetch(
        `/api/reports/visit-note-trends/fields?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableFields(data.fields);
      }
    } catch (err) {
      console.error("Failed to fetch fields:", err);
    } finally {
      setIsLoadingFields(false);
    }
  }, [selectedTemplateId, selectedClientId]);

  // Fetch trend report
  const fetchReport = useCallback(async () => {
    if (!selectedClientId || !selectedTemplateId || selectedFieldIds.length === 0) {
      return;
    }

    setIsLoadingReport(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        clientId: selectedClientId,
        templateId: selectedTemplateId,
        fieldIds: selectedFieldIds.join(","),
        aggregation,
      });

      if (timePreset === "custom") {
        if (customStartDate) params.set("startDate", customStartDate);
        if (customEndDate) params.set("endDate", customEndDate);
      } else {
        params.set("preset", timePreset);
      }

      const response = await fetch(`/api/reports/visit-note-trends?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch report");
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError("Failed to fetch report");
    } finally {
      setIsLoadingReport(false);
    }
  }, [
    selectedClientId,
    selectedTemplateId,
    selectedFieldIds,
    timePreset,
    customStartDate,
    customEndDate,
    aggregation,
  ]);

  // Load saved report
  const loadSavedReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/saved/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        const report: SavedReport = data.report;

        setSelectedClientId(report.config.clientId);
        setSelectedTemplateId(report.config.templateId);
        setSelectedFieldIds(report.config.fieldIds);
        setTimePreset(report.config.defaultTimeRange as TimePreset);
        setAggregation(report.config.aggregation as AggregationMethod);
        setReportName(report.name);
        setReportDescription(report.description || "");
      }
    } catch (err) {
      console.error("Failed to load saved report:", err);
    }
  }, []);

  // Save report configuration
  const handleSaveReport = async () => {
    if (!reportName.trim()) return;

    setIsSaving(true);
    try {
      const config = {
        clientId: selectedClientId,
        templateId: selectedTemplateId,
        fieldIds: selectedFieldIds,
        defaultTimeRange: timePreset,
        aggregation,
      };

      const response = await fetch("/api/reports/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reportName.trim(),
          description: reportDescription.trim(),
          type: "VISIT_NOTE_TRENDS",
          config,
        }),
      });

      if (response.ok) {
        setShowSaveModal(false);
        setReportName("");
        setReportDescription("");
        toast.success("Report configuration saved successfully");
        onSaveSuccess?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save report configuration");
      }
    } catch (err) {
      console.error("Failed to save report:", err);
      toast.error("Failed to save report configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!reportData) return;

    setIsExporting(true);

    // Build CSV content
    const headers = ["Date", ...reportData.fields.map((f) => f.label)];
    const dateSet = new Set<string>();

    // Collect all unique dates
    for (const field of reportData.fields) {
      for (const point of field.dataPoints) {
        dateSet.add(point.date);
      }
    }

    const dates = Array.from(dateSet).sort();

    // Build data rows
    const rows = dates.map((date) => {
      const row: (string | number)[] = [date];
      for (const field of reportData.fields) {
        const point = field.dataPoints.find((p) => p.date === date);
        row.push(point ? point.value : "");
      }
      return row;
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `trend-report-${reportData.client.firstName}-${reportData.client.lastName}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  // Export to PDF (placeholder - would need a PDF library)
  const handleExportPDF = () => {
    // For now, we'll use the browser's print functionality
    window.print();
  };

  // Load saved report if provided
  useEffect(() => {
    if (savedReportId) {
      loadSavedReport(savedReportId);
    }
  }, [savedReportId, loadSavedReport]);

  // Fetch templates when client changes
  useEffect(() => {
    if (selectedClientId) {
      fetchTemplates();
      setSelectedTemplateId("");
      setAvailableFields([]);
      setSelectedFieldIds([]);
      setReportData(null);
    }
  }, [selectedClientId, fetchTemplates]);

  // Fetch fields when template changes
  useEffect(() => {
    if (selectedTemplateId) {
      fetchFields();
      setSelectedFieldIds([]);
      setReportData(null);
    }
  }, [selectedTemplateId, fetchFields]);

  // Auto-fetch report when configuration is complete
  useEffect(() => {
    if (selectedClientId && selectedTemplateId && selectedFieldIds.length > 0) {
      fetchReport();
    }
  }, [
    selectedClientId,
    selectedTemplateId,
    selectedFieldIds,
    timePreset,
    customStartDate,
    customEndDate,
    aggregation,
    fetchReport,
  ]);

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Select all fields
  const selectAllFields = () => {
    setSelectedFieldIds(availableFields.map((f) => f.id));
  };

  // Clear all fields
  const clearAllFields = () => {
    setSelectedFieldIds([]);
  };

  // Handle client selection from search
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="border rounded-lg p-4 bg-background space-y-4">
        <h3 className="font-semibold text-foreground">Report Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client Selection (only shown if not pre-selected) */}
          {!initialClientId && (
            <div>
              <ClientSearchSelect
                value={selectedClientId}
                onChange={handleClientChange}
                label="Client"
                placeholder="Search for a client..."
              />
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">
              Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={!selectedClientId || isLoadingTemplates}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Select template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">
              Time Range
            </label>
            <select
              value={timePreset}
              onChange={(e) => setTimePreset(e.target.value as TimePreset)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Aggregation Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">
              Daily Aggregation
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as AggregationMethod)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="latest">Latest Value</option>
              <option value="average">Average</option>
              <option value="first">First Value</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {timePreset === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Field Selection */}
        {selectedTemplateId && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground-secondary">
                Fields to Track ({selectedFieldIds.length} selected)
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAllFields}>
                  Clear
                </Button>
              </div>
            </div>

            {isLoadingFields ? (
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading fields...
              </div>
            ) : availableFields.length === 0 ? (
              <p className="text-sm text-foreground-secondary">
                No numeric fields found in this template.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableFields.map((field) => {
                  const isSelected = selectedFieldIds.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => toggleField(field.id)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-background-secondary text-foreground hover:bg-background-secondary/80"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {field.label}
                      <span className="text-xs opacity-70">
                        ({field.sectionTitle})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-md bg-error/20 text-error flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoadingReport && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Report Display */}
      {reportData && !isLoadingReport && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {reportData.client.firstName} {reportData.client.lastName} - Trends
              </h2>
              <p className="text-sm text-foreground-secondary">
                {reportData.template.name} | {reportData.dateRange.start} to{" "}
                {reportData.dateRange.end} | {reportData.totalVisitNotes} visit
                notes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSaveModal(true)}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Configuration
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>

          {/* Print Header (visible only when printing) */}
          <div className="hidden print:block">
            <h1 className="text-xl font-bold">
              Visit Note Trends Report
            </h1>
            <p className="text-sm">
              Client: {reportData.client.firstName} {reportData.client.lastName}
            </p>
            <p className="text-sm">
              Template: {reportData.template.name}
            </p>
            <p className="text-sm">
              Date Range: {reportData.dateRange.start} to {reportData.dateRange.end}
            </p>
            <p className="text-sm">
              Total Visit Notes: {reportData.totalVisitNotes}
            </p>
          </div>

          {/* Charts */}
          {reportData.fields.length === 0 ? (
            <div className="text-center py-12 text-foreground-secondary">
              No data available for the selected fields and time range.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
              {reportData.fields.map((field, index) => (
                <TrendChart
                  key={field.fieldId}
                  fieldId={field.fieldId}
                  label={field.label}
                  sectionTitle={field.sectionTitle}
                  dataPoints={field.dataPoints}
                  stats={field.stats}
                  config={field.config}
                  color={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Save Report Configuration
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Monthly Pain Assessment"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary">
                  Description (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Brief description of this report..."
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSaveModal(false);
                  setReportName("");
                  setReportDescription("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReport}
                disabled={!reportName.trim() || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
