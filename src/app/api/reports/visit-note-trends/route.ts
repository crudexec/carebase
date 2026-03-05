import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  invertTrend?: boolean; // If true, increasing values = improving
}

// GET /api/reports/visit-note-trends
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const clientId = searchParams.get("clientId");
    const templateId = searchParams.get("templateId");
    const fieldIds = searchParams.get("fieldIds")?.split(",").filter(Boolean) || [];
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const preset = searchParams.get("preset") as "7d" | "30d" | "90d" | "custom" | null;
    const aggregation = (searchParams.get("aggregation") || "latest") as "average" | "latest" | "first";

    // Validate required parameters
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }
    if (fieldIds.length === 0) {
      return NextResponse.json({ error: "fieldIds is required" }, { status: 400 });
    }

    // Calculate date range
    let dateRange: { start: Date; end: Date };
    try {
      if (preset && preset !== "custom") {
        dateRange = getDateRange(preset);
      } else if (startDate && endDate) {
        dateRange = getDateRange("custom", new Date(startDate), new Date(endDate));
      } else {
        dateRange = getDateRange("30d"); // Default to 30 days
      }
    } catch {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Verify client belongs to company and check sponsor access
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId,
        // Sponsors can only see their own clients
        ...(role === "SPONSOR" ? { sponsorId: userId } : {}),
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

    // Verify template belongs to company
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        companyId,
      },
      select: {
        id: true,
        name: true,
        sections: {
          include: {
            fields: {
              where: {
                id: { in: fieldIds },
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

    // Extract the requested fields from the template
    const fieldsMap = new Map<string, { label: string; config: FieldConfig; sectionTitle: string }>();
    for (const section of template.sections) {
      for (const field of section.fields) {
        fieldsMap.set(field.id, {
          label: field.label,
          config: (field.config as FieldConfig) || {},
          sectionTitle: section.title,
        });
      }
    }

    // Verify all requested fields exist
    const missingFields = fieldIds.filter((id) => !fieldsMap.has(id));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Fields not found: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch visit notes for the client within the date range
    // Use visitDate for filtering and ordering (the actual visit date, not when submitted)
    // Fall back to submittedAt for legacy records where visitDate is null
    const visitNotes = await prisma.visitNote.findMany({
      where: {
        companyId,
        clientId,
        templateId,
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
    const fieldsData = fieldIds.map((fieldId) => {
      const fieldInfo = fieldsMap.get(fieldId)!;
      const config = fieldInfo.config;

      // Extract data points for this field
      const rawDataPoints: DataPoint[] = [];

      for (const note of visitNotes) {
        const noteData = note.data as Record<string, unknown>;
        const value = noteData[fieldId];

        // Include numeric values (handle both numbers and numeric strings)
        let numericValue: number | null = null;

        if (typeof value === "number" && !isNaN(value)) {
          numericValue = value;
        } else if (typeof value === "string" && value.trim() !== "" && !isNaN(parseFloat(value))) {
          numericValue = parseFloat(value);
        }

        if (numericValue !== null) {
          // Use visitDate if available, otherwise fall back to submittedAt
          const effectiveDate = note.visitDate || note.submittedAt;
          rawDataPoints.push({
            date: new Date(effectiveDate),
            value: numericValue,
            visitNoteId: note.id,
          });
        }
      }

      // Aggregate by day if needed
      const dataPoints = aggregateByDay(rawDataPoints, aggregation);

      // Calculate statistics
      const stats = calculateStats(dataPoints, config.invertTrend || false);

      return {
        fieldId,
        label: fieldInfo.label,
        sectionTitle: fieldInfo.sectionTitle,
        config: {
          min: config.min,
          max: config.max,
          thresholdEnabled: config.thresholdEnabled ?? (config.min !== undefined || config.max !== undefined),
        },
        dataPoints: dataPoints.map((p) => ({
          date: p.date.toISOString().split("T")[0], // YYYY-MM-DD
          value: p.value,
          visitNoteId: p.visitNoteId,
        })),
        stats,
      };
    });

    return NextResponse.json({
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
      },
      template: {
        id: template.id,
        name: template.name,
      },
      fields: fieldsData,
      dateRange: {
        start: dateRange.start.toISOString().split("T")[0],
        end: dateRange.end.toISOString().split("T")[0],
      },
      aggregation,
      totalVisitNotes: visitNotes.length,
    });
  } catch (error) {
    console.error("Error fetching visit note trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit note trends" },
      { status: 500 }
    );
  }
}
