import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for billing settings
const billingSettingsSchema = z.object({
  npi: z
    .string()
    .length(10, "NPI must be exactly 10 digits")
    .regex(/^\d+$/, "NPI must contain only digits")
    .optional()
    .nullable(),
  taxId: z
    .string()
    .length(9, "Tax ID must be exactly 9 digits")
    .regex(/^\d+$/, "Tax ID must contain only digits")
    .optional()
    .nullable(),
  taxonomyCode: z.string().max(50).optional().nullable(),
  billingName: z.string().max(255).optional().nullable(),
  billingAddress: z.string().max(500).optional().nullable(),
  billingCity: z.string().max(100).optional().nullable(),
  billingState: z
    .string()
    .length(2, "State must be 2-letter code")
    .optional()
    .nullable(),
  billingZip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
    .optional()
    .nullable(),
  billingPhone: z.string().max(20).optional().nullable(),
  billingFrequency: z.enum(["WEEKLY", "FORTNIGHTLY", "MONTHLY"]).optional().nullable(),
});

// GET - Fetch billing settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        npi: true,
        taxId: true,
        taxonomyCode: true,
        billingName: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingZip: true,
        billingPhone: true,
        billingFrequency: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ settings: company });
  } catch (error) {
    console.error("Error fetching billing settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update billing settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;

    // Check permission - only ADMIN and OPS_MANAGER can manage billing settings
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = billingSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Build update object, only including non-undefined values
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: {
        id: true,
        name: true,
        npi: true,
        taxId: true,
        taxonomyCode: true,
        billingName: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingZip: true,
        billingPhone: true,
        billingFrequency: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_BILLING_SETTINGS",
        entityType: "Company",
        entityId: companyId,
        changes: JSON.parse(JSON.stringify(updateData)),
        userId,
        companyId,
      },
    });

    return NextResponse.json({ settings: updatedCompany });
  } catch (error) {
    console.error("Error updating billing settings:", error);
    return NextResponse.json(
      { error: "Failed to update billing settings" },
      { status: 500 }
    );
  }
}
