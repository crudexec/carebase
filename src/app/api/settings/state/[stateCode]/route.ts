import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ stateCode: string }>;
}

// GET /api/settings/state/[stateCode] - Get full state configuration details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stateCode } = await params;

    const stateConfig = await prisma.stateConfiguration.findUnique({
      where: { stateCode: stateCode.toUpperCase() },
      include: {
        assessmentTemplates: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            isRequired: true,
            displayOrder: true,
            scoringMethod: true,
            maxScore: true,
          },
        },
        consentFormTemplates: {
          where: { isActive: true },
          orderBy: { formType: "asc" },
          select: {
            id: true,
            name: true,
            formType: true,
            description: true,
            isRequired: true,
            requiresWitness: true,
            expiresAfterDays: true,
          },
        },
      },
    });

    if (!stateConfig) {
      return NextResponse.json(
        { error: "State configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ stateConfig });
  } catch (error) {
    console.error("Error fetching state configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch state configuration" },
      { status: 500 }
    );
  }
}
