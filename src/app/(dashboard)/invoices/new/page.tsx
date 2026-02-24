"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@/components/ui";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect sponsors away from new invoice page
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SPONSOR") {
      router.replace("/invoices");
    }
  }, [session, status, router]);

  // Show nothing while checking auth or if sponsor
  if (status === "loading" || session?.user?.role === "SPONSOR") {
    return null;
  }

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
