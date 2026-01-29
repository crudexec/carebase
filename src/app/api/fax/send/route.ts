import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendFax } from "@/lib/sinch";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const carePlanId = formData.get("carePlanId") as string;
    const toNumber = formData.get("toNumber") as string;
    const recipientName = formData.get("recipientName") as string | null;
    const pdfFile = formData.get("pdf") as File | null;

    // Validate required fields
    if (!carePlanId) {
      return NextResponse.json({ error: "Care plan ID is required" }, { status: 400 });
    }
    if (!toNumber) {
      return NextResponse.json({ error: "Fax number is required" }, { status: 400 });
    }
    if (!pdfFile) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    // Verify care plan exists and belongs to user's company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id: carePlanId,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Get the app URL for webhook callback (only use if not localhost)
    const appUrl = process.env.NEXTAUTH_URL || "";
    const callbackUrl = appUrl && !appUrl.includes("localhost")
      ? `${appUrl}/api/fax/webhook`
      : undefined;

    // Create fax record first
    const faxRecord = await prisma.faxRecord.create({
      data: {
        toNumber,
        fromNumber: process.env.SINCH_FAX_NUMBER || "",
        status: "QUEUED",
        documentType: "CARE_PLAN",
        documentId: carePlanId,
        documentName: `Care Plan - ${carePlan.client.firstName} ${carePlan.client.lastName}`,
        recipientName: recipientName || carePlan.physicianName || undefined,
        recipientType: "PHYSICIAN",
        companyId: session.user.companyId,
        sentById: session.user.id,
        carePlanId,
      },
    });

    try {
      console.log("Sending fax request:", {
        toNumber,
        fromNumber: process.env.SINCH_FAX_NUMBER,
        fileName: `care-plan-${carePlan.planNumber}.pdf`,
        pdfSize: pdfBuffer.length,
        callbackUrl: callbackUrl || "(none - localhost)",
      });

      // Send fax via Sinch
      const sinchResponse = await sendFax({
        to: toNumber,
        file: pdfBuffer,
        fileName: `care-plan-${carePlan.planNumber}.pdf`,
        headerText: `Care Plan ${carePlan.planNumber}`,
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
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "FAX_SENT",
          entityType: "FaxRecord",
          entityId: faxRecord.id,
          changes: {
            carePlanId,
            toNumber,
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
    console.error("Error sending fax:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send fax" },
      { status: 500 }
    );
  }
}
