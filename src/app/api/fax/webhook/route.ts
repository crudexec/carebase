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
  const requestTime = new Date().toISOString();

  try {
    // Log raw request details for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log("=== SINCH FAX WEBHOOK RECEIVED ===");
    console.log("Time:", requestTime);
    console.log("Headers:", JSON.stringify(headers, null, 2));

    const rawBody = await request.text();
    console.log("Raw body:", rawBody);

    let payload: SinchFaxWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      return NextResponse.json({
        received: true,
        error: "Invalid JSON payload",
        rawBody: rawBody.substring(0, 500)
      });
    }

    console.log("Parsed Sinch webhook payload:", JSON.stringify(payload, null, 2));

    // Only handle FAX_COMPLETED events for outbound faxes
    if (payload.event !== "FAX_COMPLETED" || payload.fax.direction !== "OUTBOUND") {
      console.log(`Ignoring webhook - event: ${payload.event}, direction: ${payload.fax?.direction}`);
      return NextResponse.json({ received: true, ignored: true, reason: "Not FAX_COMPLETED or not OUTBOUND" });
    }

    const { fax } = payload;

    // Find the fax record by Sinch fax ID
    console.log(`Looking up fax record with sinchFaxId: ${fax.id}`);
    const faxRecord = await prisma.faxRecord.findUnique({
      where: { sinchFaxId: fax.id },
    });

    if (!faxRecord) {
      console.warn(`Fax record not found for Sinch fax ID: ${fax.id}`);
      // Also try to find by looking at all records to help debug
      const recentFaxes = await prisma.faxRecord.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, sinchFaxId: true, toNumber: true, status: true, createdAt: true }
      });
      console.log("Recent fax records in database:", JSON.stringify(recentFaxes, null, 2));
      return NextResponse.json({ received: true, warning: "Fax record not found", sinchFaxId: fax.id });
    }

    console.log(`Found fax record: ${faxRecord.id}, current status: ${faxRecord.status}`);
    console.log(`Updating to status: ${mapSinchStatus(fax.status)}`);


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

    console.log(`=== FAX WEBHOOK SUCCESS ===`);
    console.log(`Fax record ${faxRecord.id} updated from ${faxRecord.status} to ${updatedFaxRecord.status}`);
    console.log(`Sinch fax ID: ${fax.id}`);
    console.log(`Completed at: ${fax.completedTime}`);
    console.log(`Pages: ${fax.numberOfPages}`);
    if (fax.errorCode) {
      console.log(`Error code: ${fax.errorCode}, message: ${fax.errorMessage}`);
    }

    return NextResponse.json({
      received: true,
      success: true,
      faxRecordId: updatedFaxRecord.id,
      previousStatus: faxRecord.status,
      newStatus: updatedFaxRecord.status,
    });
  } catch (error) {
    console.error("=== FAX WEBHOOK ERROR ===");
    console.error("Error processing fax webhook:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");
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
