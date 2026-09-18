import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { companyId, id: userId, role } = session.user;

    const certificate = await prisma.trainingCertificate.findFirst({
      where: {
        id,
        companyId,
        ...(role === "CARER" ? { userId } : {}),
      },
      include: {
        company: { select: { name: true } },
        course: {
          select: {
            title: true,
            category: true,
            durationMinutes: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(4);
    doc.rect(36, 36, pageWidth - 72, pageHeight - 72);
    doc.setLineWidth(1);
    doc.rect(54, 54, pageWidth - 108, pageHeight - 108);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("Certificate of Completion", pageWidth / 2, 120, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text("This certifies that", pageWidth / 2, 170, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text(`${certificate.user.firstName} ${certificate.user.lastName}`, pageWidth / 2, 215, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text("has successfully completed", pageWidth / 2, 255, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    const courseTitle = doc.splitTextToSize(certificate.course.title, pageWidth - 180);
    doc.text(courseTitle, pageWidth / 2, 300, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    const details = [
      `Issued: ${format(certificate.issuedAt, "MMMM d, yyyy")}`,
      certificate.expiresAt ? `Expires: ${format(certificate.expiresAt, "MMMM d, yyyy")}` : null,
      certificate.score != null ? `Score: ${certificate.score}%` : null,
      certificate.ceuCredits > 0 ? `CEU Credits: ${certificate.ceuCredits}` : null,
      certificate.contactHours > 0 ? `Contact Hours: ${certificate.contactHours}` : null,
    ].filter(Boolean).join("   |   ");
    doc.text(details, pageWidth / 2, 370, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(certificate.company.name, pageWidth / 2, 430, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Certificate No. ${certificate.certificateNumber}`, 72, pageHeight - 92);
    doc.text(`Verify: /certificates/verify/${certificate.verificationToken}`, 72, pageHeight - 74);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certificate.certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating training certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
