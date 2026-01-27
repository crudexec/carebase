import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/care-plans/[id]/orders - List orders for a care plan
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get("showArchived") === "true";

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const orders = await prisma.carePlanOrder.findMany({
      where: {
        carePlanId: id,
        ...(showArchived ? {} : { isActive: true }),
      },
      orderBy: [{ disciplineType: "asc" }, { displayOrder: "asc" }],
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

const createOrderSchema = z.object({
  disciplineType: z.string().min(1, "Discipline type is required"),
  bodySystem: z.string().optional(),
  orderText: z.string().min(1, "Order text is required"),
  orderExplanation: z.string().optional(),
  goals: z.string().optional(),
  goalsExplanation: z.string().optional(),
  isFrequencyOrder: z.boolean().default(false),
  effectiveDate: z.string().optional(),
  displayOrder: z.number().optional(),
});

// POST /api/care-plans/[id]/orders - Add order to care plan
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get max display order
    const maxOrder = await prisma.carePlanOrder.aggregate({
      where: { carePlanId: id },
      _max: { displayOrder: true },
    });

    const order = await prisma.carePlanOrder.create({
      data: {
        carePlanId: id,
        disciplineType: validation.data.disciplineType,
        bodySystem: validation.data.bodySystem,
        orderText: validation.data.orderText,
        orderExplanation: validation.data.orderExplanation,
        goals: validation.data.goals,
        goalsExplanation: validation.data.goalsExplanation,
        isFrequencyOrder: validation.data.isFrequencyOrder,
        effectiveDate: validation.data.effectiveDate
          ? new Date(validation.data.effectiveDate)
          : null,
        displayOrder: validation.data.displayOrder ?? (maxOrder._max.displayOrder || 0) + 1,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  disciplineType: z.string().optional(),
  bodySystem: z.string().nullable().optional(),
  orderText: z.string().optional(),
  orderExplanation: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  goalsExplanation: z.string().nullable().optional(),
  orderStatus: z.enum(["ACTIVE", "GOALS_MET", "ONGOING", "DISCONTINUED"]).optional(),
  isFrequencyOrder: z.boolean().optional(),
  effectiveDate: z.string().nullable().optional(),
  goalsMetDate: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/care-plans/[id]/orders - Update order
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { orderId, effectiveDate, goalsMetDate, ...rest } = validation.data;

    const order = await prisma.carePlanOrder.update({
      where: { id: orderId },
      data: {
        ...rest,
        effectiveDate: effectiveDate
          ? new Date(effectiveDate)
          : effectiveDate === null
          ? null
          : undefined,
        goalsMetDate: goalsMetDate
          ? new Date(goalsMetDate)
          : goalsMetDate === null
          ? null
          : undefined,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE /api/care-plans/[id]/orders - Delete order (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.carePlanOrder.update({
      where: { id: orderId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
