import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import jsPDF from "jspdf";
import {
  parseAssessmentTemplateSnapshot,
  snapshotToRenderedTemplate,
} from "@/lib/assessments/snapshots";

// GET - Export assessment as PDF download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { id } = await params;

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
        template: {
          include: {
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
        responses: {
          include: {
            item: true,
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
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const snapshot = parseAssessmentTemplateSnapshot(
      assessment.formSchemaSnapshot as Prisma.JsonValue | null
    );
    const template = snapshot ? snapshotToRenderedTemplate(snapshot) : {
      id: assessment.template.id,
      name: assessment.template.name,
      description: assessment.template.description,
      version: assessment.template.version,
      maxScore: assessment.template.maxScore ? Number(assessment.template.maxScore) : null,
      sections: assessment.template.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        sectionType: section.sectionType,
        displayOrder: section.displayOrder,
        items: section.items.map((item) => ({
          id: item.id,
          code: item.code,
          question: item.question,
          description: item.description,
          responseType: item.responseType,
          responseOptions: item.responseOptions,
          minValue: item.minValue,
          maxValue: item.maxValue,
          isRequired: item.isRequired,
          displayOrder: item.displayOrder,
        })),
      })),
    };

    // Calculate percentage score if total score and max score exist
    const totalScore = assessment.totalScore ? Number(assessment.totalScore) : null;
    const maxScore = template.maxScore ?? null;
    const percentageScore = totalScore !== null && maxScore !== null && maxScore > 0
      ? (totalScore / maxScore) * 100
      : null;

    // Generate PDF - map the assessment data to the expected format
    const pdfBuffer = await generateAssessmentPDF({
      id: assessment.id,
      assessmentType: assessment.assessmentType,
      status: assessment.status,
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
      totalScore,
      percentageScore,
      careLevel: assessment.careLevel,
      notes: assessment.notes,
      company: assessment.company,
      template: {
        name: template.name,
        description: template.description,
        maxScore,
        sections: template.sections.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          sectionType: section.sectionType,
          items: section.items.map(item => ({
            id: item.id,
            code: item.code,
            question: item.question,
            description: item.description,
            responseType: item.responseType,
            responseOptions: item.responseOptions,
            minValue: item.minValue ? Number(item.minValue) : null,
            maxValue: item.maxValue ? Number(item.maxValue) : null,
            isRequired: item.isRequired,
          })),
        })),
      },
      responses: assessment.responses.map(r => ({
        itemId: r.itemId,
        valueNumber: r.valueNumber,
        valueText: r.valueText,
        notes: r.notes,
        item: {
          code: r.item.code,
          question: r.item.question,
        },
      })),
      client: assessment.client,
      assessor: assessment.assessor,
    });

    // Return PDF as download
    const clientName = `${assessment.client.firstName} ${assessment.client.lastName}`.replace(/\s+/g, "-");
    const filename = `Assessment-${template.name.replace(/\s+/g, "-")}-${clientName}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting assessment PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export PDF" },
      { status: 500 }
    );
  }
}

// Helper function to generate PDF
async function generateAssessmentPDF(assessment: {
  id: string;
  assessmentType: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  totalScore: number | null;
  percentageScore: number | null;
  careLevel: string | null;
  notes: string | null;
  company: { name: string; address: string | null; phone: string | null };
  template: {
    name: string;
    description: string | null;
    maxScore: number | null;
    sections: Array<{
      id: string;
      title: string;
      description: string | null;
      sectionType: string;
      items: Array<{
        id: string;
        code: string;
        question: string;
        description: string | null;
        responseType: string;
        responseOptions: unknown;
        minValue: number | null;
        maxValue: number | null;
        isRequired: boolean;
      }>;
    }>;
  };
  responses: Array<{
    itemId: string;
    valueNumber: unknown;
    valueText: string | null;
    notes: string | null;
    item: {
      code: string;
      question: string;
    };
  }>;
  client: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    address: string | null;
    phone: string | null;
    physicianName: string | null;
    physicianFax: string | null;
  };
  assessor: {
    firstName: string;
    lastName: string;
  };
}): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  // Helper functions
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
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

  // Create a response lookup map
  const responseMap = new Map<string, { valueNumber: unknown; valueText: string | null; notes: string | null }>();
  for (const response of assessment.responses) {
    responseMap.set(response.itemId, {
      valueNumber: response.valueNumber,
      valueText: response.valueText,
      notes: response.notes,
    });
  }

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
  y = 50;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 30, "F");

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
  if (assessment.client.phone) {
    doc.text(`Phone: ${assessment.client.phone}`, margin + 5, y);
    y += 5;
  }

  // Physician info on right side
  if (assessment.client.physicianName) {
    let physicianY = 56;
    doc.setFont("helvetica", "bold");
    doc.text("PHYSICIAN", pageWidth - margin - 60, physicianY);
    physicianY += 6;
    doc.setFont("helvetica", "normal");
    doc.text(assessment.client.physicianName, pageWidth - margin - 60, physicianY);
    physicianY += 5;
    if (assessment.client.physicianFax) {
      doc.text(`Fax: ${assessment.client.physicianFax}`, pageWidth - margin - 60, physicianY);
    }
  }

  // Assessment Details
  y = 90;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 25, "F");

  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT DETAILS", margin + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Type: ${assessment.assessmentType.replace(/_/g, " ")}`, margin + 5, y);
  doc.text(`Status: ${assessment.status.replace(/_/g, " ")}`, margin + 70, y);
  y += 5;

  doc.text(`Started: ${formatDateTime(assessment.startedAt)}`, margin + 5, y);
  if (assessment.completedAt) {
    doc.text(`Completed: ${formatDateTime(assessment.completedAt)}`, margin + 70, y);
  }
  y += 5;

  doc.text(`Assessor: ${assessment.assessor.firstName} ${assessment.assessor.lastName}`, margin + 5, y);

  // Score (if available)
  if (assessment.totalScore !== null || assessment.percentageScore !== null) {
    y += 10;
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 12, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SCORE", margin + 3, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const scoreText: string[] = [];
    if (assessment.totalScore !== null) {
      scoreText.push(`Total: ${assessment.totalScore}${assessment.template.maxScore ? ` / ${assessment.template.maxScore}` : ""}`);
    }
    if (assessment.percentageScore !== null) {
      scoreText.push(`Percentage: ${assessment.percentageScore.toFixed(1)}%`);
    }
    if (assessment.careLevel) {
      scoreText.push(`Care Level: ${assessment.careLevel}`);
    }
    doc.text(scoreText.join("  |  "), margin + 3, y);
    y += 8;
  }

  y += 10;

  // Assessment Sections and Questions
  for (const section of assessment.template.sections) {
    checkPageBreak(30);

    // Section Header
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin + 3, y);
    y += 10;

    if (section.description) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const descLines = doc.splitTextToSize(section.description, pageWidth - 2 * margin - 5);
      doc.text(descLines, margin + 3, y);
      y += descLines.length * 4 + 3;
    }

    // Questions in this section
    for (const item of section.items) {
      checkPageBreak(20);

      const response = responseMap.get(item.id);
      const hasResponse = response && (response.valueNumber !== null || response.valueText !== null);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      // Question text
      const questionText = item.question || item.code;
      const questionLines = doc.splitTextToSize(`${item.code}: ${questionText}`, pageWidth - 2 * margin - 5);
      doc.text(questionLines, margin + 3, y);
      y += questionLines.length * 4;

      // Response value
      doc.setFont("helvetica", "normal");
      if (hasResponse) {
        let responseText = "";
        if (response.valueNumber !== null) {
          const numVal = typeof response.valueNumber === "object" && response.valueNumber !== null
            ? parseFloat(String(response.valueNumber))
            : response.valueNumber;
          responseText = `Answer: ${numVal}`;
        } else if (response.valueText) {
          // Check if it's a JSON array (multi-select)
          try {
            const parsed = JSON.parse(response.valueText);
            if (Array.isArray(parsed)) {
              responseText = `Answer: ${parsed.join(", ")}`;
            } else {
              responseText = `Answer: ${response.valueText}`;
            }
          } catch {
            responseText = `Answer: ${response.valueText}`;
          }
        }

        doc.setTextColor(0, 100, 0);
        const responseLines = doc.splitTextToSize(responseText, pageWidth - 2 * margin - 10);
        doc.text(responseLines, margin + 8, y);
        y += responseLines.length * 4;
        doc.setTextColor(0, 0, 0);

        // Notes if present
        if (response.notes) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          const notesLines = doc.splitTextToSize(`Notes: ${response.notes}`, pageWidth - 2 * margin - 10);
          doc.text(notesLines, margin + 8, y);
          y += notesLines.length * 4;
          doc.setTextColor(0, 0, 0);
        }
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text("Answer: Not answered", margin + 8, y);
        y += 4;
        doc.setTextColor(0, 0, 0);
      }

      y += 3;
    }

    y += 5;
  }

  // Assessment Notes
  if (assessment.notes) {
    checkPageBreak(30);
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ASSESSMENT NOTES", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(assessment.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 4;
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | ${assessment.template.name}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
