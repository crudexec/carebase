import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { Resend } from "resend";
import jsPDF from "jspdf";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "invoices@carebasehealth.com";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "CareBase";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";

// Generate PDF for invoice
async function generateInvoicePDF(invoice: NonNullable<Awaited<ReturnType<typeof getInvoiceWithDetails>>>): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

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

  // Header
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

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 25, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, pageWidth - margin, 35, { align: "right" });

  // Invoice Details
  y = 50;
  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.text(`Period: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  if (invoice.dueDate) {
    doc.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - margin, y, { align: "right" });
  }

  // Bill To
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
  } else {
    doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, margin, y);
    y += 5;
    if (invoice.client.address) {
      doc.text(invoice.client.address, margin, y);
    }
  }

  // Line Items
  y = 100;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Description", margin + 2, y);
  doc.text("Qty", margin + 115, y, { align: "right" });
  doc.text("Rate", margin + 135, y, { align: "right" });
  doc.text("Amount", pageWidth - margin - 2, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  for (const item of invoice.lineItems) {
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

  doc.setFontSize(11);
  doc.text("Amount Due:", totalsX, y);
  doc.text(formatCurrency(invoice.amountDue.toNumber()), pageWidth - margin - 2, y, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}

// Get invoice with all details
async function getInvoiceWithDetails(id: string, companyId: string) {
  return prisma.invoice.findFirst({
    where: { id, companyId },
    include: {
      company: {
        select: {
          name: true,
          address: true,
        },
      },
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          address: true,
        },
      },
      sponsor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lineItems: {
        orderBy: { serviceDate: "asc" },
      },
    },
  });
}

// Generate email HTML
function generateEmailHTML(invoice: NonNullable<Awaited<ReturnType<typeof getInvoiceWithDetails>>>) {
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

  const recipientName = invoice.sponsor
    ? `${invoice.sponsor.firstName} ${invoice.sponsor.lastName}`
    : `${invoice.client.firstName} ${invoice.client.lastName}`;

  return `
    <p>Dear ${recipientName},</p>

    <p>Please find attached your invoice from ${invoice.company.name}.</p>

    <div class="alert-box alert-info">
      <table class="info-table">
        <tr>
          <td>Invoice Number:</td>
          <td><strong>${invoice.invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td>Billing Period:</td>
          <td>${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}</td>
        </tr>
        <tr>
          <td>Client:</td>
          <td>${invoice.client.firstName} ${invoice.client.lastName}</td>
        </tr>
        <tr>
          <td>Total Amount:</td>
          <td><strong>${formatCurrency(invoice.total.toNumber())}</strong></td>
        </tr>
        ${invoice.amountPaid.toNumber() > 0 ? `
        <tr>
          <td>Amount Paid:</td>
          <td>${formatCurrency(invoice.amountPaid.toNumber())}</td>
        </tr>
        ` : ""}
        <tr>
          <td>Amount Due:</td>
          <td><strong style="color: ${invoice.amountDue.toNumber() > 0 ? "#f59e0b" : "#22c55e"};">${formatCurrency(invoice.amountDue.toNumber())}</strong></td>
        </tr>
        ${invoice.dueDate ? `
        <tr>
          <td>Due Date:</td>
          <td>${formatDate(invoice.dueDate)}</td>
        </tr>
        ` : ""}
      </table>
    </div>

    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ""}

    <p>The invoice is attached to this email as a PDF. If you have any questions about this invoice, please don't hesitate to contact us.</p>

    <p>Thank you for your continued business.</p>

    <p>Best regards,<br/>${invoice.company.name}</p>
  `;
}

// POST - Send invoice via email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    // Check permission
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured. Set RESEND_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Get invoice with details
    const invoice = await getInvoiceWithDetails(id, companyId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Determine recipient email
    let recipientEmail: string | null = null;
    if (invoice.sponsor?.email) {
      recipientEmail = invoice.sponsor.email;
    }
    // Note: Client model doesn't have email field, so if no sponsor, we can't send

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No email address available for this invoice recipient" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Generate email HTML
    const emailHtml = generateEmailHTML(invoice);

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`,
      html: wrapInEmailTemplate(emailHtml),
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Error sending invoice email:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    // Update invoice status and sentAt
    await prisma.invoice.update({
      where: { id },
      data: {
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      sentTo: recipientEmail,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}

// Wrap email in styled template
function wrapInEmailTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .content p {
      margin: 0 0 16px;
    }
    .alert-box {
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: 500;
      color: #6b7280;
      width: 140px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Invoice</h1>
      </div>
      <div class="content">
        ${body}
      </div>
      <div class="footer">
        <p>This is an automated invoice from CareBase.</p>
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
          If you have questions about this invoice, please contact your care provider.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
