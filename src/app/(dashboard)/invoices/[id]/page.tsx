"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  RefreshCw,
  Receipt,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  XCircle,
  Plus,
  MoreVertical,
  Send,
  Download,
} from "lucide-react";
import { InvoicePaymentModal } from "@/components/invoices/invoice-payment-modal";

interface LineItem {
  id: string;
  type: "SHIFT" | "CUSTOM";
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceDate: string | null;
  shift?: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
    carer: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
}

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  notes: string | null;
  recordedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  dueDate: string | null;
  notes: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address: string | null;
    phone: string | null;
  };
  sponsor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
  lineItems: LineItem[];
  payments: Payment[];
}

const STATUS_CONFIG: Record<string, { variant: "default" | "warning" | "success" | "error"; icon: React.ElementType }> = {
  DRAFT: { variant: "default", icon: FileText },
  PENDING: { variant: "warning", icon: Clock },
  SENT: { variant: "warning", icon: Send },
  PARTIAL: { variant: "warning", icon: DollarSign },
  PAID: { variant: "success", icon: CheckCircle },
  OVERDUE: { variant: "error", icon: AlertTriangle },
  CANCELLED: { variant: "default", icon: XCircle },
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);

  const fetchInvoice = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);

      if (!response.ok) {
        throw new Error("Invoice not found");
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  React.useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, fetchInvoice]);

  const handleDelete = async () => {
    if (!invoice || invoice.status !== "DRAFT") return;

    if (!confirm("Are you sure you want to delete this draft invoice?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete invoice");
      }

      router.push("/invoices");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSend = async () => {
    if (!invoice) return;

    // Check if there's an email to send to
    if (!invoice.sponsor) {
      alert("Cannot send invoice: No sponsor email address available. Invoices can only be emailed to sponsors.");
      return;
    }

    if (!confirm(`Send invoice to ${invoice.sponsor.firstName} ${invoice.sponsor.lastName} (${invoice.sponsor.email})?`)) {
      return;
    }

    try {
      setIsSending(true);
      setShowActionsMenu(false);

      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invoice");
      }

      const data = await response.json();
      alert(`Invoice sent successfully to ${data.sentTo}`);
      fetchInvoice(); // Refresh to show updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setIsSending(false);
    }
  };

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
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const breadcrumbItems = [
    { label: "Invoices", href: "/invoices" },
    { label: invoice?.invoiceNumber || "..." },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const canEdit = ["DRAFT", "PENDING"].includes(invoice.status);
  const canDelete = invoice.status === "DRAFT";
  const canRecordPayment = !["PAID", "CANCELLED"].includes(invoice.status);

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-heading-2 text-foreground">{invoice.invoiceNumber}</h1>
            <Badge variant={statusConfig.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {invoice.status}
            </Badge>
          </div>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Created on {formatDate(invoice.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
          )}
          {canRecordPayment && (
            <Button size="sm" onClick={() => setShowPaymentModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Record Payment
            </Button>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                    onClick={() => setShowActionsMenu(false)}
                    download
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2 disabled:opacity-50"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? "Sending..." : "Send Invoice"}
                  </button>
                  {canDelete && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 flex items-center gap-2"
                      onClick={() => {
                        setShowActionsMenu(false);
                        handleDelete();
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {invoice.client.firstName} {invoice.client.lastName}
                </p>
                {invoice.client.address && (
                  <p className="text-sm text-foreground-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {invoice.client.address}
                  </p>
                )}
                {invoice.client.phone && (
                  <p className="text-sm text-foreground-secondary flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {invoice.client.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Bill To
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.sponsor ? (
                  <>
                    <p className="font-medium">
                      {invoice.sponsor.firstName} {invoice.sponsor.lastName}
                    </p>
                    <p className="text-sm text-foreground-secondary flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {invoice.sponsor.email}
                    </p>
                    {invoice.sponsor.phone && (
                      <p className="text-sm text-foreground-secondary flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {invoice.sponsor.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-foreground-secondary">
                    Billing to client directly
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium text-foreground-secondary">
                        Description
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">
                        Qty
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">
                        Rate
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="py-3 px-3">
                          <div>
                            <p className="text-sm font-medium">{item.description}</p>
                            {item.shift && (
                              <p className="text-xs text-foreground-tertiary">
                                Carer: {item.shift.carer.firstName} {item.shift.carer.lastName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-right">{item.quantity}</td>
                        <td className="py-3 px-3 text-sm text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-sm font-medium text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex justify-between w-full max-w-xs text-sm">
                    <span className="text-foreground-secondary">Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between w-full max-w-xs text-sm">
                      <span className="text-foreground-secondary">
                        Tax ({(invoice.taxRate * 100).toFixed(1)}%):
                      </span>
                      <span>{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full max-w-xs text-base font-semibold pt-2 border-t border-border mt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-sm text-success">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-base font-semibold">
                    <span className={invoice.amountDue > 0 ? "text-warning" : ""}>
                      Amount Due:
                    </span>
                    <span className={invoice.amountDue > 0 ? "text-warning" : ""}>
                      {formatCurrency(invoice.amountDue)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-secondary whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Summary & Payments */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-foreground-tertiary uppercase">Billing Period</p>
                <p className="text-sm font-medium">
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-xs text-foreground-tertiary uppercase">Due Date</p>
                  <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
              )}
              {invoice.sentAt && (
                <div>
                  <p className="text-xs text-foreground-tertiary uppercase">Sent</p>
                  <p className="text-sm font-medium">{formatDateTime(invoice.sentAt)}</p>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <p className="text-xs text-foreground-tertiary uppercase">Paid</p>
                  <p className="text-sm font-medium">{formatDateTime(invoice.paidAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment History
              </CardTitle>
              {canRecordPayment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-foreground-secondary text-center py-4">
                  No payments recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start justify-between py-2 border-b border-border last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-success">
                          +{formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-foreground-tertiary">
                          {formatDateTime(payment.paidAt)}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-foreground-secondary mt-1">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-foreground-tertiary">
                        by {payment.recordedBy.firstName} {payment.recordedBy.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <InvoicePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={invoice.id}
        amountDue={invoice.amountDue}
        onSuccess={() => {
          setShowPaymentModal(false);
          fetchInvoice();
        }}
      />
    </div>
  );
}
