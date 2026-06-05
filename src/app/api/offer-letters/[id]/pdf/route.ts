import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import jsPDF from "jspdf";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

function canManage(role: string) {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const offer = await prisma.offerLetter.findFirst({
      where: { id, companyId: session.user.companyId },
      include: {
        company: { select: { name: true, address: true, phone: true } },
        template: { select: { name: true } },
        sentBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }

    const pdf = new jsPDF();
    const margin = 18;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addText = (text: string, fontSize = 11, style: "normal" | "bold" = "normal") => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += fontSize * 0.45 + 3;
      });
    };

    addText(offer.company.name, 16, "bold");
    if (offer.company.address) addText(offer.company.address, 9);
    if (offer.company.phone) addText(offer.company.phone, 9);
    y += 6;

    addText(offer.renderedSubject, 14, "bold");
    addText(`Recipient: ${offer.recipientFirstName} ${offer.recipientLastName} <${offer.recipientEmail}>`, 9);
    addText(`Status: ${offer.status}`, 9);
    if (offer.sentAt) addText(`Sent: ${offer.sentAt.toLocaleDateString("en-US")}`, 9);
    if (offer.acceptedAt) addText(`Accepted: ${offer.acceptedAt.toLocaleString("en-US")}`, 9);
    if (offer.declinedAt) addText(`Declined: ${offer.declinedAt.toLocaleString("en-US")}`, 9);
    y += 6;

    addText(toPlainText(offer.renderedBodyHtml), 11);
    y += 8;

    if (offer.signatureData) {
      if (y > pageHeight - 55) {
        pdf.addPage();
        y = margin;
      }
      addText("Signature", 12, "bold");
      try {
        pdf.addImage(offer.signatureData, "PNG", margin, y, 80, 28);
        y += 34;
      } catch {
        addText("[Signature image could not be embedded]", 9);
      }
      if (offer.acceptedAt) addText(`Signed at: ${offer.acceptedAt.toLocaleString("en-US")}`, 9);
      if (offer.signedIpAddress) addText(`IP address: ${offer.signedIpAddress}`, 9);
    }

    if (offer.declineReason) {
      y += 4;
      addText("Decline Reason", 12, "bold");
      addText(offer.declineReason, 10);
    }

    const buffer = Buffer.from(pdf.output("arraybuffer"));
    const fileName = `offer-letter-${offer.recipientLastName}-${offer.recipientFirstName}.pdf`
      .replace(/[^a-z0-9.-]+/gi, "-")
      .toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating offer letter PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate offer letter PDF" },
      { status: 500 }
    );
  }
}

function toPlainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .trim();
}
