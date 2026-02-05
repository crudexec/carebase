import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFaxDocument } from "@/lib/sinch";

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
    contentUrl?: string; // URL to download inbound fax content
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

// Handle inbound fax
async function handleInboundFax(fax: SinchFaxWebhookPayload["fax"]) {
  console.log("=== PROCESSING INBOUND FAX ===");
  console.log(`From: ${fax.from}, To: ${fax.to}`);
  console.log(`Sinch fax ID: ${fax.id}`);
  console.log(`Pages: ${fax.numberOfPages}`);

  // Find company by fax number
  const company = await prisma.company.findFirst({
    where: {
      faxNumber: fax.to,
    },
  });

  if (!company) {
    console.error(`No company found with fax number: ${fax.to}`);
    // Try to find by checking the default SINCH_FAX_NUMBER
    const defaultFaxNumber = process.env.SINCH_FAX_NUMBER;
    if (defaultFaxNumber && fax.to === defaultFaxNumber) {
      // If using default fax number, try to get the first active company
      const defaultCompany = await prisma.company.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });
      if (defaultCompany) {
        console.log(`Using default company: ${defaultCompany.id} (${defaultCompany.name})`);
        return await createInboundFaxRecord(fax, defaultCompany.id);
      }
    }
    return { error: "Company not found for fax number", faxNumber: fax.to };
  }

  console.log(`Found company: ${company.id} (${company.name})`);
  return await createInboundFaxRecord(fax, company.id);
}

async function createInboundFaxRecord(fax: SinchFaxWebhookPayload["fax"], companyId: string) {
  // Download and store the fax document
  let documentUrl: string | null = null;
  try {
    // For now, store document URL from Sinch (temporary - expires)
    // In production, you should download and store in S3/R2
    if (fax.contentUrl) {
      documentUrl = fax.contentUrl;
    } else {
      // Try to construct the document URL from the fax ID
      const projectId = process.env.SINCH_PROJECT_ID;
      if (projectId) {
        documentUrl = `sinch://${projectId}/faxes/${fax.id}/file`;
      }
    }

    // Optionally download and store permanently
    // Uncomment this when you have S3/R2 configured:
    // const pdfBuffer = await getFaxDocument(fax.id);
    // documentUrl = await uploadToStorage(pdfBuffer, `faxes/inbound/${fax.id}.pdf`);
  } catch (error) {
    console.error("Failed to process fax document:", error);
  }

  // Create inbound fax record
  const faxRecord = await prisma.faxRecord.create({
    data: {
      companyId,
      sinchFaxId: fax.id,
      direction: "INBOUND",
      toNumber: fax.to,
      fromNumber: fax.from,
      status: mapSinchStatus(fax.status),
      documentType: "INBOUND_FAX",
      documentUrl,
      numberOfPages: fax.numberOfPages,
      completedAt: fax.completedTime ? new Date(fax.completedTime) : new Date(),
      errorCode: fax.errorCode,
      errorMessage: fax.errorMessage,
    },
  });

  console.log(`Created inbound fax record: ${faxRecord.id}`);

  // Find an admin user to attribute the audit log to (for system events)
  const adminUser = await prisma.user.findFirst({
    where: {
      companyId,
      role: "ADMIN",
      isActive: true,
    },
    select: { id: true },
  });

  // Create audit log if we have a user to attribute it to
  if (adminUser) {
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: adminUser.id,
        action: "FAX_RECEIVED",
        entityType: "FaxRecord",
        entityId: faxRecord.id,
        changes: {
          sinchFaxId: fax.id,
          from: fax.from,
          to: fax.to,
          pages: fax.numberOfPages,
          systemGenerated: true,
        },
      },
    });
  }

  // TODO: Send notification to company admins about incoming fax
  // This could trigger an email or in-app notification

  return {
    success: true,
    faxRecordId: faxRecord.id,
    direction: "INBOUND",
  };
}

// Handle outbound fax status update
async function handleOutboundFaxUpdate(fax: SinchFaxWebhookPayload["fax"]) {
  console.log(`Looking up fax record with sinchFaxId: ${fax.id}`);
  const faxRecord = await prisma.faxRecord.findUnique({
    where: { sinchFaxId: fax.id },
  });

  if (!faxRecord) {
    console.warn(`Fax record not found for Sinch fax ID: ${fax.id}`);
    const recentFaxes = await prisma.faxRecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, sinchFaxId: true, toNumber: true, status: true, createdAt: true }
    });
    console.log("Recent fax records in database:", JSON.stringify(recentFaxes, null, 2));
    return { warning: "Fax record not found", sinchFaxId: fax.id };
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
  if (faxRecord.sentById) {
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
  }

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

  return {
    success: true,
    faxRecordId: updatedFaxRecord.id,
    previousStatus: faxRecord.status,
    newStatus: updatedFaxRecord.status,
  };
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

    const { event, fax } = payload;

    // Handle incoming fax (inbound)
    if (event === "INCOMING_FAX" || (event === "FAX_COMPLETED" && fax.direction === "INBOUND")) {
      const result = await handleInboundFax(fax);
      return NextResponse.json({ received: true, ...result });
    }

    // Handle outbound fax completion
    if (event === "FAX_COMPLETED" && fax.direction === "OUTBOUND") {
      const result = await handleOutboundFaxUpdate(fax);
      return NextResponse.json({ received: true, ...result });
    }

    // Unknown event type
    console.log(`Ignoring webhook - event: ${event}, direction: ${fax?.direction}`);
    return NextResponse.json({ received: true, ignored: true, reason: `Unhandled event: ${event}` });

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
