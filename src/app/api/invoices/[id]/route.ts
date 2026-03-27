import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Line item schema for updates
const lineItemSchema = z.object({
  id: z.string().optional(), // Existing item ID for updates
  type: z.enum(["SHIFT", "CUSTOM"]),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  shiftId: z.string().optional().nullable(),
  serviceDate: z.string().optional().nullable(),
});

// Update invoice schema
const updateInvoiceSchema = z.object({
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  taxRate: z.number().min(0).max(1).optional(),
  currency: z.enum(["USD", "GBP", "CAD", "NGN"]).optional(),
  status: z.enum(["DRAFT", "PENDING", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELLED", "ARCHIVED"]).optional(),
  sponsorId: z.string().optional().nullable(),
  lineItems: z.array(lineItemSchema).optional(),
});

// GET - Get single invoice with details
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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        ...(isSponsor ? { sponsorId: userId } : {}),
      },
      include: {
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
          include: {
            shift: {
              select: {
                id: true,
                scheduledStart: true,
                scheduledEnd: true,
                carer: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { serviceDate: "asc" },
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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        currency: invoice.currency,
        subtotal: invoice.subtotal.toNumber(),
        taxRate: invoice.taxRate.toNumber(),
        taxAmount: invoice.taxAmount.toNumber(),
        total: invoice.total.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        status: invoice.status,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        sentAt: invoice.sentAt,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        client: invoice.client,
        sponsor: invoice.sponsor,
        lineItems: invoice.lineItems.map((item) => ({
          id: item.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity.toNumber(),
          unitPrice: item.unitPrice.toNumber(),
          amount: item.amount.toNumber(),
          serviceDate: item.serviceDate,
          shiftId: item.shiftId,
          shift: item.shift,
          createdAt: item.createdAt,
        })),
        payments: invoice.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount.toNumber(),
          paidAt: payment.paidAt,
          notes: payment.notes,
          recordedBy: payment.recordedBy,
          createdAt: payment.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice
export async function PATCH(
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

    // Find existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: { lineItems: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only DRAFT and PENDING invoices can be fully edited
    const canEditFully = ["DRAFT", "PENDING"].includes(existingInvoice.status);

    // Archived invoices can only be unarchived, not edited
    if (existingInvoice.status === "ARCHIVED" && data.status !== "DRAFT" && data.status !== "PENDING") {
      return NextResponse.json(
        { error: "Archived invoices can only be restored to DRAFT or PENDING status" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = updateInvoiceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // If changing line items and not in editable status, reject
    if (data.lineItems && !canEditFully) {
      return NextResponse.json(
        { error: "Cannot modify line items for invoices that are not DRAFT or PENDING" },
        { status: 400 }
      );
    }

    // Start building update data
    const updateData: Record<string, unknown> = {};

    if (data.periodStart !== undefined) {
      updateData.periodStart = new Date(data.periodStart);
    }
    if (data.periodEnd !== undefined) {
      updateData.periodEnd = new Date(data.periodEnd);
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      // If marking as paid, set paidAt
      if (data.status === "PAID" && !existingInvoice.paidAt) {
        updateData.paidAt = new Date();
      }
      // If marking as sent, set sentAt
      if (data.status === "SENT" && !existingInvoice.sentAt) {
        updateData.sentAt = new Date();
      }
    }
    if (data.sponsorId !== undefined) {
      updateData.sponsorId = data.sponsorId;
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }

    // Handle line items update
    if (data.lineItems) {
      const taxRate = data.taxRate ?? existingInvoice.taxRate.toNumber();

      // Calculate new totals
      const subtotal = data.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      const amountPaid = existingInvoice.amountPaid.toNumber();
      const amountDue = total - amountPaid;

      updateData.subtotal = subtotal;
      updateData.taxRate = taxRate;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
      updateData.amountDue = amountDue;

      // Update status based on payment
      if (amountDue <= 0 && amountPaid > 0) {
        updateData.status = "PAID";
        updateData.paidAt = new Date();
      } else if (amountPaid > 0 && amountDue > 0) {
        updateData.status = "PARTIAL";
      }

      // Delete all existing line items and recreate
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: id },
      });

      // Create new line items
      await prisma.invoiceLineItem.createMany({
        data: data.lineItems.map((item) => ({
          invoiceId: id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          shiftId: item.shiftId || null,
          serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
        })),
      });
    } else if (data.taxRate !== undefined) {
      // Just updating tax rate without changing line items
      const subtotal = existingInvoice.subtotal.toNumber();
      const taxAmount = subtotal * data.taxRate;
      const total = subtotal + taxAmount;
      const amountPaid = existingInvoice.amountPaid.toNumber();
      const amountDue = total - amountPaid;

      updateData.taxRate = data.taxRate;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
      updateData.amountDue = amountDue;
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
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
        lineItems: true,
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
        },
      },
    });

    return NextResponse.json({
      invoice: {
        ...updatedInvoice,
        currency: updatedInvoice.currency,
        subtotal: updatedInvoice.subtotal.toNumber(),
        taxRate: updatedInvoice.taxRate.toNumber(),
        taxAmount: updatedInvoice.taxAmount.toNumber(),
        total: updatedInvoice.total.toNumber(),
        amountPaid: updatedInvoice.amountPaid.toNumber(),
        amountDue: updatedInvoice.amountDue.toNumber(),
        lineItems: updatedInvoice.lineItems.map((item) => ({
          ...item,
          quantity: item.quantity.toNumber(),
          unitPrice: item.unitPrice.toNumber(),
          amount: item.amount.toNumber(),
        })),
        payments: updatedInvoice.payments.map((payment) => ({
          ...payment,
          amount: payment.amount.toNumber(),
        })),
      },
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice (only DRAFT, CANCELLED, or ARCHIVED invoices)
export async function DELETE(
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

    // Check permission - only INVOICE_FULL can delete
    const canDelete = hasAnyPermission(role, [PERMISSIONS.INVOICE_FULL]);

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        payments: true,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only DRAFT, CANCELLED, and ARCHIVED invoices can be deleted
    const deletableStatuses = ["DRAFT", "CANCELLED", "ARCHIVED"];
    if (!deletableStatuses.includes(existingInvoice.status)) {
      return NextResponse.json(
        {
          error: "Only draft, cancelled, or archived invoices can be deleted. Archive the invoice first.",
          currentStatus: existingInvoice.status
        },
        { status: 400 }
      );
    }

    // Don't allow deletion if there are payments recorded
    if (existingInvoice.payments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete invoice with recorded payments. Archive it instead." },
        { status: 400 }
      );
    }

    // Delete invoice (line items will cascade delete)
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
