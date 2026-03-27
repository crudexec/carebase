import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Query validation schema
const invoicesQuerySchema = z.object({
  status: z.string().optional(),
  clientId: z.string().optional(),
  sponsorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// Line item schema
const lineItemSchema = z.object({
  type: z.enum(["SHIFT", "CUSTOM"]),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  shiftId: z.string().optional(),
  serviceDate: z.string().optional(),
});

// Create invoice schema
const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  sponsorId: z.string().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(1).default(0),
  currency: z.enum(["USD", "GBP", "CAD", "NGN"]).default("USD"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  status: z.enum(["DRAFT", "PENDING"]).default("DRAFT"),
});

// Generate invoice number
async function generateInvoiceNumber(companyId: string, offset: number = 0): Promise<string> {
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

  // Add offset for retry attempts (handles race conditions and gaps)
  nextNumber += offset;

  return `INV-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

// GET - List invoices
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;

    // Check permission
    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_VIEW,
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    // Sponsors can only view their own invoices
    const isSponsor = role === "SPONSOR";

    if (!canViewAll && !isSponsor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = invoicesQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { status, clientId, sponsorId, startDate, endDate, search, page, limit } = queryResult.data;

    // Build where clause
    const whereClause: Prisma.InvoiceWhereInput = { companyId };

    // Sponsors can only see their own invoices
    if (isSponsor) {
      whereClause.sponsorId = userId;
    } else if (sponsorId) {
      whereClause.sponsorId = sponsorId;
    }

    if (status) {
      if (status === "ALL") {
        // Show all invoices including archived
      } else {
        whereClause.status = status as Prisma.EnumInvoiceStatusFilter;
      }
    } else {
      // By default, exclude archived invoices
      whereClause.status = { not: "ARCHIVED" };
    }

    if (clientId) {
      whereClause.clientId = clientId;
    }

    if (startDate) {
      whereClause.periodStart = { gte: new Date(startDate) };
    }

    if (endDate) {
      whereClause.periodEnd = { lte: new Date(endDate) };
    }

    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { client: { firstName: { contains: search, mode: "insensitive" } } },
        { client: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
          _count: {
            select: {
              lineItems: true,
              payments: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const stats = await prisma.invoice.groupBy({
      by: ["status"],
      where: { companyId, ...(isSponsor ? { sponsorId: userId } : {}) },
      _count: true,
      _sum: {
        total: true,
        amountDue: true,
      },
    });

    // Get totals
    const totals = await prisma.invoice.aggregate({
      where: { companyId, ...(isSponsor ? { sponsorId: userId } : {}) },
      _sum: {
        total: true,
        amountDue: true,
        amountPaid: true,
      },
      _count: true,
    });

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        currency: inv.currency,
        subtotal: inv.subtotal.toNumber(),
        taxRate: inv.taxRate.toNumber(),
        taxAmount: inv.taxAmount.toNumber(),
        total: inv.total.toNumber(),
        amountPaid: inv.amountPaid.toNumber(),
        amountDue: inv.amountDue.toNumber(),
        status: inv.status,
        dueDate: inv.dueDate,
        notes: inv.notes,
        sentAt: inv.sentAt,
        paidAt: inv.paidAt,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        client: inv.client,
        sponsor: inv.sponsor,
        lineItemCount: inv._count.lineItems,
        paymentCount: inv._count.payments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: stats.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.status]: {
            count: stat._count,
            total: stat._sum.total?.toNumber() || 0,
            amountDue: stat._sum.amountDue?.toNumber() || 0,
          },
        }),
        {}
      ),
      totals: {
        count: totals._count,
        total: totals._sum.total?.toNumber() || 0,
        amountPaid: totals._sum.amountPaid?.toNumber() || 0,
        amountDue: totals._sum.amountDue?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST - Create invoice
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission
    const canCreate = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = createInvoiceSchema.safeParse(body);

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

    // If sponsorId provided, verify sponsor exists
    if (data.sponsorId) {
      const sponsor = await prisma.user.findFirst({
        where: { id: data.sponsorId, companyId, role: "SPONSOR" },
      });

      if (!sponsor) {
        return NextResponse.json(
          { error: "Sponsor not found" },
          { status: 404 }
        );
      }
    }

    // Calculate totals
    const subtotal = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * data.taxRate;
    const total = subtotal + taxAmount;

    // Retry logic to handle race conditions on invoice number
    const MAX_RETRIES = 5;
    let invoice = null;
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Generate invoice number fresh on each attempt, with offset for retries
        const invoiceNumber = await generateInvoiceNumber(companyId, attempt);

        // Create invoice with line items
        invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            periodStart: new Date(data.periodStart),
            periodEnd: new Date(data.periodEnd),
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            notes: data.notes,
            currency: data.currency,
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
              create: data.lineItems.map((item) => ({
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
                shiftId: item.shiftId || null,
                serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
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

        // Success - break out of retry loop
        break;
      } catch (error) {
        lastError = error;
        // Check if it's a unique constraint error on invoiceNumber (P2002)
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          (error.meta?.target as string[] | undefined)?.includes("invoiceNumber")
        ) {
          // Retry with a new invoice number
          console.log(`Invoice number collision, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`);
          continue;
        }
        // For other errors, throw immediately
        throw error;
      }
    }

    if (!invoice) {
      console.error("Failed to create invoice after max retries:", lastError);
      return NextResponse.json(
        { error: "Failed to create invoice - please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoice: {
        ...invoice,
        currency: invoice.currency,
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
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
