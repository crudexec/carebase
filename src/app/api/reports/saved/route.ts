import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/reports/saved - List saved reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    const reports = await prisma.savedReport.findMany({
      where: {
        companyId,
        ...(type ? { type } : {}),
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports/saved - Create a saved report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;
    const body = await request.json();

    const { name, description, type, config } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }
    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Config is required" }, { status: 400 });
    }

    const report = await prisma.savedReport.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type,
        config,
        companyId,
        createdById: userId,
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

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating saved report:", error);
    return NextResponse.json(
      { error: "Failed to create saved report" },
      { status: 500 }
    );
  }
}
