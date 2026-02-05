import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch company details
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        faxNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}

// PATCH - Update company details (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update company settings
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update company settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, phone, faxNumber } = body;

    // Validate name is required
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Validate fax number format if provided (E.164 format)
    if (faxNumber && !/^\+?[1-9]\d{1,14}$/.test(faxNumber.trim())) {
      return NextResponse.json(
        { error: "Fax number must be in E.164 format (e.g., +12025551234)" },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        faxNumber: faxNumber?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        faxNumber: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: session.user.companyId,
        action: "COMPANY_UPDATED",
        entityType: "Company",
        entityId: company.id,
        changes: { name, address, phone, faxNumber },
      },
    });

    return NextResponse.json({
      message: "Company settings updated successfully",
      company,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company settings" },
      { status: 500 }
    );
  }
}
