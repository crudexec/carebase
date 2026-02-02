"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  User,
  Calendar,
  FileCheck,
} from "lucide-react";

interface PayrollRecord {
  id: string;
  hoursWorked: number;
  hourlyRate: number;
  totalAmount: number;
  dailyReportCompliant: boolean;
  status: string;
  paymentCycle: string | null;
  createdAt: string;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  shift: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  supervisorApprovedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  processedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface PayrollStats {
  PENDING?: { count: number; amount: number; hours: number };
  SUPERVISOR_APPROVED?: { count: number; amount: number; hours: number };
  PROCESSED?: { count: number; amount: number; hours: number };
}

interface PayrollTotals {
  count: number;
  amount: number;
  hours: number;
}

const STATUS_COLORS: Record<string, "warning" | "primary" | "success"> = {
  PENDING: "warning",
  SUPERVISOR_APPROVED: "primary",
  PROCESSED: "success",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SUPERVISOR_APPROVED: "Approved",
  PROCESSED: "Processed",
};

export default function PayrollPage() {
  const [records, setRecords] = React.useState<PayrollRecord[]>([]);
  const [summary, setSummary] = React.useState<PayrollStats>({});
  const [totals, setTotals] = React.useState<PayrollTotals>({ count: 0, amount: 0, hours: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/payroll?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setSummary(data.summary || {});
        setTotals(data.totals || { count: 0, amount: 0, hours: 0 });
      } else {
        setError("Failed to load payroll data");
      }
    } catch {
      setError("Failed to load payroll data");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.carer.firstName.toLowerCase().includes(query) ||
      record.carer.lastName.toLowerCase().includes(query) ||
      record.shift.client.firstName.toLowerCase().includes(query) ||
      record.shift.client.lastName.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Payroll</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Manage caregiver payroll and payment processing
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Records</p>
                <p className="text-2xl font-semibold">{totals.count}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Amount</p>
                <p className="text-2xl font-semibold">{formatCurrency(totals.amount)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Hours</p>
                <p className="text-2xl font-semibold">{totals.hours.toFixed(1)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Pending</p>
                <p className="text-2xl font-semibold">
                  {(summary.PENDING?.count || 0) + (summary.SUPERVISOR_APPROVED?.count || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground-secondary">Pending Approval</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-semibold">{summary.PENDING?.count || 0}</p>
                  <p className="text-sm text-foreground-secondary">
                    {formatCurrency(summary.PENDING?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground-secondary">Approved (Ready to Process)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-semibold">{summary.SUPERVISOR_APPROVED?.count || 0}</p>
                  <p className="text-sm text-foreground-secondary">
                    {formatCurrency(summary.SUPERVISOR_APPROVED?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground-secondary">Processed</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-semibold">{summary.PROCESSED?.count || 0}</p>
                  <p className="text-sm text-foreground-secondary">
                    {formatCurrency(summary.PROCESSED?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <Input
                  placeholder="Search by carer or client name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUPERVISOR_APPROVED">Approved</option>
                <option value="PROCESSED">Processed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <p className="text-foreground-secondary text-center py-8">
              No payroll records found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Carer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Shift Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Hours
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Rate
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Amount
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Daily Report
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b last:border-b-0 hover:bg-background-secondary transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {record.carer.firstName} {record.carer.lastName}
                            </p>
                            <p className="text-xs text-foreground-secondary">
                              {record.carer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {record.shift.client.firstName} {record.shift.client.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-foreground-secondary" />
                          <div>
                            <p className="text-sm">{formatDate(record.shift.scheduledStart)}</p>
                            <p className="text-xs text-foreground-secondary">
                              {formatDateTime(record.shift.scheduledStart)} -{" "}
                              {formatDateTime(record.shift.scheduledEnd)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-medium">{record.hoursWorked.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm">{formatCurrency(record.hourlyRate)}/hr</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-semibold">{formatCurrency(record.totalAmount)}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {record.dailyReportCompliant ? (
                          <CheckCircle className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-warning mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={STATUS_COLORS[record.status]}>
                          {STATUS_LABELS[record.status] || record.status}
                        </Badge>
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
