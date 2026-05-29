import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";
import { FormFieldType, Prisma } from "@prisma/client";

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

// Body map marker interface
interface BodyMapMarker {
  id: string;
  regionId: string;
  regionLabel: string;
  type: "pain" | "wound" | "bruise" | "rash" | "swelling" | "other";
  severity: "mild" | "moderate" | "severe";
  woundType?: string;
  size?: string;
  notes?: string;
}

// Approximate center coordinates for each body region (for PDF rendering)
// Coordinates are based on a 100x200 unit body outline
const REGION_POSITIONS: Record<string, { x: number; y: number; view: "front" | "back" }> = {
  // Front view regions
  "head": { x: 50, y: 12, view: "front" },
  "neck": { x: 50, y: 25, view: "front" },
  "left-shoulder": { x: 25, y: 32, view: "front" },
  "right-shoulder": { x: 75, y: 32, view: "front" },
  "left-chest": { x: 35, y: 40, view: "front" },
  "right-chest": { x: 65, y: 40, view: "front" },
  "left-upper-arm": { x: 18, y: 48, view: "front" },
  "right-upper-arm": { x: 82, y: 48, view: "front" },
  "left-elbow": { x: 15, y: 58, view: "front" },
  "right-elbow": { x: 85, y: 58, view: "front" },
  "left-forearm": { x: 12, y: 70, view: "front" },
  "right-forearm": { x: 88, y: 70, view: "front" },
  "left-hand": { x: 8, y: 85, view: "front" },
  "right-hand": { x: 92, y: 85, view: "front" },
  "upper-abs": { x: 50, y: 48, view: "front" },
  "middle-abs": { x: 50, y: 55, view: "front" },
  "lower-abs": { x: 50, y: 62, view: "front" },
  "left-oblique": { x: 38, y: 55, view: "front" },
  "right-oblique": { x: 62, y: 55, view: "front" },
  "left-hip": { x: 38, y: 70, view: "front" },
  "right-hip": { x: 62, y: 70, view: "front" },
  "left-thigh": { x: 38, y: 82, view: "front" },
  "right-thigh": { x: 62, y: 82, view: "front" },
  "left-knee": { x: 38, y: 92, view: "front" },
  "right-knee": { x: 62, y: 92, view: "front" },
  "left-shin": { x: 38, y: 105, view: "front" },
  "right-shin": { x: 62, y: 105, view: "front" },
  "left-ankle": { x: 38, y: 118, view: "front" },
  "right-ankle": { x: 62, y: 118, view: "front" },
  "left-foot": { x: 38, y: 125, view: "front" },
  "right-foot": { x: 62, y: 125, view: "front" },
  // Back view regions
  "back-head": { x: 50, y: 12, view: "back" },
  "back-neck": { x: 50, y: 25, view: "back" },
  "left-shoulder-back": { x: 25, y: 32, view: "back" },
  "right-shoulder-back": { x: 75, y: 32, view: "back" },
  "left-trap": { x: 38, y: 32, view: "back" },
  "right-trap": { x: 62, y: 32, view: "back" },
  "left-upper-back": { x: 38, y: 42, view: "back" },
  "right-upper-back": { x: 62, y: 42, view: "back" },
  "left-tricep": { x: 18, y: 48, view: "back" },
  "right-tricep": { x: 82, y: 48, view: "back" },
  "left-elbow-back": { x: 15, y: 58, view: "back" },
  "right-elbow-back": { x: 85, y: 58, view: "back" },
  "mid-back": { x: 50, y: 52, view: "back" },
  "lower-back": { x: 50, y: 62, view: "back" },
  "left-forearm-back": { x: 12, y: 70, view: "back" },
  "right-forearm-back": { x: 88, y: 70, view: "back" },
  "left-hand-back": { x: 8, y: 85, view: "back" },
  "right-hand-back": { x: 92, y: 85, view: "back" },
  "left-glute": { x: 38, y: 72, view: "back" },
  "right-glute": { x: 62, y: 72, view: "back" },
  "left-hamstring": { x: 38, y: 85, view: "back" },
  "right-hamstring": { x: 62, y: 85, view: "back" },
  "left-calf": { x: 38, y: 105, view: "back" },
  "right-calf": { x: 62, y: 105, view: "back" },
  "left-achilles": { x: 38, y: 118, view: "back" },
  "right-achilles": { x: 62, y: 118, view: "back" },
  "left-heel": { x: 38, y: 125, view: "back" },
  "right-heel": { x: 62, y: 125, view: "back" },
};

// Helper function to draw body map in PDF
function drawBodyMapInPdf(
  doc: jsPDF,
  markers: BodyMapMarker[],
  startX: number,
  startY: number,
  pageWidth: number
): number {
  const bodyWidth = 45; // Width of each body diagram
  const bodyHeight = 70; // Height of each body diagram
  const spacing = 15; // Space between front and back views

  // Calculate positions for front and back views side by side
  const frontX = startX + (pageWidth - startX * 2 - bodyWidth * 2 - spacing) / 2;
  const backX = frontX + bodyWidth + spacing;

  // Draw labels
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FRONT", frontX + bodyWidth / 2, startY, { align: "center" });
  doc.text("BACK", backX + bodyWidth / 2, startY, { align: "center" });

  const diagramY = startY + 5;

  // Draw simplified body outlines
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.5);

  // Front body silhouette
  drawBodySilhouette(doc, frontX, diagramY, bodyWidth, bodyHeight);

  // Back body silhouette
  drawBodySilhouette(doc, backX, diagramY, bodyWidth, bodyHeight);

  // Separate markers by view
  const frontMarkers: { marker: BodyMapMarker; index: number }[] = [];
  const backMarkers: { marker: BodyMapMarker; index: number }[] = [];

  markers.forEach((marker, index) => {
    const position = REGION_POSITIONS[marker.regionId];
    if (position) {
      if (position.view === "front") {
        frontMarkers.push({ marker, index: index + 1 });
      } else {
        backMarkers.push({ marker, index: index + 1 });
      }
    } else {
      // Default to front view if position unknown
      frontMarkers.push({ marker, index: index + 1 });
    }
  });

  // Draw markers on front view
  frontMarkers.forEach(({ marker, index }) => {
    const position = REGION_POSITIONS[marker.regionId] || { x: 50, y: 50 };
    const markerX = frontX + (position.x / 100) * bodyWidth;
    const markerY = diagramY + (position.y / 130) * bodyHeight;
    drawMarker(doc, markerX, markerY, index, marker.severity);
  });

  // Draw markers on back view
  backMarkers.forEach(({ marker, index }) => {
    const position = REGION_POSITIONS[marker.regionId] || { x: 50, y: 50 };
    const markerX = backX + (position.x / 100) * bodyWidth;
    const markerY = diagramY + (position.y / 130) * bodyHeight;
    drawMarker(doc, markerX, markerY, index, marker.severity);
  });

  // Return the Y position after the body diagrams
  return diagramY + bodyHeight + 8;
}

// Draw a simplified body silhouette with realistic proportions
function drawBodySilhouette(doc: jsPDF, x: number, y: number, width: number, height: number) {
  const scale = width / 100;
  const scaleY = height / 130;

  // Head - oval shape
  doc.ellipse(x + 50 * scale, y + 10 * scaleY, 7 * scale, 9 * scaleY);

  // Neck
  doc.line(x + 46 * scale, y + 18 * scaleY, x + 44 * scale, y + 26 * scaleY);
  doc.line(x + 54 * scale, y + 18 * scaleY, x + 56 * scale, y + 26 * scaleY);

  // Shoulders - slightly curved
  doc.line(x + 44 * scale, y + 26 * scaleY, x + 22 * scale, y + 32 * scaleY);
  doc.line(x + 56 * scale, y + 26 * scaleY, x + 78 * scale, y + 32 * scaleY);

  // Upper arms (shoulder to elbow)
  doc.line(x + 22 * scale, y + 32 * scaleY, x + 15 * scale, y + 52 * scaleY);
  doc.line(x + 78 * scale, y + 32 * scaleY, x + 85 * scale, y + 52 * scaleY);

  // Forearms (elbow to wrist)
  doc.line(x + 15 * scale, y + 52 * scaleY, x + 12 * scale, y + 70 * scaleY);
  doc.line(x + 85 * scale, y + 52 * scaleY, x + 88 * scale, y + 70 * scaleY);

  // Hands (small ovals)
  doc.ellipse(x + 11 * scale, y + 74 * scaleY, 3 * scale, 5 * scaleY);
  doc.ellipse(x + 89 * scale, y + 74 * scaleY, 3 * scale, 5 * scaleY);

  // Torso - left side (shoulder to waist to hip)
  doc.line(x + 22 * scale, y + 32 * scaleY, x + 28 * scale, y + 55 * scaleY); // chest
  doc.line(x + 28 * scale, y + 55 * scaleY, x + 30 * scale, y + 68 * scaleY); // waist
  doc.line(x + 30 * scale, y + 68 * scaleY, x + 35 * scale, y + 75 * scaleY); // hip

  // Torso - right side
  doc.line(x + 78 * scale, y + 32 * scaleY, x + 72 * scale, y + 55 * scaleY); // chest
  doc.line(x + 72 * scale, y + 55 * scaleY, x + 70 * scale, y + 68 * scaleY); // waist
  doc.line(x + 70 * scale, y + 68 * scaleY, x + 65 * scale, y + 75 * scaleY); // hip

  // Crotch area
  doc.line(x + 35 * scale, y + 75 * scaleY, x + 50 * scale, y + 80 * scaleY);
  doc.line(x + 65 * scale, y + 75 * scaleY, x + 50 * scale, y + 80 * scaleY);

  // Left leg - outer
  doc.line(x + 35 * scale, y + 75 * scaleY, x + 32 * scale, y + 100 * scaleY); // thigh
  doc.line(x + 32 * scale, y + 100 * scaleY, x + 34 * scale, y + 120 * scaleY); // calf

  // Left leg - inner
  doc.line(x + 50 * scale, y + 80 * scaleY, x + 44 * scale, y + 100 * scaleY); // inner thigh
  doc.line(x + 44 * scale, y + 100 * scaleY, x + 42 * scale, y + 120 * scaleY); // inner calf

  // Right leg - outer
  doc.line(x + 65 * scale, y + 75 * scaleY, x + 68 * scale, y + 100 * scaleY); // thigh
  doc.line(x + 68 * scale, y + 100 * scaleY, x + 66 * scale, y + 120 * scaleY); // calf

  // Right leg - inner
  doc.line(x + 50 * scale, y + 80 * scaleY, x + 56 * scale, y + 100 * scaleY); // inner thigh
  doc.line(x + 56 * scale, y + 100 * scaleY, x + 58 * scale, y + 120 * scaleY); // inner calf

  // Feet
  doc.ellipse(x + 38 * scale, y + 123 * scaleY, 5 * scale, 3 * scaleY);
  doc.ellipse(x + 62 * scale, y + 123 * scaleY, 5 * scale, 3 * scaleY);
}

// Draw a numbered marker
function drawMarker(doc: jsPDF, x: number, y: number, number: number, severity: string) {
  const radius = 3;

  // Set color based on severity
  switch (severity) {
    case "severe":
      doc.setFillColor(220, 53, 69); // Red
      break;
    case "moderate":
      doc.setFillColor(255, 152, 0); // Orange
      break;
    default:
      doc.setFillColor(255, 193, 7); // Yellow
  }

  doc.circle(x, y, radius, "F");
  doc.setDrawColor(0, 0, 0);
  doc.circle(x, y, radius, "S");

  // Draw number in center
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(String(number), x, y + 1.5, { align: "center" });
}

// Draw marker legend/table
function drawMarkerLegend(
  doc: jsPDF,
  markers: BodyMapMarker[],
  startX: number,
  startY: number,
  pageWidth: number,
  checkPageBreak: (space: number) => boolean
): number {
  let y = startY;
  const margin = startX;

  if (markers.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("No markers recorded", margin, y);
    return y + 10;
  }

  // Legend header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);

  const colWidths = [12, 45, 25, 25, pageWidth - 2 * margin - 107];
  const colX = [margin, margin + 12, margin + 57, margin + 82, margin + 107];

  doc.text("#", colX[0], y);
  doc.text("Location", colX[1], y);
  doc.text("Type", colX[2], y);
  doc.text("Severity", colX[3], y);
  doc.text("Notes", colX[4], y);

  y += 4;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Marker rows
  doc.setFont("helvetica", "normal");

  markers.forEach((marker, index) => {
    if (checkPageBreak(15)) {
      y = 25;
    }

    const typeLabel = marker.type.charAt(0).toUpperCase() + marker.type.slice(1);
    const severityLabel = marker.severity.charAt(0).toUpperCase() + marker.severity.slice(1);
    const notes = marker.notes || (marker.woundType ? `${marker.woundType}${marker.size ? `, ${marker.size}` : ""}` : "-");

    // Set severity color for the marker number
    switch (marker.severity) {
      case "severe":
        doc.setTextColor(220, 53, 69);
        break;
      case "moderate":
        doc.setTextColor(255, 152, 0);
        break;
      default:
        doc.setTextColor(200, 150, 0);
    }
    doc.setFont("helvetica", "bold");
    doc.text(String(index + 1), colX[0], y);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(marker.regionLabel || marker.regionId, colX[1], y);
    doc.text(typeLabel, colX[2], y);
    doc.text(severityLabel, colX[3], y);

    // Wrap notes if too long
    const maxNotesWidth = colWidths[4];
    const notesLines = doc.splitTextToSize(notes, maxNotesWidth);
    doc.text(notesLines[0], colX[4], y);

    y += 5;

    // Additional lines for notes if needed
    if (notesLines.length > 1) {
      for (let i = 1; i < Math.min(notesLines.length, 3); i++) {
        if (checkPageBreak(5)) {
          y = 25;
        }
        doc.text(notesLines[i], colX[4], y);
        y += 4;
      }
    }
  });

  return y + 5;
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
    const isSponsor = role === "SPONSOR";

    if (!canView && !isCarer && !isSponsor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build where clause based on role
    const whereClause: Prisma.VisitNoteWhereInput = {
      id,
      companyId,
    };

    if (isCarer && !canView) {
      whereClause.carerId = userId;
    }

    // Sponsors can only view PDFs for their clients' approved notes
    if (isSponsor) {
      const sponsorClients = await prisma.client.findMany({
        where: { companyId, sponsorId: userId },
        select: { id: true },
      });
      const clientIds = sponsorClients.map((c) => c.id);
      if (clientIds.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      whereClause.clientId = { in: clientIds };
      whereClause.qaStatus = "APPROVED" as const;
    }

    // Fetch visit note with all details
    const visitNote = await prisma.visitNote.findFirst({
      where: whereClause,
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
    const shiftDate = visitNote.shift ? formatDate(visitNote.shift.scheduledStart) : formatDate(visitNote.submittedAt);
    const shiftTime = visitNote.shift
      ? `${formatTime(visitNote.shift.scheduledStart)} - ${formatTime(visitNote.shift.scheduledEnd)}`
      : "Manual Entry";
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
        if (field.type === "TEXT_DISPLAY") {
          const content = stripHtml(String((field.config as { content?: string } | null)?.content || ""));
          if (content) {
            checkPageBreak(15);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const contentLines = doc.splitTextToSize(content, pageWidth - 2 * margin - 10);
            doc.text(contentLines, margin + 3, y);
            y += contentLines.length * 4 + 4;
          }
          continue;
        }

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
            case "BODY_MAP": {
              // Handle body map specially - draw diagram and legend
              const markers = Array.isArray(value) ? (value as BodyMapMarker[]) : [];

              if (markers.length === 0) {
                displayValue = "No markers recorded";
              } else {
                // Draw the body map diagram
                checkPageBreak(90); // Ensure enough space for diagram
                y = drawBodyMapInPdf(doc, markers, margin, y, pageWidth);

                // Draw the marker legend
                y = drawMarkerLegend(doc, markers, margin, y, pageWidth, checkPageBreak);

                // Skip the normal text rendering for this field
                continue;
              }
              break;
            }
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
    const noteDate = formatDate(visitNote.shift?.scheduledStart || visitNote.submittedAt).replace(/[,\s]+/g, "-");
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

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
