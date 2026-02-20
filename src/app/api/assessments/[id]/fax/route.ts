import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { sendFax } from "@/lib/sinch";
import jsPDF from "jspdf";

interface AssessmentItem {
  id: string;
  code: string;
  question: string;
  label?: string;
  description: string | null;
  responseType: string;
  responseOptions: unknown;
  options?: unknown;
  minValue: number | null;
  maxValue: number | null;
  isRequired: boolean;
  displayOrder: number;
}

interface AssessmentSection {
  id: string;
  title: string;
  name?: string;
  description: string | null;
  sectionType: string;
  displayOrder: number;
  items: AssessmentItem[];
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
  maxScore: number | null;
  sections: AssessmentSection[];
}

interface AssessmentResponse {
  itemId: string;
  valueNumber: number | null;
  valueText: string | null;
  notes: string | null;
}

// POST - Send assessment as fax
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { toNumber, recipientName } = body;

    if (!toNumber) {
      return NextResponse.json(
        { error: "Fax number is required" },
        { status: 400 }
      );
    }

    // Check permission
    const canSendFax = hasAnyPermission(session.user.role, [
      PERMISSIONS.ASSESSMENT_FULL,
      PERMISSIONS.FAX_SEND,
    ]);

    if (!canSendFax) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch assessment with all details
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        company: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            address: true,
            phone: true,
            physicianName: true,
            physicianNpi: true,
            physicianPhone: true,
            physicianFax: true,
          },
        },
        assessor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            maxScore: true,
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Only completed assessments can be faxed" },
        { status: 400 }
      );
    }

    // Extract included relations with proper typing
    const { company, client, assessor, template, responses } = assessment;

    // Format fax number to E.164
    const formattedFaxNumber = formatToE164(toNumber);
    if (!formattedFaxNumber) {
      return NextResponse.json(
        { error: "Invalid fax number format" },
        { status: 400 }
      );
    }

    // Generate PDF - map database responses to our interface
    const mappedResponses: AssessmentResponse[] = responses.map((r) => ({
      itemId: r.itemId,
      valueNumber: r.valueNumber ? Number(r.valueNumber) : null,
      valueText: r.valueText,
      notes: r.notes,
    }));

    const pdfBuffer = await generateAssessmentPDF({
      company,
      client,
      assessor,
      template: template as AssessmentTemplate,
      responses: mappedResponses,
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
      totalScore: assessment.totalScore ? Number(assessment.totalScore) : null,
      notes: assessment.notes,
      assessmentType: assessment.assessmentType,
    });

    // Get the app URL for webhook callback
    const webhookBaseUrl =
      process.env.SINCH_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "";

    const isProductionUrl = webhookBaseUrl &&
      !webhookBaseUrl.includes("localhost") &&
      !webhookBaseUrl.includes("127.0.0.1");

    const callbackUrl = isProductionUrl
      ? `${webhookBaseUrl.replace(/\/$/, "")}/api/fax/webhook`
      : undefined;

    // Create fax record
    const faxRecord = await prisma.faxRecord.create({
      data: {
        direction: "OUTBOUND",
        toNumber: formattedFaxNumber,
        fromNumber: process.env.SINCH_FAX_NUMBER || "",
        status: "QUEUED",
        documentType: "ASSESSMENT",
        documentId: id,
        documentName: `Assessment - ${template.name} - ${client.firstName} ${client.lastName}`,
        recipientName: recipientName || client.physicianName || undefined,
        recipientType: "PHYSICIAN",
        companyId,
        sentById: userId,
        clientId: client.id,
      },
    });

    try {
      // Send fax via Sinch
      const clientName = `${client.firstName}-${client.lastName}`.replace(/\s+/g, "-");
      const assessmentDate = assessment.completedAt
        ? new Date(assessment.completedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const sinchResponse = await sendFax({
        to: formattedFaxNumber,
        file: pdfBuffer,
        fileName: `assessment-${clientName}-${assessmentDate}.pdf`,
        headerText: `Assessment - ${template.name} - ${client.firstName} ${client.lastName}`,
        ...(callbackUrl && { callbackUrl }),
      });

      // Update fax record with Sinch fax ID
      const updatedFaxRecord = await prisma.faxRecord.update({
        where: { id: faxRecord.id },
        data: {
          sinchFaxId: sinchResponse.id,
          status: sinchResponse.status === "QUEUED" ? "QUEUED" : "IN_PROGRESS",
          numberOfPages: sinchResponse.numberOfPages,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          companyId,
          userId,
          action: "ASSESSMENT_FAXED",
          entityType: "Assessment",
          entityId: id,
          changes: {
            faxRecordId: faxRecord.id,
            toNumber: formattedFaxNumber,
            recipientName: recipientName || client.physicianName,
            sinchFaxId: sinchResponse.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        faxRecord: updatedFaxRecord,
        message: "Fax queued successfully",
      });
    } catch (sinchError) {
      // Update fax record with error
      await prisma.faxRecord.update({
        where: { id: faxRecord.id },
        data: {
          status: "FAILED",
          errorMessage: sinchError instanceof Error ? sinchError.message : "Unknown error",
        },
      });

      throw sinchError;
    }
  } catch (error) {
    console.error("Error sending assessment fax:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send fax" },
      { status: 500 }
    );
  }
}

// Helper function to format phone number to E.164
function formatToE164(phone: string): string | null {
  // Remove all non-digit characters except leading +
  let digits = phone.replace(/[^\d+]/g, "");

  // If starts with +, keep it
  if (digits.startsWith("+")) {
    digits = digits.substring(1);
  }

  // If already starts with 1 and has 11 digits, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // If 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If already in correct format (11+ digits)
  if (digits.length >= 11) {
    return `+${digits}`;
  }

  return null;
}

// Helper function to generate PDF
async function generateAssessmentPDF(assessment: {
  company: { name: string; address: string | null; phone: string | null };
  client: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    address: string | null;
    phone: string | null;
    physicianName: string | null;
    physicianNpi: string | null;
    physicianPhone: string | null;
    physicianFax: string | null;
  };
  assessor: { firstName: string; lastName: string };
  template: AssessmentTemplate;
  responses: AssessmentResponse[];
  startedAt: Date;
  completedAt: Date | null;
  totalScore: number | null;
  notes: string | null;
  assessmentType: string;
}): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  // Helper functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 30) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // Header - Company Info
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(assessment.company.name, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (assessment.company.address) {
    doc.text(assessment.company.address, margin, y);
    y += 4;
  }
  if (assessment.company.phone) {
    doc.text(assessment.company.phone, margin, y);
    y += 4;
  }

  // Title
  y += 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT", pageWidth - margin, 25, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(assessment.template.name, pageWidth - margin, 32, { align: "right" });

  // Client Information Box
  y = 55;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT INFORMATION", margin + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${assessment.client.firstName} ${assessment.client.lastName}`, margin + 5, y);
  y += 5;
  if (assessment.client.dateOfBirth) {
    doc.text(`DOB: ${formatDate(assessment.client.dateOfBirth)}`, margin + 5, y);
    y += 5;
  }
  if (assessment.client.address) {
    doc.text(`Address: ${assessment.client.address}`, margin + 5, y);
    y += 5;
  }
  if (assessment.client.phone) {
    doc.text(`Phone: ${assessment.client.phone}`, margin + 5, y);
  }

  // Physician info on right side
  if (assessment.client.physicianName) {
    let physicianY = 61;
    doc.setFont("helvetica", "bold");
    doc.text("PHYSICIAN", pageWidth - margin - 60, physicianY);
    physicianY += 6;
    doc.setFont("helvetica", "normal");
    doc.text(assessment.client.physicianName, pageWidth - margin - 60, physicianY);
    physicianY += 5;
    if (assessment.client.physicianNpi) {
      doc.text(`NPI: ${assessment.client.physicianNpi}`, pageWidth - margin - 60, physicianY);
      physicianY += 5;
    }
    if (assessment.client.physicianPhone) {
      doc.text(`Ph: ${assessment.client.physicianPhone}`, pageWidth - margin - 60, physicianY);
    }
  }

  // Assessment Details
  y = 100;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT DETAILS", margin + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Type: ${assessment.assessmentType.replace("_", " ")}`, margin + 5, y);
  doc.text(`Started: ${formatDateTime(assessment.startedAt)}`, margin + 80, y);
  y += 5;
  doc.text(`Assessor: ${assessment.assessor.firstName} ${assessment.assessor.lastName}`, margin + 5, y);
  if (assessment.completedAt) {
    doc.text(`Completed: ${formatDateTime(assessment.completedAt)}`, margin + 80, y);
  }

  // Score Summary (if applicable)
  if (assessment.totalScore !== null) {
    y += 15;
    doc.setFillColor(230, 240, 250);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 15, "F");

    doc.setFont("helvetica", "bold");
    doc.text("SCORE SUMMARY", margin + 5, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    let scoreText = `Total Score: ${assessment.totalScore}`;
    if (assessment.template.maxScore) {
      scoreText += ` / ${assessment.template.maxScore}`;
      const percentage = Math.round((assessment.totalScore / assessment.template.maxScore) * 100);
      scoreText += ` (${percentage}%)`;
    }
    doc.text(scoreText, margin + 5, y);
    y += 10;
  } else {
    y += 15;
  }

  // Create a map of responses by itemId
  const responseMap = new Map<string, AssessmentResponse>();
  for (const response of assessment.responses) {
    responseMap.set(response.itemId, response);
  }

  // Form Sections
  for (const section of assessment.template.sections) {
    checkPageBreak(25);

    // Section Header
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.title || section.name || "Section", margin + 3, y);
    y += 10;

    if (section.description) {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const descLines = doc.splitTextToSize(section.description, pageWidth - 2 * margin - 10);
      doc.text(descLines, margin + 3, y);
      y += descLines.length * 4 + 2;
    }

    // Items/Questions
    for (const item of section.items) {
      const response = responseMap.get(item.id);

      checkPageBreak(15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const questionText = item.question || item.label || item.code;
      doc.text(`${questionText}${item.isRequired ? " *" : ""}`, margin + 3, y);
      y += 4;

      doc.setFont("helvetica", "normal");

      // Format value based on response
      let displayValue = "";

      if (!response || (response.valueNumber === null && response.valueText === null)) {
        displayValue = "No response";
        doc.setTextColor(128, 128, 128);
      } else {
        doc.setTextColor(0, 0, 0);

        if (response.valueNumber !== null) {
          displayValue = String(response.valueNumber);
          // If there are response options, try to find the label
          const options = item.responseOptions || item.options;
          if (options && Array.isArray(options)) {
            const option = options.find((opt: { value: number; label?: string }) =>
              opt.value === response.valueNumber
            );
            if (option && option.label) {
              displayValue = `${option.label} (${response.valueNumber})`;
            }
          }
        } else if (response.valueText !== null) {
          displayValue = response.valueText;
        }

        // Add notes if present
        if (response.notes) {
          displayValue += ` [Note: ${response.notes}]`;
        }
      }

      // Wrap long text
      const valueLines = doc.splitTextToSize(displayValue, pageWidth - 2 * margin - 10);
      doc.text(valueLines, margin + 3, y);
      doc.setTextColor(0, 0, 0);
      y += valueLines.length * 4 + 4;
    }

    y += 5;
  }

  // Notes
  if (assessment.notes) {
    checkPageBreak(25);
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Additional Notes:", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(assessment.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, y);
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${formatDateTime(new Date())} | ${assessment.template.name}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
