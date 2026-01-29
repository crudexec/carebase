import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sinch webhook payload structure
interface SinchFaxWebhookPayload {
  event: "FAX_COMPLETED" | "INCOMING_FAX";
  fax: {
    id: string;
    direction: "OUTBOUND" | "INBOUND";
    status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILURE";
    to: string;
    from: string;
    numberOfPages?: number;
    pagesSentSuccessfully?: number;
    createTime: string;
    completedTime?: string;
    errorCode?: number;
    errorMessage?: string;
    price?: {
      amount: string;
      currencyCode: string;
    };
  };
}

// Map Sinch status to our FaxStatus enum
function mapSinchStatus(status: string): "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" {
  switch (status) {
    case "QUEUED":
      return "QUEUED";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "FAILURE":
      return "FAILED";
    default:
      return "IN_PROGRESS";
  }
}

export async function POST(request: Request) {
  try {
    const payload: SinchFaxWebhookPayload = await request.json();

    console.log("Received Sinch webhook:", JSON.stringify(payload, null, 2));

    // Only handle FAX_COMPLETED events for outbound faxes
    if (payload.event !== "FAX_COMPLETED" || payload.fax.direction !== "OUTBOUND") {
      return NextResponse.json({ received: true });
    }

    const { fax } = payload;

    // Find the fax record by Sinch fax ID
    const faxRecord = await prisma.faxRecord.findUnique({
      where: { sinchFaxId: fax.id },
    });

    if (!faxRecord) {
      console.warn(`Fax record not found for Sinch fax ID: ${fax.id}`);
      return NextResponse.json({ received: true, warning: "Fax record not found" });
    }

    // Update the fax record with the new status
    const updatedFaxRecord = await prisma.faxRecord.update({
      where: { id: faxRecord.id },
      data: {
        status: mapSinchStatus(fax.status),
        numberOfPages: fax.numberOfPages,
        completedAt: fax.completedTime ? new Date(fax.completedTime) : null,
        errorCode: fax.errorCode,
        errorMessage: fax.errorMessage,
      },
    });

    // Create audit log for status update
    await prisma.auditLog.create({
      data: {
        companyId: faxRecord.companyId,
        userId: faxRecord.sentById,
        action: fax.status === "COMPLETED" ? "FAX_DELIVERED" : "FAX_FAILED",
        entityType: "FaxRecord",
        entityId: faxRecord.id,
        changes: {
          sinchFaxId: fax.id,
          status: fax.status,
          errorCode: fax.errorCode,
          errorMessage: fax.errorMessage,
        },
      },
    });

    // If care plan is associated, update its signature sent date on success
    if (fax.status === "COMPLETED" && faxRecord.carePlanId) {
      await prisma.carePlan.update({
        where: { id: faxRecord.carePlanId },
        data: {
          signatureSentDate: new Date(),
        },
      });
    }

    console.log(`Fax record ${faxRecord.id} updated to status: ${fax.status}`);

    return NextResponse.json({
      received: true,
      faxRecordId: updatedFaxRecord.id,
      status: updatedFaxRecord.status,
    });
  } catch (error) {
    console.error("Error processing fax webhook:", error);
    // Return 200 to acknowledge receipt even on error
    // This prevents Sinch from retrying
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Also handle GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: "Fax webhook endpoint active" });
}
