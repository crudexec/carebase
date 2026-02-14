import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";
import { FormFieldType } from "@prisma/client";

interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: unknown;
}

interface FormSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: FormField[];
}

interface FormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections: FormSection[];
}

// GET - Generate PDF for visit note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { id } = await params;

    // Check permission
    const canView = hasAnyPermission(role, [
      PERMISSIONS.VISIT_NOTE_VIEW,
      PERMISSIONS.VISIT_NOTE_MANAGE,
    ]);

    // Carers can view their own notes
    const isCarer = role === "CARER";

    if (!canView && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch visit note with all details
    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id,
        companyId,
        ...(isCarer && !canView ? { carerId: userId } : {}),
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
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        shift: {
          select: {
            scheduledStart: true,
            scheduledEnd: true,
            actualStart: true,
            actualEnd: true,
          },
        },
        files: true,
      },
    });

    if (!visitNote) {
      return NextResponse.json({ error: "Visit note not found" }, { status: 404 });
    }

    // Parse form schema snapshot
    const schema = visitNote.formSchemaSnapshot as unknown as FormSchemaSnapshot;
    const data = visitNote.data as Record<string, unknown>;

    // Generate PDF
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

    const formatTime = (date: Date | string) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatDateTime = (date: Date | string) => {
      return `${formatDate(date)} at ${formatTime(date)}`;
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
    doc.text(visitNote.company.name, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (visitNote.company.address) {
      doc.text(visitNote.company.address, margin, y);
      y += 4;
    }
    if (visitNote.company.phone) {
      doc.text(visitNote.company.phone, margin, y);
      y += 4;
    }

    // Title
    y += 6;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("VISIT NOTE", pageWidth - margin, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(schema.templateName, pageWidth - margin, 32, { align: "right" });
    doc.text(`v${schema.version}`, pageWidth - margin, 38, { align: "right" });

    // Client Information Box
    y = 55;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT INFORMATION", margin + 5, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${visitNote.client.firstName} ${visitNote.client.lastName}`, margin + 5, y);
    y += 5;
    if (visitNote.client.dateOfBirth) {
      doc.text(`DOB: ${formatDate(visitNote.client.dateOfBirth)}`, margin + 5, y);
      y += 5;
    }
    if (visitNote.client.address) {
      doc.text(`Address: ${visitNote.client.address}`, margin + 5, y);
      y += 5;
    }
    if (visitNote.client.phone) {
      doc.text(`Phone: ${visitNote.client.phone}`, margin + 5, y);
    }

    // Physician info on right side
    if (visitNote.client.physicianName) {
      let physicianY = 61;
      doc.setFont("helvetica", "bold");
      doc.text("PHYSICIAN", pageWidth - margin - 60, physicianY);
      physicianY += 6;
      doc.setFont("helvetica", "normal");
      doc.text(visitNote.client.physicianName, pageWidth - margin - 60, physicianY);
      physicianY += 5;
      if (visitNote.client.physicianNpi) {
        doc.text(`NPI: ${visitNote.client.physicianNpi}`, pageWidth - margin - 60, physicianY);
        physicianY += 5;
      }
      if (visitNote.client.physicianPhone) {
        doc.text(`Ph: ${visitNote.client.physicianPhone}`, pageWidth - margin - 60, physicianY);
        physicianY += 5;
      }
      if (visitNote.client.physicianFax) {
        doc.text(`Fax: ${visitNote.client.physicianFax}`, pageWidth - margin - 60, physicianY);
      }
    }

    // Visit Details
    y = 100;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.text("VISIT DETAILS", margin + 5, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    const shiftDate = formatDate(visitNote.shift.scheduledStart);
    const shiftTime = `${formatTime(visitNote.shift.scheduledStart)} - ${formatTime(visitNote.shift.scheduledEnd)}`;
    doc.text(`Date: ${shiftDate}`, margin + 5, y);
    doc.text(`Time: ${shiftTime}`, margin + 80, y);
    y += 5;
    doc.text(`Carer: ${visitNote.carer.firstName} ${visitNote.carer.lastName}`, margin + 5, y);
    doc.text(`Submitted: ${formatDateTime(visitNote.submittedAt)}`, margin + 80, y);

    // Form Sections
    y += 15;

    for (const section of schema.sections.sort((a, b) => a.order - b.order)) {
      checkPageBreak(25);

      // Section Header
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin + 3, y);
      y += 10;

      if (section.description) {
        checkPageBreak(10);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const descLines = doc.splitTextToSize(section.description, pageWidth - 2 * margin - 10);
        doc.text(descLines, margin + 3, y);
        y += descLines.length * 4 + 2;
      }

      // Fields
      for (const field of section.fields.sort((a, b) => a.order - b.order)) {
        const value = data[field.id];

        checkPageBreak(15);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}${field.required ? " *" : ""}`, margin + 3, y);
        y += 4;

        doc.setFont("helvetica", "normal");

        // Format value based on field type
        let displayValue = "";

        if (value === null || value === undefined || value === "") {
          displayValue = "No response";
          doc.setTextColor(128, 128, 128);
        } else {
          doc.setTextColor(0, 0, 0);

          switch (field.type) {
            case "TEXT_SHORT":
            case "TEXT_LONG":
              displayValue = String(value);
              break;
            case "NUMBER":
              displayValue = String(value);
              break;
            case "YES_NO":
              displayValue = value ? "Yes" : "No";
              break;
            case "SINGLE_CHOICE":
              displayValue = String(value);
              break;
            case "MULTIPLE_CHOICE":
              displayValue = Array.isArray(value) ? value.join(", ") : String(value);
              break;
            case "DATE":
              displayValue = formatDate(String(value));
              break;
            case "TIME":
              displayValue = String(value);
              break;
            case "DATETIME":
              displayValue = formatDateTime(String(value));
              break;
            case "RATING_SCALE": {
              const config = field.config as { min?: number; max?: number } | null;
              displayValue = `${value} / ${config?.max || 5}`;
              break;
            }
            case "SIGNATURE":
            case "PHOTO":
              displayValue = "[Attachment - See original]";
              break;
            default:
              displayValue = JSON.stringify(value);
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

    // QA Status
    if (visitNote.qaStatus) {
      checkPageBreak(25);
      y += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("QA Status: ", margin, y);

      if (visitNote.qaStatus === "APPROVED") {
        doc.setTextColor(76, 175, 80);
        doc.text("APPROVED", margin + 25, y);
      } else if (visitNote.qaStatus === "REJECTED") {
        doc.setTextColor(244, 67, 54);
        doc.text("REJECTED", margin + 25, y);
      } else {
        doc.setTextColor(255, 152, 0);
        doc.text("PENDING REVIEW", margin + 25, y);
      }
      doc.setTextColor(0, 0, 0);

      if (visitNote.qaComment) {
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const commentLines = doc.splitTextToSize(`Comment: ${visitNote.qaComment}`, pageWidth - 2 * margin);
        doc.text(commentLines, margin, y);
        y += commentLines.length * 4;
      }
    }

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${formatDateTime(new Date())} | ${schema.templateName} v${schema.version}`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Create filename
    const clientName = `${visitNote.client.firstName}-${visitNote.client.lastName}`.replace(/\s+/g, "-");
    const noteDate = formatDate(visitNote.shift.scheduledStart).replace(/[,\s]+/g, "-");
    const filename = `visit-note-${clientName}-${noteDate}.pdf`;

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating visit note PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
