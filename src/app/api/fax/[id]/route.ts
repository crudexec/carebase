import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/fax/[id] - Get single fax record details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const faxRecord = await prisma.faxRecord.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        sentBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carePlan: {
          select: {
            id: true,
            planNumber: true,
            client: {
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

    if (!faxRecord) {
      return NextResponse.json({ error: "Fax record not found" }, { status: 404 });
    }

    return NextResponse.json({ faxRecord });
  } catch (error) {
    console.error("Error fetching fax record:", error);
    return NextResponse.json(
      { error: "Failed to fetch fax record" },
      { status: 500 }
    );
  }
}

const updateFaxSchema = z.object({
  assignedToId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  processedAt: z.boolean().optional(), // true to mark as processed now
});

// PATCH /api/fax/[id] - Update fax record (assign, link to client, add notes, mark processed)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const faxRecord = await prisma.faxRecord.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!faxRecord) {
      return NextResponse.json({ error: "Fax record not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateFaxSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = {};

    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
    }

    if (data.clientId !== undefined) {
      updateData.clientId = data.clientId;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.processedAt === true) {
      updateData.processedAt = new Date();
    }

    const updatedFaxRecord = await prisma.faxRecord.update({
      where: { id },
      data: updateData,
      include: {
        sentBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "FAX_RECORD_UPDATED",
        entityType: "FaxRecord",
        entityId: id,
        changes: JSON.parse(JSON.stringify(updateData)),
      },
    });

    return NextResponse.json({ faxRecord: updatedFaxRecord });
  } catch (error) {
    console.error("Error updating fax record:", error);
    return NextResponse.json(
      { error: "Failed to update fax record" },
      { status: 500 }
    );
  }
}

// DELETE /api/fax/[id] - Delete fax record
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and ops managers can delete fax records
    if (!["ADMIN", "OPS_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const faxRecord = await prisma.faxRecord.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!faxRecord) {
      return NextResponse.json({ error: "Fax record not found" }, { status: 404 });
    }

    await prisma.faxRecord.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "FAX_RECORD_DELETED",
        entityType: "FaxRecord",
        entityId: id,
        changes: {
          direction: faxRecord.direction,
          fromNumber: faxRecord.fromNumber,
          toNumber: faxRecord.toNumber,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fax record:", error);
    return NextResponse.json(
      { error: "Failed to delete fax record" },
      { status: 500 }
    );
  }
}
