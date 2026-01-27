import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/assessments/templates - List available assessment templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("stateCode");
    const requiredOnly = searchParams.get("requiredOnly") === "true";

    // Get company's primary state config
    const companyState = await prisma.companyStateConfig.findFirst({
      where: {
        companyId: session.user.companyId,
        isPrimaryState: true,
      },
      include: {
        stateConfig: true,
      },
    });

    const stateConfigId = companyState?.stateConfigId;

    // Build where clause to get templates for the state, company, or global (no state/company)
    const orConditions = [];

    // State-specific templates
    if (stateConfigId) {
      orConditions.push({ stateConfigId: stateConfigId });
    }

    // Company-specific templates
    orConditions.push({ companyId: session.user.companyId });

    // Global templates (no state or company restrictions)
    orConditions.push({ stateConfigId: null, companyId: null });

    const where: Record<string, unknown> = {
      isActive: true,
      OR: orConditions,
    };

    if (requiredOnly) {
      where.isRequired = true;
    }

    const templates = await prisma.assessmentTemplate.findMany({
      where,
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
          include: {
            items: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
        stateConfig: {
          select: {
            stateCode: true,
            stateName: true,
          },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      templates,
      stateConfig: companyState?.stateConfig || null,
    });
  } catch (error) {
    console.error("Error fetching assessment templates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch assessment templates", details: errorMessage },
      { status: 500 }
    );
  }
}
