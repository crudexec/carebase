import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

// Payment recording schema
const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paidAt: z.string().optional(), // ISO date string, defaults to now
  notes: z.string().optional().nullable(),
});

// POST - Record a payment
export async function POST(
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
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Cannot add payment to cancelled invoices
    if (existingInvoice.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot add payment to a cancelled invoice" },
        { status: 400 }
      );
    }

    // Cannot add payment to already fully paid invoices
    if (existingInvoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already fully paid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = recordPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate payment amount doesn't exceed amount due
    const currentAmountDue = existingInvoice.amountDue.toNumber();
    if (data.amount > currentAmountDue) {
      return NextResponse.json(
        {
          error: "Payment amount exceeds amount due",
          amountDue: currentAmountDue,
        },
        { status: 400 }
      );
    }

    // Calculate new amounts
    const newAmountPaid = existingInvoice.amountPaid.toNumber() + data.amount;
    const newAmountDue = existingInvoice.total.toNumber() - newAmountPaid;

    // Determine new status
    let newStatus: InvoiceStatus = existingInvoice.status;
    let paidAt: Date | null = existingInvoice.paidAt;

    if (newAmountDue <= 0) {
      newStatus = InvoiceStatus.PAID;
      paidAt = new Date();
    } else if (newAmountPaid > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    // Create payment and update invoice in a transaction
    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.invoicePayment.create({
        data: {
          invoiceId: id,
          amount: data.amount,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
          notes: data.notes || null,
          recordedById: userId,
        },
        include: {
          recordedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
          paidAt,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
          payments: {
            include: {
              recordedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { paidAt: "desc" },
          },
        },
      }),
    ]);

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount.toNumber(),
        paidAt: payment.paidAt,
        notes: payment.notes,
        recordedBy: payment.recordedBy,
        createdAt: payment.createdAt,
      },
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        total: updatedInvoice.total.toNumber(),
        amountPaid: updatedInvoice.amountPaid.toNumber(),
        amountDue: updatedInvoice.amountDue.toNumber(),
        status: updatedInvoice.status,
        paidAt: updatedInvoice.paidAt,
        client: updatedInvoice.client,
        sponsor: updatedInvoice.sponsor,
        payments: updatedInvoice.payments.map((p) => ({
          id: p.id,
          amount: p.amount.toNumber(),
          paidAt: p.paidAt,
          notes: p.notes,
          recordedBy: p.recordedBy,
          createdAt: p.createdAt,
        })),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}

// GET - Get payment history for an invoice
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

    // Find invoice to verify access
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        ...(isSponsor ? { sponsorId: userId } : {}),
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get payments
    const payments = await prisma.invoicePayment.findMany({
      where: { invoiceId: id },
      include: {
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount.toNumber(),
        paidAt: p.paidAt,
        notes: p.notes,
        recordedBy: p.recordedBy,
        createdAt: p.createdAt,
      })),
      summary: {
        total: invoice.total.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        paymentCount: payments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
