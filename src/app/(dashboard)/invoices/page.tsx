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
  RefreshCw,
  Search,
  Receipt,
  Calendar,
  User,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: string;
  markedPaidAt: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface InvoiceStats {
  PENDING?: { count: number; amount: number };
  PAID?: { count: number; amount: number };
}

interface InvoiceTotals {
  count: number;
  amount: number;
}

const STATUS_COLORS: Record<string, "warning" | "success"> = {
  PENDING: "warning",
  PAID: "success",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [summary, setSummary] = React.useState<InvoiceStats>({});
  const [totals, setTotals] = React.useState<InvoiceTotals>({ count: 0, amount: 0 });
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

      const response = await fetch(`/api/invoices?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setSummary(data.summary || {});
        setTotals(data.totals || { count: 0, amount: 0 });
      } else {
        setError("Failed to load invoices");
      }
    } catch {
      setError("Failed to load invoices");
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

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.client.firstName.toLowerCase().includes(query) ||
      invoice.client.lastName.toLowerCase().includes(query)
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
          <h1 className="text-heading-2 text-foreground">Invoices</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            View and manage client invoices
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
                <p className="text-sm text-foreground-secondary">Total Invoices</p>
                <p className="text-2xl font-semibold">{totals.count}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
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
                <p className="text-sm text-foreground-secondary">Pending</p>
                <p className="text-2xl font-semibold">{summary.PENDING?.count || 0}</p>
                <p className="text-xs text-foreground-secondary">
                  {formatCurrency(summary.PENDING?.amount || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Paid</p>
                <p className="text-2xl font-semibold">{summary.PAID?.count || 0}</p>
                <p className="text-xs text-foreground-secondary">
                  {formatCurrency(summary.PAID?.amount || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
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
                  placeholder="Search by invoice number or client name..."
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
                <option value="PAID">Paid</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-foreground-secondary text-center py-8">
              No invoices found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Period
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Amount
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b last:border-b-0 hover:bg-background-secondary transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-foreground-secondary" />
                          <span className="font-medium text-sm">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm">
                            {invoice.client.firstName} {invoice.client.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-foreground-secondary" />
                          <span className="text-sm">
                            {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-sm">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={STATUS_COLORS[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground-secondary">
                          {formatDate(invoice.createdAt)}
                        </span>
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
