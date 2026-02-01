import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFaxStatus } from "@/lib/sinch";

// POST /api/fax/[id]/refresh - Refresh fax status from Sinch API
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the fax record
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
        { error: "No Sinch fax ID associated with this record" },
        { status: 400 }
      );
    }

    // Already completed or failed - no need to refresh
    if (faxRecord.status === "COMPLETED" || faxRecord.status === "FAILED") {
      return NextResponse.json({
        message: "Fax already in final state",
        faxRecord,
      });
    }

    // Get status from Sinch
    console.log("=== FAX STATUS REFRESH ===");
    console.log(`Fax record ID: ${id}`);
    console.log(`Sinch fax ID: ${faxRecord.sinchFaxId}`);
    console.log(`Current local status: ${faxRecord.status}`);

    const sinchStatus = await getFaxStatus(faxRecord.sinchFaxId);

    console.log("Sinch API response:", JSON.stringify(sinchStatus, null, 2));

    // Map Sinch status to our status
    let newStatus: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" = faxRecord.status;
    switch (sinchStatus.status) {
      case "QUEUED":
        newStatus = "QUEUED";
        break;
      case "IN_PROGRESS":
        newStatus = "IN_PROGRESS";
        break;
      case "COMPLETED":
        newStatus = "COMPLETED";
        break;
      case "FAILURE":
        newStatus = "FAILED";
        break;
    }

    // Update the fax record
    console.log(`Updating fax record from ${faxRecord.status} to ${newStatus}`);
    const updatedFaxRecord = await prisma.faxRecord.update({
      where: { id },
      data: {
        status: newStatus,
        numberOfPages: sinchStatus.numberOfPages ?? faxRecord.numberOfPages,
        completedAt: sinchStatus.completedTime ? new Date(sinchStatus.completedTime) : faxRecord.completedAt,
        errorCode: sinchStatus.errorCode ?? faxRecord.errorCode,
        errorMessage: sinchStatus.errorMessage ?? faxRecord.errorMessage,
      },
    });
    console.log(`Fax record updated successfully. New status: ${updatedFaxRecord.status}`);

    // If care plan is associated and fax completed, update signature sent date
    if (newStatus === "COMPLETED" && faxRecord.carePlanId) {
      await prisma.carePlan.update({
        where: { id: faxRecord.carePlanId },
        data: {
          signatureSentDate: new Date(),
        },
      });
    }

    // Create audit log for status refresh
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "FAX_STATUS_REFRESHED",
        entityType: "FaxRecord",
        entityId: id,
        changes: {
          previousStatus: faxRecord.status,
          newStatus,
          sinchFaxId: faxRecord.sinchFaxId,
          sinchResponse: sinchStatus,
        },
      },
    });

    return NextResponse.json({
      success: true,
      previousStatus: faxRecord.status,
      newStatus,
      faxRecord: updatedFaxRecord,
    });
  } catch (error) {
    console.error("Error refreshing fax status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to refresh fax status" },
      { status: 500 }
    );
  }
}
