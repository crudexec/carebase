import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  TerminologySettings,
  TERMINOLOGY_OPTIONS,
  validateTerminologySettings,
} from "@/lib/terminology";

// Schema for updating terminology settings
const updateTerminologySchema = z.object({
  visitNote: z.enum(["visit_note", "daily_report"]).optional(),
  client: z.enum(["client", "patient", "resident"]).optional(),
  carer: z.enum(["carer", "caregiver", "staff_member"]).optional(),
  shift: z.enum(["shift", "visit", "appointment"]).optional(),
});

// GET /api/settings/terminology - Get current terminology settings
// Accessible by all authenticated users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        terminology: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Validate stored terminology (in case of invalid data)
    const terminology = validateTerminologySettings(company.terminology)
      ? (company.terminology as TerminologySettings)
      : null;

    return NextResponse.json({
      terminology,
      options: TERMINOLOGY_OPTIONS,
    });
  } catch (error) {
    console.error("Error fetching terminology settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch terminology settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/terminology - Update terminology settings
// Admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update terminology settings
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTerminologySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const newSettings = validation.data;

    // Get current terminology settings
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { terminology: true },
    });

    // Merge with existing settings
    const currentSettings = validateTerminologySettings(company?.terminology)
      ? (company?.terminology as TerminologySettings)
      : {};

    const updatedSettings: TerminologySettings = {
      ...currentSettings,
      ...newSettings,
    };

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        terminology: updatedSettings,
      },
      select: {
        terminology: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "TERMINOLOGY_SETTINGS_UPDATED",
        entityType: "Company",
        entityId: session.user.companyId,
        changes: {
          previous: currentSettings,
          updated: updatedSettings,
        },
      },
    });

    return NextResponse.json({
      success: true,
      terminology: updatedCompany.terminology as TerminologySettings,
    });
  } catch (error) {
    console.error("Error updating terminology settings:", error);
    return NextResponse.json(
      { error: "Failed to update terminology settings" },
      { status: 500 }
    );
  }
}
