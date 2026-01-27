import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/settings/state - Get available states and company's state config
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    // Get all active states
    const states = await prisma.stateConfiguration.findMany({
      where: { isActive: true },
      orderBy: { stateName: "asc" },
      select: {
        id: true,
        stateCode: true,
        stateName: true,
        medicaidProgramName: true,
        evvRequired: true,
        authorizationRequired: true,
        maxHoursPerDay: true,
        maxHoursPerWeek: true,
      },
    });

    // Get company's current state configuration
    const companyStateConfig = await prisma.companyStateConfig.findFirst({
      where: {
        companyId: session.user.companyId,
        isPrimaryState: true,
      },
      include: {
        stateConfig: true,
      },
    });

    // Get all company state configs (for multi-state operations)
    const allCompanyStates = await prisma.companyStateConfig.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        stateConfig: {
          select: {
            id: true,
            stateCode: true,
            stateName: true,
          },
        },
      },
    });

    return NextResponse.json({
      states,
      primaryState: companyStateConfig?.stateConfig || null,
      companyStates: allCompanyStates,
    });
  } catch (error) {
    console.error("Error fetching state configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch state configuration" },
      { status: 500 }
    );
  }
}

const setStateSchema = z.object({
  stateConfigId: z.string().min(1, "State is required"),
  isPrimaryState: z.boolean().default(true),
  customPayerId: z.string().optional(),
  customEvvVendor: z.string().optional(),
});

// POST /api/settings/state - Set company's state configuration
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can change state configuration
    if (!["ADMIN", "OPS_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = setStateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { stateConfigId, isPrimaryState, customPayerId, customEvvVendor } =
      validation.data;

    // Verify state exists
    const stateConfig = await prisma.stateConfiguration.findUnique({
      where: { id: stateConfigId },
    });

    if (!stateConfig) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    // If setting as primary, unset other primary states
    if (isPrimaryState) {
      await prisma.companyStateConfig.updateMany({
        where: {
          companyId: session.user.companyId,
          isPrimaryState: true,
        },
        data: { isPrimaryState: false },
      });
    }

    // Create or update company state config
    const companyStateConfig = await prisma.companyStateConfig.upsert({
      where: {
        companyId_stateConfigId: {
          companyId: session.user.companyId,
          stateConfigId,
        },
      },
      update: {
        isPrimaryState,
        customPayerId,
        customEvvVendor,
        isActive: true,
      },
      create: {
        companyId: session.user.companyId,
        stateConfigId,
        isPrimaryState,
        customPayerId,
        customEvvVendor,
        isActive: true,
      },
      include: {
        stateConfig: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "STATE_CONFIG_UPDATED",
        entityType: "CompanyStateConfig",
        entityId: companyStateConfig.id,
        changes: {
          stateCode: stateConfig.stateCode,
          isPrimaryState,
        },
      },
    });

    return NextResponse.json({
      companyStateConfig,
      message: `State configuration updated to ${stateConfig.stateName}`,
    });
  } catch (error) {
    console.error("Error updating state configuration:", error);
    return NextResponse.json(
      { error: "Failed to update state configuration" },
      { status: 500 }
    );
  }
}
