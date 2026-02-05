import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFaxDocument } from "@/lib/sinch";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/fax/[id]/download - Download fax document (PDF)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const faxRecord = await prisma.faxRecord.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!faxRecord) {
      return NextResponse.json({ error: "Fax record not found" }, { status: 404 });
    }

    if (!faxRecord.sinchFaxId) {
      return NextResponse.json(
        { error: "No Sinch fax ID available for this record" },
        { status: 400 }
      );
    }

    // Download the fax document from Sinch
    const pdfBuffer = await getFaxDocument(faxRecord.sinchFaxId);

    // Generate filename
    const direction = faxRecord.direction === "INBOUND" ? "received" : "sent";
    const dateStr = faxRecord.createdAt.toISOString().split("T")[0];
    const filename = `fax-${direction}-${dateStr}-${faxRecord.id.slice(-6)}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return as PDF download
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading fax document:", error);
    return NextResponse.json(
      { error: "Failed to download fax document" },
      { status: 500 }
    );
  }
}
