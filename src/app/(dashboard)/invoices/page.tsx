"use client";

import * as React from "react";
import Link from "next/link";
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
  Plus,
  FileText,
  AlertTriangle,
  XCircle,
  Eye,
  Zap,
} from "lucide-react";
import { GenerateInvoicesModal } from "@/components/invoices/generate-invoices-modal";

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sponsor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}


const STATUS_CONFIG: Record<string, { variant: "default" | "warning" | "success" | "error"; icon: React.ElementType }> = {
  DRAFT: { variant: "default", icon: FileText },
  PENDING: { variant: "warning", icon: Clock },
  SENT: { variant: "warning", icon: Clock },
  PARTIAL: { variant: "warning", icon: DollarSign },
  PAID: { variant: "success", icon: CheckCircle },
  OVERDUE: { variant: "error", icon: AlertTriangle },
  CANCELLED: { variant: "default", icon: XCircle },
};

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Sponsor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);

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

  // Fetch clients and sponsors for generate modal
  React.useEffect(() => {
    async function fetchClientsAndSponsors() {
      try {
        const [clientsRes, sponsorsRes] = await Promise.all([
          fetch("/api/clients?limit=1000"),
          fetch("/api/sponsors?limit=1000"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
        }

        if (sponsorsRes.ok) {
          const data = await sponsorsRes.json();
          setSponsors(data.sponsors || []);
        }
      } catch (err) {
        console.error("Error fetching clients/sponsors:", err);
      }
    }

    fetchClientsAndSponsors();
  }, []);

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
      invoice.client.lastName.toLowerCase().includes(query) ||
      invoice.sponsor?.firstName.toLowerCase().includes(query) ||
      invoice.sponsor?.lastName.toLowerCase().includes(query)
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
            Create, manage, and track client invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setShowGenerateModal(true)}>
            <Zap className="w-4 h-4 mr-1" />
            Generate from Shifts
          </Button>
          <Link href="/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Create Invoice
            </Button>
          </Link>
        </div>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <Input
                  placeholder="Search by invoice number, client, or sponsor..."
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
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
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
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
              <p className="text-foreground-secondary">No invoices found</p>
              <p className="text-sm text-foreground-tertiary mt-1">
                Create your first invoice to get started
              </p>
              <Link href="/invoices/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Invoice
                </Button>
              </Link>
            </div>
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
                      Bill To
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Period
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Due
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b last:border-b-0 hover:bg-background-secondary transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            <Receipt className="w-4 h-4 text-foreground-secondary" />
                            <span className="font-medium text-sm">{invoice.invoiceNumber}</span>
                          </Link>
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
                          <span className="text-sm text-foreground-secondary">
                            {invoice.sponsor
                              ? `${invoice.sponsor.firstName} ${invoice.sponsor.lastName}`
                              : "Client"
                            }
                          </span>
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
                            {formatCurrency(invoice.total)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm ${invoice.amountDue > 0 ? "text-warning font-medium" : "text-foreground-secondary"}`}>
                            {formatCurrency(invoice.amountDue)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Invoices Modal */}
      <GenerateInvoicesModal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          fetchData();
        }}
        clients={clients}
        sponsors={sponsors}
      />
    </div>
  );
}
