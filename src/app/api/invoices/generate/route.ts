import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Generate invoice schema
const generateInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  sponsorId: z.string().optional().nullable(),
  periodStart: z.string(),
  periodEnd: z.string(),
  dueDate: z.string().optional().nullable(),
  taxRate: z.number().min(0).max(1).default(0),
  notes: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PENDING"]).default("DRAFT"),
});

// Preview schema
const previewSchema = z.object({
  clientId: z.string().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

// Generate invoice number
async function generateInvoiceNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();

  // Find the highest invoice number for this year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      companyId,
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
    orderBy: { invoiceNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

// GET - Preview shifts available for invoicing
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parseResult = previewSchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { clientId, periodStart, periodEnd } = parseResult.data;

    // Find completed shifts in the period that haven't been invoiced
    const shifts = await prisma.shift.findMany({
      where: {
        companyId,
        status: "COMPLETED",
        scheduledStart: {
          gte: new Date(periodStart),
        },
        scheduledEnd: {
          lte: new Date(periodEnd),
        },
        ...(clientId ? { clientId } : {}),
        // Exclude shifts that are already on an invoice
        invoiceLineItems: {
          none: {},
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ clientId: "asc" }, { scheduledStart: "asc" }],
    });

    // Group shifts by client
    const clientShifts: Record<string, {
      client: { id: string; firstName: string; lastName: string };
      shifts: typeof shifts;
      totalHours: number;
    }> = {};

    for (const shift of shifts) {
      if (!clientShifts[shift.clientId]) {
        clientShifts[shift.clientId] = {
          client: shift.client,
          shifts: [],
          totalHours: 0,
        };
      }

      const hours = (new Date(shift.actualEnd || shift.scheduledEnd).getTime() -
        new Date(shift.actualStart || shift.scheduledStart).getTime()) / (1000 * 60 * 60);

      clientShifts[shift.clientId].shifts.push(shift);
      clientShifts[shift.clientId].totalHours += hours;
    }

    return NextResponse.json({
      preview: Object.values(clientShifts).map((group) => ({
        client: group.client,
        shiftCount: group.shifts.length,
        totalHours: Math.round(group.totalHours * 100) / 100,
        shifts: group.shifts.map((s) => ({
          id: s.id,
          scheduledStart: s.scheduledStart,
          scheduledEnd: s.scheduledEnd,
          actualStart: s.actualStart,
          actualEnd: s.actualEnd,
          carer: s.carer,
        })),
      })),
      period: {
        start: periodStart,
        end: periodEnd,
      },
    });
  } catch (error) {
    console.error("Error previewing invoice generation:", error);
    return NextResponse.json(
      { error: "Failed to preview invoice generation" },
      { status: 500 }
    );
  }
}

// POST - Generate invoice from shifts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = generateInvoiceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify client exists and belongs to company
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, companyId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Find completed shifts for this client in the period that haven't been invoiced
    const shifts = await prisma.shift.findMany({
      where: {
        companyId,
        clientId: data.clientId,
        status: "COMPLETED",
        scheduledStart: {
          gte: new Date(data.periodStart),
        },
        scheduledEnd: {
          lte: new Date(data.periodEnd),
        },
        // Exclude shifts that are already on an invoice
        invoiceLineItems: {
          none: {},
        },
      },
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledStart: "asc" },
    });

    if (shifts.length === 0) {
      return NextResponse.json(
        { error: "No uninvoiced completed shifts found for this client in the specified period" },
        { status: 400 }
      );
    }

    // Calculate line items from shifts
    // Note: Rate is set to 0 and should be filled in by user or from a rate table
    const lineItems = shifts.map((shift) => {
      const start = new Date(shift.actualStart || shift.scheduledStart);
      const end = new Date(shift.actualEnd || shift.scheduledEnd);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return {
        type: "SHIFT" as const,
        description: `Care visit - ${shift.carer.firstName} ${shift.carer.lastName}`,
        quantity: Math.round(hours * 100) / 100, // Round to 2 decimal places
        unitPrice: 0, // Rate should be set by user
        shiftId: shift.id,
        serviceDate: start,
      };
    });

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(companyId);

    // Calculate totals (with 0 rates, will be 0)
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * data.taxRate;
    const total = subtotal + taxAmount;

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        amountPaid: 0,
        amountDue: total,
        status: data.status,
        companyId,
        clientId: data.clientId,
        sponsorId: data.sponsorId || null,
        lineItems: {
          create: lineItems.map((item) => ({
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            shiftId: item.shiftId,
            serviceDate: item.serviceDate,
          })),
        },
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
        lineItems: true,
      },
    });

    return NextResponse.json({
      invoice: {
        ...invoice,
        subtotal: invoice.subtotal.toNumber(),
        taxRate: invoice.taxRate.toNumber(),
        taxAmount: invoice.taxAmount.toNumber(),
        total: invoice.total.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        lineItems: invoice.lineItems.map((item) => ({
          ...item,
          quantity: item.quantity.toNumber(),
          unitPrice: item.unitPrice.toNumber(),
          amount: item.amount.toNumber(),
        })),
      },
      message: `Invoice generated with ${shifts.length} shifts. Please set the rates for each line item.`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
