import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateTrendReportPDF,
  TrendFieldData,
} from "@/lib/reports/trend-pdf-generator";
import {
  calculateStats,
  aggregateByDay,
  getDateRange,
  DataPoint,
} from "@/lib/reports/trend-calculations";

interface FieldConfig {
  min?: number;
  max?: number;
  thresholdEnabled?: boolean;
  invertTrend?: boolean;
}

interface SavedReportConfig {
  clientId?: string; // Optional - legacy support, new reports don't include clientId
  templateId: string;
  fieldIds: string[];
  timeRange: "7d" | "30d" | "90d" | "custom";
  aggregation: "latest" | "average" | "first";
  customStartDate?: string;
  customEndDate?: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reports/saved/[id]/preview
 * Generate and return a PDF preview for a specific client
 *
 * Query params:
 * - clientId: string (required) - The client to generate the preview for
 * - startDate: string (optional) - Override start date
 * - endDate: string (optional) - Override end date
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get("clientId");
    const overrideStartDate = searchParams.get("startDate");
    const overrideEndDate = searchParams.get("endDate");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Get the saved report
    const savedReport = await prisma.savedReport.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!savedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (savedReport.type !== "VISIT_NOTE_TRENDS") {
      return NextResponse.json(
        { error: "Only trend reports support PDF preview" },
        { status: 400 }
      );
    }

    const config = savedReport.config as unknown as SavedReportConfig;

    // Get the client
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate date range
    let dateRange: { start: Date; end: Date };
    try {
      if (overrideStartDate && overrideEndDate) {
        dateRange = getDateRange(
          "custom",
          new Date(overrideStartDate),
          new Date(overrideEndDate)
        );
      } else if (config.timeRange !== "custom") {
        dateRange = getDateRange(config.timeRange);
      } else if (config.customStartDate && config.customEndDate) {
        dateRange = getDateRange(
          "custom",
          new Date(config.customStartDate),
          new Date(config.customEndDate)
        );
      } else {
        dateRange = getDateRange("30d");
      }
    } catch {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Get the template
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: config.templateId,
        companyId,
      },
      select: {
        id: true,
        name: true,
        sections: {
          include: {
            fields: {
              where: {
                id: { in: config.fieldIds },
                type: "NUMBER",
              },
              select: {
                id: true,
                label: true,
                config: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Build fields map
    const fieldsMap = new Map<
      string,
      { label: string; config: FieldConfig; sectionTitle: string }
    >();
    for (const section of template.sections) {
      for (const field of section.fields) {
        fieldsMap.set(field.id, {
          label: field.label,
          config: (field.config as FieldConfig) || {},
          sectionTitle: section.title,
        });
      }
    }

    // Fetch visit notes
    const visitNotes = await prisma.visitNote.findMany({
      where: {
        companyId,
        clientId,
        templateId: config.templateId,
        OR: [
          {
            visitDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          {
            visitDate: null,
            submittedAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        ],
      },
      select: {
        id: true,
        data: true,
        visitDate: true,
        submittedAt: true,
      },
      orderBy: {
        visitDate: "asc",
      },
    });

    // Process each field's data
    const fieldsData: TrendFieldData[] = config.fieldIds
      .filter((fieldId) => fieldsMap.has(fieldId))
      .map((fieldId) => {
        const fieldInfo = fieldsMap.get(fieldId)!;
        const fieldConfig = fieldInfo.config;

        // Extract data points for this field
        const rawDataPoints: DataPoint[] = [];

        for (const note of visitNotes) {
          const noteData = note.data as Record<string, unknown>;
          const value = noteData[fieldId];

          let numericValue: number | null = null;

          if (typeof value === "number" && !isNaN(value)) {
            numericValue = value;
          } else if (
            typeof value === "string" &&
            value.trim() !== "" &&
            !isNaN(parseFloat(value))
          ) {
            numericValue = parseFloat(value);
          }

          if (numericValue !== null) {
            const effectiveDate = note.visitDate || note.submittedAt;
            rawDataPoints.push({
              date: new Date(effectiveDate),
              value: numericValue,
              visitNoteId: note.id,
            });
          }
        }

        // Aggregate by day
        const dataPoints = aggregateByDay(rawDataPoints, config.aggregation);

        // Calculate statistics
        const stats = calculateStats(dataPoints, fieldConfig.invertTrend || false);

        return {
          fieldName: fieldId,
          fieldLabel: fieldInfo.label,
          stats,
          dataPoints,
        };
      });

    if (fieldsData.length === 0) {
      return NextResponse.json(
        { error: "No data available for the selected fields and date range" },
        { status: 400 }
      );
    }

    // Generate PDF
    const clientName = `${client.firstName} ${client.lastName}`;
    const pdfBuffer = await generateTrendReportPDF({
      clientName,
      templateName: savedReport.name,
      companyName: savedReport.company.name,
      dateRange,
      fields: fieldsData,
      aggregationMethod: config.aggregation,
    });

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${clientName.replace(/\s+/g, "_")}_Trends_Report_Preview.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF preview:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF preview" },
      { status: 500 }
    );
  }
}
