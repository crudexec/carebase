"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Label,
  Input,
} from "@/components/ui";
import {
  Users,
  UserCheck,
  Calendar,
  ClipboardList,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";

type EntityType = "clients" | "staff" | "shifts" | "visit-notes";

interface ReportSummary {
  [key: string]: number | string;
}

interface TrendData {
  date: string;
  total?: number;
  completed?: number;
  count?: number;
}

interface ReportData {
  summary: ReportSummary;
  byStatus?: Array<{ status: string; count: number }>;
  byRole?: Array<{ role: string; count: number }>;
  byTemplate?: Array<{ templateId: string; templateName: string; count: number }>;
  trend?: TrendData[];
  recentClients?: Array<{ id: string; name: string; status: string; createdAt: string }>;
  recentStaff?: Array<{ id: string; name: string; role: string; isActive: boolean; createdAt: string }>;
  shifts?: Array<{ id: string; client: string; carer: string; status: string; scheduledStart: string }>;
  visitNotes?: Array<{ id: string; template: string; client: string; carer: string; submittedAt: string }>;
}

const ENTITY_CONFIG: Record<EntityType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string; color: string }> = {
  clients: {
    label: "Clients",
    icon: UserCheck,
    description: "Client registration and status reports",
    color: "#10b981",
  },
  staff: {
    label: "Staff",
    icon: Users,
    description: "Staff members by role and status",
    color: "#6366f1",
  },
  shifts: {
    label: "Shifts",
    icon: Calendar,
    description: "Shift schedules and completion rates",
    color: "#f59e0b",
  },
  "visit-notes": {
    label: "Visit Notes",
    icon: ClipboardList,
    description: "Visit note submissions and form usage",
    color: "#8b5cf6",
  },
};

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10b981",
  INACTIVE: "#ef4444",
  PROSPECT: "#6366f1",
  ONBOARDING: "#f59e0b",
  SCHEDULED: "#6366f1",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

const QUICK_DATE_RANGES = [
  { label: "Last 7 days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: "This month", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: "Last 90 days", getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
];

export default function ReportsPage() {
  const router = useRouter();
  const [selectedEntity, setSelectedEntity] = React.useState<EntityType | null>(null);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<ReportData | null>(null);

  const fetchReport = async () => {
    if (!selectedEntity) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ entity: selectedEntity });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.report);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedEntity) {
      fetchReport();
    }
  }, [selectedEntity]);

  const handleDateRangeSelect = (range: { start: Date; end: Date }) => {
    setStartDate(format(range.start, "yyyy-MM-dd"));
    setEndDate(format(range.end, "yyyy-MM-dd"));
  };

  const applyFilters = () => {
    fetchReport();
  };

  const exportToCsv = () => {
    if (!reportData || !selectedEntity) return;

    let csvContent = "";
    const entityLabel = ENTITY_CONFIG[selectedEntity].label;

    // Add summary
    csvContent += `${entityLabel} Report Summary\n`;
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
    csvContent += "\n";

    // Add detail data based on entity type
    if (selectedEntity === "clients" && reportData.recentClients) {
      csvContent += "Recent Clients\n";
      csvContent += "Name,Status,Created At\n";
      reportData.recentClients.forEach((c) => {
        csvContent += `${c.name},${c.status},${c.createdAt}\n`;
      });
    } else if (selectedEntity === "staff" && reportData.recentStaff) {
      csvContent += "Recent Staff\n";
      csvContent += "Name,Role,Active,Created At\n";
      reportData.recentStaff.forEach((s) => {
        csvContent += `${s.name},${s.role},${s.isActive},${s.createdAt}\n`;
      });
    } else if (selectedEntity === "shifts" && reportData.shifts) {
      csvContent += "Shifts\n";
      csvContent += "Client,Carer,Status,Scheduled Start\n";
      reportData.shifts.forEach((s) => {
        csvContent += `${s.client},${s.carer},${s.status},${s.scheduledStart}\n`;
      });
    } else if (selectedEntity === "visit-notes" && reportData.visitNotes) {
      csvContent += "Visit Notes\n";
      csvContent += "Template,Client,Carer,Submitted At\n";
      reportData.visitNotes.forEach((v) => {
        csvContent += `${v.template},${v.client},${v.carer},${v.submittedAt}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedEntity}-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  // Prepare chart data
  const getStatusChartData = () => {
    if (!reportData) return [];
    const data = reportData.byStatus || reportData.byRole || reportData.byTemplate || [];
    return data.map((item: { status?: string; role?: string; templateName?: string; count: number }) => ({
      name: item.status || item.role || item.templateName || "",
      value: item.count,
      fill: STATUS_COLORS[item.status || ""] || CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
    }));
  };

  const getTrendChartData = () => {
    if (!reportData?.trend) return [];
    return reportData.trend.map((t) => ({
      date: format(new Date(t.date), "MMM d"),
      total: t.total || t.count || 0,
      completed: t.completed || 0,
    }));
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    const summaryItems = Object.entries(reportData.summary);

    const getIcon = (key: string) => {
      if (key.toLowerCase().includes("total")) return <BarChart3 className="w-5 h-5" />;
      if (key.toLowerCase().includes("active")) return <CheckCircle className="w-5 h-5" />;
      if (key.toLowerCase().includes("hour")) return <Clock className="w-5 h-5" />;
      if (key.toLowerCase().includes("rate")) return <TrendingUp className="w-5 h-5" />;
      return <BarChart3 className="w-5 h-5" />;
    };

    const getColor = (key: string) => {
      if (key.toLowerCase().includes("active") || key.toLowerCase().includes("completed")) return "bg-green-100 text-green-600";
      if (key.toLowerCase().includes("inactive") || key.toLowerCase().includes("cancelled")) return "bg-red-100 text-red-600";
      if (key.toLowerCase().includes("rate")) return "bg-purple-100 text-purple-600";
      return "bg-blue-100 text-blue-600";
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getColor(key)}`}>
                  {getIcon(key)}
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {typeof value === "number"
                      ? key.toLowerCase().includes("rate")
                        ? `${value}%`
                        : value.toLocaleString()
                      : value}
                  </p>
                  <p className="text-xs text-foreground-secondary capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Generate reports on clients, staff, shifts, and visit notes
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/reports/visit-notes")}
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Visit Note Field Reports
        </Button>
      </div>

      {/* Entity Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ENTITY_CONFIG) as [EntityType, typeof ENTITY_CONFIG[EntityType]][]).map(
          ([entity, config]) => {
            const Icon = config.icon;
            const isSelected = selectedEntity === entity;
            return (
              <Card
                key={entity}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary border-primary" : ""
                }`}
                onClick={() => setSelectedEntity(entity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: isSelected ? config.color : `${config.color}20`,
                        color: isSelected ? "white" : config.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{config.label}</h3>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <ChevronRight className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {selectedEntity && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex gap-2">
                  {QUICK_DATE_RANGES.map((range) => (
                    <Button
                      key={range.label}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDateRangeSelect(range.getValue())}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button onClick={applyFilters} disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              {renderSummaryCards()}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution Chart (Pie/Bar) */}
                {(reportData.byStatus || reportData.byRole || reportData.byTemplate) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {reportData.byStatus
                          ? "Distribution by Status"
                          : reportData.byRole
                          ? "Distribution by Role"
                          : "Distribution by Template"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getStatusChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                              labelLine={false}
                            >
                              {getStatusChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {getStatusChartData().map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill || CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-xs text-foreground-secondary">
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bar Chart for same data */}
                {(reportData.byStatus || reportData.byRole || reportData.byTemplate) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {reportData.byStatus
                          ? "Count by Status"
                          : reportData.byRole
                          ? "Count by Role"
                          : "Count by Template"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getStatusChartData()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={100}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {getStatusChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Trend Chart */}
              {reportData.trend && reportData.trend.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Trend Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        {selectedEntity === "shifts" ? (
                          <AreaChart data={getTrendChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="total"
                              name="Total Shifts"
                              stroke="#6366f1"
                              fill="#6366f180"
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="completed"
                              name="Completed"
                              stroke="#10b981"
                              fill="#10b98180"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        ) : (
                          <LineChart data={getTrendChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="total"
                              name="Count"
                              stroke={ENTITY_CONFIG[selectedEntity].color}
                              strokeWidth={2}
                              dot={{ fill: ENTITY_CONFIG[selectedEntity].color, strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Items Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" onClick={exportToCsv}>
                      <Download className="w-4 h-4 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {selectedEntity === "clients" && reportData.recentClients && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Name</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Status</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.recentClients.map((c) => (
                            <tr
                              key={c.id}
                              className="border-b border-border hover:bg-background-secondary/50 cursor-pointer"
                              onClick={() => router.push(`/clients/${c.id}`)}
                            >
                              <td className="p-3 font-medium">{c.name}</td>
                              <td className="p-3">
                                <Badge>{c.status}</Badge>
                              </td>
                              <td className="p-3 text-foreground-secondary">
                                {format(new Date(c.createdAt), "MMM d, yyyy")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {selectedEntity === "staff" && reportData.recentStaff && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Name</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Role</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Status</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.recentStaff.map((s) => (
                            <tr
                              key={s.id}
                              className="border-b border-border hover:bg-background-secondary/50 cursor-pointer"
                              onClick={() => router.push(`/staff/${s.id}`)}
                            >
                              <td className="p-3 font-medium">{s.name}</td>
                              <td className="p-3">
                                <Badge>{s.role}</Badge>
                              </td>
                              <td className="p-3">
                                <Badge variant={s.isActive ? "success" : "error"}>
                                  {s.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-3 text-foreground-secondary">
                                {format(new Date(s.createdAt), "MMM d, yyyy")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {selectedEntity === "shifts" && reportData.shifts && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Client</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Carer</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Status</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Scheduled</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.shifts.slice(0, 10).map((s) => (
                            <tr key={s.id} className="border-b border-border hover:bg-background-secondary/50">
                              <td className="p-3 font-medium">{s.client}</td>
                              <td className="p-3">{s.carer}</td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    s.status === "COMPLETED" ? "success" :
                                    s.status === "CANCELLED" ? "error" :
                                    s.status === "IN_PROGRESS" ? "warning" : "default"
                                  }
                                >
                                  {s.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-foreground-secondary">
                                {format(new Date(s.scheduledStart), "MMM d, h:mm a")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {selectedEntity === "visit-notes" && reportData.visitNotes && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Template</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Client</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Carer</th>
                            <th className="text-left p-3 text-sm font-medium text-foreground-secondary">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.visitNotes.slice(0, 10).map((v) => (
                            <tr
                              key={v.id}
                              className="border-b border-border hover:bg-background-secondary/50 cursor-pointer"
                              onClick={() => router.push(`/visit-notes/${v.id}`)}
                            >
                              <td className="p-3">
                                <Badge>{v.template}</Badge>
                              </td>
                              <td className="p-3 font-medium">{v.client}</td>
                              <td className="p-3">{v.carer}</td>
                              <td className="p-3 text-foreground-secondary">
                                {format(new Date(v.submittedAt), "MMM d, h:mm a")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
