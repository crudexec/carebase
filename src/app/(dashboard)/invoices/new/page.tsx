"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: "Invoices", href: "/invoices" },
    { label: "New Invoice" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-heading-2 text-foreground">Create Invoice</h1>
        <p className="text-body-sm text-foreground-secondary mt-1">
          Create a new invoice for a client
        </p>
      </div>

      <InvoiceForm onCancel={() => router.push("/invoices")} />
    </div>
  );
}
