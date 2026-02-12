import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";

// GET - Generate PDF for invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { id } = await params;

    // Check permission
    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_VIEW,
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    const isSponsor = role === "SPONSOR";

    if (!canViewAll && !isSponsor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch invoice with all details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        ...(isSponsor ? { sponsorId: userId } : {}),
      },
      include: {
        company: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            phone: true,
          },
        },
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        lineItems: {
          orderBy: { serviceDate: "asc" },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Helper functions
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // Header - Company Info
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.company.name, margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (invoice.company.address) {
      doc.text(invoice.company.address, margin, y);
      y += 5;
    }
    if (invoice.company.phone) {
      doc.text(invoice.company.phone, margin, y);
      y += 5;
    }

    // Invoice Title
    y += 5;
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin, 25, { align: "right" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.invoiceNumber, pageWidth - margin, 35, { align: "right" });

    // Invoice Details (right side)
    y = 50;
    doc.setFontSize(10);
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, pageWidth - margin, y, { align: "right" });
    y += 5;
    doc.text(`Period: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, pageWidth - margin, y, { align: "right" });
    y += 5;
    if (invoice.dueDate) {
      doc.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - margin, y, { align: "right" });
      y += 5;
    }

    // Status badge
    y += 5;
    doc.setFillColor(invoice.status === "PAID" ? 76 : invoice.status === "OVERDUE" ? 239 : 245,
                     invoice.status === "PAID" ? 175 : invoice.status === "OVERDUE" ? 68 : 158,
                     invoice.status === "PAID" ? 80 : invoice.status === "OVERDUE" ? 68 : 11);
    doc.roundedRect(pageWidth - margin - 30, y - 4, 30, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(invoice.status, pageWidth - margin - 15, y + 2, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Bill To Section
    y = 50;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    if (invoice.sponsor) {
      doc.text(`${invoice.sponsor.firstName} ${invoice.sponsor.lastName}`, margin, y);
      y += 5;
      if (invoice.sponsor.email) {
        doc.text(invoice.sponsor.email, margin, y);
        y += 5;
      }
      if (invoice.sponsor.phone) {
        doc.text(invoice.sponsor.phone, margin, y);
        y += 5;
      }
    } else {
      doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, margin, y);
      y += 5;
      if (invoice.client.address) {
        doc.text(invoice.client.address, margin, y);
        y += 5;
      }
      if (invoice.client.phone) {
        doc.text(invoice.client.phone, margin, y);
        y += 5;
      }
    }

    // For (Client) Section
    if (invoice.sponsor) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("FOR:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, margin, y);
      y += 10;
    }

    // Line Items Table
    y = Math.max(y, 100);
    y += 10;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Description", margin + 2, y);
    doc.text("Qty", margin + 115, y, { align: "right" });
    doc.text("Rate", margin + 135, y, { align: "right" });
    doc.text("Amount", pageWidth - margin - 2, y, { align: "right" });
    y += 8;

    // Table Rows
    doc.setFont("helvetica", "normal");
    for (const item of invoice.lineItems) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const description = item.description.length > 50
        ? item.description.substring(0, 47) + "..."
        : item.description;

      doc.text(description, margin + 2, y);
      doc.text(item.quantity.toNumber().toString(), margin + 115, y, { align: "right" });
      doc.text(formatCurrency(item.unitPrice.toNumber()), margin + 135, y, { align: "right" });
      doc.text(formatCurrency(item.amount.toNumber()), pageWidth - margin - 2, y, { align: "right" });
      y += 6;
    }

    // Totals
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 100, y, pageWidth - margin, y);
    y += 8;

    const totalsX = margin + 110;
    doc.text("Subtotal:", totalsX, y);
    doc.text(formatCurrency(invoice.subtotal.toNumber()), pageWidth - margin - 2, y, { align: "right" });
    y += 6;

    if (invoice.taxRate.toNumber() > 0) {
      doc.text(`Tax (${(invoice.taxRate.toNumber() * 100).toFixed(1)}%):`, totalsX, y);
      doc.text(formatCurrency(invoice.taxAmount.toNumber()), pageWidth - margin - 2, y, { align: "right" });
      y += 6;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsX, y);
    doc.text(formatCurrency(invoice.total.toNumber()), pageWidth - margin - 2, y, { align: "right" });
    y += 6;

    if (invoice.amountPaid.toNumber() > 0) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(76, 175, 80);
      doc.text("Paid:", totalsX, y);
      doc.text(formatCurrency(invoice.amountPaid.toNumber()), pageWidth - margin - 2, y, { align: "right" });
      doc.setTextColor(0, 0, 0);
      y += 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const amountDue = invoice.amountDue.toNumber();
    if (amountDue > 0) {
      doc.setTextColor(245, 158, 11);
    }
    doc.text("Amount Due:", totalsX, y);
    doc.text(formatCurrency(amountDue), pageWidth - margin - 2, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 10;

    // Notes
    if (invoice.notes) {
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");

      const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, y);
    }

    // Payment History
    if (invoice.payments.length > 0) {
      y += 20;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Payment History:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");

      for (const payment of invoice.payments) {
        doc.text(`${formatDate(payment.paidAt)} - ${formatCurrency(payment.amount.toNumber())}`, margin, y);
        y += 5;
      }
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
