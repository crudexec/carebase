import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import {
  generateTrendReportPDF,
  TrendFieldData,
} from "@/lib/reports/trend-pdf-generator";
import {
  generateTrendReportEmailHtml,
  wrapInTrendReportEmailTemplate,
  TrendSummaryItem,
} from "@/lib/reports/trend-report-email-template";
import {
  calculateStats,
  aggregateByDay,
  getDateRange,
  DataPoint,
} from "@/lib/reports/trend-calculations";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "reports@carebasehealth.com";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "CareBase";

interface FieldConfig {
  min?: number;
  max?: number;
  thresholdEnabled?: boolean;
  invertTrend?: boolean;
}

interface SavedReportConfig {
  clientId: string;
  templateId: string;
  fieldIds: string[];
  timeRange: "7d" | "30d" | "90d" | "custom";
  aggregation: "latest" | "average" | "first";
  customStartDate?: string;
  customEndDate?: string;
}

interface BulkSendResult {
  clientId: string;
  clientName: string;
  status: "sent" | "skipped" | "failed";
  sentTo?: string;
  error?: string;
}

/**
 * POST /api/reports/bulk-send
 * Send a saved trend report to multiple clients' sponsors via email
 *
 * Body:
 * - savedReportId: string (required) - The saved report template to use
 * - clientIds: string[] (required) - List of client IDs to generate reports for
 * - startDate?: string (optional) - Override start date
 * - endDate?: string (optional) - Override end date
 * - skipWithoutSponsor?: boolean (optional, default: true) - Skip clients without sponsors
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const body = await request.json();

    const {
      savedReportId,
      clientIds,
      startDate: overrideStartDate,
      endDate: overrideEndDate,
      skipWithoutSponsor = true,
    } = body;

    if (!savedReportId) {
      return NextResponse.json(
        { error: "savedReportId is required" },
        { status: 400 }
      );
    }

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { error: "clientIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured. Set RESEND_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Get the saved report
    const savedReport = await prisma.savedReport.findFirst({
      where: {
        id: savedReportId,
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
        { error: "Only trend reports can be sent via email" },
        { status: 400 }
      );
    }

    const config = savedReport.config as unknown as SavedReportConfig;

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

    // Get all clients with their sponsors
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const results: BulkSendResult[] = [];
    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Process each client
    for (const clientId of clientIds) {
      const client = clientMap.get(clientId);

      if (!client) {
        results.push({
          clientId,
          clientName: "Unknown",
          status: "failed",
          error: "Client not found",
        });
        failedCount++;
        continue;
      }

      const clientName = `${client.firstName} ${client.lastName}`;

      // Check for sponsor email
      if (!client.sponsor?.email) {
        if (skipWithoutSponsor) {
          results.push({
            clientId,
            clientName,
            status: "skipped",
            error: client.sponsor
              ? "Sponsor has no email address"
              : "No sponsor assigned",
          });
          skippedCount++;
          continue;
        } else {
          results.push({
            clientId,
            clientName,
            status: "failed",
            error: client.sponsor
              ? "Sponsor has no email address"
              : "No sponsor assigned",
          });
          failedCount++;
          continue;
        }
      }

      const recipientEmail = client.sponsor.email;
      const sponsorName = `${client.sponsor.firstName} ${client.sponsor.lastName}`;

      try {
        // Fetch visit notes for this client
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

            const dataPoints = aggregateByDay(rawDataPoints, config.aggregation);
            const stats = calculateStats(dataPoints, fieldConfig.invertTrend || false);

            return {
              fieldName: fieldId,
              fieldLabel: fieldInfo.label,
              stats,
              dataPoints,
            };
          });

        if (fieldsData.length === 0 || fieldsData.every((f) => f.dataPoints.length === 0)) {
          results.push({
            clientId,
            clientName,
            status: "skipped",
            error: "No data available for the selected fields and date range",
          });
          skippedCount++;
          continue;
        }

        // Generate PDF
        const pdfBuffer = await generateTrendReportPDF({
          clientName,
          templateName: savedReport.name,
          companyName: savedReport.company.name,
          dateRange,
          fields: fieldsData,
          aggregationMethod: config.aggregation,
        });

        // Generate email HTML
        const summaryStats: TrendSummaryItem[] = fieldsData.map((field) => ({
          fieldLabel: field.fieldLabel,
          average: field.stats.average,
          trend: field.stats.trend,
        }));

        const formatDate = (date: Date) => {
          return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        };

        const emailHtml = generateTrendReportEmailHtml({
          sponsorName,
          clientName,
          templateName: savedReport.name,
          companyName: savedReport.company.name,
          dateRange: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
          summaryStats,
        });

        // Send email
        const { data, error } = await resend.emails.send({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
          to: recipientEmail,
          subject: `Trends Report: ${clientName} - ${savedReport.name}`,
          html: wrapInTrendReportEmailTemplate(emailHtml),
          attachments: [
            {
              filename: `${clientName.replace(/\s+/g, "_")}_Trends_Report.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        if (error) {
          console.error(`Error sending report for client ${clientId}:`, error);
          results.push({
            clientId,
            clientName,
            status: "failed",
            error: error.message,
          });
          failedCount++;
          continue;
        }

        results.push({
          clientId,
          clientName,
          status: "sent",
          sentTo: recipientEmail,
        });
        sentCount++;
      } catch (err) {
        console.error(`Error processing client ${clientId}:`, err);
        results.push({
          clientId,
          clientName,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        sent: sentCount,
        skipped: skippedCount,
        failed: failedCount,
        total: clientIds.length,
      },
    });
  } catch (error) {
    console.error("Error in bulk send:", error);
    return NextResponse.json(
      { error: "Failed to process bulk send" },
      { status: 500 }
    );
  }
}
