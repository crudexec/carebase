import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const exportSchema = z.object({
  format: z.enum(["FLAT_FILE", "XML", "JSON", "PDF"]).default("FLAT_FILE"),
});

// POST /api/oasis/assessments/[id]/export - Export OASIS assessment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only admins and clinical directors can export
    if (!["ADMIN", "CLINICAL_DIRECTOR", "OPS_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { format } = validation.data;

    // Verify assessment exists and is approved
    const assessment = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: true,
        client: true,
        assessor: true,
        responses: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only allow export of QA-approved assessments
    if (assessment.status !== "QA_APPROVED" && assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Only QA-approved assessments can be exported" },
        { status: 400 }
      );
    }

    // Generate export based on format
    let exportData: string;
    let contentType: string;
    let filename: string;

    const baseFilename = `OASIS_${assessment.client.lastName}_${assessment.timePoint}_${new Date().toISOString().split("T")[0]}`;

    switch (format) {
      case "FLAT_FILE":
        exportData = generateFlatFile(assessment);
        contentType = "text/plain";
        filename = `${baseFilename}.txt`;
        break;

      case "XML":
        exportData = generateXML(assessment);
        contentType = "application/xml";
        filename = `${baseFilename}.xml`;
        break;

      case "JSON":
        exportData = generateJSON(assessment);
        contentType = "application/json";
        filename = `${baseFilename}.json`;
        break;

      case "PDF":
        // For PDF, we would generate a PDF report
        // This is a placeholder - actual PDF generation would use a library like puppeteer or pdfkit
        return NextResponse.json(
          { error: "PDF export not yet implemented" },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: "Invalid export format" },
          { status: 400 }
        );
    }

    // Update assessment status to exported
    await prisma.oasisAssessment.update({
      where: { id },
      data: {
        status: "EXPORTED",
        exportedAt: new Date(),
        exportFormat: format,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_EXPORTED",
        entityType: "OasisAssessment",
        entityId: id,
        changes: {
          format,
          clientName: `${assessment.client.firstName} ${assessment.client.lastName}`,
          timePoint: assessment.timePoint,
        },
      },
    });

    // Return the export data
    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting OASIS assessment:", error);
    return NextResponse.json(
      { error: "Failed to export assessment" },
      { status: 500 }
    );
  }
}

// Types for the assessment response
interface ExportResponse {
  itemCode: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueDate: Date | null;
  valueJson: unknown;
}

interface ExportAssessment {
  id: string;
  timePoint: string;
  m0090AssessmentDate: Date | null;
  template: { version: string };
  client: {
    firstName: string;
    lastName: string;
    medicaidId: string | null;
    dateOfBirth: Date | null;
  };
  responses: ExportResponse[];
}

// Generate CMS-compliant flat file format
function generateFlatFile(assessment: ExportAssessment): string {
  const lines: string[] = [];

  // Header line
  lines.push(`OASIS-${assessment.template.version}`);
  const assessmentDate = assessment.m0090AssessmentDate || new Date();
  lines.push(`ASSESSMENT_DATE=${formatDate(assessmentDate)}`);
  lines.push(`TIME_POINT=${assessment.timePoint}`);
  lines.push("");

  // Client info
  lines.push(`M0040=${assessment.client.lastName}`);
  lines.push(`M0040_FIRST=${assessment.client.firstName}`);
  if (assessment.client.medicaidId) {
    lines.push(`M0065=${assessment.client.medicaidId}`);
  }
  if (assessment.client.dateOfBirth) {
    lines.push(`M0066=${formatDate(assessment.client.dateOfBirth)}`);
  }
  lines.push("");

  // Responses
  for (const response of assessment.responses) {
    const value = getResponseValue(response);
    if (value !== null) {
      lines.push(`${response.itemCode}=${value}`);
    }
  }

  return lines.join("\n");
}

// Generate XML format
function generateXML(assessment: ExportAssessment): string {
  const items = assessment.responses
    .map((r) => {
      const value = getResponseValue(r);
      return value !== null
        ? `    <item code="${r.itemCode}">${escapeXml(String(value))}</item>`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  const assessmentDate = assessment.m0090AssessmentDate || new Date();

  return `<?xml version="1.0" encoding="UTF-8"?>
<oasis version="${assessment.template.version}">
  <assessment id="${assessment.id}" timePoint="${assessment.timePoint}">
    <assessmentDate>${formatDate(assessmentDate)}</assessmentDate>
    <patient>
      <firstName>${escapeXml(assessment.client.firstName)}</firstName>
      <lastName>${escapeXml(assessment.client.lastName)}</lastName>
      ${assessment.client.medicaidId ? `<medicaidNumber>${assessment.client.medicaidId}</medicaidNumber>` : ""}
    </patient>
    <items>
${items}
    </items>
  </assessment>
</oasis>`;
}

// Generate JSON format
function generateJSON(assessment: ExportAssessment): string {
  const items: Record<string, unknown> = {};
  for (const response of assessment.responses) {
    const value = getResponseValue(response);
    if (value !== null) {
      items[response.itemCode] = value;
    }
  }

  const assessmentDate = assessment.m0090AssessmentDate || new Date();

  return JSON.stringify(
    {
      oasisVersion: assessment.template.version,
      assessmentId: assessment.id,
      timePoint: assessment.timePoint,
      assessmentDate: formatDate(assessmentDate),
      patient: {
        firstName: assessment.client.firstName,
        lastName: assessment.client.lastName,
        medicaidNumber: assessment.client.medicaidId,
      },
      items,
    },
    null,
    2
  );
}

// Helper functions
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

function getResponseValue(response: ExportResponse): string | number | null {
  if (response.valueText !== null) return response.valueText;
  if (response.valueNumber !== null) return response.valueNumber;
  if (response.valueBoolean !== null) return response.valueBoolean ? "1" : "0";
  if (response.valueDate !== null) return formatDate(response.valueDate);
  if (response.valueJson !== null) {
    // For JSON values, try to extract a simple value
    if (typeof response.valueJson === "object" && response.valueJson !== null) {
      const obj = response.valueJson as Record<string, unknown>;
      if ("value" in obj) return String(obj.value);
      if ("code" in obj) return String(obj.code);
    }
    return JSON.stringify(response.valueJson);
  }
  return null;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
