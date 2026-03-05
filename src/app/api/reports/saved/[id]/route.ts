import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/saved/[id] - Get a single saved report
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;

    const report = await prisma.savedReport.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching saved report:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved report" },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/saved/[id] - Update a saved report
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;
    const body = await request.json();

    const { name, description, config } = body;

    // Verify report exists and belongs to company
    const existingReport = await prisma.savedReport.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      config?: object;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (config !== undefined) {
      if (typeof config !== "object") {
        return NextResponse.json({ error: "Config must be an object" }, { status: 400 });
      }
      updateData.config = config;
    }

    const report = await prisma.savedReport.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error updating saved report:", error);
    return NextResponse.json(
      { error: "Failed to update saved report" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/saved/[id] - Delete a saved report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;

    // Verify report exists and belongs to company
    const existingReport = await prisma.savedReport.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.savedReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved report:", error);
    return NextResponse.json(
      { error: "Failed to delete saved report" },
      { status: 500 }
    );
  }
}
