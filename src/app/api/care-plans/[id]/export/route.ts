import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";

// GET - Export care plan as PDF download
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

    // Check permission
    const canView = hasAnyPermission(session.user.role, [
      PERMISSIONS.CARE_PLAN_VIEW,
      PERMISSIONS.CARE_PLAN_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch care plan with all details
    const carePlan = await prisma.carePlan.findFirst({
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
        physician: {
          select: {
            firstName: true,
            lastName: true,
            npi: true,
            phone: true,
            fax: true,
          },
        },
        diagnoses: {
          where: { isActive: true },
          orderBy: { diagnosisType: "asc" },
        },
        orders: {
          where: { isActive: true },
          orderBy: { effectiveDate: "desc" },
        },
      },
    });

    if (!carePlan) {
      return NextResponse.json({ error: "Care plan not found" }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateCarePlanPDF(carePlan);

    // Return PDF as download
    const clientName = `${carePlan.client.firstName} ${carePlan.client.lastName}`.replace(/\s+/g, "-");
    const filename = `Care-Plan-${clientName}-${carePlan.planNumber || id}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting care plan PDF:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export PDF" },
      { status: 500 }
    );
  }
}

// Helper function to generate PDF
async function generateCarePlanPDF(carePlan: {
  planNumber: string | null;
  status: string;
  effectiveDate: Date | null;
  certStartDate: Date | null;
  certEndDate: Date | null;
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
  physician: {
    firstName: string;
    lastName: string;
    npi: string | null;
    phone: string | null;
    fax: string | null;
  } | null;
  diagnoses: Array<{
    icdCode: string;
    icdDescription: string;
    diagnosisType: string;
  }>;
  orders: Array<{
    disciplineType: string;
    orderText: string;
    goals: string | null;
  }>;
  summary: string | null;
  medications: string | null;
  allergies: string | null;
  functionalLimitations: string[];
  activitiesPermitted: string[];
  mentalStatus: string[];
  prognosis: string | null;
  dischargePlan: string | null;
  safetyMeasures: string | null;
  nutritionalRequirements: string | null;
  dmeSupplies: string | null;
  careLevel: string | null;
  recommendedHours: unknown;
  physicianCertStatement: string | null;
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

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 30) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  const addSection = (title: string, content: string | null | undefined) => {
    if (!content) return;
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 4 + 5;
  };

  // Header - Company Info
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(carePlan.company.name, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (carePlan.company.address) {
    doc.text(carePlan.company.address, margin, y);
    y += 4;
  }
  if (carePlan.company.phone) {
    doc.text(carePlan.company.phone, margin, y);
    y += 4;
  }

  // Title
  y += 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PLAN OF CARE", pageWidth - margin, 25, { align: "right" });

  if (carePlan.planNumber) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${carePlan.planNumber}`, pageWidth - margin, 32, { align: "right" });
  }

  // Client Information Box
  y = 50;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT INFORMATION", margin + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${carePlan.client.firstName} ${carePlan.client.lastName}`, margin + 5, y);
  y += 5;
  if (carePlan.client.dateOfBirth) {
    doc.text(`DOB: ${formatDate(carePlan.client.dateOfBirth)}`, margin + 5, y);
    y += 5;
  }
  if (carePlan.client.address) {
    const addressLines = doc.splitTextToSize(`Address: ${carePlan.client.address}`, 80);
    doc.text(addressLines, margin + 5, y);
    y += addressLines.length * 4;
  }
  if (carePlan.client.phone) {
    doc.text(`Phone: ${carePlan.client.phone}`, margin + 5, y);
  }

  // Physician info on right side
  const physicianName = carePlan.physician
    ? `${carePlan.physician.firstName} ${carePlan.physician.lastName}`
    : carePlan.client.physicianName;

  if (physicianName) {
    let physicianY = 56;
    doc.setFont("helvetica", "bold");
    doc.text("PHYSICIAN", pageWidth - margin - 60, physicianY);
    physicianY += 6;
    doc.setFont("helvetica", "normal");
    doc.text(physicianName, pageWidth - margin - 60, physicianY);
    physicianY += 5;

    const npi = carePlan.physician?.npi || carePlan.client.physicianNpi;
    if (npi) {
      doc.text(`NPI: ${npi}`, pageWidth - margin - 60, physicianY);
      physicianY += 5;
    }

    const phone = carePlan.physician?.phone || carePlan.client.physicianPhone;
    if (phone) {
      doc.text(`Ph: ${phone}`, pageWidth - margin - 60, physicianY);
      physicianY += 5;
    }

    const fax = carePlan.physician?.fax || carePlan.client.physicianFax;
    if (fax) {
      doc.text(`Fax: ${fax}`, pageWidth - margin - 60, physicianY);
    }
  }

  // Care Plan Details
  y = 95;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.text("CARE PLAN DETAILS", margin + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${carePlan.status.replace(/_/g, " ")}`, margin + 5, y);
  if (carePlan.effectiveDate) {
    doc.text(`Effective: ${formatDate(carePlan.effectiveDate)}`, margin + 60, y);
  }
  y += 5;
  if (carePlan.certStartDate || carePlan.certEndDate) {
    doc.text(`Cert Period: ${formatDate(carePlan.certStartDate)} - ${formatDate(carePlan.certEndDate)}`, margin + 5, y);
  }
  if (carePlan.careLevel) {
    doc.text(`Care Level: ${carePlan.careLevel}`, margin + 100, y);
  }

  y += 15;

  // Diagnoses
  if (carePlan.diagnoses.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNOSES", margin + 3, y);
    y += 10;

    doc.setFontSize(9);
    for (const diagnosis of carePlan.diagnoses) {
      checkPageBreak(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${diagnosis.icdCode}`, margin + 3, y);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(diagnosis.icdDescription, pageWidth - 2 * margin - 30);
      doc.text(descLines, margin + 25, y);
      y += descLines.length * 4 + 2;
    }
    y += 5;
  }

  // Summary
  addSection("SUMMARY / CLINICAL NOTES", carePlan.summary);

  // Medications
  addSection("MEDICATIONS", carePlan.medications);

  // Allergies
  addSection("ALLERGIES", carePlan.allergies);

  // Functional Limitations
  if (carePlan.functionalLimitations.length > 0) {
    addSection("FUNCTIONAL LIMITATIONS", carePlan.functionalLimitations.join(", "));
  }

  // Activities Permitted
  if (carePlan.activitiesPermitted.length > 0) {
    addSection("ACTIVITIES PERMITTED", carePlan.activitiesPermitted.join(", "));
  }

  // Mental Status
  if (carePlan.mentalStatus.length > 0) {
    addSection("MENTAL STATUS", carePlan.mentalStatus.join(", "));
  }

  // Safety Measures
  addSection("SAFETY MEASURES", carePlan.safetyMeasures);

  // Nutritional Requirements
  addSection("NUTRITIONAL REQUIREMENTS", carePlan.nutritionalRequirements);

  // DME & Supplies
  addSection("DME & SUPPLIES", carePlan.dmeSupplies);

  // Prognosis
  addSection("PROGNOSIS", carePlan.prognosis);

  // Discharge Plan
  addSection("DISCHARGE PLAN", carePlan.dischargePlan);

  // Orders
  if (carePlan.orders.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ORDERS", margin + 3, y);
    y += 10;

    doc.setFontSize(9);
    for (const order of carePlan.orders) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text(`${order.disciplineType}:`, margin + 3, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      const orderLines = doc.splitTextToSize(order.orderText, pageWidth - 2 * margin - 5);
      doc.text(orderLines, margin + 3, y);
      y += orderLines.length * 4;
      if (order.goals) {
        doc.setFont("helvetica", "italic");
        const goalLines = doc.splitTextToSize(`Goals: ${order.goals}`, pageWidth - 2 * margin - 5);
        doc.text(goalLines, margin + 3, y);
        y += goalLines.length * 4;
      }
      y += 3;
    }
    y += 5;
  }

  // Physician Certification Statement
  if (carePlan.physicianCertStatement) {
    checkPageBreak(40);
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PHYSICIAN CERTIFICATION", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const certLines = doc.splitTextToSize(carePlan.physicianCertStatement, pageWidth - 2 * margin);
    doc.text(certLines, margin, y);
    y += certLines.length * 4 + 10;

    // Signature line
    doc.text("Physician Signature: _________________________________", margin, y);
    doc.text(`Date: _______________`, margin + 120, y);
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | Plan #${carePlan.planNumber || "N/A"}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
