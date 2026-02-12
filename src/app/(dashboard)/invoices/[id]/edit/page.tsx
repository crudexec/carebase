"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { RefreshCw } from "lucide-react";

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

interface LineItem {
  id: string;
  type: "SHIFT" | "CUSTOM";
  description: string;
  quantity: number;
  unitPrice: number;
  shiftId?: string | null;
  serviceDate?: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string | null;
  notes: string | null;
  taxRate: number;
  status: string;
  client: Client;
  sponsor: Sponsor | null;
  lineItems: LineItem[];
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const invoiceRes = await fetch(`/api/invoices/${invoiceId}`);

        if (!invoiceRes.ok) {
          throw new Error("Invoice not found");
        }

        const invoiceData = await invoiceRes.json();
        setInvoice(invoiceData.invoice);

        // Check if invoice can be edited
        if (!["DRAFT", "PENDING"].includes(invoiceData.invoice.status)) {
          setError("This invoice cannot be edited. Only draft and pending invoices can be modified.");
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  const breadcrumbItems = [
    { label: "Invoices", href: "/invoices" },
    { label: invoice?.invoiceNumber || "...", href: `/invoices/${invoiceId}` },
    { label: "Edit" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          Invoice not found
        </div>
      </div>
    );
  }

  // Format dates for form
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const initialData = {
    id: invoice.id,
    clientId: invoice.client.id,
    clientName: `${invoice.client.firstName} ${invoice.client.lastName}`,
    sponsorId: invoice.sponsor?.id || undefined,
    sponsorName: invoice.sponsor
      ? `${invoice.sponsor.firstName} ${invoice.sponsor.lastName} (${invoice.sponsor.email})`
      : "",
    periodStart: formatDateForInput(invoice.periodStart),
    periodEnd: formatDateForInput(invoice.periodEnd),
    dueDate: invoice.dueDate ? formatDateForInput(invoice.dueDate) : undefined,
    notes: invoice.notes || undefined,
    taxRate: invoice.taxRate,
    lineItems: invoice.lineItems.map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      shiftId: item.shiftId || undefined,
      serviceDate: item.serviceDate ? formatDateForInput(item.serviceDate) : undefined,
    })),
    status: invoice.status as "DRAFT" | "PENDING",
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-heading-2 text-foreground">Edit Invoice</h1>
        <p className="text-body-sm text-foreground-secondary mt-1">
          Edit invoice {invoice.invoiceNumber}
        </p>
      </div>

      <InvoiceForm
        initialData={initialData}
        onCancel={() => router.push(`/invoices/${invoiceId}`)}
      />
    </div>
  );
}
