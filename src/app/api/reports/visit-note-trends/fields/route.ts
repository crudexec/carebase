import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface FieldConfig {
  min?: number;
  max?: number;
  thresholdEnabled?: boolean;
  invertTrend?: boolean;
}

interface NumericField {
  id: string;
  label: string;
  sectionId: string;
  sectionTitle: string;
  config: FieldConfig;
}

// GET /api/reports/visit-note-trends/fields
// Returns all numeric fields for a given template
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { searchParams } = new URL(request.url);

    const templateId = searchParams.get("templateId");
    const clientId = searchParams.get("clientId");

    if (!templateId) {
      return NextResponse.json(
        { error: "templateId is required" },
        { status: 400 }
      );
    }

    // If clientId is provided, verify access (sponsors can only see their clients)
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          companyId,
          ...(role === "SPONSOR" ? { sponsorId: userId } : {}),
        },
        select: { id: true },
      });

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
    }

    // Fetch template with sections and fields
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        companyId,
      },
      select: {
        id: true,
        name: true,
        sections: {
          select: {
            id: true,
            title: true,
            order: true,
            fields: {
              where: {
                type: "NUMBER",
              },
              select: {
                id: true,
                label: true,
                config: true,
                order: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Extract numeric fields from all sections
    const fields: NumericField[] = [];

    for (const section of template.sections) {
      for (const field of section.fields) {
        const config = (field.config as FieldConfig) || {};
        fields.push({
          id: field.id,
          label: field.label,
          sectionId: section.id,
          sectionTitle: section.title,
          config: {
            min: config.min,
            max: config.max,
            thresholdEnabled: config.thresholdEnabled ?? (config.min !== undefined || config.max !== undefined),
            invertTrend: config.invertTrend,
          },
        });
      }
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
      },
      fields,
    });
  } catch (error) {
    console.error("Error fetching template fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch template fields" },
      { status: 500 }
    );
  }
}
