"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Download,
  Filter,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface ShiftReport {
  id: string;
  date: string;
  client: {
    id: string;
    name: string;
    address: string | null;
  };
  carer: {
    id: string | undefined;
    name: string;
  };
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  hoursWorked: number;
  checkIn: {
    status: "COMPLIANT" | "OUT_OF_RANGE" | "MISSING";
    time: string | null;
    distance: number | null;
    distanceFormatted: string | null;
    accuracy: number | null;
    source: string | null;
  };
  checkOut: {
    status: "COMPLIANT" | "OUT_OF_RANGE" | "MISSING";
    time: string | null;
    distance: number | null;
    distanceFormatted: string | null;
    accuracy: number | null;
    source: string | null;
  };
  overallStatus: string;
}

interface Summary {
  totalShifts: number;
  fullyCompliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  noData: number;
  complianceRate: number;
}

interface ReportData {
  shifts: ShiftReport[];
  summary: Summary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EVVReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    complianceStatus: "all",
  });

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        complianceStatus: filters.complianceStatus,
      });

      const response = await fetch(`/api/evv/reports?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching EVV report:", err);
      setError("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCSV = () => {
    if (!data?.shifts.length) return;

    const headers = [
      "Date",
      "Carer",
      "Client",
      "Check-in Time",
      "Check-in Status",
      "Check-in Distance",
      "Check-out Time",
      "Check-out Status",
      "Check-out Distance",
      "Hours Worked",
      "Overall Status",
    ];

    const rows = data.shifts.map((shift) => [
      shift.date,
      shift.carer.name,
      shift.client.name,
      shift.checkIn.time
        ? format(new Date(shift.checkIn.time), "HH:mm")
        : "N/A",
      shift.checkIn.status,
      shift.checkIn.distanceFormatted || "N/A",
      shift.checkOut.time
        ? format(new Date(shift.checkOut.time), "HH:mm")
        : "N/A",
      shift.checkOut.status,
      shift.checkOut.distanceFormatted || "N/A",
      shift.hoursWorked.toFixed(2),
      shift.overallStatus,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evv-report-${filters.startDate}-to-${filters.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Compliant
          </Badge>
        );
      case "OUT_OF_RANGE":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Out of Range
          </Badge>
        );
      case "MISSING":
        return (
          <Badge variant="default" className="gap-1">
            <MapPin className="w-3 h-3" />
            No Data
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case "FULLY_COMPLIANT":
        return <Badge variant="success">Fully Compliant</Badge>;
      case "PARTIALLY_COMPLIANT":
        return <Badge variant="warning">Partial</Badge>;
      case "NON_COMPLIANT":
        return <Badge variant="error">Non-Compliant</Badge>;
      case "NO_DATA":
        return <Badge variant="default">No EVV Data</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">EVV Compliance Reports</h1>
          <p className="text-foreground-secondary">
            Shift-by-shift EVV data and compliance summaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={exportCSV} disabled={!data?.shifts.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Compliance Status</Label>
              <Select
                value={filters.complianceStatus}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, complianceStatus: e.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="compliant">Compliant Only</option>
                <option value="out_of_range">Out of Range</option>
                <option value="missing">Missing Location</option>
              </Select>
            </div>
            <Button onClick={fetchReport}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold">{data.summary.totalShifts}</p>
              <p className="text-sm text-foreground-secondary">Total Shifts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold text-success">
                {data.summary.fullyCompliant}
              </p>
              <p className="text-sm text-foreground-secondary">Fully Compliant</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold text-warning">
                {data.summary.partiallyCompliant}
              </p>
              <p className="text-sm text-foreground-secondary">Partial</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold text-error">
                {data.summary.nonCompliant}
              </p>
              <p className="text-sm text-foreground-secondary">Non-Compliant</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold">{data.summary.complianceRate}%</p>
              <p className="text-sm text-foreground-secondary">Compliance Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            EVV Report Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-foreground-secondary">{error}</p>
            </div>
          ) : data?.shifts.length === 0 ? (
            <div className="text-center py-12 text-foreground-secondary">
              No shifts found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Carer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Check-in
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Check-out
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Hours
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.shifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className="border-b border-border hover:bg-background-secondary"
                    >
                      <td className="py-3 px-4">
                        {format(new Date(shift.date), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4">{shift.carer.name}</td>
                      <td className="py-3 px-4">{shift.client.name}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(shift.checkIn.status)}
                          {shift.checkIn.distanceFormatted && (
                            <p className="text-xs text-foreground-tertiary">
                              {shift.checkIn.distanceFormatted}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(shift.checkOut.status)}
                          {shift.checkOut.distanceFormatted && (
                            <p className="text-xs text-foreground-tertiary">
                              {shift.checkOut.distanceFormatted}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{shift.hoursWorked.toFixed(1)}h</td>
                      <td className="py-3 px-4">
                        {getOverallStatusBadge(shift.overallStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
