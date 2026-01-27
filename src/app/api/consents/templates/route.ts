import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/consents/templates - List available consent form templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
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

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { stateConfigId: stateConfigId || undefined },
        { companyId: session.user.companyId },
      ],
    };

    if (requiredOnly) {
      where.isRequired = true;
    }

    const templates = await prisma.consentFormTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        formType: true,
        isRequired: true,
        expiresAfterDays: true,
        requiresWitness: true,
        stateConfig: {
          select: {
            stateCode: true,
            stateName: true,
          },
        },
      },
      orderBy: [
        { isRequired: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      templates,
      stateConfig: companyState?.stateConfig || null,
    });
  } catch (error) {
    console.error("Error fetching consent templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch consent templates" },
      { status: 500 }
    );
  }
}
